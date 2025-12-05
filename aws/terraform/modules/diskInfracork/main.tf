resource "aws_ebs_volume" "dataVolume" {
  availability_zone = var.availability_zone
  size              = var.size_gib
  type              = "gp3"
  iops              = 3000
  throughput        = 125

  tags = {
    Name    = "${var.app_name}-data-${var.name_suffix}"
    Project = "Infracork"
  }
}
