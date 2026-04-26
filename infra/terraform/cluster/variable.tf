variable "access_key" {
  description = "AWS access key"
  sensitive   = true
}

variable "secret_key" {
  description = "AWS secret key"
  sensitive   = true
}

variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "clustername" {
  default     = "staging"
  description = "EKS Cluster Name"
}

variable "spot_instance_types" {
  default     = ["t3.small", "t3a.small", "t2.small"]
  description = "SPOT instance types - using Free Tier eligible instances"
}

variable "spot_max_size" { default = 3 }
variable "spot_min_size" { default = 2 }
variable "spot_desired_size" { 
  description = "desired compute count"
  default = 2 
}

variable "ecr_name" {
  default = "trainings"
}