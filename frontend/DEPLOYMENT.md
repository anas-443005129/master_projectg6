# Deploying the Next.js Application

This document explains how to build the container image for the full-stack Next.js app that now lives in `frontend/` and how to deploy it to Kubernetes. The steps assume you already have a container registry (ACR, ECR, GCR, GHCR, etc.) and a cluster with an ingress controller.

## 1. Build and push the container image

```bash
cd frontend
# Build the production image (update the tag to match your registry)
docker build -t ghcr.io/your-org/master-projectg6-next:latest .

# Push the image
docker push ghcr.io/your-org/master-projectg6-next:latest
```

The Dockerfile uses a multi-stage build, outputs the standalone Next.js server bundle, and exposes port `3000`. Adjust the `NODE_VERSION` build argument if you want to pin a different LTS release.

## 2. Provide runtime environment variables

Copy `k8s_solution/frontend-app/secret.sample.yaml` and fill it with real values (they match `.env.example`).

```bash
cp k8s_solution/frontend-app/secret.sample.yaml k8s_solution/frontend-app/secret.yaml
# edit secret.yaml with real secrets
kubectl apply -f k8s_solution/frontend-app/secret.yaml
```

Required keys:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | NextAuth signing/encryption secret |
| `AI_GATEWAY_API_KEY` | Access to the AI Gateway if you are not on Vercel |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Store token |
| `POSTGRES_URL` | Database connection string consumed by Drizzle ORM |
| `REDIS_URL` | Redis connection for sessions/cache |

Add any additional application-specific variables the app expects.

## 3. Provision Redis

The application requires Redis for sessions/caching. A single-node instance is provided in `k8s_solution/redis/`.

```bash
# adjust password in redis/secret.sample.yaml, copy to redis/secret.yaml, then
kubectl apply -f k8s_solution/redis/secret.yaml
kubectl apply -k k8s_solution/redis
```

The bundled secret name (`redis-auth`) and service DNS (`redis`) match the default `REDIS_URL` in `frontend-app/secret.sample.yaml` (`redis://:change-me@redis:6379`). Update both files if you change passwords or namespaces.

## 4. Prepare HTTPS certificates

Apply the bundled cert-manager ClusterIssuers (production + staging) so the ingress at `infrarock.tech` can request TLS certificates automatically:

```bash
kubectl apply -f k8s_solution/cert-manager-issuer.yaml
```

Edit the staging issuer email before applying if you plan to test it. When the production issuer is ready, cert-manager will create the `next-app-tls` secret referenced by the ingress.

## 5. Deploy to Kubernetes

The manifests in `k8s_solution/frontend-app/` describe a basic Deployment, Service, and Ingress. Update the following before applying:

- `deployment.yaml` → set the `image` field to the tag you pushed.
- `ingress.yaml` → the repo already targets `infrarock.tech` and `next-app-tls`; update if you use a different hostname or secret.
- `namespace` fields if you do not deploy to `default`.

Apply resources (assuming namespace + TLS secret already exist):

```bash
kubectl apply -k k8s_solution/frontend-app
```

Check rollout status and logs:

```bash
kubectl rollout status deployment/next-app -n <namespace>
kubectl logs -f deployment/next-app -n <namespace>
```

## 6. Cleaning up the legacy Flask API

The legacy Flask API (Dockerfile + `k8s_solution/api-*` manifests) has been removed from the repository. If you still have the workload running in your cluster, scale it down and delete the associated Kubernetes objects after confirming the Next.js routes fully replace it.

## 7. Local smoke test (optional)

Before pushing to the registry you can verify the container locally:

```bash
docker run --rm -p 3000:3000 \
  --env-file ../frontend/.env.local \  # or individual -e flags
  ghcr.io/your-org/master-projectg6-next:latest
```

Visit `http://localhost:3000` and exercise the critical flows before shipping to the cluster.
