variable "cloudflare_api_token" {
  description = "Cloudflare API token with Account:Pages:Edit, Zone:Zone:Read, Zone:DNS:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}