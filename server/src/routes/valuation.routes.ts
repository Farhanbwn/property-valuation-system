import { Router } from 'express';
import { 
  getActiveRules, 
  calculatePropertyValuation, 
  savePropertyValuation, 
  getValuationHistory, 
  getValuationById, 
  deleteValuation, 
  calculateStandaloneLandValuation,
  saveStandaloneLandValuation,
  getDashboardStats
} from '../controllers/valuation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);


router.get('/rules', getActiveRules);
router.post('/calculate', calculatePropertyValuation);
router.post('/', savePropertyValuation);
router.get('/', getValuationHistory);
router.get('/stats', getDashboardStats);
router.get('/:id', getValuationById);
router.delete('/:id', deleteValuation);

router.post('/land-calculate', calculateStandaloneLandValuation);
router.post('/land', saveStandaloneLandValuation);

export default router;
