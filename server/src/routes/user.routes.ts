import { Router } from 'express';
import { getUsers, getMyInspectors, changePassword, createUser, deleteUser, resetUserPassword } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, getUsers);
router.get('/my-inspectors', authenticate, getMyInspectors);
router.post('/', authenticate, requireAdmin, createUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);
router.put('/:id/password', authenticate, requireAdmin, resetUserPassword);
router.put('/password', authenticate, changePassword);

export default router;
