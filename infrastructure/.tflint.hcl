plugin "azurerm" {
  enabled = true
  version = "0.27.0"
  source = "github.com/terraform-linters/tflint-ruleset-azurerm"
}

plugin "terraform" {
  enabled = true
  version = "0.9.1"
  source = "github.com/terraform-linters/tflint-ruleset-terraform"
}
