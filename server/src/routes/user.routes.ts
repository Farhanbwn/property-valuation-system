import { Router } from 'express';
import { getUsers, changePassword } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, getUsers);
router.put('/password', authenticate, changePassword);

export default router;
