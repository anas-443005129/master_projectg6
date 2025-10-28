terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0.0"
    }
  }
}

provider "azurerm" {
  # Configuration options
  subscription_id = var.ARM_SUBSCRIPTION_ID
  features {
    resource_group {
      # Extra safety: don't allow deleting RGs that still have resources
      prevent_deletion_if_contains_resources = true
    }
  }
}
terraform {
  backend "azurerm" {
    resource_group_name   = "Group-6"      
    storage_account_name  = "group6sa"
    container_name        = "tfstate"
    key                   = "terraform.tfstate"
  }
}

