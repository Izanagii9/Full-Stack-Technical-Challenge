# Development Log - Auto-Generated Blog Project

## Project Context
This is a full-stack technical challenge to build an auto-generated blog with React, Node.js, PostgreSQL, Docker, and AWS deployment. Timeline: 1 week.

---

## Technical Summary (For AI Assistant)

### Current Architecture
- **Frontend**: React 18.2.0 + Redux Toolkit + React Router + i18next (EN/PT) + Axios
- **Backend**: Express.js + CORS + Template renderer for HTML views (English only - no i18n)
- **Data Layer**: Mock data in `backend/src/services/articleService.js` (3 hardcoded articles)
- **State**: Redux store with `articlesSlice`, async thunks for API calls
- **Styling**: External CSS files, custom focus-visible for keyboard nav
- **API**: `/api/articles` (list), `/api/articles/:id` (detail), `/health` (health check)

### File Locations
- Frontend components: `frontend/src/components/`
- Frontend pages: `frontend/src/pages/`
- Frontend services: `frontend/src/services/articleService.js` (Axios wrapper)
- Frontend store: `frontend/src/store/` (Redux slices)
- Backend controllers: `backend/src/controllers/articleController.js`
- Backend services: `backend/src/services/articleService.js` (mock data)
- Backend routes: `backend/src/routes/articleRoutes.js`
- Backend views: `backend/views/*.html` (HTML templates for API docs)

### What Works
- ✅ Full frontend-backend communication via REST API
- ✅ Language switching (EN/PT) with i18next
- ✅ Responsive design with loading/error states
- ✅ Clean keyboard navigation with custom focus styles
- ✅ Backend serves JSON to API clients, HTML docs to browsers
- ✅ Service layer pattern for separation of concerns

### Key Implementation Details
- Mock data simulates async DB with 100ms delay
- Accept header detection for HTML vs JSON responses
- StateContainer uses `flex: 1` to prevent layout jumping
- Global focus-visible styles prevent excessive outline spacing
- Template renderer uses `{{placeholder}}` replacement

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

### Current Status: Phase 2 Complete

**What's Working:**
- Frontend talks to backend ✅
- Articles display correctly ✅
- Language switching works ✅
- Everything looks good and is responsive ✅

**What's Next: Phase 3 - AI Integration**

Currently, your 3 articles are hardcoded. The next step is to:
1. Connect to a free AI service (like HuggingFace)
2. Create a button or endpoint to generate new articles automatically
3. Make the AI write 1 new article every day
4. See AI-generated content appear in your blog

This is the exciting part where your blog becomes truly "auto-generated"!

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

### ⏳ Phase 3: AI Integration (NEXT - NOT STARTED)
**Goal**: Replace mock data with AI-generated content

**Planned Steps**:
1. Choose AI provider (HuggingFace, OpenRouter, DeepInfra, or OpenAI)
2. Create `backend/src/services/aiService.js`
3. Implement article generation logic
4. Add POST endpoint `/api/articles/generate`
5. Test manual article generation via API
6. Implement daily cron job (node-cron)
7. Store generated articles (still in-memory for now, before DB phase)
8. Update frontend to show newly generated articles

**Requirements**:
- Generate 1 article per day automatically
- Use free API (recommended) or max $5 on paid API
- Must have at least 3 articles when deployed

**Technical Decisions Needed**:
- Which AI provider to use?
- What prompts to use for article generation?
- How to schedule daily generation (cron vs node-cron)?
- How to store articles before PostgreSQL (array in memory, JSON file)?

### ⏳ Phase 4: PostgreSQL Database (PLANNED)
**Goal**: Replace in-memory/JSON storage with PostgreSQL

**Planned Steps**:
1. Set up PostgreSQL locally
2. Create database schema (articles table)
3. Add `pg` npm package
4. Update `articleService.js` to use PostgreSQL
5. Migrate existing articles to database
6. Test frontend still works with DB

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
