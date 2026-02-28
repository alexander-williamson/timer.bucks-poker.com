variable "cloudflare_api_token" {
  description = "Cloudflare API token with Pages:Edit permission"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}
