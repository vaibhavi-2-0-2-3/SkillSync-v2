import { Router } from 'express';
import { syncLeetCode } from '../controllers/leetcode.controller';

const router = Router();

router.post('/sync', syncLeetCode);

export default router;


