import express from 'express';
import { documentController, upload } from '../controller/docController.js';

const router = express.Router();


router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/onboarding/:onboardingId', documentController.getDocumentsByOnboardingId);
router.patch('/:id/status', documentController.updateDocumentStatus); 
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.downloadDocument);
router.get('/:id/view', documentController.viewDocument);
router.get('/path/:documentPath', documentController.serveDocumentByPath); 

export default router;