# Argo Apps

This folder contains ArgoCD application manifests used to manage application deployments (monitoring, frontend, etc.) via GitOps.

Quick usage

- To register these with ArgoCD, either point ArgoCD at this repo or create apps via the CLI:

```bash
# Example (adjust names/paths):
argocd app create monitoring --repo <repo-url> --path argo-apps/monitoring --dest-server https://kubernetes.default.svc --dest-namespace monitoring
argocd app sync monitoring
```

- Files under `argo-apps/monitoring/` include `grafana-app.yaml` and `prometheus-app.yaml` to deploy monitoring components.
- Use `values-argocd.yaml` at repo root to configure environment-specific settings for ArgoCD if present.
