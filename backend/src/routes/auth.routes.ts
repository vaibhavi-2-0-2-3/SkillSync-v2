import { Router } from 'express';
import { getGitHubOAuthUrl, githubOAuthCallback } from '../controllers/auth.controller';

const router = Router();

router.get('/github/url', getGitHubOAuthUrl);
router.get('/github/callback', githubOAuthCallback);

export default router;


