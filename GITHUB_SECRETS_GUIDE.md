# 🔐 GitHub Secrets Configuration

You need to add these **11 secrets** to your GitHub repository:

## 📋 Repository Settings → Secrets and Variables → Actions → New Repository Secret

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `AZURE_CREDENTIALS` | ✅ **Already Added** | Service Principal JSON from Azure |
| `AZURE_SUBSCRIPTION_ID` | `12345678-1234-1234-1234-123456789012` | Your Azure subscription ID |
| `EXISTING_ACR_NAME` | `group6acr` | Your existing ACR name |
| `TERRAFORM_RG` | `rg-devops-group6` | Resource group from Terraform |
| `AKS_CLUSTER` | `devopsa-aks` | AKS cluster name from Terraform |
| `IMAGE_NAME` | `devops-advisor` | Docker image name |
| `OPENAI_API_KEY` | `sk-proj-abc123...` | Your OpenAI API key |
| `FLASK_SECRET_KEY` | `my-super-secret-key-2024` | Random string for Flask sessions |
| `POSTGRES_USER` | `postgres` | Database username |
| `POSTGRES_PASSWORD` | `SecurePassword123!` | Database password |
| `POSTGRES_DB` | `devops_advisor_db` | Database name |

## 🔍 How to Get Azure Subscription ID:

```bash
az login
az account show --query id --output tsv
```

## 🚀 What Happens When You Push:

1. **Azure Login** ✅
2. **Build Docker Images** 🐳
3. **Push to ACR** (`group6acr`) 📦
4. **Create Infrastructure** (Terraform) 🏗️
5. **Connect to AKS** ⚙️
6. **Link ACR to AKS** 🔗
7. **Deploy K8s YAML Files** ☸️

## 📊 Expected Result:

- ✅ PostgreSQL database running
- ✅ Flask app with 2 replicas
- ✅ LoadBalancer service with external IP
- ✅ All secrets properly configured
- 🌐 **Your app will be accessible via external IP**

## 💡 After Deployment:

```bash
# Check status
kubectl get pods -n devops-advisor
kubectl get svc -n devops-advisor

# Get external IP
kubectl get svc devops-advisor-lb -n devops-advisor
```

**That's it!** Push to main branch and watch the magic happen! 🎉