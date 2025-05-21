import express from 'express';
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewsByEmployee,
  getEmployee,
  getAllEmployees,
  getReviews
} from '../controller/reviewController.js';

const router = express.Router();


router.post('/', createReview);
router.get('/', getAllReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.get('/employee/:employee_id', getReviewsByEmployee);
router.get('/emp/:employee_id', getReviews);


router.get('/employee-details/:employee_id', getEmployee);
router.get('/employees', getAllEmployees);

export default router;