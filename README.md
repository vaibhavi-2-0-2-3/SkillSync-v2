# SkillSync

**A production-grade, personalized developer skill-gap analyzer that integrates GitHub, LeetCode, and LinkedIn data to provide actionable insights and AI-powered career roadmaps.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 🎯 Overview

SkillSync is a full-stack MERN application that analyzes developer profiles across multiple platforms to identify skill gaps, generate personalized learning roadmaps, and match developers with relevant job opportunities. Built with production-ready architecture, automated data synchronization, and AI-powered insights.

### Key Features

- **🔐 GitHub OAuth Integration** - Authenticate and fetch repository data, language statistics, and commit history
- **💻 LeetCode Analytics** - Track problem-solving progress and identify weak DSA categories
- **💼 LinkedIn Skills Import** - Extract and normalize professional skills
- **🤖 AI-Powered Analysis** - Generate personalized roadmaps, skill gap analysis, and job readiness scores
- **🏢 Company Matching** - Compare your skills against 20+ company profiles with fit scores
- **⏰ Automated Sync** - Background workers keep data fresh every 6 hours
- **📊 Interactive Dashboards** - Beautiful visualizations with Recharts (radar charts, pie charts, bar charts)
- **🚀 Production Ready** - Deployed on Vercel (frontend) + Render (backend) with Docker, PM2, and Winston logging

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   External      │
│   (Vercel)      │◄────────┤   (Render)      │─────────┤   APIs          │
│   React + TS    │  REST   │   Express + TS  │  OAuth  │   GitHub        │
│   TailwindCSS   │  API    │   MongoDB      │         │   LeetCode      │
│   Recharts      │         │   Winston      │         │   LinkedIn      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      │ Cron Jobs
                                      ▼
                            ┌─────────────────┐
                            │ Render Scheduled│
                            │     Jobs        │
                            │  (Every 6 hrs)  │
                            └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Node.js 20** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **Winston** for production logging
- **node-cron** (local) / Render Scheduled Jobs (production)
- **Helmet**, **compression**, **express-rate-limit** for security

### Infrastructure
- **Vercel** - Frontend hosting (serverless)
- **Render** - Backend hosting (Docker containers)
- **MongoDB Atlas** - Database hosting

## 📦 Installation

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- GitHub OAuth App credentials

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillsync.git
   cd skillsync
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your credentials
   ```

   **Backend `.env` variables:**
   ```env
   NODE_ENV=development
   PORT=4000

   # Local + production database URIs
   MONGODB_URI_LOCAL=mongodb://localhost:27017/skillsync
   # MONGODB_URI_PROD=<render_connection_string>

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL_LOCAL=http://localhost:4000/api/auth/github/callback
   GITHUB_CALLBACK_URL_PROD=https://skillsync-api.onrender.com/api/auth/github/callback

   # Frontend/Backend URLs
   FRONTEND_URL_LOCAL=http://localhost:5173
   FRONTEND_URL_PROD=https://skill-sync-v2-bay.vercel.app
   BACKEND_URL_PROD=https://skillsync-api.onrender.com

   LEETCODE_API_BASE_URL=https://leetcode-stats-api.herokuapp.com

   # Run cron jobs locally, disable on Render (use Scheduled Jobs)
   ENABLE_CRON=true
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file (optional for local dev)
   echo "VITE_BACKEND_URL=http://localhost:4000" > .env
   ```

5. **Run Development Servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or separately:
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

## 🚀 Deployment

### Backend (Render)

1. **Connect Repository** to Render
2. **Create Web Service** using `render.yaml` configuration
3. **Set Environment Variables** in Render dashboard:
   - `MONGODB_URI`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL_PROD` (production callback URL)
   - `FRONTEND_URL_PROD` (Vercel frontend URL)
   - `BACKEND_URL_PROD` (Render backend URL)
   - `ENABLE_CRON=false` (Render Scheduled Jobs handle cron)

4. **Create Scheduled Job** in Render:
   - Command: `npm run cron:refresh`
   - Schedule: `0 */6 * * *` (every 6 hours)

### Frontend (Vercel)

1. **Connect Repository** to Vercel
2. **Configure Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables**:
   - `VITE_BACKEND_URL=https://your-render-backend.onrender.com`

4. **Deploy** - Vercel auto-detects `vercel.json` configuration

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📚 API Documentation

See [docs/API.md](./docs/API.md) for complete API reference with examples.

### Quick Endpoints

- `GET /api/auth/github/url` - Get GitHub OAuth URL
- `GET /api/auth/github/callback` - OAuth callback handler
- `GET /api/github/repos?userId=...` - Fetch user repositories
- `GET /api/github/languages?userId=...` - Get language statistics
- `GET /api/leetcode/sync` - Sync LeetCode stats
- `POST /api/linkedin/skills` - Upload LinkedIn skills
- `GET /api/analyze/:userId` - Generate developer analysis
- `POST /api/ai/generate` - Generate AI insights
- `GET /api/company-match/:userId` - Get company matches
- `POST /api/refresh/:userId` - Force refresh all data

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend && npm test

# Frontend tests (when implemented)
cd frontend && npm test
```

## 📖 Project Structure

```
skillsync/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & DB config
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── scheduler/       # Cron job definitions
│   │   ├── utils/          # Logger, helpers
│   │   ├── app.ts          # Express app
│   │   └── server.ts       # Server entry point
│   ├── scripts/
│   │   └── cron-refresh.ts # Standalone cron script
│   ├── Dockerfile          # Docker config
│   ├── render.yaml         # Render deployment config
│   └── ecosystem.config.js # PM2 config (local)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── context/        # React context
│   │   └── App.tsx         # Root component
│   └── vercel.json         # Vercel deployment config
└── docs/
    ├── DEPLOYMENT.md        # Deployment guide
    └── API.md              # API documentation
```

## 🎨 Features in Detail

### 1. GitHub Integration
- OAuth 2.0 authentication
- Repository listing with pagination
- Language usage statistics
- Commit frequency analysis
- Framework/library detection from READMEs

### 2. LeetCode Analytics
- Problem-solving statistics by difficulty
- Weak topic identification
- Progress tracking over time

### 3. LinkedIn Skills
- JSON upload endpoint
- Skill normalization and deduplication
- Cross-platform skill comparison

### 4. AI-Powered Insights
- Personalized learning roadmap
- Skill gap analysis
- Job readiness scoring (0-100)
- Senior developer feedback

### 5. Company Matching
- 20+ pre-configured company profiles
- Fit score calculation (0-100%)
- Missing skills identification
- Matched skills highlighting

## 🔒 Security

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests/15min in production
- **CORS** - Configured for production domains
- **Input Sanitization** - Express body parser limits
- **Environment Variables** - Sensitive data never committed

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 👤 Author

Built as a portfolio project demonstrating:
- Full-stack MERN development
- OAuth integration
- Background job processing
- Production deployment (Vercel + Render)
- TypeScript best practices
- Modern React patterns

---

**Ready for production. Resume-ready. Portfolio-ready.** 🚀
