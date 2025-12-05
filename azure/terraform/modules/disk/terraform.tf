resource "azurerm_role_assignment" "aks_disk_contributor" {
  scope                = var.azurerm_resource_group_id
  role_definition_name = "Contributor"
  principal_id         = var.aks_principal_id
}

resource "azurerm_managed_disk" "disk" {
  name                 = var.managed_disk_name
  location             = var.resource_group_location
  resource_group_name  = var.resource_group_name
  storage_account_type = var.storage_account_type
  create_option        = "Empty"
  disk_size_gb         = var.disk_size_gb
  
  depends_on = [azurerm_role_assignment.aks_disk_contributor]
}
