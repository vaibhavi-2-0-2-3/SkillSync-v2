import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github.routes';
import leetcodeRoutes from './routes/leetcode.routes';
import linkedinRoutes from './routes/linkedin.routes';
import analysisRoutes from './routes/analysis.routes';
import aiRoutes from './routes/ai.routes';
import companyRoutes from './routes/company.routes';
import refreshRoutes from './routes/refresh.routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.nodeEnv === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? process.env.FRONTEND_URL || 'https://skillsync.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.nodeEnv === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/company-match', companyRoutes);
app.use('/api/refresh', refreshRoutes);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const logger = require('./utils/logger').logger;
  logger.error('Express error handler', {
    error: err.message,
    stack: env.nodeEnv === 'development' ? err.stack : undefined
  });

  res.status(err.status || 500).json({
    error: env.nodeEnv === 'production' ? 'Internal server error' : err.message,
    ...(env.nodeEnv === 'development' && { stack: err.stack })
  });
});

export default app;


