# 🚀 LLM DevOps Advisor Platform

## Overview

**LLM DevOps Advisor** is a full-stack, production-grade SaaS platform that uses AI to provide intelligent DevOps guidance. It combines:

- **Modern Next.js frontend** (React 19 RC, TypeScript, Tailwind CSS 4.1) with rich editors and real-time UI
- **Server-side AI workflows** implemented via Next.js App Router (legacy Flask API retired)
- **PostgreSQL database** with Drizzle ORM migrations
- **Kubernetes orchestration** (Azure AKS) with auto-scaling, persistent storage, and secrets management
- **Infrastructure-as-Code** (Terraform) for reproducible Azure resource provisioning
- **GitOps deployment** via ArgoCD with automated CI/CD (GitHub Actions)
- **Monitoring & observability** (Prometheus, Grafana, OpenTelemetry)

The platform intelligently generates **cost optimization**, **performance recommendations**, **project structures**, **Terraform code**, and **infrastructure provisioning scripts** tailored to cloud providers (AWS, Azure, GCP) and regional constraints.

> ℹ️ **Legacy notice:** the original Flask API, templates, and static assets were removed in favor of a single Next.js deployment. Historical references remain below until the documentation rewrite is complete.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Infrastructure](#infrastructure)
- [Monitoring](#monitoring)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies (uses pnpm)
pnpm install

# Development mode with Turbo
pnpm dev
# Access at http://localhost:3000

# Build for production
pnpm build
pnpm start
```

### Docker (Next.js standalone)

```bash
cd frontend
docker build -t devops-advisor-next:latest .
docker run --rm -p 3000:3000 \
  --env-file .env.local \
  devops-advisor-next:latest
```

### Kubernetes (Production)

```bash
# Connect to AKS cluster
az aks get-credentials --resource-group rg-devops-group6 --name devopsa-aks

# Apply manifests in order
kubectl apply -f k8s_solution/namespace.yml
kubectl apply -f k8s_solution/db/secret.yaml
kubectl apply -f k8s_solution/redis/secret.yaml
kubectl apply -f k8s_solution/frontend-app/secret.yaml
kubectl apply -k k8s_solution/db
kubectl apply -k k8s_solution/redis
kubectl apply -f k8s_solution/cert-manager-issuer.yaml   # optional but recommended
kubectl apply -k k8s_solution/frontend-app

# Check status
kubectl get pods -n devops-advisor
kubectl get svc -A -w  # Watch for external IP/ingress
```

---

## Features

- **LLM-powered DevOps Guidance:** Five AI endpoints for cost, performance, structure, Terraform, and CLI generation with OpenAI GPT-4o-mini
- **Multi-cloud Support:** Context-aware recommendations for AWS, Azure, and Google Cloud with region accuracy validation
- **Cost Optimization:** Saudi Riyal (SAR) pricing, regional cost breakdowns, scale-aware multipliers, and best practices
- **Performance Optimization:** Latency analysis, CDN strategies, autoscaling patterns, database optimization, regional performance impact
- **Project Structure Generation:** AI-inferred tech stack detection (React, Next.js, Vue, Angular, FastAPI, Express, etc.) with production-ready folder layouts
- **Terraform Code Generation:** Complete modular Terraform code with networking, compute, database, security, monitoring, storage, registry, and CDN modules
- **Infrastructure CLI Scripts:** Bash/PowerShell scripts for one-command infrastructure provisioning (Azure, AWS, GCP)
- **Modern Frontend:** Next.js 15 with React 19 RC, TypeScript, Tailwind CSS 4.1, CodeMirror editors, ProseMirror rich text, Drizzle ORM
- **User Authentication:** Secure registration/login with hashed passwords (bcrypt), session management via Flask-Login
- **Query History:** Full audit trail of all LLM recommendations per user (searchable, exportable as JSON)
- **Auto-scaling:** Kubernetes HPA (2-5 replicas based on CPU 60% threshold)
- **Persistent Storage:** 10Gi PostgreSQL volume with automated backups via container orchestration
- **Secrets Management:** All API keys/credentials via Kubernetes secrets (ready for Azure Key Vault integration)
- **GitOps Deployment:** ArgoCD with auto-sync, auto-prune, and auto-heal for continuous deployment
- **Monitoring & Observability:** Prometheus metrics, Grafana dashboards, OpenTelemetry instrumentation, structured logging

---

## Architecture

### System Design

```
┌─────────────────┐          ┌─────────────────┐
│  Next.js        │          │  Flask Backend  │
│  Frontend       │◄────────►│  (Python 3.11)  │
│  (React 19 RC)  │          │  OpenAI API     │
└────────┬────────┘          └────────┬────────┘
         │                            │
         │         PostgreSQL        │
         └───────────┬───────────────┘
                     │
         ┌───────────▼───────────┐
         │  Kubernetes (AKS)     │
         │  ├─ Namespace         │
         │  ├─ Deployments       │
         │  ├─ Services          │
         │  ├─ StatefulSets      │
         │  ├─ Ingress (AGIC)    │
         │  └─ HPA (2-5 replicas)│
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Monitoring Stack     │
         │  ├─ Prometheus        │
         │  ├─ Grafana           │
         │  └─ Logs              │
         └───────────────────────┘
```

### Component Breakdown

| Component              | Technology                                            | Purpose                                         |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| **Frontend**           | Next.js 15, React 19 RC, TypeScript, Tailwind CSS 4.1 | User interface, real-time UI, code/text editors |
| **Backend API**        | Flask, SQLAlchemy, OpenAI SDK, Gunicorn               | REST endpoints, LLM integration, business logic |
| **Database**           | PostgreSQL 16 (containerized)                         | User accounts, query history, persistent state  |
| **Container Registry** | Azure ACR (group6acr)                                 | Stores Docker images for K8s                    |
| **Orchestration**      | Kubernetes (AKS)                                      | Pod management, scaling, networking, secrets    |
| **Infrastructure**     | Terraform (Azure modules)                             | Resource provisioning (AKS, RG, ACR, disks)     |
| **Deployment**         | ArgoCD, GitHub Actions                                | GitOps sync, CI/CD automation                   |
| **Monitoring**         | Prometheus, Grafana, OpenTelemetry                    | Metrics, dashboards, APM                        |
| **Secrets**            | Kubernetes Secrets, Azure Key Vault                   | API keys, DB credentials                        |

---

## Technology Stack

**Backend:**

- Python 3.11, Flask, SQLAlchemy, Flask-Login
- OpenAI API (gpt-4o-mini for recommendations)
- Gunicorn (4 workers, 120s timeout)
- psycopg2 (PostgreSQL driver)

**Frontend:**

- Node.js 18+, pnpm 9.12.3
- Next.js 15 (app router, SSR, edge runtime ready)
- React 19 RC, TypeScript (strict mode)
- Tailwind CSS 4.1, PostCSS
- CodeMirror 6, ProseMirror (editors)
- Drizzle ORM (database queries)
- NextAuth 5.0.0-beta (authentication)
- Radix UI, shadcn/ui (components)
- Playwright (E2E tests)

**Infrastructure & Deployment:**

- Docker (Python 3.11-slim, non-root user)
- Kubernetes (AKS), Helm
- Terraform 1.5+, Azure provider
- ArgoCD (GitOps)
- GitHub Actions (CI/CD)

**Monitoring & Observability:**

- Prometheus (metrics collection)
- Grafana (dashboards)
- OpenTelemetry (distributed tracing)
- Structured logging (Gunicorn, K8s)

**Cloud Platform:**

- Azure AKS (Kubernetes cluster)
- Azure ACR (container registry)
- Azure PostgreSQL Flexible Server (managed DB)
- Azure App Gateway (ingress controller)
- Azure Key Vault (secrets storage)

---

## Project Structure

````
master_projectg6/
├── README.md                         # This file
├── LICENSE                           # MIT License
├── Dockerfile                        # Python 3.11-slim, non-root user, 4 Gunicorn workers
├── requirements.txt                  # Backend dependencies
├── Flask_App.py                      # Main Flask application (846 lines)
│
├── frontend/                         # Next.js React frontend
│   ├── package.json                  # pnpm workspace, v3.1.0
│   ├── pnpm-lock.yaml                # Lock file
│   ├── next.config.ts                # Next.js config (PPR, image remotePatterns)
│   ├── tsconfig.json                 # TypeScript strict mode
│   ├── tailwind.config.ts            # Tailwind CSS 4.1
│   ├── postcss.config.mjs            # PostCSS setup
│   ├── drizzle.config.ts             # Drizzle ORM config
│   ├── playwright.config.ts          # E2E testing
│   ├── biome.jsonc                   # Code formatter/linter
│   ├── middleware.ts                 # Next.js middleware
│   ├── instrumentation.ts            # OpenTelemetry setup
│   ├── app/                          # App router (Next.js 13+)
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── (auth)/                   # Auth routes (login, register)
│   │   ├── (chat)/                   # Chat routes
│   │   └── (landing)/                # Landing page routes
│   ├── components/                   # 40+ reusable React components
│   │   ├── chat.tsx                  # Main chat component
│   │   ├── artifact.tsx              # Artifact viewer
│   │   ├── code-editor.tsx           # CodeMirror wrapper
│   │   ├── image-editor.tsx          # Image editing
│   │   ├── sheet-editor.tsx          # Spreadsheet editing
│   │   ├── document.tsx              # Document rendering
│   │   ├── message.tsx               # Message display
│   │   ├── ui/                       # shadcn/ui components
│   │   └── ...
│   ├── artifacts/                    # Artifact action handlers
│   │   ├── actions.ts                # Server actions
│   │   ├── code/                     # Code artifact handlers
│   │   ├── image/                    # Image handlers
│   │   ├── sheet/                    # Sheet handlers
│   │   └── text/                     # Text handlers
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Utilities, database setup, helpers
│   ├── public/                       # Static assets
│   ├── tests/                        # Playwright E2E tests
│   └── README.md                     # Frontend-specific guide
│
├── k8s_solution/                     # Kubernetes manifests
│   ├── namespace.yml                 # devops-advisor namespace
│   ├── cert-manager-issuer.yaml      # ClusterIssuers for TLS
│   ├── app-ingress-agic.yml          # Azure App Gateway ingress (optional)
│   ├── db/                           # PostgreSQL manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── pvc.yaml
│   │   ├── secret.sample.yaml
│   │   └── kustomization.yaml
│   ├── redis/                        # Redis manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── pvc.yaml
│   │   ├── secret.sample.yaml
│   │   └── kustomization.yaml
│   ├── frontend-app/                 # Next.js deployment manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── secret.sample.yaml
│   │   └── kustomization.yaml
│   └── README.md                     # K8s deployment guide
│
├── argo-apps/                        # ArgoCD application manifests
│   ├── monitoring/                   # Monitoring apps
│   │   ├── grafana-app.yaml          # Grafana ArgoCD app
│   │   └── prometheus-app.yaml       # Prometheus ArgoCD app
│   └── README.md                     # ArgoCD guide
│
├── terraform/                        # Infrastructure as Code
│   ├── main.tf                       # Root config, module calls
│   ├── providers.tf                  # Azure provider setup (>= 3.0.0)
│   ├── variables.tf                  # Input variables
│   ├── outputs.tf                    # Root outputs
│   ├── modules/                      # Reusable Terraform modules
│   │   ├── resourcegroups/           # Azure Resource Group
│   │   ├── acr/                      # Azure Container Registry
│   │   ├── aks/                      # Azure Kubernetes Service
│   │   └── disk/                     # Managed disk provisioning
│   └── README.md                     # Terraform usage guide
│
├── deploy-argocd.yml                 # ArgoCD deployment playbook
├── deploy-monitoring.yml             # Monitoring stack deployment
├── values-argocd.yaml                # ArgoCD Helm values
├── values-prometheus.yaml            # Prometheus Helm values
├── values-grafana.yaml               # Grafana Helm values
└── argocd-apps.yaml                  # ArgoCD application manifest

**Key Next.js Assets:** most production logic now lives under `frontend/` (App Router routes, `components/`, `artifacts/`, and server actions). See `frontend/README.md` for the full breakdown.

---

## Setup & Installation

### Prerequisites

**System Requirements:**
- macOS, Linux, or Windows with WSL2
- Docker & Docker Compose (for containerized development)
- Python 3.11+ (for local development)
- Node.js 18+ & pnpm 9.12+ (for frontend)
- Terraform 1.5+ (for infrastructure provisioning)
- Azure CLI & kubectl (for cloud deployment)
- Git

**API & Credentials:**
- OpenAI API key (https://platform.openai.com/api-keys)
- Azure Subscription & service principal (for Terraform)
- GitHub repository with secrets configured

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/anas-443005129/master_projectg6.git
cd master_projectg6
git checkout frontend  # Switch to frontend branch
````

#### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies (uses pnpm for faster installs)
pnpm install

# Create environment file
cp .env.example .env.local  # update POSTGRES_URL/REDIS_URL/etc.

# Run development server with Turbo
pnpm dev
# Frontend running at http://localhost:3000

# Verify build
pnpm build

# Run linter/formatter
pnpm lint
pnpm format
```

#### 3. PostgreSQL Database

**Option A: Docker Container**

```bash
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your-secure-password \
  -e POSTGRES_DB=devops_advisor_db \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B: Local Installation**

```bash
# On macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb devops_advisor_db
```

#### 4. Run Locally

```bash
# Terminal 1: Frontend
cd master_projectg6/frontend
pnpm dev

# Terminal 2: Database (if using Docker)
docker run -d --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=devops_advisor_db \
  -p 5432:5432 \
  postgres:16-alpine

# Terminal 3: Redis (optional but recommended)
docker run -d --name redis-dev \
  -e REDIS_PASSWORD=change-me \
  -p 6379:6379 \
  redis:7-alpine --requirepass change-me

# Access:
# - Frontend: http://localhost:3000
```

---

## Development Guide

> Legacy notice: The remaining content in this section refers to the retired Flask backend and is preserved only for historical context.

### Backend Development (Flask)

**Key Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | GET/POST | User registration |
| `/auth/login` | GET/POST | User login |
| `/auth/logout` | GET | User logout |
| `/` | GET | Main dashboard (requires login) |
| `/best_practices_cost` | POST | Cost optimization recommendations |
| `/best_practices_performance` | POST | Performance optimization recommendations |
| `/structure` | POST | AI-generated project structure |
| `/terraform` | POST | Terraform module generation |
| `/infra_cli` | POST | Infrastructure provisioning CLI script |
| `/history` | GET | User's query history (JSON) |
| `/history/export` | GET | Export history with optional filters |
| `/init-db` | GET | Manual database initialization |

**Making LLM Requests:**

```bash
curl -X POST http://localhost:5001/best_practices_cost \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "provider=Azure&description=Web+app+with+database&scale=Medium+%281k-100k%2Fday%29&loading_pressure=Everyday&country=Saudi+Arabia"
```

**Database Debugging:**

```bash
# Connect to database
psql -U postgres -d devops_advisor_db

# View tables
\dt

# Query user history
SELECT * FROM histories WHERE user_id = 1 ORDER BY created_at DESC LIMIT 5;
```

### Frontend Development (Next.js)

**Key Commands:**

```bash
# Start with Turbo for faster rebuilds
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Run type checking
pnpm run tsc --noEmit

# Format code with Biome
pnpm format

# Lint with Biome
pnpm lint

# Run E2E tests with Playwright
pnpm test

# Database operations
pnpm db:generate   # Generate schema migrations
pnpm db:migrate    # Run migrations
pnpm db:studio     # Open Drizzle Studio
pnpm db:push       # Push schema to database
pnpm db:pull       # Pull schema from database
```

**File Organization:**

- `app/` – Pages and layouts using app router
- `components/` – Reusable React components
- `artifacts/` – Artifact handlers (code, images, sheets, etc.)
- `hooks/` – Custom React hooks
- `lib/` – Utilities, database setup, API clients
- `public/` – Static assets

### Code Style & Quality

**Backend:**

- Black code formatting
- Type hints with Python 3.11
- SQLAlchemy async-ready models
- Docstrings for functions/classes

**Frontend:**

- Biome code formatter and linter
- TypeScript strict mode
- ESLint for code quality
- Playwright for E2E tests

---

## API Endpoints

> Legacy notice: These endpoints belonged to the deprecated Flask API. The Next.js implementation exposes equivalent functionality via server actions and Route Handlers.

### Authentication

**POST /auth/register**

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response: Redirect to login

**POST /auth/login**

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response: Redirect to dashboard

**GET /auth/logout**
Response: Redirect to login

### LLM Recommendations

**POST /best_practices_cost**

Parameters:

- `provider` (string): AWS, Azure, Google Cloud
- `description` (string): Project description
- `scale` (string): Small/Medium/Large
- `loading_pressure` (string): Everyday/3-5 days/No pressure
- `country` (string, optional): User's country

Response:

```json
{
  "cost": "Detailed cost optimization recommendations in SAR..."
}
```

**POST /best_practices_performance**

Same parameters as cost endpoint.

Response:

```json
{
  "performance": "Performance optimization strategies..."
}
```

**POST /structure**

Generates AI-inferred project structure based on description.

Response:

```json
{
  "structure": "project-root/\n├── frontend/\n├── backend/\n├── terraform/\n..."
}
```

**POST /terraform**

Generates complete Terraform modules.

Response:

```json
{
  "terraform": "### FILE: main.tf\n...\n### FILE: modules/..."
}
```

**POST /infra_cli**

Generates provisioning script (Bash/PowerShell).

Response:

```json
{
  "cli": "#!/usr/bin/env bash\nset -uo pipefail\n..."
}
```

### History & Export

**GET /history**

Returns user's query history (max 50).

Response:

```json
{
  "history": [
    {
      "id": 1,
      "type": "cost",
      "created_at": "2025-11-25T10:30:00Z",
      "provider": "Azure",
      "scale": "Medium",
      "country": "Saudi Arabia",
      "prompt": "Web app description",
      "result": "Cost recommendations..."
    }
  ]
}
```

**GET /history/export?type=cost&q=azure**

Exports history as downloadable JSON with optional filters.

Parameters:

- `type` (optional): cost|performance|structure|terraform|cli|all
- `q` (optional): Full-text search in prompt/result
- `include_raw` (optional): 1 to include raw markdown

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### History Table

```sql
CREATE TABLE histories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_type VARCHAR(32),           -- cost, performance, structure, terraform, cli
  provider VARCHAR(64),            -- AWS, Azure, Google Cloud
  scale VARCHAR(64),               -- Small, Medium, Large
  loading VARCHAR(64),             -- Everyday, 3-5 days, No pressure
  country VARCHAR(128),            -- User's country/region
  prompt_text TEXT NOT NULL,       -- User's project description
  result_text TEXT NOT NULL,       -- LLM recommendation output
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Deployment

### Docker Image

**Build:**

```bash
cd frontend
docker build -t devops-advisor-next:latest .
```

**Run:**

```bash
docker run --rm -p 3000:3000 \
  --env-file .env.local \
  devops-advisor-next:latest
```

### Push to Azure ACR

```bash
# Login to ACR
az acr login --name group6acr

# Tag image
docker tag devops-advisor-next:latest group6acr.azurecr.io/devops-advisor-next:latest

# Push
docker push group6acr.azurecr.io/devops-advisor-next:latest
```

### Terraform Infrastructure Provisioning

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan \
  -var="ARM_SUBSCRIPTION_ID=<your-subscription-id>" \
  -out=tfplan

# Apply infrastructure
terraform apply tfplan

# View outputs
terraform output
```

### Kubernetes Deployment

**Prerequisites:**

- AKS cluster running
- kubectl configured
- ACR integrated with AKS

**Deployment Steps:**

```bash
# 1. Connect to AKS
az aks get-credentials \
  --resource-group rg-devops-group6 \
  --name devopsa-aks \
  --overwrite-existing

# 2. Apply namespace and secrets
kubectl apply -f k8s_solution/namespace.yml
kubectl apply -f k8s_solution/db/secret.yaml
kubectl apply -f k8s_solution/redis/secret.yaml
kubectl apply -f k8s_solution/frontend-app/secret.yaml

# 3. Deploy data stores
kubectl apply -k k8s_solution/db
kubectl apply -k k8s_solution/redis

# Wait for PostgreSQL to be ready
kubectl wait --namespace devops-advisor \
  --for=condition=ready pod -l app=postgres \
  --timeout=180s

# 4. (Optional) Apply ClusterIssuers for cert-manager
kubectl apply -f k8s_solution/cert-manager-issuer.yaml

# 5. Deploy the Next.js app (service + ingress)
kubectl apply -k k8s_solution/frontend-app

# 6. (Optional) Setup App Gateway ingress for other workloads
kubectl apply -f k8s_solution/app-ingress-agic.yml

# 7. Monitor rollout
kubectl rollout status deployment/next-app -n default

# 8. Get ingress / service endpoints
kubectl get ingress -A
kubectl get svc -A -w

# 9. View pods
kubectl get pods -A
```

**Verify Deployment:**

```bash
# Check pod logs
kubectl logs -f deployment/next-app -n default

# Check database connection
kubectl exec -it deployment/postgres-db -n devops-advisor -- pg_isready

# Test frontend health locally
kubectl port-forward svc/next-app 3000:80 -n default
curl http://localhost:3000/
```

### ArgoCD GitOps Deployment

```bash
# Deploy ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Create application (points to this repo)
kubectl apply -f argocd-apps.yaml

# Check sync status
argocd app get devops-advisor-app
argocd app sync devops-advisor-app

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
```

---

## Monitoring

### Prometheus & Grafana

**Deploy Prometheus & Grafana:**

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  -f values-prometheus.yaml \
  -n monitoring --create-namespace

# Install Grafana separately (if needed)
helm install grafana grafana/grafana \
  -f values-grafana.yaml \
  -n monitoring

# Access Grafana
kubectl port-forward svc/grafana 3000:80 -n monitoring
# Open http://localhost:3000 (default: admin/admin)
```

### Application Monitoring

**Key Metrics:**

- Pod CPU/Memory usage
- Request latency and throughput
- Database connection pool usage
- OpenAI API call latency
- Error rates by endpoint

**Health Check Endpoints:**

```bash
# Frontend health
curl http://localhost:3000/health

# Prometheus metrics (if exposed)
curl http://localhost:9090/api/v1/query?query=up
```

### OpenTelemetry Integration

**Frontend Instrumentation:**

- Configured in `frontend/instrumentation.ts`
- Automatic tracing for React components, API calls
- Export to Vercel OTEL collector or self-hosted

**Backend Instrumentation:**

- Gunicorn access/error logs
- Structured logging for LLM calls
- Database query performance

---

## Security

### Secrets Management

**Kubernetes Secrets:**

```bash
# View secrets
kubectl get secrets -A

# Apply from sample files (edit first)
kubectl apply -f k8s_solution/db/secret.yaml
kubectl apply -f k8s_solution/redis/secret.yaml
kubectl apply -f k8s_solution/frontend-app/secret.yaml

# Patch individual keys later
kubectl patch secret postgres-secret -n devops-advisor -p \
  '{"data":{"POSTGRES_PASSWORD":"'$(echo -n 'new-pass' | base64)'"}}'
```

**Azure Key Vault Integration (Optional):**

```bash
# Enable Key Vault secret driver on AKS
az aks addon enable --addons azure-keyvault-secrets-provider \
  --name devopsa-aks \
  --resource-group rg-devops-group6

# Deploy SecretProviderClass
kubectl apply -f - <<EOF
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-keyvault
  namespace: devops-advisor
spec:
  provider: azure
  parameters:
    usePodIdentity: "true"
    keyvaultName: "devops-advisor-kv"
    objects: |
      array:
        - |
          objectName: "OPENAI-API-KEY"
          objectType: secret
        - |
          objectName: "FLASK-SECRET-KEY"
          objectType: secret
EOF
```

### Authentication & Authorization

**Backend Security:**

- Passwords hashed with Werkzeug (PBKDF2)
- Flask-Login session management
- CSRF protection via Flask
- SQL injection prevention via SQLAlchemy ORM

**Frontend Security:**

- NextAuth for session management
- HTTPS-only cookies
- XSS protection via React's built-in escaping
- CORS configured for backend domain

**Network Security:**

- Azure App Gateway HTTPS enforcement
- TLS 1.2+ only
- WAF (Web Application Firewall) rules
- Network Policies for K8s pod-to-pod communication

### Best Practices

✅ **Implemented:**

- Non-root user in Docker container (appuser)
- Resource limits on K8s pods (requests/limits)
- Health checks (readiness/liveness probes)
- Secrets in environment (never in code)
- Managed identity for AKS → ACR pull

⚠️ **Recommended Additions:**

- Enable audit logging on AKS
- Configure Network Policies for pod isolation
- Implement rate limiting on API endpoints
- Add request signing for sensitive endpoints
- Use managed identities for all cloud resources
- Enable encryption at rest for PostgreSQL
- Rotate secrets regularly (automation via GitOps)

---

## Troubleshooting

### Backend Issues

**Flask app won't start:**

```bash
# Check environment variables
env | grep OPENAI_API_KEY

# Check Python version
python --version

# Verify database connection
psql -U postgres -d devops_advisor_db -c "SELECT 1"

# Check Flask logs
python Flask_App.py 2>&1 | tail -50
```

**Database connection timeout:**

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs postgres-dev

# Test connection
psql -h localhost -U postgres -c "SELECT 1"
```

**OpenAI API errors:**

```bash
# Verify API key
echo $OPENAI_API_KEY

# Test OpenAI connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Frontend Issues

**Next.js build fails:**

```bash
# Clear build cache
rm -rf .next

# Rebuild
pnpm build

# Check TypeScript
pnpm run tsc --noEmit
```

**Tailwind CSS not loading:**

```bash
# Verify Tailwind config
cat tailwind.config.ts

# Rebuild CSS
pnpm build

# Clear browser cache
# Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Kubernetes Issues

**Pod won't start:**

```bash
# Check pod status
kubectl describe pod <pod-name> -n devops-advisor

# View pod logs
kubectl logs <pod-name> -n devops-advisor

# Check events
kubectl get events -n devops-advisor
```

**Database pod stuck pending:**

```bash
# Check PVC status
kubectl get pvc -n devops-advisor

# Check PV availability
kubectl get pv

# Describe PVC for details
kubectl describe pvc postgres-pvc -n devops-advisor
```

**App can't connect to database:**

```bash
# Verify DB service
kubectl get svc postgres-db -n devops-advisor

# Test DNS resolution
kubectl run -it --rm debug --image=alpine --restart=Never -- \
  sh -c 'apk add curl && curl http://postgres-db:5432'

# Check database pod is ready
kubectl get pod -l app=postgres -n devops-advisor
```

**LoadBalancer stuck on "pending":**

```bash
# Check service events
kubectl describe svc devops-advisor-lb -n devops-advisor

# On Azure, verify Load Balancer resource
az network lb list --resource-group MC_rg-devops-group6_devopsa-aks_southafricanorth

# Wait a few minutes (Azure LB provisioning can take time)
kubectl get svc devops-advisor-lb -n devops-advisor -w
```

### Terraform Issues

**Provider authentication failed:**

```bash
# Verify Azure CLI login
az account show

# Set subscription
az account set --subscription <subscription-id>

# Verify Terraform backend
terraform init -upgrade

# Check provider logs
TF_LOG=DEBUG terraform plan
```

**Resource conflicts:**

```bash
# List existing resources
az resource list --resource-group rg-devops-group6

# Remove conflicting resource
az resource delete --ids /subscriptions/...

# Try apply again
terraform apply
```

### Container Registry Issues

**ACR authentication failed:**

```bash
# Login to ACR
az acr login --name group6acr

# Verify credentials
cat ~/.docker/config.json

# On AKS, verify ACR integration
az aks show --resource-group rg-devops-group6 --name devopsa-aks \
  --query "acrProfile"
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write clear, descriptive commits:**

   ```bash
   git commit -m "feat(backend): add cost optimization for SAR pricing"
   ```

3. **Follow code style:**

   - Backend: Black formatter, type hints
   - Frontend: Biome formatter/linter
   - Test your changes locally

4. **Add tests** for new features:

   - Backend: Unit tests with pytest (if added)
   - Frontend: E2E tests with Playwright

5. **Submit a pull request** with:

   - Clear description of changes
   - Screenshots/videos if UI changes
   - Testing steps
   - Reference to related issues

6. **Review process:**
   - Code review by maintainers
   - Automated CI/CD checks
   - Merge after approval

---

## License

This project is licensed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## Acknowledgements

- **OpenAI** – GPT-4o-mini LLM for intelligent recommendations
- **Microsoft Azure** – AKS, ACR, and infrastructure services
- **Vercel** – Next.js framework and deployment platform
- **Prometheus & Grafana** – Monitoring and observability
- **ArgoCD** – GitOps continuous deployment
- **Hashicorp Terraform** – Infrastructure as Code
- **All open-source contributors** – Flask, SQLAlchemy, PostgreSQL, Kubernetes, and more

---

## Support & Resources

**Documentation:**

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

**Community:**

- GitHub Issues: Report bugs and feature requests
- GitHub Discussions: Ask questions and share ideas
- Pull Requests: Submit improvements

**Getting Help:**

- Review the [Troubleshooting](#troubleshooting) section
- Check existing GitHub issues
- Read endpoint documentation in [API Endpoints](#api-endpoints)
- Examine the subproject READMEs for detailed guides

---

## Project Status

✅ **Production Ready**

- Full-stack application with all core features
- Containerized and orchestrated on Kubernetes
- Infrastructure-as-Code with Terraform
- CI/CD automation with GitHub Actions and ArgoCD
- Monitoring and observability in place

🚀 **Future Enhancements**

- Async task queues for long-running LLM calls
- Advanced caching layer (Redis)
- Multi-language support for UI
- Mobile app (React Native)
- Enhanced analytics and reporting
- Community marketplace for custom advisors

---

## Contact

For questions, suggestions, or inquiries:

- **GitHub**: [@anas-443005129](https://github.com/anas-443005129)
- **Issues**: [GitHub Issues](https://github.com/anas-443005129/master_projectg6/issues)

---

**Last Updated:** November 25, 2025  
**Version:** 3.1.0  
**Maintained By:** DevOps Team
