variable "ARM_SUBSCRIPTION_ID" {
  type        = string
  description = "Azure Subscription ID"
}

variable "author" {
  type        = string
  description = "Author of the resources"
  default     = "group6"
}

variable "resource_prefix" {
  type        = string
  description = "Resource prefix for all resources"
  default     = "group6kub"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the Resource Group"
  default     = "group600"
}

variable "resource_group_location" {
  type        = string
  description = "Location of the Resource Group"
  default     = "southafricanorth"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "managed_disk_name" {
  description = "The name of the managed disk"
  type        = string
}

variable "disk_size_gb" {
  description = "The size of the managed disk in GB"
  type        = number
}

variable "storage_account_type" {
  description = "The type of storage account for the managed disk"
  type        = string
}

