# Architecture Documentation

## System Overview

The Auto-Generated Blog is a full-stack application that automatically generates and publishes blog articles using AI. The system is deployed on AWS infrastructure and uses Docker containers for all components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          GitHub Repository                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ (git push)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS CodeBuild                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Clone repository                                       │   │
│  │ 2. Build Docker images (frontend + backend)              │   │
│  │ 3. Push images to ECR                                    │   │
│  │ 4. Deploy to EC2 via SSM                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────┬───────────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────┐  ┌──────────────────────────────────┐
│   Amazon ECR            │  │         Amazon EC2               │
│                         │  │  ┌────────────────────────────┐  │
│ • autoblog-frontend    │  │  │   Docker Containers        │  │
│ • autoblog-backend     │──┼─▶│                            │  │
│                         │  │  │  ┌──────────────────────┐ │  │
└─────────────────────────┘  │  │  │  Frontend (nginx)    │ │  │
                             │  │  │  Port: 80            │ │  │
┌─────────────────────────┐  │  │  └──────────────────────┘ │  │
│   HuggingFace API       │  │  │                            │  │
│  (AI Generation)        │──┼─▶│  ┌──────────────────────┐ │  │
│                         │  │  │  │  Backend (Node.js)   │ │  │
└─────────────────────────┘  │  │  │  Port: 3001          │ │  │
                             │  │  └──────────────────────┘ │  │
                             │  │                            │  │
                             │  │  ┌──────────────────────┐ │  │
                             │  │  │  PostgreSQL DB       │ │  │
                             │  │  │  Port: 5432          │ │  │
                             │  │  └──────────────────────┘ │  │
                             │  └────────────────────────────┘  │
                             └──────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **State Management**: Redux Toolkit 2.0.1
- **Routing**: React Router 6.20.0
- **Build Tool**: Vite 5.0.8
- **i18n**: i18next (English/Portuguese)
- **Server**: nginx (production)

### Backend
- **Runtime**: Node.js 18 (Alpine Linux)
- **Framework**: Express.js 4.18.2
- **Database Driver**: pg 8.16.3
- **Scheduler**: node-cron 4.2.1
- **AI Integration**: HuggingFace Router API

### Database
- **Engine**: PostgreSQL 16
- **Features**: Connection pooling, migrations, indexing

### Infrastructure
- **Compute**: AWS EC2 (t2.micro)
- **Container Registry**: AWS ECR
- **CI/CD**: AWS CodeBuild
- **IAM**: Custom roles for EC2 and CodeBuild
- **Containerization**: Docker + Docker Compose

## Component Architecture

### Frontend Layer

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ArticleCard.jsx  # Article preview card
│   │   └── LanguageSwitcher.jsx
│   ├── pages/              # Route-based pages
│   │   ├── ArticleDetail.jsx
│   │   └── ArticleList.jsx
│   ├── store/              # Redux state management
│   │   ├── articlesSlice.js
│   │   └── store.js
│   ├── services/           # API communication
│   │   └── articleService.js
│   ├── i18n/              # Internationalization
│   │   ├── en.json
│   │   └── pt.json
│   └── App.jsx            # Root component
└── nginx.conf             # Production server config
```

**Key Features**:
- Responsive design (mobile/tablet/desktop)
- Loading states and error handling
- Client-side routing with React Router
- Internationalization (i18next)
- Redux for state management
- Optimized production build with Vite

### Backend Layer

```
backend/
├── src/
│   ├── ai/                    # AI integration layer
│   │   ├── huggingfaceClient.js   # API client
│   │   ├── modelDiscovery.js      # Dynamic model fetching
│   │   ├── promptBuilder.js       # Prompt construction
│   │   └── responseParser.js      # JSON validation
│   ├── config/                # Configuration
│   │   └── database.js        # PostgreSQL connection
│   ├── controllers/           # Request handlers
│   │   └── articleController.js
│   ├── db/                    # Database layer
│   │   ├── migrations/        # SQL schema migrations
│   │   └── seed.js           # Initial data seeding
│   ├── jobs/                  # Background tasks
│   │   └── articleJob.js     # Daily article generation
│   ├── lib/                   # Utilities
│   │   └── cache/
│   │       ├── modelCache.js  # Adaptive AI model cache
│   │       └── models.json    # Cached model data
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/               # Data models
│   │   └── Article.js        # Article entity
│   ├── routes/               # API routes
│   │   └── articleRoutes.js
│   ├── services/             # Business logic
│   │   ├── aiService.js      # AI orchestration
│   │   └── articleService.js # Article operations
│   └── server.js             # Application entry point
└── Dockerfile                # Container definition
```

**Key Features**:
- Clean layered architecture (routes → controllers → services → models)
- Adaptive AI model caching with performance scoring
- Automatic failover and retry logic
- Database migrations and seeding
- Scheduled tasks with node-cron
- Comprehensive error handling
- Health check and monitoring endpoints

### Database Schema

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

CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
```

**Features**:
- Auto-incrementing primary key
- Timestamp tracking for article creation
- Array type for tags (PostgreSQL-specific)
- Indexed queries for performance

## AI Integration Architecture

### HuggingFace Router API

The system uses the HuggingFace Router API with an intelligent caching and failover mechanism:

```
┌─────────────────────────────────────────────────────────────┐
│                    Article Generation Request                │
└────────────────────────────┬────────────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │   AI Service    │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  Model Cache    │
                    │  (Performance   │
                    │   Scoring)      │
                    └────────┬────────┘
                             ▼
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Best Model      │        │  Fallback Models │
    │  (Highest Score) │        │  (Scored Queue)  │
    └────────┬─────────┘        └────────┬─────────┘
             │                           │
             └───────────┬───────────────┘
                         ▼
              ┌────────────────────┐
              │ HuggingFace Router │
              │       API          │
              └────────┬───────────┘
                       ▼
              ┌────────────────────┐
              │  Success/Failure   │
              │  Update Cache      │
              └────────────────────┘
```

**Adaptive Caching System**:
- Models scored from 0.0 to 1.0 based on performance
- +0.1 points for successful generation
- -0.2 points for failures
- Auto-removal after 3 consecutive failures
- 30-day cache duration with score decay
- Dynamic model discovery from HuggingFace Hub

**Error Classification**:
- `AUTH_ERROR`: API key issues (doesn't penalize model)
- `RATE_LIMIT`: Too many requests (doesn't penalize model)
- `MODEL_ERROR`: Model-specific failures (penalizes model)

### Daily Article Generation

```javascript
// Scheduled daily at 00:00 UTC
cron.schedule('0 0 * * *', async () => {
  try {
    const newArticle = await articleService.createArticle();
    console.log(`Generated article: ${newArticle.title}`);
  } catch (error) {
    // Retry every 5 minutes if all models fail
    setTimeout(() => retryGeneration(), 5 * 60 * 1000);
  }
}, { scheduled: true, timezone: "UTC" });
```

**Features**:
- Automatic topic selection by AI
- 5-minute retry interval on total failure
- Continues retrying until success
- Logs all generation attempts

## Deployment Architecture

### AWS Resources

**EC2 Instance**:
- Instance Type: t2.micro (Free Tier)
- OS: Amazon Linux 2023
- IAM Role: AutoblogEC2Role
- Security Group: Ports 80, 3001, 22

**ECR Repositories**:
- autoblog-frontend (nginx-based React app)
- autoblog-backend (Node.js Express API)
- Image Tags: `latest` + commit hash

**CodeBuild Project**:
- Name: autoblog-build
- Build Spec: infra/buildspec.yml
- IAM Role: AutoblogCodeBuildRole
- Trigger: Manual or GitHub webhook

### CI/CD Pipeline

```
1. Developer pushes code to GitHub
   ↓
2. CodeBuild triggered (manual or webhook)
   ↓
3. buildspec.yml phases:
   • pre_build: Login to ECR, detect AWS account
   • build: Build frontend + backend Docker images
   • post_build: Push to ECR, deploy to EC2 via SSM
   ↓
4. EC2 pulls new images from ECR
   ↓
5. docker-compose restarts containers
   ↓
6. Application live with updated code
```

### Docker Configuration

**Multi-Stage Frontend Build**:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Optimized Backend Build**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Network Architecture

**Docker Compose Network**:
```yaml
services:
  frontend:
    ports: ["80:80"]
    networks: [app-network]

  backend:
    ports: ["3001:3001"]
    networks: [app-network]
    depends_on: [database]

  database:
    ports: ["5432:5432"]
    networks: [app-network]
    volumes: [postgres_data:/var/lib/postgresql/data]

networks:
  app-network:
    driver: bridge
```

**Security Groups**:
- Port 80: Public access (HTTP)
- Port 3001: Public access (API)
- Port 22: SSH access (restricted to your IP)
- Port 5432: Internal only (database)

## API Endpoints

### Articles API

**GET /api/articles**
- Description: List all articles
- Response: Array of articles with id, title, excerpt, author, createdAt
- Use Case: Article list page

**GET /api/articles/:id**
- Description: Get single article
- Response: Full article with content
- Use Case: Article detail page

**POST /api/articles/generate**
- Description: Generate new article via AI
- Response: Created article object
- Use Case: Manual article generation

### Monitoring API

**GET /health**
- Description: Application health check
- Response: Status and database connectivity

**GET /cache-stats**
- Description: AI model performance dashboard
- Response: Model scores, success rates, cache status

## Data Flow

### Article List Page

```
User → Frontend (/)
  ↓
Frontend dispatches fetchArticles()
  ↓
API GET /api/articles
  ↓
Backend queries PostgreSQL
  ↓
Returns JSON array
  ↓
Redux stores in articlesSlice
  ↓
React renders ArticleCard components
```

### Article Detail Page

```
User clicks article
  ↓
Frontend navigates to /article/:id
  ↓
Frontend dispatches fetchArticle(id)
  ↓
API GET /api/articles/:id
  ↓
Backend queries PostgreSQL with id
  ↓
Returns full article JSON
  ↓
Redux stores selected article
  ↓
React renders ArticleDetail component
```

### Daily Article Generation

```
Cron triggers at 00:00 UTC
  ↓
articleJob.js calls articleService.createArticle()
  ↓
aiService.generateArticle()
  ↓
modelCache.getBestModel()
  ↓
huggingfaceClient.generateText()
  ↓
HuggingFace API responds
  ↓
responseParser validates JSON
  ↓
PostgreSQL INSERT article
  ↓
modelCache.updateScore() (+0.1 success / -0.2 failure)
  ↓
Article available in API
```

## Performance Optimizations

### Frontend
- Multi-stage Docker build (smaller image)
- nginx gzip compression
- Static asset caching
- Code splitting with Vite
- Lazy loading of routes

### Backend
- Database connection pooling
- Model performance caching
- Indexed database queries
- Production-only dependencies
- Efficient JSON parsing

### Infrastructure
- Public ECR base images (faster pulls)
- Alpine Linux (smaller images)
- Docker layer caching
- Named volumes for persistence

## Security Considerations

### Application Security
- Environment variables for secrets
- .gitignore for sensitive files
- nginx security headers
- Input validation on API
- Error handling without stack traces

### AWS Security
- IAM roles with least privilege
- Security groups with minimal ports
- EC2 instance profile (no hardcoded credentials)
- ECR image scanning enabled
- SSM for secure deployments

## Monitoring and Logging

### Application Logs
- Express request logging middleware
- Error tracking with stack traces
- AI generation attempt logging
- Cron job execution logs

### Health Checks
- Database connectivity checks
- API health endpoint
- Model cache status dashboard

### Metrics
- Model performance scores
- Success/failure rates
- Cache hit/miss ratios
- Article generation timing

## Scalability Considerations

### Current Architecture (Single EC2)
- Suitable for prototype/demo
- Free tier eligible
- Simple deployment

### Future Scaling Options
1. **Horizontal Scaling**
   - Add load balancer
   - Multiple EC2 instances
   - Shared RDS PostgreSQL

2. **Managed Services**
   - RDS for PostgreSQL
   - ElastiCache for Redis (model cache)
   - CloudWatch for monitoring

3. **Container Orchestration**
   - ECS/Fargate for containers
   - Auto-scaling groups
   - Application Load Balancer

4. **Performance**
   - CDN for static assets (CloudFront)
   - Read replicas for database
   - API caching layer

## Disaster Recovery

### Backup Strategy
- Database: PostgreSQL volume backups
- Code: Git repository (GitHub)
- Images: ECR retention policy
- Configuration: Infrastructure as Code

### Recovery Procedures
1. EC2 failure: Launch new instance, run init-ec2.sh
2. Database corruption: Restore from volume snapshot
3. Build failure: Manual docker build and push
4. Total AWS failure: Deploy to new region with same scripts

## Cost Optimization

### Free Tier Usage
- EC2 t2.micro: 750 hours/month free
- ECR: 500 MB storage free
- CodeBuild: 100 build minutes/month free
- HuggingFace API: Free tier models

### Estimated Monthly Cost (After Free Tier)
- EC2 t2.micro: $0-10/month
- ECR storage: $0-1/month
- CodeBuild: $0-5/month
- Data transfer: $0-2/month
- **Total: $0-18/month**

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

### Deployment to Production
```bash
# Option 1: Automated via CodeBuild
git push origin main
aws codebuild start-build --project-name autoblog-build

# Option 2: Manual deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migrations
```bash
# Apply migrations
npm run migrate

# Seed initial data
npm run seed
```

## Troubleshooting

### Common Issues

**Frontend can't connect to backend**:
- Check VITE_API_URL environment variable
- Verify backend is running on correct port
- Check security group allows port 3001

**AI generation fails**:
- Verify HUGGINGFACE_API_KEY is set
- Check /cache-stats for model performance
- Review logs for error classification

**Database connection errors**:
- Verify PostgreSQL container is running
- Check DATABASE_URL format
- Ensure database is initialized

**Docker build fails**:
- Clear Docker cache: `docker system prune -a`
- Check Dockerfile syntax
- Verify base image availability

## Conclusion

This architecture provides a production-ready, scalable, and cost-effective solution for an auto-generated blog application. The system leverages modern technologies, cloud infrastructure, and intelligent AI integration to deliver a robust and maintainable application.
