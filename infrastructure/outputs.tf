output "pages_project_subdomain" {
  description = "Cloudflare Pages auto-assigned subdomain"
  value       = cloudflare_pages_project.timer.subdomain
}
