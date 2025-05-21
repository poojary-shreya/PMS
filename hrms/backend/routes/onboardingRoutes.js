import express from 'express';
import multer from 'multer';
import path from 'path';
import { onboardingController } from '../controller/onboardingcontroller.js';

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/status/:status', onboardingController.getOnboardingsByStatus);
router.get('/employee/:employeeId', onboardingController.getOnboardingByEmployeeId);
router.get('/employee', onboardingController.getOnboardingByEmail);
router.get('/employee/status', onboardingController.getEmployeeOnboarding);

router.post('/', upload.array('uploadedFiles'), onboardingController.createOnboarding);
router.get('/', onboardingController.getAllOnboardings);
router.get('/:id', onboardingController.getOnboardingById);
router.put('/:id', onboardingController.updateOnboarding);
router.delete('/:id', onboardingController.deleteOnboarding);
router.post('/:id/send-reminder', onboardingController.sendReminderEmail);

export default router;