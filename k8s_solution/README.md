# k8s_solution

This folder holds Kubernetes manifests for deploying the application and related services.

Quick notes


```bash
# 1. Create namespace (if provided)
kubectl apply -f namespace.yml

# 2. Create secrets (copy *.sample.* files, edit, then apply)
kubectl apply -f db/secret.yaml
kubectl apply -f redis/secret.yaml
kubectl apply -f frontend-app/secret.yaml

# 3. Deploy data stores (each kustomization bundles PVC, deployment, service)
kubectl apply -k db
kubectl apply -k redis

# 4. Deploy the Next.js frontend (update image/hostname first)
kubectl apply -k frontend-app

# 5. Ingress / ingress controller config needed by other workloads (optional)
kubectl apply -f app-ingress-agic.yml
```

- Issue certificates via cert-manager:

```bash
kubectl apply -f cert-manager-issuer.yaml
```

Deploy the Next.js frontend bundle with `kubectl apply -k frontend-app` (ensure `frontend-app/ingress.yaml` uses your domain and TLS secret).


Customize secrets and configuration before applying to production clusters.
