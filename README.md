# LLM DevOps Advisor Platform

## Overview

LLM DevOps Advisor is a cloud-native, production-grade platform that leverages Large Language Models (LLMs) to provide expert DevOps, cloud cost, and performance optimization guidance. The application is built with Python (Flask), containerized for scalable deployment, and orchestrated using Kubernetes (AKS) with full infrastructure-as-code (Terraform), CI/CD automation (GitHub Actions), and advanced monitoring (Prometheus, Grafana). It is designed for extensibility, security, and operational excellence in modern cloud environments.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Infrastructure Provisioning](#infrastructure-provisioning)
- [CI/CD Pipeline](#cicd-pipeline)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **LLM-powered DevOps Guidance:** Interactive web app for cloud cost and performance optimization using OpenAI models.
- **User Authentication:** Secure login and registration with hashed passwords and session management.
- **History Tracking:** Stores user queries and LLM responses for cost, performance, and architecture recommendations.
- **Multi-cloud Support:** Context-aware recommendations for AWS, Azure, and Google Cloud.
- **Cost & Performance Analysis:** Dynamic prompts for region, scale, and workload, with SAR-based cost breakdowns.
- **Infrastructure-as-Code:** Modular Terraform for Azure resources (AKS, ACR, PostgreSQL, monitoring, etc.).
- **Containerization:** Dockerfile and docker-compose for local development and production builds.
- **Kubernetes Orchestration:** Manifests for app and database deployments, secrets, ingress, HPA, and service exposure.
- **CI/CD Automation:** GitHub Actions workflows for provisioning, building, pushing, and deploying.
- **Monitoring & Observability:** Prometheus and Grafana integration for metrics and dashboards.
- **Secrets Management:** Secure handling of API keys and DB credentials via Kubernetes secrets and Key Vault.

---

## Architecture

- **Frontend:** HTML templates served by Flask (can be extended to React/Vue).
- **Backend:** Flask app with SQLAlchemy ORM, OpenAI API integration, and RESTful endpoints.
- **Database:** PostgreSQL, containerized and managed via Kubernetes and Terraform.
- **Containerization:** Python 3.11-slim base, non-root user, healthchecks, and environment variable injection.
- **Orchestration:** AKS cluster with namespace isolation, readiness/liveness probes, resource requests/limits.
- **Infrastructure:** Terraform modules for resource groups, AKS, ACR, disks, and more.
- **CI/CD:** Multi-stage GitHub Actions workflows for infra provisioning, image build/push, platform config, and exposure.
- **Monitoring:** Prometheus and Grafana deployed via Helm/Ansible, with secrets and access control.
- **Secrets:** Managed via Kubernetes secrets and optionally Azure Key Vault.

---

## Technology Stack
- **Languages:** Python 3.11, SQL, YAML, HCL (Terraform)
- **Frameworks:** Flask, SQLAlchemy, Flask-Login
- **Containerization:** Docker, docker-compose
- **Orchestration:** Kubernetes (AKS)
- **Infrastructure:** Terraform (Azure provider)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana
- **Cloud:** Azure (AKS, ACR, PostgreSQL, App Gateway, Key Vault)
- **LLM Integration:** OpenAI API

---

## Folder Structure

```
proj_Devops/
├── Flask_App.py                # Main Flask application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container build instructions
├── docker-compose.dev.yml      # Local dev multi-service setup
├── static/                     # CSS/JS assets
├── templates/                  # HTML templates
├── k8s_solution/               # Kubernetes manifests
│   ├── api-deploy.yml          # App deployment
│   ├── db-deploy.yml           # DB deployment
│   ├── ...                     # Ingress, secrets, HPA, services
├── terraform/                  # Infrastructure-as-Code
│   ├── main.tf                 # Root config
│   ├── providers.tf            # Provider setup
│   ├── variables.tf            # Input variables
│   ├── modules/                # Modular resources (acr, aks, disk, resourcegroups)
├── .github/workflows/          # CI/CD workflows
│   └── deploy.yml              # Main pipeline
```

---

## Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Terraform 1.5+
- Azure CLI
- kubectl
- Ansible (for ArgoCD/monitoring)
- GitHub account with repository secrets configured

### Local Development
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd proj_Devops
   ```
2. Create a `.env` file with required secrets (see sample in code):
   - `OPENAI_API_KEY`
   - `FLASK_SECRET_KEY`
   - `DB_PASSWORD`
3. Start services with Docker Compose:
   ```sh
   docker-compose -f docker-compose.dev.yml up --build
   ```
4. Access the app at `http://localhost:5002` (default port).

---

## Configuration

- **Environment Variables:**
  - `OPENAI_API_KEY`: OpenAI API key for LLM queries
  - `FLASK_SECRET_KEY`: Flask session secret
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection
- **Kubernetes Secrets:**
  - Managed via `app-secret.yml` and `db-secret.yml` manifests
- **Terraform Variables:**
  - Set in `terraform.tfvars` or via pipeline

---

## Development Workflow

- **Python:**
  - Edit `Flask_App.py` and templates
  - Install dependencies: `pip install -r requirements.txt`
- **Containerization:**
  - Build image: `docker build -t devops-advisor:latest .`
  - Run locally: `docker run -p 5001:5001 --env-file .env devops-advisor:latest`
- **Database:**
  - PostgreSQL runs as a container, persistent volume via Docker/K8s
- **Testing:**
  - Add unit/integration tests in a `tests/` folder (not included by default)

---

## Infrastructure Provisioning

- **Terraform:**
  - Modular structure for resource groups, AKS, ACR, disks
  - Example usage:
    ```sh
    cd terraform
    terraform init
    terraform apply -var="ARM_SUBSCRIPTION_ID=<id>" ...
    ```
  - Variables for location, prefix, environment, disk size, etc.
- **Modules:**
  - `resourcegroups`, `acr`, `aks`, `disk` (extendable)

---

## CI/CD Pipeline

- **GitHub Actions:**
  - Multi-job workflow: infra provisioning, image build/push, platform config, exposure
  - Secrets required: `AZURE_CREDENTIALS`, `OPENAI_API_KEY`, `FLASK_SECRET_KEY`, `POSTGRES_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`
  - Automated steps:
    - Provision infra with Terraform
    - Build/push Docker image to ACR
    - Configure AKS, ArgoCD, monitoring
    - Deploy manifests via ArgoCD
    - Expose app via AGIC (App Gateway Ingress Controller)
    - Enable HPA (Horizontal Pod Autoscaler)
    - Self-signed SSL for HTTPS

---

## Kubernetes Deployment

- **Manifests:**
  - App and DB deployments, services, secrets, ingress, HPA
  - Namespace isolation (`devops-advisor`)
  - Readiness/liveness probes for health
  - Resource requests/limits for scaling
- **Operational Steps:**
  - Connect to AKS
  - Apply manifests in order (namespace, secrets, DB, app)
  - Monitor rollout and external IP assignment

---

## Monitoring & Observability

- **Prometheus & Grafana:**
  - Deployed via Helm/Ansible
  - Grafana admin credentials managed via Kubernetes secret
  - Access dashboards via exposed service
- **Healthchecks:**
  - Dockerfile and K8s probes for app health
- **Logging:**
  - Application logs via gunicorn and Kubernetes

---

## Security

- **Secrets Management:**
  - All sensitive values stored in Kubernetes secrets
  - Optionally integrate with Azure Key Vault
- **User Authentication:**
  - Passwords hashed, sessions managed via Flask-Login
- **Network Security:**
  - HTTPS enforced via App Gateway
  - Private endpoints for DB/storage (extendable)
- **RBAC:**
  - AKS and ACR integration via managed identities

---

## Usage

- Register/login to access LLM-powered cost and performance recommendations
- Select cloud provider, scale, and workload details
- View history of queries and responses
- Export history as JSON
- Monitor app and DB health via Grafana

---

## Troubleshooting

- **App Fails to Start:**
  - Check `.env` for required variables
  - Ensure DB container is healthy
- **Kubernetes Issues:**
  - Validate secrets and manifests
  - Check pod logs and rollout status
- **Terraform Errors:**
  - Confirm provider credentials and variable values
- **CI/CD Failures:**
  - Review workflow logs for failed steps

---

## Contributing

Contributions are welcome! Please follow these guidelines:
- Fork the repository and create a feature branch
- Write clear, descriptive commit messages
- Add/extend tests for new features
- Submit a pull request with detailed description

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Acknowledgements
- OpenAI for LLM API
- Azure for cloud infrastructure
- Prometheus & Grafana for monitoring
- All open-source contributors
