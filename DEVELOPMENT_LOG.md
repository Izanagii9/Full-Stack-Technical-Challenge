# Development Log - Auto-Generated Blog Project

## Project Context
This is a full-stack technical challenge to build an auto-generated blog with React, Node.js, PostgreSQL, Docker, and AWS deployment. Timeline: 1 week.

---

## Technical Summary (For AI Assistant)

### Current Architecture
- **Frontend**: React 18.2.0 + Redux Toolkit + React Router + i18next (EN/PT) + Axios
- **Backend**: Express.js + CORS + Template renderer for HTML views (English only - no i18n)
- **Database**: PostgreSQL 18.1 with `pg` connection pool
- **Data Layer**: `backend/src/services/articleService.js` (database-backed operations)
- **State**: Redux store with `articlesSlice`, async thunks for API calls
- **Styling**: External CSS files, custom focus-visible for keyboard nav
- **API**: `/api/articles` (list), `/api/articles/:id` (detail), `/api/articles/generate` (POST), `/health` (health check)

### File Locations
- Frontend components: `frontend/src/components/`
- Frontend pages: `frontend/src/pages/`
- Frontend services: `frontend/src/services/articleService.js` (Axios wrapper)
- Frontend store: `frontend/src/store/` (Redux slices)
- Backend controllers: `backend/src/controllers/articleController.js`
- Backend services: `backend/src/services/articleService.js` (PostgreSQL operations)
- Backend routes: `backend/src/routes/articleRoutes.js`
- Backend views: `backend/views/*.html` (HTML templates for API docs)
- Database config: `backend/src/config/database.js` (PostgreSQL pool)
- Database migrations: `backend/src/db/migrations/` (SQL migration files)

### What Works
- ✅ Full frontend-backend communication via REST API
- ✅ Language switching (EN/PT) with i18next
- ✅ Responsive design with loading/error states
- ✅ Clean keyboard navigation with custom focus styles
- ✅ Backend serves JSON to API clients, HTML docs to browsers
- ✅ Service layer pattern for separation of concerns
- ✅ PostgreSQL database integration with connection pooling
- ✅ Database migrations and seeding scripts
- ✅ Persistent article storage across server restarts

### Key Implementation Details
- PostgreSQL with `pg` connection pool (max 20 connections)
- Accept header detection for HTML vs JSON responses
- StateContainer uses `flex: 1` to prevent layout jumping
- Global focus-visible styles prevent excessive outline spacing
- Template renderer uses `{{placeholder}}` replacement
- Database field mapping: `created_at` (DB) → `createdAt` (API)
- SQL migrations run via Node.js scripts

---

## User-Friendly Summary

### What We've Built So Far

**Phase 1 & 2 Complete** ✅

You have a fully functional blog application:

1. **Frontend (React App)**
   - Browse a list of 3 blog articles
   - Click to read full articles
   - Switch between English and Portuguese
   - Works on desktop, tablet, and mobile
   - Shows loading spinners and error messages when needed
   - Keyboard-friendly navigation (Tab key works smoothly)

2. **Backend (API Server)**
   - Provides article data through REST endpoints
   - Can be viewed in browser (shows clean API documentation)
   - Currently using 3 pre-written sample articles
   - Clean, organized code structure

3. **Visual Features**
   - Blue gradient header
   - Article cards with tags
   - Smooth transitions between pages
   - Professional, clean design

### Current Status: Phase 4 Complete ✅

**What's Working:**
- Frontend talks to backend ✅
- Articles display correctly ✅
- Language switching works ✅
- Everything looks good and is responsive ✅
- **AI article generation** ✅
- **POST /api/articles/generate endpoint** ✅
- **Daily automated article creation (cron)** ✅
- **PostgreSQL database integration** ✅
- **Persistent article storage** ✅
- Articles now survive server restarts!

**What's Next: Phase 5 - Docker Containerization**

Your blog is now production-ready with a real database! Next steps:
1. Create Dockerfiles for frontend and backend
2. Set up docker-compose for local development
3. Configure database connection for containerized environment
4. Test everything works in containers
5. Prepare for AWS deployment

This will make your app portable and ready for cloud deployment!

---

## Development Phases Tracker

### ✅ Phase 1: Frontend Foundation (COMPLETED)
**Duration**: Initial development
**What Was Built**:
- React application with Vite
- Redux Toolkit for state management
- React Router for navigation (ArticleList, ArticleDetail pages)
- i18next for internationalization (English/Portuguese)
- Language switcher component with globe icon
- Reusable state components (LoadingState, ErrorState, EmptyState, StateContainer)
- Responsive CSS (3 breakpoints: desktop/tablet/mobile)
- Custom keyboard focus styles (focus-visible)

**Key Commits**:
- Initial React setup
- Redux store and slices
- i18n configuration
- State component creation
- Focus style improvements

### ✅ Phase 2: Backend API (COMPLETED)
**Duration**: Initial development
**What Was Built**:
- Express.js server with CORS
- REST API endpoints (`/api/articles`, `/api/articles/:id`, `/health`)
- Service layer pattern (articleService.js with mock data)
- Controller layer (articleController.js)
- Request logging and error handling middleware
- Template renderer utility for HTML views
- HTML documentation views (minimal terminal-style theme)
- Static file serving for CSS

**Mock Data**:
- 3 hardcoded articles in `articleService.js`
- Simulated async database delay (100ms)

**Key Commits**:
- Backend setup with Express
- Service layer with mock data
- HTML views for API documentation
- CSS extraction and code organization
- Navigation simplification

**API Endpoints**:
```
GET /health              → Health check (HTML or JSON)
GET /api/articles        → List all articles (JSON)
GET /api/articles/:id    → Single article (JSON)
```

### ✅ Phase 3: AI Integration (COMPLETED)
**Duration**: December 8, 2025
**Goal**: Real AI-powered article generation using HuggingFace

**What Was Built**:

**HuggingFace Router API Integration**:
- Integrated with HuggingFace Router API (`https://router.huggingface.co/v1/chat/completions`)
- Real AI models generate articles with title, content, excerpt, and tags
- Production-grade error handling with automatic model failover
- AI chooses topics automatically (no hardcoded list)

**Adaptive Model Caching System** 🧠:
- Persistent JSON cache tracks model performance (`backend/src/lib/cache/modelCache.js`)
- Score system: +0.1 for success, -0.2 for failure (0.0-1.0 scale)
- Models sorted by performance score (best models tried first)
- Auto-removes models after 3 consecutive failures
- Score decay for models not used recently
- Dynamic model discovery from HuggingFace Hub API (refreshes every 24 hours)

**Clean Code Architecture**:
- `backend/src/ai/promptBuilder.js` - Prompt construction
- `backend/src/ai/responseParser.js` - JSON validation
- `backend/src/ai/modelDiscovery.js` - Model fetching and cache refresh
- `backend/src/ai/huggingfaceClient.js` - HTTP client for Router API
- `backend/src/lib/textFormatter.js` - Text utilities
- `backend/src/lib/cache/modelCache.js` - Adaptive learning cache
- `backend/src/services/aiService.js` - Orchestration layer (70 lines)

**Daily Automation**:
- node-cron scheduler runs daily at 00:00 UTC (production mode)
- Automatic article generation with AI-selected topics
- Articles stored in-memory (persist during session)

**API Endpoints Added**:
```
POST /api/articles/generate  → Generate new article (optional topic parameter)
```

**Files Created/Modified**:
- ✅ `backend/src/ai/promptBuilder.js` (NEW)
- ✅ `backend/src/ai/responseParser.js` (NEW)
- ✅ `backend/src/ai/modelDiscovery.js` (NEW)
- ✅ `backend/src/ai/huggingfaceClient.js` (NEW)
- ✅ `backend/src/lib/textFormatter.js` (NEW)
- ✅ `backend/src/lib/cache/modelCache.js` (NEW)
- ✅ `backend/src/services/aiService.js` (REFACTORED)
- ✅ `backend/src/jobs/articleJob.js` (MODIFIED)
- ✅ `backend/src/controllers/articleController.js` (MODIFIED)
- ✅ `backend/src/routes/articleRoutes.js` (MODIFIED)
- ✅ `backend/src/server.js` (MODIFIED)
- ✅ `backend/.env.example` (MODIFIED)
- ✅ `backend/package.json` (axios, node-cron added)

### ✅ Phase 4: PostgreSQL Database (COMPLETED)
**Duration**: December 8, 2025
**Goal**: Replace in-memory storage with PostgreSQL

**What Was Built**:
- Database Setup:
  - Created `autoblog_db` PostgreSQL database
  - Installed `pg` npm package for Node.js
  - Connection pool configuration with environment variables

- Database Schema (`001_create_articles_table.sql`):
  - Articles table with columns: id, title, excerpt, content, author, created_at, tags
  - SERIAL primary key for auto-incrementing IDs
  - TEXT[] array type for tags
  - Indexes on created_at and tags for performance

- Migration System:
  - SQL migration files in `backend/src/db/migrations/`
  - Migration runner script (`migrate.js`)
  - Database seeding script (`seed.js`)

- Article Entity Model (`Article.js`):
  - Created Article class with validation
  - `fromDatabase()` - Converts DB rows to Article entities
  - `toDb()` - Converts Article to database format for INSERT
  - `toJSON()` - Converts to API response format
  - `validate()` - Validates article data

- Service Layer Update (`articleService.js`):
  - Replaced in-memory array with PostgreSQL queries
  - `getAllArticles()` - SELECT with ORDER BY created_at DESC
  - `getArticleById()` - Parameterized query with $1 placeholder
  - `createArticle()` - INSERT using `article.toDb()` method
  - Field mapping: `created_at` (DB) to `createdAt` (API)

- Environment Configuration:
  - Added DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD to `.env`
  - Updated `.env.example` with database variables

**Files Created/Modified**:
- ✅ `backend/src/models/Article.js` (NEW - Article entity with toDb() method)
- ✅ `backend/src/config/database.js` (NEW - connection pool)
- ✅ `backend/src/db/migrations/001_create_articles_table.sql` (NEW)
- ✅ `backend/src/db/migrate.js` (NEW - migration runner)
- ✅ `backend/src/db/seed.js` (MODIFIED - AI-generated seed articles)
- ✅ `backend/src/services/articleService.js` (MODIFIED - PostgreSQL queries with toDb())
- ✅ `backend/.env` (MODIFIED - database credentials)
- ✅ `backend/.env.example` (MODIFIED - database variables)
- ✅ `backend/package.json` (pg added)

**Database Schema**:
```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[] DEFAULT '{}'
);
```

**Key Achievements**:
- ✅ Articles now persist across server restarts
- ✅ Production-ready data layer with entity pattern
- ✅ All existing functionality maintained
- ✅ Clean database serialization with `toDb()` method
- ✅ All articles generated by AI (no hardcoded seed data)

### ⏳ Phase 5: Docker Containerization (PLANNED)
**Goal**: Containerize frontend and backend

**Planned Steps**:
1. Create `frontend/Dockerfile`
2. Create `backend/Dockerfile`
3. Create `docker-compose.yml` for local dev
4. Test containers locally
5. Document Docker setup

### ⏳ Phase 6: AWS Deployment (PLANNED)
**Goal**: Deploy to AWS EC2 with CI/CD pipeline

**Planned Steps**:
1. Set up AWS account
2. Create ECR repositories
3. Create EC2 instance
4. Set up CodeBuild project
5. Create `buildspec.yml`
6. Configure deployment pipeline
7. Test live deployment
8. Document deployment process

---

## Next Session: Starting Phase 3

**What to do next**:
1. Research and choose AI provider
2. Get API key/credentials
3. Create `aiService.js` in backend
4. Implement basic article generation
5. Test via Postman or browser
6. See AI content in your blog UI
7. Add daily scheduling

**Decisions to make**:
- AI provider selection
- Article generation prompts/topics
- Storage strategy before DB (JSON file vs in-memory array)

---

## Notes
- Main branch: `main`
- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:3000 (Vite dev server on 5173, proxy to 3000)
- Recent work focused on keyboard accessibility and backend simplification
