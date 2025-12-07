# Auto-Generated Blog - Backend API

Node.js + Express REST API for the Auto-Generated Blog application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article by ID

### Health Check

- `GET /health` - Server health status

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment template
└── package.json
```

## Current State

- Using mock data (3 sample articles)
- Ready for Phase 3: AI integration
- Ready for Phase 4: Database integration
