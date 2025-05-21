import express from 'express';
import {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan,
  getAllEmployees
} from '../controller/pipController.js';

const router = express.Router();

router.post('/', createPlan);
router.get('/', getPlans);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.get('/employees', getAllEmployees)

export default router;