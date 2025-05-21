import { Router } from 'express';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlansByEmployee,
  getAllEmployees
} from '../controller/successionController.js';

const router = Router();


router.post('/', createPlan);
router.get('/', getPlans);
router.get('/:id', getPlanById); 


router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.get('/employee/:employeeId', getPlansByEmployee);
router.put('/employee/:id/update', updatePlan);
router.get('/employees', getAllEmployees);

export default router;