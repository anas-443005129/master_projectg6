variable "managed_disk_name" {
  description = "The name of the managed disk"
  type        = string
}

variable "disk_size_gb" {
  description = "The size of the managed disk in GB"
  type        = number
  default     = 32
}

variable "storage_account_type" {
  description = "The type of storage account for the managed disk (Standard_LRS, Premium_LRS, StandardSSD_LRS, UltraSSD_LRS)"
  type        = string
  default     = "Standard_LRS"
}

variable "aks_resource_group_name" {
  description = "The resource group where your AKS cluster is located"
  type        = string
}

variable "aks_cluster_name" {
  description = "The name of your AKS cluster"
  type        = string
}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "resource_prefix" {}
variable "environment" {}
variable "aks_principal_id" {
  type = string
}
variable "azurerm_resource_group_id" {
    type = string
}