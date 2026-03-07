import express from 'express';
import { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  duplicateTemplate 
} from '../controllers/templateController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all templates for the authenticated user
router.get('/', getTemplates);

// Get a specific template by ID
router.get('/:id', getTemplateById);

// Create a new template
router.post('/', createTemplate);

// Update a template
router.put('/:id', updateTemplate);

// Delete a template
router.delete('/:id', deleteTemplate);

// Duplicate a template
router.post('/:id/duplicate', duplicateTemplate);

export default router;
