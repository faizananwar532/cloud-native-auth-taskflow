terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    argocd = {
      source  = "argoproj-labs/argocd"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

#### cluster resources
data "aws_eks_cluster" "stagingCluster" {
  name = var.clustername
}

data "aws_eks_cluster_auth" "clusterAuth" {
  name = var.clustername
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.stagingCluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.stagingCluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.clusterAuth.token
}

provider "helm" {
  kubernetes = {
    host                   = data.aws_eks_cluster.stagingCluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.stagingCluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.clusterAuth.token
  }
}

# Nginx ingress controller
resource "helm_release" "ingress_nginx" {
  name       = "opeth"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"

  set = [
    {
      name  = "controller.metrics.enabled"
      value = "true"
    },
    {
      name  = "controller.metrics.service.annotations.prometheus\\.io/scrape"
      value = "true"
      type  = "string"
    },
    {
      name  = "controller.metrics.service.annotations.prometheus\\.io/port"
      value = "10254"
      type  = "string"
    },
    {
      name  = "defaultBackend.enabled"
      value = "true"
    },
    {
      name  = "controller.service.type"
      value = "LoadBalancer"
    },
    {
      name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-backend-protocol"
      value = "tcp"
      type  = "string"
    },
    {
      name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-cross-zone-load-balancing-enabled"
      value = "true"
    },
    {
      name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
      value = "nlb"
      type  = "string"
    }
  ]
}

# argo cd config and installation using terraform and helm 
# resource "helm_release" "argocd" {
#   name             = "argocd"
#   repository       = "https://argoproj.github.io/argo-helm"
#   chart            = "argo-cd"
#   version          = "5.34.1"
#   namespace        = "argocd"
#   create_namespace = true

#   values = [file("argo-values.yaml")]

#   set_sensitive = [
#     {
#       name  = "configs.secret.argocdServerAdminPassword"
#       value = bcrypt(var.argoadminpassword)
#     }
#   ]

#   lifecycle {
#     ignore_changes = [
#       set_sensitive,
#       metadata,
#     ]
#   }
# }

# Configure the Argo CD provider
# Note: Update server_addr with ArgoCD LoadBalancer DNS after deployment
# provider "argocd" {
#   server_addr = "localhost:8080" # Temporary - update with LoadBalancer DNS after ArgoCD is deployed
#   username    = "admin"
#   password    = var.argoadminpassword
#   insecure    = true
# }

# # Add the GitHub repository to Argo CD
# resource "argocd_repository" "github_repo" {
#   repo = "https://github.com/faizananwar532/cloud-native-auth-taskflow" # Replace with your GitHub repository URL
#   username = var.github_username
#   password = var.github_token
#   depends_on = [helm_release.argocd]  
# }