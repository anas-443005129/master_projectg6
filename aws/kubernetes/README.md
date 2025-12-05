# Infracorkapp Kubernetes Deployment on AWS EKS

This directory contains all Kubernetes manifests and deployment scripts for running Infracorkapp on Amazon EKS (Elastic Kubernetes Service).

## Overview

The deployment includes:

- **Infracorkapp**: Next.js application with 2 replicas for high availability
- **PostgreSQL**: Database with persistent EBS storage (20 GiB)
- **Redis**: Caching layer
- **AWS Load Balancer Controller**: Manages ALB for incoming traffic
- **cert-manager**: Automatic TLS certificate management with Let's Encrypt
- **Ingress**: Routes traffic from ALB to services with automatic HTTPS

## Architecture

```
Internet (HTTPS)
    ↓
Route53 (infrarock.tech)
    ↓
AWS ALB (Application Load Balancer)
    ↓
Ingress (TLS termination)
    ↓
Infracorkapp Service (3000)
    ↓
Infracorkapp Pods (2 replicas)
    ↓
PostgreSQL (Database)
Redis (Cache)
```

## Prerequisites

1. **AWS Account** with:
   - EKS cluster running (eksCluster-infracork-Infracork)
   - ECR repository created
   - EBS volume provisioned (vol-0e3e437a64fd7956a)
   - IAM permissions for ALB, Route53

2. **Tools installed**:
   - `kubectl` (v1.28+)
   - `aws-cli` (v2)
   - `helm` (v3)

3. **Domain**: infrarock.tech configured in Route53

## File Structure

```
kubernetes/
├── 01-storage.yaml              # StorageClass, PV, PVC for database
├── 02-config-secrets.yaml       # ConfigMaps and Secrets
├── 03-postgres.yaml             # PostgreSQL StatefulSet
├── 04-redis.yaml                # Redis Deployment
├── 05-infracorkapp.yaml         # Infracorkapp Deployment
├── 06-alb-controller-rbac.yaml  # ALB Controller RBAC
├── 07-cert-manager-issuer.yaml  # Let's Encrypt ClusterIssuers
├── 08-ingress.yaml              # ALB Ingress with TLS
├── deploy.sh                    # Automated deployment script
└── README.md                    # This file
```

## Quick Start

### 1. Prepare ECR Image

Push the Docker image to ECR before deploying:

```bash
# Build Docker image
docker-compose build

# Get ECR login password
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 319191252186.dkr.ecr.eu-central-1.amazonaws.com

# Tag image
docker tag master_projectg6-infracorkapp:latest 319191252186.dkr.ecr.eu-central-1.amazonaws.com/infracork-app-infracork:latest

# Push to ECR
docker push 319191252186.dkr.ecr.eu-central-1.amazonaws.com/infracork-app-infracork:latest
```

### 2. Update kubeconfig

```bash
aws eks update-kubeconfig --name eksCluster-infracork-Infracork --region eu-central-1
```

### 3. Update Configuration

Edit `02-config-secrets.yaml` to update:
- ECR registry credentials (base64 encoded)
- AUTH_SECRET (use a strong random value)
- Database password (change from default)

### 4. Run Deployment Script

```bash
chmod +x kubernetes/deploy.sh
./kubernetes/deploy.sh
```

### 5. Manual Deployment (Alternative)

Apply manifests in order:

```bash
# Step 1: Storage
kubectl apply -f kubernetes/01-storage.yaml

# Step 2: Configuration
kubectl apply -f kubernetes/02-config-secrets.yaml

# Step 3: Database
kubectl apply -f kubernetes/03-postgres.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n infracork --timeout=300s

# Step 4: Cache
kubectl apply -f kubernetes/04-redis.yaml
kubectl wait --for=condition=ready pod -l app=redis -n infracork --timeout=300s

# Step 5: Application
kubectl apply -f kubernetes/05-infracorkapp.yaml

# Step 6: Install EBS CSI Driver (required for PV/PVC)
kubectl apply -k github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.24

# Step 7: ALB Controller RBAC
kubectl apply -f kubernetes/06-alb-controller-rbac.yaml

# Step 8: cert-manager
helm repo add jetstack https://charts.jetstack.io --force-update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Step 9: Certificate Issuers
kubectl apply -f kubernetes/07-cert-manager-issuer.yaml

# Step 10: AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts --force-update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --namespace kube-system \
  --set clusterName=eksCluster-infracork-Infracork

# Step 11: Ingress
kubectl apply -f kubernetes/08-ingress.yaml
```

## Configuration

### Environment Variables

Update in `02-config-secrets.yaml`:

```yaml
NEXTAUTH_URL: "https://infrarock.tech"
POSTGRES_HOST: "postgres"
POSTGRES_PORT: "5432"
REDIS_HOST: "redis"
REDIS_PORT: "6379"
```

### Storage Configuration

The deployment uses AWS EBS volumes via:
- **StorageClass**: `ebs-gp3` (gp3 type with 3000 IOPS)
- **PersistentVolume**: `infracork-db-pv` (20 GiB, vol-0e3e437a64fd7956a)
- **PersistentVolumeClaim**: `postgres-pvc` (requested by PostgreSQL)

### TLS Certificates

Certificates are automatically managed by cert-manager:
- **Issuer**: Let's Encrypt Production
- **Email**: admin@infrarock.tech
- **Domains**: infrarock.tech, www.infrarock.tech
- **Secret Name**: infrarock-tls

### ALB Configuration

The ALB is configured with:
- **Scheme**: Internet-facing
- **Target Type**: IP
- **Health Check**: HTTP on port 3000
- **SSL Redirect**: HTTP → HTTPS
- **Listeners**: HTTP (80) → HTTPS (443)

## Verification

### Check Deployment Status

```bash
# View all resources
kubectl get all -n infracork

# Check pods
kubectl get pods -n infracork -w

# Check services
kubectl get svc -n infracork

# Check ingress
kubectl get ingress -n infracork

# View ingress details
kubectl describe ingress infracorkapp-ingress -n infracork
```

### Get ALB Endpoint

```bash
kubectl get ingress infracorkapp-ingress -n infracork -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Check Certificate Status

```bash
# List certificates
kubectl get certificate -n infracork

# View certificate details
kubectl describe certificate infrarock-tls -n infracork

# Check certificate secret
kubectl get secret infrarock-tls -n infracork -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text -noout
```

### View Logs

```bash
# Application logs
kubectl logs -f deployment/infracorkapp -n infracork

# ALB Controller logs
kubectl logs -f deployment/aws-load-balancer-controller -n kube-system

# cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager
```

## Domain Configuration

### Route53

1. Go to Route53 Console
2. Select hosted zone for `infrarock.tech`
3. Create DNS record:
   - **Type**: ALIAS or CNAME
   - **Name**: infrarock.tech (or www.infrarock.tech)
   - **Target**: ALB hostname (e.g., `k8s-infracor-infraco-xxxxx.eu-central-1.elb.amazonaws.com`)
   - **TTL**: 300

Example ALIAS record:
```
infrarock.tech  ALIAS  <ALB-HOSTNAME>
www.infrarock.tech  ALIAS  <ALB-HOSTNAME>
```

### External Domain Registrar

If your domain is registered elsewhere:
1. Update nameservers to AWS Route53 nameservers
2. Or create CNAME records pointing to ALB hostname

## Scaling

### Scale Application Replicas

```bash
kubectl scale deployment infracorkapp --replicas=3 -n infracork
```

### Scale Database Storage

```bash
kubectl patch pvc postgres-pvc -p '{"spec":{"resources":{"requests":{"storage":"50Gi"}}}}' -n infracork
```

### Horizontal Pod Autoscaler

Create HPA for automatic scaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: infracorkapp-hpa
  namespace: infracork
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: infracorkapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Troubleshooting

### Application Pod Crashing

```bash
# Check pod logs
kubectl logs <pod-name> -n infracork

# Describe pod
kubectl describe pod <pod-name> -n infracork

# Check events
kubectl get events -n infracork --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -n infracork -- psql -h postgres -U postgres -c "SELECT 1"

# Check database pod
kubectl logs postgres-0 -n infracork
```

### ALB Not Created

```bash
# Check ALB controller
kubectl get deployment -n kube-system | grep load-balancer

# View controller logs
kubectl logs -f deployment/aws-load-balancer-controller -n kube-system

# Check ingress events
kubectl describe ingress infracorkapp-ingress -n infracork
```

### Certificate Not Issued

```bash
# Check certificate status
kubectl describe certificate infrarock-tls -n infracork

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager

# Check certificate request
kubectl get certificaterequest -n infracork
```

### DNS Not Resolving

```bash
# Test DNS from pod
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup infrarock.tech

# Check Route53 records
aws route53 list-resource-record-sets --hosted-zone-id <ZONE-ID>
```

## Security Best Practices

1. **Secrets Management**:
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly
   - Use IRSA (IAM Roles for Service Accounts)

2. **Network Security**:
   - Implement Network Policies
   - Use security groups on ALB
   - Enable WAF on ALB if needed

3. **TLS/SSL**:
   - Always use HTTPS in production
   - Keep certificates updated automatically via cert-manager
   - Monitor certificate expiration

4. **RBAC**:
   - Implement least privilege access
   - Use namespace-level service accounts
   - Audit RBAC decisions

5. **Pod Security**:
   - Use distroless or minimal images
   - Run containers as non-root
   - Implement resource limits
   - Use readiness/liveness probes

## Maintenance

### Update Application Image

```bash
kubectl set image deployment/infracorkapp \
  infracorkapp=319191252186.dkr.ecr.eu-central-1.amazonaws.com/infracork-app-infracork:v2.0 \
  -n infracork
```

### Database Backup

```bash
# Create backup pod
kubectl exec -it postgres-0 -n infracork -- pg_dump -U postgres infracorkapp > backup.sql

# Restore from backup
kubectl exec -i postgres-0 -n infracork -- psql -U postgres infracorkapp < backup.sql
```

### Rolling Update

```bash
kubectl patch deployment infracorkapp -p \
  '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}' \
  -n infracork
```

## Support

For issues or questions, refer to:
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## License

This deployment configuration is part of the Infracorkapp project.
