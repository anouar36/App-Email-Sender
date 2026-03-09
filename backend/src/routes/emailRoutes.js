import express from 'express';
import multer from 'multer';
import { sendEmail, getCampaigns, sendEmailWithAttachment } from '../controllers/emailController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (store in memory for email attachment)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'));
    }
  }
});

router.use(authenticateToken);
router.post('/send', sendEmail);
router.post('/send-with-attachment', upload.single('cvFile'), sendEmailWithAttachment);
router.get('/campaigns', getCampaigns);

export default router;
