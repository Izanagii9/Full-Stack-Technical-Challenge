# Auto-Generated Blog - Full-Stack Application

A modern full-stack blog application with AI-powered content generation, built with React, Node.js, PostgreSQL, Docker, and AWS deployment.

## 🚀 Features

- **Frontend**: React 18 with Redux Toolkit state management and i18next (EN/PT)
- **Backend**: Node.js + Express REST API (English only)
- **Responsive Design**: Mobile, tablet, and desktop support
- **Clean Architecture**: Service layer pattern with separation of concerns
- **AI Integration**: HuggingFace Router API with adaptive model caching
- **Smart Model Selection**: Performance-based caching with automatic failover
- **Database**: PostgreSQL with entity pattern and migrations
- **Auto-retry**: 5-minute retry mechanism for failed generations
- **Monitoring**: Model performance dashboard at `/cache-stats`
- **Containerization**: Docker with multi-stage builds and orchestration
- **Cloud Deployment**: AWS EC2 + CodeBuild + ECR (Phase 6 - Planned)

## 📁 Project Structure

```
Full-Stack Technical Challenge/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   ├── services/     # API service layer
│   │   ├── i18n/         # Internationalization
│   │   └── data/         # Mock data (temporary)
│   ├── .env.example      # Environment template
│   └── package.json
│
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── server.js     # Entry point
│   ├── .env.example      # Environment template
│   └── package.json
│
└── README.md          # This file
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

**IMPORTANT: You MUST configure your HuggingFace API key before running Docker!**

1. **Get API Key**: Go to https://huggingface.co/settings/tokens and create a token
2. **Edit `docker-compose.yml`**:
   - Line 40: Replace `HUGGINGFACE_API_KEY` with your actual key
   - Lines 10-11: (Optional) Change database credentials
   - Line 17: Update healthcheck `-U username` to match your POSTGRES_USER
   - Lines 37-38: Update backend DB credentials to match

**Example:**
```yaml
HUGGINGFACE_API_KEY: hf_your_actual_key_here  # ⚠️ REQUIRED
POSTGRES_PASSWORD: your_secure_password       # Recommended
```

See [DOCKER.md](DOCKER.md) for detailed configuration instructions.

### Quick Start

```bash
# 1. Edit docker-compose.yml first (add API key!)

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# Stop services
docker-compose down
```

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

### Docker (Recommended - Edit docker-compose.yml)

For Docker deployment, all configuration is in `docker-compose.yml`. **You MUST set:**

```yaml
# Backend service environment (required)
HUGGINGFACE_API_KEY: hf_your_actual_key  # ⚠️ REQUIRED - Get from https://huggingface.co/settings/tokens

# Database credentials (optional, but recommended to change)
POSTGRES_USER: autoblog
POSTGRES_PASSWORD: your_secure_password

# Backend database connection (must match database credentials)
DB_USER: autoblog
DB_PASSWORD: your_secure_password
```

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

## 🚧 Development Phases

- ✅ **Phase 1**: React frontend with Redux and i18n
- ✅ **Phase 2**: Node.js backend with REST API
- ✅ **Phase 3**: AI integration with HuggingFace Router API
- ✅ **Phase 4**: PostgreSQL database with migrations
- ✅ **Phase 4.5**: AI model caching & retry mechanism
- ✅ **Phase 5**: Docker containerization
- ⏳ **Phase 6**: AWS deployment (EC2, CodeBuild, ECR)

## 🎯 Current State

The application is **fully containerized** and production-ready. Uses real AI-generated content from HuggingFace models with intelligent caching and automatic failover. Articles are stored in **PostgreSQL** and persist across restarts.

**Key Features Implemented**:
- Docker containerization with multi-stage builds
- Adaptive model selection based on performance
- 5-minute auto-retry for failed generations
- Daily automated article creation (00:00 UTC)
- Model performance dashboard
- Production-ready error handling
- Intelligent error classification (auth vs. model errors)
- Docker-managed persistent volumes

**Quick Start with Docker**:
```bash
docker-compose up -d
# Frontend: http://localhost
# Backend: http://localhost:3001
# Cache Dashboard: http://localhost:3001/cache-stats
```

**Next steps**: AWS deployment (EC2, CodeBuild, ECR).

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

## 📄 License

MIT