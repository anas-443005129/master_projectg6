output "app_image_url" {
  description = "ECR image URL for Infracorkapp"
  value       = module.ecsInfracork.app_image_url
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eksInfracork.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eksInfracork.cluster_endpoint
}

output "data_disk_id" {
  description = "EBS volume ID for database"
  value       = module.diskInfracork.data_disk_id
}

output "resource_group_arn_Infracork" {
  description = "AWS Resource Group ARN for Infracork"
  value       = module.resourceGroupInfracork.group_arn
}
