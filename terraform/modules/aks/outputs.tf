output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "aks_cluster_id" {
  value = azurerm_kubernetes_cluster.aks.id
}

output "kube_config" {
  value = azurerm_kubernetes_cluster.aks.kube_config_raw
}
output "aks_principal_id" {
  value = azurerm_kubernetes_cluster.aks.identity[0].principal_id
  description = "The principal ID of the AKS managed identity for Role Assignments"
}
