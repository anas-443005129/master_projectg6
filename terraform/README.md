# Terraform

This folder contains Terraform configurations used to provision cloud infrastructure (AKS, ACR, resource groups, disks, etc.).

Getting started

```bash
cd terraform
terraform init
terraform plan -out plan.tfplan
terraform apply plan.tfplan
```

Notes
- Supply cloud provider credentials via environment variables or a provider-specific auth file.
- Use `variables.tf` and `terraform.tfvars` (or CLI `-var` flags) to set environment-specific values.
- Modules live in `modules/` and are designed to be reusable.

Always review the plan before applying changes to production.
