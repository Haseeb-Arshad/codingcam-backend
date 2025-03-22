import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/daily', AnalyticsController.getDailyStats);
router.get('/languages', AnalyticsController.getLanguageStats);
router.get('/projects', AnalyticsController.getProjectStats);

export default router;