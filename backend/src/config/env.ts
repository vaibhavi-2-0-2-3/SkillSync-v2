import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const frontendUrlLocal = process.env.FRONTEND_URL_LOCAL || 'http://localhost:5173';
const frontendUrlProd = process.env.FRONTEND_URL_PROD || 'https://skill-sync-v2-bay.vercel.app';
const frontendUrl = process.env.FRONTEND_URL || (isProduction ? frontendUrlProd : frontendUrlLocal);

const backendUrlProd = process.env.BACKEND_URL_PROD || 'https://skillsync-api.onrender.com';

const githubCallbackUrlLocal =
  process.env.GITHUB_CALLBACK_URL_LOCAL || 'http://localhost:4000/api/auth/github/callback';
const githubCallbackUrlProd =
  process.env.GITHUB_CALLBACK_URL_PROD || `${backendUrlProd}/api/auth/github/callback`;
const githubCallbackUrl =
  process.env.GITHUB_CALLBACK_URL || (isProduction ? githubCallbackUrlProd : githubCallbackUrlLocal);

const mongodbUri =
  process.env.MONGODB_URI ||
  (isProduction
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/skillsync');

if (!mongodbUri) {
  throw new Error('MONGODB_URI is not defined');
}

const devCorsOrigins = (process.env.CORS_ORIGINS_LOCAL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv,
  isProduction,
  mongodbUri,
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubCallbackUrl,
  githubDefaultRedirectUrl: process.env.GITHUB_DEFAULT_REDIRECT_URL || frontendUrl,
  frontendUrl,
  frontendUrlLocal,
  frontendUrlProd,
  backendUrlProd,
  leetcodeApiBaseUrl:
    process.env.LEETCODE_API_BASE_URL || 'https://leetcode-stats-api.herokuapp.com',
  enableCron:
    (process.env.ENABLE_CRON ?? (isProduction ? 'false' : 'true')).toLowerCase() === 'true',
  devCorsOrigins
};
