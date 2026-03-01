terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.5"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_pages_project" "timer" {
  account_id        = var.cloudflare_account_id
  name              = "timer-bucks-poker-com"
  production_branch = "main"

  build_config {
    build_command   = "bun run build"
    destination_dir = "dist"
    root_dir        = "/"
  }
}