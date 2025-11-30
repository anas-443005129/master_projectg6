resource "aws_ecr_repository" "appInfracork" {
  name                 = "${var.app_name}-app-${lower(var.name_suffix)}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.app_name}-app-${var.name_suffix}"
    Project = "Infracork"
  }
}
