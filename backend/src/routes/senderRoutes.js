import express from 'express';
import { getSenders, createSender, deleteSender } from '../controllers/senderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getSenders);
router.post('/', createSender);
router.delete('/:id', deleteSender);

export default router;
