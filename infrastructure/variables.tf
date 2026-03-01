variable "cloudflare_api_token" {
  description = "Cloudflare API token with Pages:Edit permission"
  type        = string
  sensitive   = true
  default = "RLnt0KJf00eigDwViEtKQUxjK3bxdfwHrGJDTFIC"
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  default = "0b6d905d5bc315da27e37c0853e6f183"
}

variable "github_owner" {
  description = "GitHub account or organisation that owns the repository"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without owner prefix)"
  type        = string
  default     = "timer.bucks-poker.com"
}
