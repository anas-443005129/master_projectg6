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
