#!/bin/bash

# Quick fix script to add missing Docker variables to .env

ENV_FILE=".env"

echo "🔧 Fixing .env file for Docker Compose..."

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Add variables if they don't exist
if ! grep -q "^STACK_NAME=" "$ENV_FILE" 2>/dev/null; then
    echo "" >> "$ENV_FILE"
    echo "# Docker Compose Variables" >> "$ENV_FILE"
    echo "STACK_NAME=ecommerce" >> "$ENV_FILE"
    echo "✅ Added STACK_NAME"
fi

if ! grep -q "^DOCKER_IMAGE_BACKEND=" "$ENV_FILE" 2>/dev/null; then
    echo "DOCKER_IMAGE_BACKEND=ecommerce-backend" >> "$ENV_FILE"
    echo "✅ Added DOCKER_IMAGE_BACKEND"
fi

if ! grep -q "^DOCKER_IMAGE_FRONTEND=" "$ENV_FILE" 2>/dev/null; then
    echo "DOCKER_IMAGE_FRONTEND=ecommerce-frontend" >> "$ENV_FILE"
    echo "✅ Added DOCKER_IMAGE_FRONTEND"
fi

# Ensure MONGO_HOST is 'db' for Docker
if grep -q "^MONGO_HOST=" "$ENV_FILE" 2>/dev/null; then
    # Use macOS-compatible sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/^MONGO_HOST=.*/MONGO_HOST=db/' "$ENV_FILE"
    else
        sed -i 's/^MONGO_HOST=.*/MONGO_HOST=db/' "$ENV_FILE"
    fi
    echo "✅ Updated MONGO_HOST to 'db'"
else
    echo "MONGO_HOST=db" >> "$ENV_FILE"
    echo "✅ Added MONGO_HOST=db"
fi

echo ""
echo "✅ .env file is ready for Docker Compose!"
echo "You can now run: ./docker-start.sh"

