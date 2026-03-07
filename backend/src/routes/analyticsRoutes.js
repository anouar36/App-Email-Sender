import express from 'express';
import { getAnalytics, exportAnalytics, exportDetailedAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get analytics data
router.get('/', authenticateToken, getAnalytics);

// Export analytics to Excel
router.get('/export', authenticateToken, exportAnalytics);

// Export detailed analytics with recipient info
router.post('/export-detailed', authenticateToken, exportDetailedAnalytics);

export default router;
