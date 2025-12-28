# Docker Compose Setup Guide

This guide will help you run the E-Commerce ML Platform using Docker Compose.

## Prerequisites

- Docker installed and running
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### 1. Create Environment File

Create a `.env` file in the `ecommerce_ml` directory (same level as `docker-compose.yml`):

```bash
cd /Users/monicabolla/projects/ecommerce_ml/ecommerce_ml
```

Create `.env` file with these variables:

```env
# Project Configuration
PROJECT_NAME=E-Commerce ML Platform

# Superuser Configuration
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=admin

# MongoDB Configuration
MONGO_HOST=db
MONGO_PORT=27017
MONGO_DB=ecommerce
MONGO_USER=admin
MONGO_PASSWORD=password

# API Configuration
API_V1_STR=/api/v1
SECRET_KEY=change-this-to-a-random-secret-key-in-production
ENVIRONMENT=development

# CORS Configuration (JSON array format)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]

# Docker Image Names (for docker-compose.yml)
DOCKER_IMAGE_BACKEND=ecommerce-backend
DOCKER_IMAGE_FRONTEND=ecommerce-frontend
STACK_NAME=ecommerce

# SSO Configuration (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SSO_CALLBACK_HOSTNAME=
SSO_LOGIN_CALLBACK_URL=
```

### 2. Development Mode (with hot reload)

Run the development setup:

```bash
cd /Users/monicabolla/projects/ecommerce_ml/ecommerce_ml
docker compose up --build
```

This will:
- Start MongoDB database
- Start FastAPI backend (with hot reload) on port 8000
- Start React frontend (with hot reload) on port 5173
- Start Traefik proxy on port 80

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Traefik Dashboard: http://localhost:8090

### 3. Production Mode

For production deployment:

```bash
cd /Users/monicabolla/projects/ecommerce_ml/ecommerce_ml
docker compose -f docker-compose.prod.yml up --build
```

**Note:** Production mode requires additional environment variables:
- `DOMAIN` - Your domain name
- `TRAEFIK_TLS_EMAIL` - Email for Let's Encrypt certificates
- `DOCKER_PACKAGE_REPOSITORY` - Docker registry (optional)

## Services

### Backend (FastAPI)
- **Port:** 8000
- **Hot Reload:** Enabled in development mode
- **Health Check:** Available at `/api/v1/health`

### Frontend (React)
- **Port:** 5173
- **Hot Reload:** Enabled in development mode
- **Build:** Production build served via Nginx in production mode

### MongoDB
- **Port:** 27017
- **Data Persistence:** Stored in Docker volume `app-db-data`
- **Health Check:** Automatic health checks configured

### Traefik (Reverse Proxy)
- **Port:** 80 (HTTP), 443 (HTTPS in production)
- **Dashboard:** Port 8090 (development only)

## Common Commands

### Start services
```bash
docker compose up
```

### Start in background (detached mode)
```bash
docker compose up -d
```

### Rebuild and start
```bash
docker compose up --build
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (⚠️ deletes database)
```bash
docker compose down -v
```

### View logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### Execute commands in containers
```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend sh

# MongoDB shell
docker compose exec db mongosh
```

## Troubleshooting

### Port already in use
If ports 8000, 5173, or 27017 are already in use:

1. Stop the conflicting service, or
2. Modify port mappings in `docker-compose.yml`:
   ```yaml
   ports:
     - "8001:8000"  # Change host port
   ```

### Backend can't connect to MongoDB
- Check that MongoDB service is healthy: `docker compose ps`
- Verify `MONGO_HOST=db` in `.env` (not `localhost`)
- Check MongoDB logs: `docker compose logs db`

### Frontend can't connect to backend
- Verify `VITE_API_URL` environment variable (if set)
- Check backend is running: `docker compose ps backend`
- Check CORS settings in `.env`: `BACKEND_CORS_ORIGINS`

### Models not loading
- Ensure ML models exist in `backend/ml/models/`
- Check backend logs: `docker compose logs backend`
- Verify file paths in the container

### Rebuild after code changes
```bash
# Rebuild specific service
docker compose build backend
docker compose build frontend

# Rebuild and restart
docker compose up --build backend
```

## Environment Variables Reference

### Required Variables
- `PROJECT_NAME` - Project name
- `FIRST_SUPERUSER` - Admin email
- `FIRST_SUPERUSER_PASSWORD` - Admin password
- `MONGO_HOST` - MongoDB hostname (use `db` for Docker)
- `MONGO_PORT` - MongoDB port
- `MONGO_DB` - Database name
- `SECRET_KEY` - JWT secret key (generate random string)
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins (JSON array)

### Optional Variables
- `MONGO_USER` - MongoDB username (if auth enabled)
- `MONGO_PASSWORD` - MongoDB password (if auth enabled)
- `GOOGLE_CLIENT_ID` - For SSO login
- `GOOGLE_CLIENT_SECRET` - For SSO login

## Data Persistence

- **MongoDB data:** Stored in Docker volume `app-db-data`
- **ML models:** Mounted from `backend/ml/models/` directory
- **Dataset files:** Mounted from `backend/ml/dataset/` directory

To backup MongoDB:
```bash
docker compose exec db mongodump --out /data/backup
```

## Next Steps

1. Access the frontend at http://localhost:5173
2. Register a new user or use the superuser credentials
3. Explore product recommendations
4. Check demand forecasting analytics

For more details, see the main [README.md](../README.md).

