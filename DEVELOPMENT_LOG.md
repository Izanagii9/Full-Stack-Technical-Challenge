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
**Goal**: Replace mock data with AI-generated content

**What Was Built**:
- AI Service (`backend/src/services/aiService.js`):
  - Article generation with mock AI content
  - Random topic selection from 15 technology topics
  - Smart tag generation based on topic keywords
  - Two content templates for variety

- Article Service Updates (`backend/src/services/articleService.js`):
  - Changed from `const` to `let` for mutable articles array
  - Added `createArticle(topic)` method
  - Auto-incrementing ID generation
  - New articles prepended to array (newest first)

- Generation Endpoint (`POST /api/articles/generate`):
  - Manual article generation via API
  - Accepts optional `topic` in request body
  - Returns 201 status with generated article

- Daily Automation (`backend/src/jobs/articleJob.js`):
  - node-cron scheduler integration
  - Runs daily at 00:00 UTC
  - Automatic random topic selection

- Server Integration:
  - Cron job starts with server
  - Fixed FRONTEND_URL to port 3000 (matching Vite config)

**API Endpoints Added**:
```
POST /api/articles/generate  → Generate new article
```

**Files Created/Modified**:
- ✅ `backend/src/services/aiService.js` (NEW)
- ✅ `backend/src/jobs/articleJob.js` (NEW)
- ✅ `backend/src/services/articleService.js` (MODIFIED)
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

- Service Layer Update (`articleService.js`):
  - Replaced in-memory array with PostgreSQL queries
  - `getAllArticles()` - SELECT with ORDER BY created_at DESC
  - `getArticleById()` - Parameterized query with $1 placeholder
  - `createArticle()` - INSERT with RETURNING clause
  - Field mapping: `created_at` (DB) to `createdAt` (API)

- Environment Configuration:
  - Added DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD to `.env`
  - Updated `.env.example` with database variables

**Files Created/Modified**:
- ✅ `backend/src/config/database.js` (NEW - connection pool)
- ✅ `backend/src/db/migrations/001_create_articles_table.sql` (NEW)
- ✅ `backend/src/db/migrate.js` (NEW - migration runner)
- ✅ `backend/src/db/seed.js` (NEW - database seeding)
- ✅ `backend/src/services/articleService.js` (MODIFIED - PostgreSQL queries)
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

**Key Achievement**:
✅ Articles now persist across server restarts
✅ Production-ready data layer
✅ All existing functionality maintained

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
