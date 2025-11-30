output "group_arn" {
  description = "ARN of the AWS Resource Group for Infracork"
  value       = aws_resourcegroups_group.infracork_group.arn
}
