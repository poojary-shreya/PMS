import express from 'express';
import {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getEmployees,getFeedbackEmp
} from '../controller/feedbackController.js';

const router = express.Router();


router.post('/', createFeedback);

router.get('/empfeedback', getFeedbackEmp);
router.get('/', getFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

router.get('/employees', getEmployees);

export default router;