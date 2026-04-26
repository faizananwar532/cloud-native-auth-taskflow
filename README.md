# cloud-native-auth-taskflow

terraform init -backend-config=backend.conf
terraform init -upgrade
terraform plan -var-file=secrets.tfvars
terraform apply -var-file=secrets.tfvars


kubectl patch storageclass gp2 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

helm install taskflow . --namespace taskflow --create-namespace
helm upgrade taskflow . --namespace taskflow

