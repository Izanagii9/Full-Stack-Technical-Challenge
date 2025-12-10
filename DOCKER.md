# Docker Setup Guide

This guide explains how to run the Auto-Generated Blog application using Docker containers.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- **HuggingFace API Key** (required for AI article generation)

## ⚠️ IMPORTANT: Configuration Before First Run

### Get Your HuggingFace API Key

**The application WILL NOT WORK without a valid HuggingFace API key.**

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is sufficient)
3. Copy the token (starts with `hf_...`)

### Configure Environment Variables

Before running `docker-compose up`, you **MUST** create and configure the `.env` file:

**Step 1: Copy the example file**
```bash
cp .env.example .env
```

**Step 2: Edit the `.env` file**

Open `.env` in your text editor and update these values:

```bash
# HuggingFace API (REQUIRED - Get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=hf_YOUR_ACTUAL_KEY_HERE  # ⚠️ REPLACE THIS

# Database Configuration (Optional but recommended)
POSTGRES_DB=autoblog_db
POSTGRES_USER=autoblog
POSTGRES_PASSWORD=MySecurePassword123  # ⚠️ Change to a strong password

# Backend Configuration (must match database credentials)
DB_HOST=database
DB_PORT=5432
DB_NAME=autoblog_db
DB_USER=autoblog
DB_PASSWORD=MySecurePassword123  # ⚠️ Must match POSTGRES_PASSWORD
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost
HUGGINGFACE_API_URL=https://router.huggingface.co/v1/chat/completions
```

**Important: Database credentials must match:**
- `POSTGRES_USER` must equal `DB_USER`
- `POSTGRES_PASSWORD` must equal `DB_PASSWORD`
- `POSTGRES_DB` must equal `DB_NAME`

### Security Notes

- **NEVER commit the `.env` file to git** - it's already in `.gitignore`
- The `.env.example` file is safe to commit (it contains no secrets)
- Change the default passwords before deploying to production

## Quick Start

### 1. Configure (First Time Only)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API key
# Required: HUGGINGFACE_API_KEY
# Recommended: Change POSTGRES_PASSWORD
```

### 2. Start All Services

From the project root directory:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 80 (http://localhost)

### 2. Check Status

```bash
docker-compose ps
```

You should see 3 containers running:
- `autoblog-db` - PostgreSQL database
- `autoblog-backend` - Node.js API
- `autoblog-frontend` - Nginx serving React app

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/health
- **Cache Dashboard**: http://localhost:3001/cache-stats
- **Database**: localhost:5432 (use postgres/postgres)

## Container Details

### Frontend Container
- **Image**: nginx:alpine
- **Build**: Multi-stage (Node.js build → Nginx serve)
- **Port**: 80
- **Features**:
  - Gzip compression
  - SPA routing
  - Static asset caching
  - Security headers

### Backend Container
- **Image**: node:18-alpine
- **Port**: 3001
- **Features**:
  - Auto-runs migrations on startup
  - AI model caching persisted via volume
  - HuggingFace API integration
  - Daily cron job for article generation

### Database Container
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Features**:
  - Persistent data via Docker volume
  - Health checks
  - Auto-initializes on first run

## Common Commands

### Stop Containers
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Containers
```bash
docker-compose up -d --build
```

### Run Database Migrations
```bash
docker-compose exec backend npm run migrate
```

### Seed Database
```bash
docker-compose exec backend npm run seed
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Database
docker-compose exec database psql -U postgres -d autoblog_db
```

### View Resource Usage
```bash
docker stats
```

## Troubleshooting

### Backend Can't Connect to Database
```bash
# Check database is healthy
docker-compose ps database

# Restart backend
docker-compose restart backend
```

### Frontend Shows Connection Error
```bash
# Check backend is running
docker-compose logs backend

# Restart services
docker-compose restart backend frontend
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :80
netstat -ano | findstr :3001

# Stop containers
docker-compose down

# Kill process or change ports in docker-compose.yml
```

### Clear Everything and Start Fresh
```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up -d --build
```

## Environment Variables

### Backend Environment
Set in `docker-compose.yml` under `backend.environment`:
- `PORT` - Backend port (3001)
- `NODE_ENV` - Environment (production)
- `DB_HOST` - Database hostname (database)
- `HUGGINGFACE_API_URL` - AI API endpoint

### Frontend Environment
Set in `.env.production`:
- `VITE_API_URL` - Backend API URL

## Volumes

### postgres_data
Stores PostgreSQL database files. Persists data across container restarts.

### backend cache
Mounts `./backend/src/lib/cache` for AI model performance data persistence.

## Network

All services run on `autoblog-network` bridge network, allowing inter-container communication by service name.

## Production Deployment

For AWS/cloud deployment:
1. Push images to container registry (ECR)
2. Update environment variables for production URLs
3. Use managed database service (RDS)
4. Set up load balancer for frontend/backend
5. Configure SSL/TLS certificates
6. Set up secrets management

## Development vs Docker

**Local Development** (without Docker):
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Docker** (production-like environment):
```bash
docker-compose up -d
```

Choose Docker when you want to:
- Test production build locally
- Avoid installing PostgreSQL locally
- Test nginx configuration
- Ensure consistency across team
- Prepare for cloud deployment
