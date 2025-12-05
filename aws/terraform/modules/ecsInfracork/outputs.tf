output "app_image_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.appInfracork.repository_url
}
