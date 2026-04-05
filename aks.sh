# This is not necessarily meant to be run as a script, but more of a set of commands to run in sequence to create an AKS cluster, build and push the image, and deploy the service.
# Since there is a manual step to update the manifest with the login server and image namespace

$ACR_NAME="acrname" # this needs to be purely alphanumeric and unique across Azure
$RESOURCE_GROUP="rg-dev-utils"
$LOCATION="westus"
$IMAGE_NAMESPACE="aks-dev-utils"
$CLUSTER_NAME="dev_utils_cluster"

# create resource group and container registry
az group create --name $RESOURCE_GROUP --location $LOCATION
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --location $LOCATION

# build and push the image to ACR
az acr build --registry $ACR_NAME --image $IMAGE_NAMESPACE/utils:latest .

# create the AKS cluster and attach ACR
# this will attempt role assignments so you will need to have owner permissions on the subscription
az aks create --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --node-count 3 --node-vm-size standard_l8s_v3 --generate-ssh-keys --attach-acr $ACR_NAME

# az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME
# kubectl get nodes # to verify the cluster

# get this from the create command output or the below
# $LOGIN_SERVER=$(az acr show --name $ACR_NAME --query "loginServer" --output tsv)

# you need to update the placeholder in the manifest with the login server and image namespace from above
kubectl apply -f aks-service-manifest.yml

# kubectl delete -f aks-service-manifest.yml