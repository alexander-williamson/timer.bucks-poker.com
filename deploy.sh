#!/bin/bash

CLOUDFLARE_API_TOKEN="RLnt0KJf00eigDwViEtKQUxjK3bxdfwHrGJDTFIC"
PROJECT_ID="timer-bucks-poker-com"
DIST_DIR="./app/dist"
CLOUDFLARE_ACCOUNT_ID="0b6d905d5bc315da27e37c0853e6f183"

# Ensure the dist folder exists
if [ ! -d "$DIST_DIR" ]; then
  echo "Error: dist folder not found at $DIST_DIR"
  exit 1
fi

# Optionally zip the contents of the dist folder if you want to upload a single file (uncomment if needed)
# ZIP_FILE="dist.zip"
# zip -r "$ZIP_FILE" "$DIST_DIR"

# You can skip zipping if you prefer to upload individual files
# Upload each file from dist folder to Cloudflare Pages
for file in "$DIST_DIR"/*; do
  if [ -f "$file" ]; then
    echo "Uploading $file..."
    curl -X POST "https://api.cloudflare.com/client/v4/pages/projects/$PROJECT_ID/deployments" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -F "files=@$file" \
      -F "metadata={\"branch\":\"main\"}"  # Adjust branch if needed
  fi
done

echo "Deployment complete!"