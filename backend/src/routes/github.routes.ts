import { Router } from 'express';
import { getUserRepos, getLanguageStats, getCommitStats } from '../controllers/github.controller';

const router = Router();

router.get('/repos', getUserRepos);
router.get('/languages', getLanguageStats);
router.get('/commits', getCommitStats);

export default router;


