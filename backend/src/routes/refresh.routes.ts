import { Router } from 'express';
import { refreshUserData } from '../controllers/refresh.controller';

const router = Router();

router.post('/:userId', refreshUserData);

export default router;

