# k8s_solution

This folder holds Kubernetes manifests for deploying the application and related services.

Quick notes

- Apply manifests in a safe order (example):

```bash
# 1. Create namespace (if provided)
kubectl apply -f namespace.yml

# 2. Create secrets (use samples as templates)
kubectl apply -f app-secret.sample.yml
kubectl apply -f db-secret.sample.yml

# 3. Persistent volumes / PVCs
kubectl apply -f db-pvc.yml

# 4. Database deployment
kubectl apply -f db-deploy.yml
kubectl apply -f db-svc.yml

# 5. API/backend deployment and service
kubectl apply -f api-deploy.yml
kubectl apply -f api-svc.yml

# 6. Ingress / ingress controller config
kubectl apply -f app-ingress-agic.yml

# 7. Optional HPA
kubectl apply -f api-hpa.yml
```

- Check rollout status: `kubectl rollout status deployment/<deployment-name> -n <namespace>`
- Inspect logs: `kubectl logs -f deployment/<deployment-name> -n <namespace>`

Customize secrets and configuration before applying to production clusters.
