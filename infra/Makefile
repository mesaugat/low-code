.SHELLFLAGS := -ec
.DEFAULT_GOAL := plan

init:
	echo "Initializing Terraform 🏃"
	terraform init

plan:
	echo "Executing Plan 🤖"
	terraform plan -out .tfplan

apply:
	echo "Applying Terraform 🚀"
	terraform apply .tfplan

destroy:
	echo "Destroying Infrastructure 😈"
	terraform destroy


all: init plan apply

plan: init
