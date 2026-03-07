import express from 'express';
import { getProfile, updateProfile, upload } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getProfile);
router.put('/', upload.single('avatar'), updateProfile);

export default router;
