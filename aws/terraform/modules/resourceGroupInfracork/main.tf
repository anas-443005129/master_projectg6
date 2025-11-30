resource "aws_resourcegroups_group" "infracork_group" {
  name = "${var.app_name}-${var.name_suffix}-group"

  description = "Resource group for ${var.app_name} ${var.name_suffix} resources"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Project"
          Values = ["Infracork"]
        }
      ]
    })
  }

  tags = {
    Name    = "${var.app_name}-${var.name_suffix}-group"
    Project = "Infracork"
  }
}
