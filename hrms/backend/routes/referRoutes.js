import express from 'express';
import upload from '../config/multerConfig.js';
import {
  createReferral,
  getAllReferrals,
  getReferrerInfo,
  quickResumeUpload
} from '../controller/referController.js';

const router = express.Router();

// Create a new referral with resume upload
router.post('/create', upload.single('resume'), createReferral);
router.get('/referrer/info', getReferrerInfo);
router.post('/quick-upload', upload.single('resume'), quickResumeUpload);
// Get all referrals
router.get('/', getAllReferrals);
router.get('/debug-session', (req, res) => {
    console.log('Session data:', req.session);
    res.json({
      sessionExists: !!req.session,
      hasEmployeeId: !!req.session.employee_id,
      employeeId: req.session.employee_id || 'not set'
    });
  });

// Get referral by email
// router.get('/:email', getReferralByEmail);

// // Update a referral
// router.put('/:email', upload.single('resume'), updateReferral);

// // Delete a referral
// router.delete('/:email', deleteReferral);

// // Download resume
// router.get('/resume/:email', downloadResume);

export default router;