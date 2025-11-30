variable "aws_region" {
  description = "AWS region for all Infracork resources"
  type        = string
  default     = "eu-central-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "app_name" {
  description = "Base application name"
  type        = string
  default     = "infracork"
}

variable "name_suffix" {
  description = "Suffix added to all resource names"
  type        = string
  default     = "Infracork"
}

variable "disk_availability_zone" {
  description = "AZ for the DB EBS disk"
  type        = string
  default     = "eu-central-1a"
}

variable "disk_size_gib" {
  description = "Size of the DB data disk (GiB)"
  type        = number
  default     = 20
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}
