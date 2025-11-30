
module "resourceGroupInfracork" {
  source      = "./modules/resourceGroupInfracork"
  app_name    = var.app_name
  name_suffix = var.name_suffix
}
module "ecsInfracork" {
  source      = "./modules/ecsInfracork"
  aws_region  = var.aws_region
  app_name    = var.app_name
  name_suffix = var.name_suffix
}

module "diskInfracork" {
  source              = "./modules/diskInfracork"
  aws_region          = var.aws_region
  app_name            = var.app_name
  name_suffix         = var.name_suffix
  availability_zone   = var.disk_availability_zone
  size_gib            = var.disk_size_gib
}

module "eksInfracork" {
  source      = "./modules/eksInfracork"
  aws_region  = var.aws_region
  app_name    = var.app_name
  name_suffix = var.name_suffix
  app_image_url = module.ecsInfracork.app_image_url
  data_disk_id = module.diskInfracork.data_disk_id
}

# --- IRSA for EBS CSI Driver ---
# Get cluster OIDC issuer
data "aws_eks_cluster" "infracork" {
  name = module.eksInfracork.cluster_name
}

data "tls_certificate" "eks_oidc" {
  url = data.aws_eks_cluster.infracork.identity[0].oidc[0].issuer
}

# Create OIDC provider for IRSA
resource "aws_iam_openid_connect_provider" "eks" {
  url = data.aws_eks_cluster.infracork.identity[0].oidc[0].issuer

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint
  ]

  tags = {
    Name    = "eksOIDC-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }
}

# Trust policy for EBS CSI driver
data "aws_iam_policy_document" "ebs_csi_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

# IAM role for EBS CSI driver
resource "aws_iam_role" "ebs_csi_driver" {
  name               = "ebs-csi-driver-${var.app_name}-${var.name_suffix}"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json

  tags = {
    Name    = "ebsCSIDriver-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }
}

# Attach EBS CSI driver policy
resource "aws_iam_role_policy_attachment" "ebs_csi_driver" {
  role       = aws_iam_role.ebs_csi_driver.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# Install EBS CSI driver as EKS addon
resource "aws_eks_addon" "ebs_csi" {
  cluster_name             = module.eksInfracork.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  service_account_role_arn = aws_iam_role.ebs_csi_driver.arn
  resolve_conflicts        = "OVERWRITE"

  tags = {
    Name    = "ebsCSIAddon-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }

  depends_on = [
    aws_iam_role_policy_attachment.ebs_csi_driver
  ]
}

# --- IRSA for ALB Controller ---
# Trust policy for ALB controller
data "aws_iam_policy_document" "alb_controller_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

# IAM role for ALB controller
resource "aws_iam_role" "alb_controller" {
  name               = "alb-controller-${var.app_name}-${var.name_suffix}"
  assume_role_policy = data.aws_iam_policy_document.alb_controller_assume_role.json

  tags = {
    Name    = "albController-${var.app_name}-${var.name_suffix}"
    Project = "Infracork"
  }
}

# ALB controller policy with ACM permissions
data "aws_iam_policy_document" "alb_controller_policy" {
  statement {
    effect = "Allow"
    actions = [
      "elbv2:CreateLoadBalancer",
      "elbv2:DeleteLoadBalancer",
      "elbv2:DescribeLoadBalancers",
      "elbv2:DescribeTargetGroups",
      "elbv2:ModifyLoadBalancerAttributes",
      "elbv2:ModifyTargetGroup",
      "elbv2:ModifyTargetGroupAttributes",
      "elbv2:DeleteTargetGroup",
      "elbv2:CreateTargetGroup",
      "elbv2:CreateListener",
      "elbv2:DeleteListener",
      "elbv2:CreateRule",
      "elbv2:DeleteRule",
      "elbv2:ModifyRule",
      "elbv2:DescribeListeners",
      "elbv2:DescribeRules",
      "elbv2:DescribeSSLPolicies",
      "elbv2:DescribeTags",
      "elbv2:AddTags",
      "elbv2:RemoveTags",
      "elbv2:RegisterTargets",
      "elbv2:DeregisterTargets",
      "elbv2:DescribeTargetHealth"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "elasticloadbalancing:CreateLoadBalancer",
      "elasticloadbalancing:DeleteLoadBalancer",
      "elasticloadbalancing:DescribeLoadBalancers",
      "elasticloadbalancing:DescribeLoadBalancerAttributes",
      "elasticloadbalancing:DescribeAccountLimits",
      "elasticloadbalancing:DescribeTargetGroups",
      "elasticloadbalancing:DescribeTargetGroupAttributes",
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:ModifyTargetGroup",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:DeleteTargetGroup",
      "elasticloadbalancing:CreateTargetGroup",
      "elasticloadbalancing:CreateListener",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:DeleteListener",
      "elasticloadbalancing:AddListenerCertificates",
      "elasticloadbalancing:RemoveListenerCertificates",
      "elasticloadbalancing:CreateRule",
      "elasticloadbalancing:DeleteRule",
      "elasticloadbalancing:ModifyRule",
      "elasticloadbalancing:DescribeListeners",
      "elasticloadbalancing:DescribeListenerCertificates",
      "elasticloadbalancing:DescribeListenerAttributes",
      "elasticloadbalancing:DescribeRules",
      "elasticloadbalancing:DescribeSSLPolicies",
      "elasticloadbalancing:DescribeTags",
      "elasticloadbalancing:ListTagsForResource",
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:RemoveTags",
      "elasticloadbalancing:RegisterTargets",
      "elasticloadbalancing:DeregisterTargets",
      "elasticloadbalancing:DescribeTargetHealth",
      "elasticloadbalancing:SetIpAddressType",
      "elasticloadbalancing:SetSecurityGroups",
      "elasticloadbalancing:SetSubnets",
      "elasticloadbalancing:SetWebAcl"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeVpcs",
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeAddresses",
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeCoipPools",
      "ec2:DescribeInternetGateways",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeVpcEndpoints",
      "ec2:DescribeVpcPeeringConnections",
      "ec2:DescribeNatGateways",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeTags",
      "ec2:DescribeInstances",
      "ec2:DescribeRouteTables",
      "ec2:CreateSecurityGroup",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:DeleteSecurityGroup",
      "ec2:ModifySecurityGroupRules",
      "ec2:CreateTags",
      "ec2:DeleteTags"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:GetCoipPoolUsage"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "iam:CreateServiceLinkedRole",
      "iam:GetServerCertificate",
      "iam:ListServerCertificates"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "acm:ListCertificates",
      "acm:DescribeCertificate",
      "acm:GetCertificate"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "cognito-idp:DescribeUserPoolClient"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "waf:GetWebACL",
      "wafv2:GetWebACL"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "shield:DescribeProtection",
      "shield:GetSubscriptionState"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

# Create inline policy for ALB controller
resource "aws_iam_role_policy" "alb_controller_policy" {
  name   = "alb-controller-policy-${var.app_name}-${var.name_suffix}"
  role   = aws_iam_role.alb_controller.id
  policy = data.aws_iam_policy_document.alb_controller_policy.json
}

# Patch ALB controller service account with IAM role annotation
resource "null_resource" "patch_alb_controller_sa" {
  provisioner "local-exec" {
    command = <<-EOT
      kubectl annotate serviceaccount aws-load-balancer-controller \
        -n kube-system \
        eks.amazonaws.com/role-arn=${aws_iam_role.alb_controller.arn} \
        --overwrite
    EOT
  }

  depends_on = [
    aws_iam_role_policy.alb_controller_policy
  ]
}
