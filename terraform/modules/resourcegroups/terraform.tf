resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.resource_group_location

  tags = {
    provisioner = "${lower(replace(var.author, " ", "-"))}-terraform"
  }

  lifecycle {
    prevent_destroy = true
  }
}


resource "azurerm_management_lock" "rg_cannot_delete" {
  name       = "protect-${azurerm_resource_group.this.name}"
  scope      = azurerm_resource_group.this.id
  lock_level = "CanNotDelete"
  notes      = "Managed by Terraform: prevents accidental deletion of the resource group. Remove this lock intentionally before delete."
}
