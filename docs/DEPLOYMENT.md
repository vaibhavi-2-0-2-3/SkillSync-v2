# Deployment Guide

This guide covers deploying SkillSync to production using **Vercel** (frontend) and **Render** (backend).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Production                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Vercel     │         │   Render     │                │
│  │  (Frontend)  │◄────────┤  (Backend)   │                │
│  │              │  HTTPS  │              │                │
│  │  React SPA   │         │  Express API │                │
│  │  Serverless  │         │  Docker      │                │
│  └──────────────┘         └──────┬───────┘                │
│                                   │                         │
│                                   │ MongoDB Atlas          │
│                                   ▼                         │
│                          ┌──────────────┐                   │
│                          │   MongoDB    │                   │
│                          │    Atlas     │                   │
│                          └──────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │   Render Scheduled Jobs               │                  │
│  │   (Cron: Every 6 hours)               │                  │
│  │   Command: npm run cron:refresh       │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Deployment (Render)

### Step 1: Prepare Repository

Ensure your repository has:
- `backend/Dockerfile`
- `backend/render.yaml`
- `backend/package.json` with build scripts
- All source files in `backend/src/`

### Step 2: Create Render Web Service

1. **Go to Render Dashboard** → New → Web Service
2. **Connect Repository** (GitHub/GitLab)
3. **Configure Service**:
   - **Name**: `skillsync-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && node dist/server.js`
   - **Plan**: Starter (or higher)

### Step 3: Set Environment Variables

In Render dashboard → Environment tab, add:

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillsync
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=https://skillsync-api.onrender.com/api/auth/github/callback
GITHUB_DEFAULT_REDIRECT_URL=https://your-frontend.vercel.app
LEETCODE_API_BASE_URL=https://leetcode-stats-api.herokuapp.com
ENABLE_CRON=false
FRONTEND_URL=https://your-frontend.vercel.app
```

**Important Notes:**
- `ENABLE_CRON=false` - Disables node-cron (Render Scheduled Jobs handle it)
- `GITHUB_CALLBACK_URL` - Must match your GitHub OAuth app settings
- `GITHUB_DEFAULT_REDIRECT_URL` - Your Vercel frontend URL

### Step 4: Create MongoDB Database (Optional)

If not using MongoDB Atlas:

1. **Render Dashboard** → New → PostgreSQL/MongoDB
2. **Copy connection string** to `MONGODB_URI`

### Step 5: Create Render Scheduled Job

1. **Render Dashboard** → New → Scheduled Job
2. **Configure**:
   - **Name**: `skillsync-cron-refresh`
   - **Schedule**: `0 */6 * * *` (every 6 hours)
   - **Command**: `cd backend && npm install && npm run cron:refresh`
   - **Environment Variables**: Same as Web Service (especially `MONGODB_URI`)

### Step 6: Verify Deployment

- Check logs: Render Dashboard → Logs
- Test health endpoint: `https://your-api.onrender.com/health`
- Should return: `{ "status": "ok" }`

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

Ensure your repository has:
- `frontend/vercel.json`
- `frontend/package.json` with build script
- All source files in `frontend/src/`

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard** → Add New Project
2. **Import Git Repository**
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
VITE_BACKEND_URL=https://your-api.onrender.com
```

**Note**: No `/api` suffix - the service layer adds it.

### Step 4: Configure GitHub OAuth

Update your GitHub OAuth App settings:

1. **GitHub** → Settings → Developer settings → OAuth Apps
2. **Authorization callback URL**: `https://your-api.onrender.com/api/auth/github/callback`
3. **Homepage URL**: `https://your-frontend.vercel.app`

### Step 5: Deploy

1. **Push to main branch** - Vercel auto-deploys
2. **Check deployment** - Vercel Dashboard → Deployments
3. **Test frontend**: `https://your-frontend.vercel.app`

## How They Communicate

### API Routing

**Development:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Vite proxy rewrites `/api/*` → `http://localhost:4000/api/*`

**Production:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-api.onrender.com`
- `vercel.json` rewrites `/api/*` → `https://your-api.onrender.com/api/*`
- Frontend code uses `VITE_BACKEND_URL` environment variable

### CORS Configuration

Backend `app.ts` includes CORS:

```typescript
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'
    : ['http://localhost:5173'],
  credentials: true
}));
```

## Cron Jobs: Render Scheduled Jobs vs node-cron

### Local Development
- Uses `node-cron` (enabled with `ENABLE_CRON=true`)
- Runs inside Express server process
- Defined in `backend/src/scheduler/cron.ts`

### Production (Render)
- Uses **Render Scheduled Jobs** (standalone script)
- Runs independently of web service
- Script: `backend/scripts/cron-refresh.ts`
- Command: `npm run cron:refresh`
- Schedule: `0 */6 * * *` (every 6 hours)

**Why?**
- Render Scheduled Jobs are more reliable for long-running tasks
- No risk of cron jobs interfering with web service
- Better resource isolation
- Easier to monitor and debug

## Monitoring & Logs

### Render
- **Web Service Logs**: Dashboard → Service → Logs
- **Scheduled Job Logs**: Dashboard → Scheduled Job → Logs
- **Metrics**: CPU, Memory, Request count

### Vercel
- **Deployment Logs**: Dashboard → Deployment → Logs
- **Analytics**: Real-time visitor metrics
- **Function Logs**: Serverless function execution logs

### Backend Logging (Winston)
- **Production**: Logs to `logs/combined-YYYY-MM-DD.log` and `logs/error-YYYY-MM-DD.log`
- **Daily rotation**: Logs rotate daily, kept for 14-30 days
- **Console**: Also logs to console for Render dashboard visibility

## Troubleshooting

### Backend Issues

**Problem**: Build fails
- **Solution**: Check `backend/package.json` scripts, ensure TypeScript compiles

**Problem**: MongoDB connection fails
- **Solution**: Verify `MONGODB_URI` is correct, check MongoDB Atlas IP whitelist

**Problem**: Cron job not running
- **Solution**: Check Render Scheduled Job logs, verify `MONGODB_URI` is set

### Frontend Issues

**Problem**: API calls fail (CORS error)
- **Solution**: Verify `FRONTEND_URL` in backend env vars matches Vercel URL

**Problem**: API calls go to wrong URL
- **Solution**: Check `VITE_BACKEND_URL` in Vercel environment variables

**Problem**: Build fails
- **Solution**: Check Vercel build logs, ensure all dependencies are in `package.json`

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=...
GITHUB_DEFAULT_REDIRECT_URL=...
LEETCODE_API_BASE_URL=...
ENABLE_CRON=false
FRONTEND_URL=...
```

### Frontend (Vercel)
```env
VITE_BACKEND_URL=https://your-api.onrender.com
```

## Cost Estimation

### Render (Starter Plan)
- **Web Service**: $7/month
- **Scheduled Job**: Free (included)
- **MongoDB**: Free (or use Atlas free tier)

### Vercel
- **Hobby Plan**: Free (unlimited deployments)
- **Bandwidth**: Generous free tier

### Total
- **~$7/month** for full production deployment

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Set up Render Scheduled Job
4. ✅ Configure GitHub OAuth
5. ✅ Test end-to-end flow
6. ✅ Monitor logs and metrics
7. ✅ Set up custom domain (optional)

---

**Your SkillSync app is now live in production! 🚀**

