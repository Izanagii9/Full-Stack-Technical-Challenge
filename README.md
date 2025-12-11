# Auto-Generated Blog - Full-Stack Application

A production-ready full-stack blog application with AI-powered content generation, built with React, Node.js, PostgreSQL, Docker, and AWS deployment infrastructure.

🔗 **Live Demo**: http://52.90.3.31 (AWS EC2 deployment)

## 🚀 Features

- **Frontend**: React 18 with Redux Toolkit state management and i18next (EN/PT)
- **Backend**: Node.js + Express REST API with clean architecture
- **Responsive Design**: Mobile, tablet, and desktop support
- **Clean Architecture**: Service layer pattern with separation of concerns
- **AI Integration**: HuggingFace Router API with adaptive model caching (FREE tier)
- **Smart Model Selection**: Performance-based caching with automatic failover
- **Database**: PostgreSQL 16 with entity pattern and migrations
- **Auto-retry**: 5-minute retry mechanism for failed generations
- **Daily Automation**: Automatic article generation at 00:00 UTC (node-cron)
- **Monitoring**: Model performance dashboard at `/cache-stats`
- **Containerization**: Docker with multi-stage builds and orchestration
- **Cloud Deployment**: AWS EC2 + CodeBuild + ECR (PRODUCTION-READY)

## 📁 Project Structure

```
Full-Stack Technical Challenge/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── services/        # API service layer
│   │   └── i18n/            # Internationalization (EN/PT)
│   ├── Dockerfile           # Multi-stage build
│   ├── nginx.conf           # Production server config
│   └── package.json
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── ai/              # HuggingFace integration
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── jobs/            # Cron jobs (daily generation)
│   │   ├── lib/cache/       # Adaptive model caching
│   │   ├── middleware/      # Express middleware
│   │   ├── db/migrations/   # PostgreSQL schema
│   │   └── server.js        # Entry point
│   ├── Dockerfile           # Production container
│   └── package.json
│
├── infra/                    # AWS infrastructure
│   ├── scripts/             # Deployment automation
│   │   ├── init-ec2.sh      # EC2 setup
│   │   └── deploy-to-ec2.sh # Auto-deployment
│   ├── buildspec.yml        # CodeBuild configuration
│   └── AWS_SETUP.md         # Complete deployment guide
│
├── docs/                     # Documentation
│   └── ARCHITECTURE.md      # System architecture
│
├── docker-compose.yml        # Local development
├── docker-compose.prod.yml   # Production deployment
├── DOCKER.md                # Docker guide
├── DEVELOPMENT_LOG.md       # Development history
└── README.md                # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Full-Stack Technical Challenge"
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on **http://localhost:3000**

### 3. Backend Setup

Open a new terminal:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will run on **http://localhost:3001**

### 4. Verify Setup

- Frontend: Open http://localhost:3000 in your browser
- Backend health check: Open http://localhost:3001/health

## 🐳 Docker Setup (Recommended)

### ⚠️ Before You Start

**IMPORTANT: You MUST configure your environment variables before running Docker!**

### Quick Start

```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Edit .env and add your HuggingFace API key
# Get your key from: https://huggingface.co/settings/tokens
# Update HUGGINGFACE_API_KEY=hf_your_actual_key_here

# 3. (Optional) Change database password in .env
# Update POSTGRES_PASSWORD to a secure password

# 4. Start all services
docker-compose up -d

# 5. View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Required Configuration:**
- `HUGGINGFACE_API_KEY` - Get from https://huggingface.co/settings/tokens
- `POSTGRES_PASSWORD` - Recommended to change from default

See [DOCKER.md](DOCKER.md) for detailed configuration instructions.

### Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/health
- **Cache Dashboard**: http://localhost:3001/cache-stats
- **Database**: localhost:5432 (user: autoblog, password: see docker-compose.yml)

### Docker Services

- **frontend**: React app served via nginx on port 80
- **backend**: Node.js API on port 3001 (auto-runs migrations)
- **database**: PostgreSQL 16 on port 5432

### Common Docker Commands

```bash
# Rebuild containers
docker-compose up -d --build

# View container status
docker-compose ps

# Access backend shell
docker-compose exec backend sh

# Run migrations manually
docker-compose exec backend npm run migrate

# Clear all data and restart fresh
docker-compose down -v
docker-compose up -d
```

For detailed Docker documentation, see [DOCKER.md](DOCKER.md).

## 🌐 API Endpoints

### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article by ID
- `POST /api/articles/generate` - Generate new AI article (optional: `{"topic": "your topic"}`)

### Monitoring

- `GET /health` - Server health status
- `GET /cache-stats` - Model performance dashboard (HTML/JSON)

## 🎨 Frontend Features

- **Language Switcher**: Dropdown with globe icon (English/Portuguese)
- **Article List**: Card-based layout with excerpts
- **Article Detail**: Full article view with back navigation
- **Responsive**: Three breakpoints (desktop, tablet, mobile)
- **Accessibility**: Keyboard navigation with focus indicators
- **Loading States**: Loading and error handling
- **Dynamic Page Title**: Changes based on selected language

## 🔧 Technology Stack

### Frontend
- React 18.2.0
- Redux Toolkit 2.0.1
- React Router 6.20.0
- Axios 1.6.2
- i18next 23.7.11
- Vite 5.0.8

### Backend
- Express 4.18.2
- PostgreSQL 8.16.3 (pg driver)
- Axios 1.13.2 (HuggingFace API)
- node-cron 4.2.1 (Daily scheduling)
- CORS 2.8.5
- Dotenv 16.3.1

## 📝 Environment Variables

### Docker (Recommended - Edit .env file)

For Docker deployment, all configuration is in the `.env` file (copy from `.env.example`). **You MUST set:**

```bash
# HuggingFace API (REQUIRED)
HUGGINGFACE_API_KEY=hf_your_actual_key_here

# Database credentials (recommended to change)
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=autoblog
POSTGRES_DB=autoblog_db

# Backend database connection (must match database credentials)
DB_PASSWORD=your_secure_password
DB_USER=autoblog
DB_NAME=autoblog_db
```

**IMPORTANT:** Never commit the `.env` file to git! It's already in `.gitignore`.

### Local Development (.env files)

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

#### Backend (.env)
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoblog_db
DB_USER=postgres
DB_PASSWORD=your_password

# HuggingFace Router API (⚠️ REQUIRED)
HUGGINGFACE_API_URL=https://router.huggingface.co/v1/chat/completions
HUGGINGFACE_API_KEY=hf_your_actual_key  # Get from https://huggingface.co/settings/tokens
```

**Without a valid `HUGGINGFACE_API_KEY`, the application cannot generate articles.**

## ☁️ AWS Deployment

The application is **production-deployed** on AWS using EC2, ECR, and CodeBuild.

🔗 **Live Application**: http://52.90.3.31

### Deployed Infrastructure

**Active Resources**:
- ✅ **EC2 Instance** (i-0fcc7cfea1674063f): t2.micro running Docker containers
- ✅ **ECR Repositories**: `autoblog-frontend` and `autoblog-backend`
- ✅ **CodeBuild Project**: `autoblog-build` with automated deployment
- ✅ **Security Group**: Ports 80 (HTTP), 3001 (API), 22 (SSH)
- ✅ **IAM Roles**: AutoblogEC2Role, AutoblogCodeBuildRole

### CI/CD Pipeline

```
GitHub Push → CodeBuild → ECR → EC2 Deployment
     │            │         │           │
     │            │         │           ├─ Frontend (nginx:80)
     │            │         │           ├─ Backend (node:3001)
     │            │         │           └─ PostgreSQL (5432)
     │            │         │
     │            │         └─ Docker Images Tagged & Pushed
     │            │
     │            └─ buildspec.yml:
     │               • Build frontend with VITE_API_URL
     │               • Build backend
     │               • Push to ECR
     │               • Deploy via SSM to EC2
     │
     └─ Triggers build on commit
```

### Deploy Your Own

1. **Prerequisites**: AWS account, AWS CLI configured
2. **Follow the guide**: See [infra/AWS_SETUP.md](infra/AWS_SETUP.md) for step-by-step instructions
3. **What you'll set up**:
   - ECR repositories for Docker images
   - CodeBuild project for automated builds
   - EC2 instance with Docker and PostgreSQL
   - Automated deployment pipeline with SSM

### Manual Deployment to EC2

```bash
# Trigger CodeBuild
aws codebuild start-build --project-name autoblog-build --region us-east-1

# Or deploy directly to EC2
cd infra/scripts
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh
```

### Cost Estimate

- **Free Tier**: EC2 t2.micro (750 hrs/month), ECR (500 MB), CodeBuild (100 min/month)
- **After Free Tier**: ~$10-18/month
- **AI Generation**: FREE (HuggingFace Router API free tier)

### Architecture Details

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete system architecture, data flow diagrams, and deployment details.

## 🚧 Development Phases

- ✅ **Phase 1**: React frontend with Redux and i18n
- ✅ **Phase 2**: Node.js backend with REST API
- ✅ **Phase 3**: AI integration with HuggingFace Router API
- ✅ **Phase 4**: PostgreSQL database with migrations
- ✅ **Phase 4.5**: AI model caching & retry mechanism
- ✅ **Phase 5**: Docker containerization
- ✅ **Phase 6**: AWS deployment infrastructure (EC2, CodeBuild, ECR)
- ✅ **Phase 7**: Production deployment and optimization

## 🎯 Production Status

The application is **LIVE** and deployed on AWS EC2: http://52.90.3.31

**Production Features**:
- ✅ Full CI/CD pipeline (GitHub → CodeBuild → ECR → EC2)
- ✅ Multi-stage Docker builds for optimized images
- ✅ Adaptive AI model caching with performance scoring
- ✅ Daily automated article generation at 00:00 UTC
- ✅ 5-minute auto-retry for failed AI generations
- ✅ PostgreSQL persistent storage with migrations
- ✅ Production nginx with security headers and gzip
- ✅ Environment-based configuration (dev/prod)
- ✅ Comprehensive monitoring and health checks
- ✅ Intelligent error handling and logging

**Live Endpoints**:
- **Frontend**: http://52.90.3.31
- **Backend API**: http://52.90.3.31:3001/health
- **Cache Dashboard**: http://52.90.3.31:3001/cache-stats

**Quick Start Locally**:
```bash
# Copy environment template
cp .env.example .env

# Add your HuggingFace API key to .env
# HUGGINGFACE_API_KEY=hf_your_key_here

# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend: http://localhost:3001
# Cache Dashboard: http://localhost:3001/cache-stats
```

**Deploy Your Own**: See [infra/AWS_SETUP.md](infra/AWS_SETUP.md) for complete AWS deployment guide.

## 📦 Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with auto-reload (--watch)
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial AI articles

## 🤝 Contributing

This is a technical challenge project. Feel free to explore and learn from the implementation.
