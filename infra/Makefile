.DEFAULT_GOAL := plan

.PHONY: init plan apply destroy applyonly

init:
	@echo "Initializing Terraform 🏃"
	@terraform init

plan: init
	@echo "Executing Plan 🤖"
	@terraform plan -out .tfplan

applyonly:
	@echo "Applying Terraform 🚀"
	@terraform apply -parallelism=20 .tfplan

destroy: init
	@echo "Destroying Infrastructure 😈"
	@terraform destroy


all: init plan apply

plan: init

apply: init plan applyonly

