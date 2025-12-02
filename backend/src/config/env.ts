import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/skillsync",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  githubCallbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:4000/api/auth/github/callback",
  githubDefaultRedirectUrl:
    process.env.GITHUB_DEFAULT_REDIRECT_URL || "http://localhost:5173",
  leetcodeApiBaseUrl:
    process.env.LEETCODE_API_BASE_URL ||
    "https://leetcode-stats-api.herokuapp.com",
  enableCron: process.env.ENABLE_CRON === "true",
};
