#!/bin/bash

# Docker Compose Quick Start Script
# This script helps you start the E-Commerce ML Platform with Docker Compose

set -e

echo "🚀 Starting E-Commerce ML Platform with Docker Compose..."

# Function to add missing Docker variables to .env
add_docker_vars() {
    local env_file=".env"
    
    # Check and add STACK_NAME
    if ! grep -q "^STACK_NAME=" "$env_file" 2>/dev/null; then
        echo "STACK_NAME=ecommerce" >> "$env_file"
        echo "✅ Added STACK_NAME to .env"
    fi
    
    # Check and add DOCKER_IMAGE_BACKEND
    if ! grep -q "^DOCKER_IMAGE_BACKEND=" "$env_file" 2>/dev/null; then
        echo "DOCKER_IMAGE_BACKEND=ecommerce-backend" >> "$env_file"
        echo "✅ Added DOCKER_IMAGE_BACKEND to .env"
    fi
    
    # Check and add DOCKER_IMAGE_FRONTEND
    if ! grep -q "^DOCKER_IMAGE_FRONTEND=" "$env_file" 2>/dev/null; then
        echo "DOCKER_IMAGE_FRONTEND=ecommerce-frontend" >> "$env_file"
        echo "✅ Added DOCKER_IMAGE_FRONTEND to .env"
    fi
    
    # Ensure MONGO_HOST is set to 'db' for Docker
    if grep -q "^MONGO_HOST=" "$env_file" 2>/dev/null; then
        # Update MONGO_HOST to 'db' if it's not already
        sed -i.bak 's/^MONGO_HOST=.*/MONGO_HOST=db/' "$env_file" 2>/dev/null || \
        sed -i '' 's/^MONGO_HOST=.*/MONGO_HOST=db/' "$env_file" 2>/dev/null
        rm -f "$env_file.bak" 2>/dev/null
    else
        echo "MONGO_HOST=db" >> "$env_file"
    fi
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one from template..."
    cat > .env << 'EOF'
# Project Configuration
PROJECT_NAME=E-Commerce ML Platform

# Superuser Configuration
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=admin

# MongoDB Configuration
MONGO_HOST=db
MONGO_PORT=27017
MONGO_DB=ecommerce
MONGO_USER=
MONGO_PASSWORD=

# API Configuration
API_V1_STR=/api/v1
SECRET_KEY=change-this-to-a-random-secret-key-in-production
ENVIRONMENT=development

# CORS Configuration (JSON array format)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]

# Docker Image Names (required for docker-compose.yml)
DOCKER_IMAGE_BACKEND=ecommerce-backend
DOCKER_IMAGE_FRONTEND=ecommerce-frontend
STACK_NAME=ecommerce

# SSO Configuration (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SSO_CALLBACK_HOSTNAME=
SSO_LOGIN_CALLBACK_URL=
EOF
    echo "✅ Created .env file. Please review and update if needed."
else
    echo "📝 Checking .env file for required Docker variables..."
    add_docker_vars
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Export Docker variables if not in .env (as fallback)
export STACK_NAME=${STACK_NAME:-ecommerce}
export DOCKER_IMAGE_BACKEND=${DOCKER_IMAGE_BACKEND:-ecommerce-backend}
export DOCKER_IMAGE_FRONTEND=${DOCKER_IMAGE_FRONTEND:-ecommerce-frontend}
export TAG=${TAG:-latest}

# Ask user which mode to run
echo ""
echo "Select mode:"
echo "1) Development (with hot reload) - Recommended for development"
echo "2) Production (optimized build)"
read -p "Enter choice [1]: " mode
mode=${mode:-1}

if [ "$mode" == "2" ]; then
    echo "📦 Starting in PRODUCTION mode..."
    docker compose -f docker-compose.prod.yml up --build
else
    echo "🔧 Starting in DEVELOPMENT mode..."
    docker compose up --build
fi

