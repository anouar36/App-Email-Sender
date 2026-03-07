import express from 'express';
import { sendEmail, getCampaigns } from '../controllers/emailController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.post('/send', sendEmail);
router.get('/campaigns', getCampaigns);

export default router;
