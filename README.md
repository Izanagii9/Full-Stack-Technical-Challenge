# Auto-Generated Blog - Full-Stack Application

A modern full-stack blog application with AI-powered content generation, built with React, Node.js, PostgreSQL, Docker, and AWS deployment.

## 🚀 Features

- **Frontend**: React 18 with Redux Toolkit state management and i18next (EN/PT)
- **Backend**: Node.js + Express REST API (English only)
- **Responsive Design**: Mobile, tablet, and desktop support
- **Clean Architecture**: Service layer pattern with separation of concerns
- **AI Integration**: Ready for AI-generated content (Phase 3)
- **Database**: PostgreSQL ready (Phase 4)
- **Containerization**: Docker support (Phase 5)
- **Cloud Deployment**: AWS EC2 + CodeBuild + ECR (Phase 6)

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

### Health

- `GET /health` - Server health status

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
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚧 Development Phases

- ✅ **Phase 1**: React frontend with Redux and i18n
- ✅ **Phase 2**: Node.js backend with REST API
- ⏳ **Phase 3**: AI integration for content generation
- ⏳ **Phase 4**: PostgreSQL database
- ⏳ **Phase 5**: Docker containerization
- ⏳ **Phase 6**: AWS deployment (EC2, CodeBuild, ECR)

## 🎯 Current State

The application is currently using **mock data** in the backend. The frontend successfully communicates with the backend API via REST endpoints.

**Next steps**: Integrate AI for automatic article generation.

## 📦 Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with auto-reload (--watch)
- `npm start` - Start production server

## 🤝 Contributing

This is a technical challenge project. Feel free to explore and learn from the implementation.

## 📄 License

MIT