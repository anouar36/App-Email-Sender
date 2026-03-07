import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getConfig);
router.post('/', updateConfig);

export default router;
