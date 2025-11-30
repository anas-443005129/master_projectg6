data "aws_vpc" "defaultInfracork" {
  default = true
}

data "aws_subnets" "defaultInfracork" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.defaultInfracork.id]
  }
}

# --- IAM role for EKS cluster ---
resource "aws_iam_role" "eks_cluster_role_Infracork" {
  name = "eksClusterRole-${var.app_name}-${var.name_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSClusterPolicy_Infracork" {
  role       = aws_iam_role.eks_cluster_role_Infracork.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSVPCResourceController_Infracork" {
  role       = aws_iam_role.eks_cluster_role_Infracork.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# --- EKS cluster ---
resource "aws_eks_cluster" "eksClusterInfracork" {
  name     = "eksCluster-${var.app_name}-${var.name_suffix}"
  role_arn = aws_iam_role.eks_cluster_role_Infracork.arn

  vpc_config {
    subnet_ids = data.aws_subnets.defaultInfracork.ids
  }

  tags = {
    Name    = "eksCluster-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_AmazonEKSClusterPolicy_Infracork,
    aws_iam_role_policy_attachment.eks_cluster_AmazonEKSVPCResourceController_Infracork
  ]
}

# --- IAM role for worker nodes ---
resource "aws_iam_role" "eks_node_role_Infracork" {
  name = "eksNodeRole-${var.app_name}-${var.name_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "worker_AmazonEKSWorkerNodePolicy_Infracork" {
  role       = aws_iam_role.eks_node_role_Infracork.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "worker_AmazonEKS_CNI_Policy_Infracork" {
  role       = aws_iam_role.eks_node_role_Infracork.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "worker_AmazonEC2ContainerRegistryReadOnly_Infracork" {
  role       = aws_iam_role.eks_node_role_Infracork.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# --- Launch template for node group with IMDS configuration ---
resource "aws_launch_template" "eks_node_launch_template_Infracork" {
  name_prefix = "eks-node-${var.app_name}-${var.name_suffix}-"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "disabled"
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name    = "eks-node-${var.app_name}-${var.name_suffix}"
      Project = "Infracork"
    }
  }
}

# --- Managed node group ---
resource "aws_eks_node_group" "eksNodeGroupInfracork" {
  cluster_name    = aws_eks_cluster.eksClusterInfracork.name
  node_group_name = "eksNodeGroup-${var.app_name}-${var.name_suffix}"
  node_role_arn   = aws_iam_role.eks_node_role_Infracork.arn
  subnet_ids      = data.aws_subnets.defaultInfracork.ids

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  launch_template {
    id      = aws_launch_template.eks_node_launch_template_Infracork.id
    version = "$Latest"
  }

  tags = {
    Name    = "eksNodeGroup-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }

  depends_on = [
    aws_iam_role_policy_attachment.worker_AmazonEKSWorkerNodePolicy_Infracork,
    aws_iam_role_policy_attachment.worker_AmazonEKS_CNI_Policy_Infracork,
    aws_iam_role_policy_attachment.worker_AmazonEC2ContainerRegistryReadOnly_Infracork
  ]
}
