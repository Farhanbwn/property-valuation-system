import { Router } from 'express';
import { createInspection, getMyInspections, getTeamInspections, getInspectionById, updateInspection, deleteInspection } from '../controllers/inspection.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Used by inspection role
router.post('/', authenticate, createInspection);
router.get('/my-inspections', authenticate, getMyInspections);

// Used by user role (standard users)
router.get('/team-inspections', authenticate, getTeamInspections);

router.get('/:id', authenticate, getInspectionById);
router.put('/:id', authenticate, updateInspection);
router.delete('/:id', authenticate, deleteInspection);

export default router;
