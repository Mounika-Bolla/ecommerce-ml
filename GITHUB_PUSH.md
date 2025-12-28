# GitHub Push Instructions

## Quick Push Commands

```bash
cd /Users/monicabolla/projects/ecommerce_ml/ecommerce_ml

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit with message
git commit -m "feat: Add Docker Compose setup and ML model integration

- Add Docker Compose configuration for full-stack deployment
- Remove Traefik proxy (simplified setup)
- Add volume mounts for ML models and datasets
- Update Dockerfile to include ML models in container
- Add helper scripts for Docker management
- Fix recommendation service (images and price parsing)
- Add comprehensive Docker setup documentation"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-ml-platform.git

# Push to GitHub
git push -u origin main
```

## Step-by-Step Guide

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ecommerce-ml-platform` (or your preferred name)
3. Description: `Full-stack e-commerce platform with AI-powered recommendations and demand forecasting`
4. Choose Public or Private
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Prepare Your Local Repository

```bash
cd /Users/monicabolla/projects/ecommerce_ml/ecommerce_ml

# Check git status
git status

# If not initialized, initialize git
git init

# Check what will be committed
git add -n .
```

### 3. Create .gitignore (if needed)

Make sure you have a `.gitignore` file that excludes:
- `.env` files (sensitive data)
- `node_modules/`
- `.venv/` or `venv/`
- `__pycache__/`
- Large dataset files (if you don't want to commit them)
- Docker volumes

### 4. Commit Your Changes

```bash
# Stage all files
git add .

# Commit
git commit -m "feat: Add Docker Compose setup and ML model integration

- Add Docker Compose configuration for full-stack deployment
- Remove Traefik proxy (simplified setup)
- Add volume mounts for ML models and datasets
- Update Dockerfile to include ML models in container
- Add helper scripts for Docker management
- Fix recommendation service (images and price parsing)
- Add comprehensive Docker setup documentation"
```

### 5. Connect to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-ml-platform.git

# Verify remote
git remote -v
```

### 6. Push to GitHub

```bash
# Push to main branch
git push -u origin main

# Or if your default branch is master
git push -u origin master
```

## What to Include/Exclude

### ✅ Include:
- All source code (backend, frontend)
- Docker configuration files
- Documentation (README, DOCKER_SETUP.md, etc.)
- ML model files (if small enough, or use Git LFS)
- Configuration templates
- Helper scripts

### ❌ Exclude (add to .gitignore):
- `.env` files (contains secrets)
- `node_modules/`
- `.venv/`, `venv/`
- `__pycache__/`, `*.pyc`
- Large dataset files (use Git LFS or exclude)
- Docker volumes
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

## Recommended .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml

# Large datasets (optional - use Git LFS if needed)
# backend/ml/dataset/*.json
# backend/ml/dataset/*.jsonl

# Logs
*.log
logs/

# Build outputs
dist/
build/
*.egg-info/
```

## After Pushing

1. Add a README badge (optional):
   ```markdown
   ![Docker](https://img.shields.io/badge/Docker-Ready-blue)
   ![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)
   ![React](https://img.shields.io/badge/React-19.1+-blue)
   ```

2. Add topics/tags to your GitHub repo:
   - `machine-learning`
   - `recommendation-system`
   - `fastapi`
   - `react`
   - `docker`
   - `ecommerce`
   - `time-series-forecasting`

3. Update repository description:
   ```
   Full-stack e-commerce platform with AI-powered product recommendations 
   and demand forecasting. Built with FastAPI, React, MongoDB, and Docker.
   ```

## Troubleshooting

### If push is rejected:
```bash
# Pull first, then push
git pull origin main --rebase
git push -u origin main
```

### If you need to update .gitignore:
```bash
# Remove tracked files that should be ignored
git rm -r --cached node_modules/
git rm --cached .env
git add .gitignore
git commit -m "chore: Update .gitignore"
git push
```

