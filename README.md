# Auto-Generated Blog - Full-Stack Application

A modern full-stack blog application with AI-powered content generation, built with React, Node.js, PostgreSQL, Docker, and AWS deployment.

## 🚀 Features

- **Frontend**: React 18 with Redux Toolkit state management and i18next (EN/PT)
- **Backend**: Node.js + Express REST API (English only)
- **Responsive Design**: Mobile, tablet, and desktop support
- **Clean Architecture**: Service layer pattern with separation of concerns
- **AI Integration**: HuggingFace Router API with adaptive model caching ✅
- **Smart Model Selection**: Performance-based caching with automatic failover
- **Database**: PostgreSQL with entity pattern and migrations ✅
- **Auto-retry**: 5-minute retry mechanism for failed generations
- **Monitoring**: Model performance dashboard at `/cache-stats`
- **Containerization**: Docker support (Phase 5 - Planned)
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

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
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

# HuggingFace Router API
HUGGINGFACE_API_URL=https://router.huggingface.co/v1/chat/completions
```

## 🚧 Development Phases

- ✅ **Phase 1**: React frontend with Redux and i18n
- ✅ **Phase 2**: Node.js backend with REST API
- ✅ **Phase 3**: AI integration with HuggingFace Router API
- ✅ **Phase 4**: PostgreSQL database with migrations
- ✅ **Phase 4.5**: AI model caching & retry mechanism
- ⏳ **Phase 5**: Docker containerization
- ⏳ **Phase 6**: AWS deployment (EC2, CodeBuild, ECR)

## 🎯 Current State

The application uses **real AI-generated content** from HuggingFace models with intelligent caching and automatic failover. Articles are stored in **PostgreSQL** and persist across restarts.

**Key Features Implemented**:
- Adaptive model selection based on performance
- 5-minute auto-retry for failed generations
- Daily automated article creation (00:00 UTC)
- Model performance dashboard
- Production-ready error handling

**Next steps**: Docker containerization for cloud deployment.

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