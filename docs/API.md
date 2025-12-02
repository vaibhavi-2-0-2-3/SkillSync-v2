# API Documentation

Complete reference for SkillSync backend API endpoints.

**Base URL**: `https://your-api.onrender.com` (production) or `http://localhost:4000` (development)

## Authentication

### GitHub OAuth Flow

#### 1. Get GitHub OAuth URL
```http
GET /api/auth/github/url
```

**Response:**
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=..."
}
```

#### 2. OAuth Callback
```http
GET /api/auth/github/callback?code=...
```

**Response:** Redirects to `GITHUB_DEFAULT_REDIRECT_URL` with query params:
- `userId`: MongoDB user ID
- `githubUsername`: GitHub username

## GitHub Data

### Get User Repositories
```http
GET /api/github/repos?userId=USER_ID
```

**Response:**
```json
[
  {
    "id": 123456,
    "name": "my-repo",
    "full_name": "username/my-repo",
    "description": "Repository description",
    "language": "TypeScript",
    "stargazers_count": 10,
    "forks_count": 2
  }
]
```

### Get Language Statistics
```http
GET /api/github/languages?userId=USER_ID
```

**Response:**
```json
{
  "TypeScript": 50000,
  "JavaScript": 30000,
  "Python": 10000
}
```

### Get Commit Statistics
```http
GET /api/github/commits?userId=USER_ID
```

**Response:**
```json
{
  "totalCommits": 150,
  "reposAnalyzed": 5,
  "byRepo": {
    "username/repo1": { "totalCommits": 100 },
    "username/repo2": { "totalCommits": 50 }
  }
}
```

## LeetCode

### Sync LeetCode Stats
```http
POST /api/leetcode/sync
Content-Type: application/json

{
  "userId": "USER_ID",
  "username": "leetcode_username"
}
```

**Response:**
```json
{
  "user": { ... },
  "stats": {
    "status": "success",
    "totalSolved": 150,
    "easySolved": 50,
    "mediumSolved": 80,
    "hardSolved": 20
  }
}
```

## LinkedIn

### Upload LinkedIn Skills
```http
POST /api/linkedin/skills
Content-Type: application/json

{
  "userId": "USER_ID",
  "payload": {
    "skills": [
      "JavaScript",
      "TypeScript",
      { "name": "React" }
    ]
  }
}
```

**Response:**
```json
{
  "user": { ... },
  "skills": ["javascript", "typescript", "react"]
}
```

## Analysis

### Generate Developer Analysis
```http
GET /api/analyze/:userId
```

**Response:**
```json
{
  "detectedSkills": ["javascript", "typescript", "react", "node"],
  "strongAreas": ["javascript", "typescript", "consistent-commit-activity"],
  "weakAreas": ["leetcode-hard", "dsa-dynamic-programming"],
  "missingSkills": ["docker", "kubernetes", "aws"],
  "githubSummary": {
    "totalRepos": 20,
    "languages": { "TypeScript": 50000, "JavaScript": 30000 },
    "dominantLanguages": ["TypeScript", "JavaScript"],
    "dominantStack": ["React", "Node.js"],
    "frameworksAndLibraries": ["react", "express", "tailwind"],
    "commitFrequencyScore": 4,
    "totalCommits": 500,
    "reposAnalyzedForCommits": 15
  },
  "leetcodeSummary": {
    "totalSolved": 150,
    "solvedByDifficulty": {
      "easy": 50,
      "medium": 80,
      "hard": 20
    },
    "weakDifficulties": ["hard"],
    "weakTopics": ["dynamic-programming"]
  },
  "linkedinSummary": {
    "skills": ["JavaScript", "TypeScript", "React"],
    "normalizedSkills": ["javascript", "typescript", "react"]
  }
}
```

## AI Insights

### Generate AI-Powered Insights
```http
POST /api/ai/generate
Content-Type: application/json

{
  "userId": "USER_ID",
  "role": "Backend Developer"
}
```

**Response:**
```json
{
  "aiInsights": {
    "roadmap": [
      "Focus on acquiring foundational skills: docker, kubernetes, aws.",
      "Deepen knowledge in weak areas: leetcode-hard via targeted practice.",
      "Leverage strong areas (javascript, typescript) to build portfolio projects."
    ],
    "skillGaps": ["docker", "kubernetes", "aws", "leetcode-hard"],
    "recommendedSkills": ["docker", "kubernetes", "aws", "system-design"],
    "readinessScore": 75,
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "role": "Backend Developer",
    "seniorFeedback": "Based on your current profile, double down on your strongest technologies..."
  }
}
```

## Company Matching

### Get Company Matches
```http
GET /api/company-match/:userId
```

**Response:**
```json
{
  "analysis": { ... },
  "matches": [
    {
      "company": "TechNova",
      "role": "Backend Developer",
      "fitScore": 85,
      "missingCompanySkills": ["kubernetes"],
      "matchedSkills": ["node", "typescript", "mongodb", "express"]
    },
    {
      "company": "CloudScale",
      "role": "Full Stack Developer",
      "fitScore": 70,
      "missingCompanySkills": ["aws", "docker"],
      "matchedSkills": ["react", "node", "typescript"]
    }
  ]
}
```

## Refresh

### Force Refresh All Data
```http
POST /api/refresh/:userId
Content-Type: application/json

{
  "role": "Backend Developer"
}
```

**Response:**
```json
{
  "message": "Data refreshed successfully",
  "analysis": { ... },
  "aiInsights": { ... },
  "companyMatches": [ ... ]
}
```

**Note**: This endpoint:
1. Syncs GitHub, LeetCode, LinkedIn data
2. Refreshes developer analysis
3. Regenerates AI insights
4. Updates company matches

## Health Check

### Server Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (user/resource not found)
- `500` - Internal Server Error

## Rate Limiting

- **Production**: 100 requests per 15 minutes per IP
- **Development**: 1000 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## TypeScript Interfaces

### DeveloperAnalysis
```typescript
interface DeveloperAnalysis {
  detectedSkills: string[];
  strongAreas: string[];
  weakAreas: string[];
  missingSkills: string[];
  githubSummary: GithubSummary | null;
  leetcodeSummary: LeetCodeSummary | null;
  linkedinSummary: LinkedInSummary | null;
}
```

### AIInsights
```typescript
interface AIInsights {
  roadmap: string[];
  skillGaps: string[];
  recommendedSkills: string[];
  readinessScore: number; // 0-100
  updatedAt: string;
  role?: string;
  seniorFeedback?: string;
}
```

### CompanyMatch
```typescript
interface CompanyMatch {
  company: string;
  role: string;
  fitScore: number; // 0-100
  missingCompanySkills: string[];
  matchedSkills: string[];
}
```

## Example Usage

### Complete Flow

1. **Authenticate with GitHub**
   ```bash
   curl https://api.onrender.com/api/auth/github/url
   # Open URL in browser, authorize, get redirected with userId
   ```

2. **Sync LeetCode**
   ```bash
   curl -X POST https://api.onrender.com/api/leetcode/sync \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "username": "leetcode_user"}'
   ```

3. **Upload LinkedIn Skills**
   ```bash
   curl -X POST https://api.onrender.com/api/linkedin/skills \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "payload": {"skills": ["JavaScript", "React"]}}'
   ```

4. **Generate Analysis**
   ```bash
   curl https://api.onrender.com/api/analyze/USER_ID
   ```

5. **Get AI Insights**
   ```bash
   curl -X POST https://api.onrender.com/api/ai/generate \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "role": "Backend Developer"}'
   ```

6. **Get Company Matches**
   ```bash
   curl https://api.onrender.com/api/company-match/USER_ID
   ```

---

**For more details, see the source code in `backend/src/routes/` and `backend/src/controllers/`.**

