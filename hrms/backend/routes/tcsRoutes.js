import express from 'express';
import {
  getAllEmployeeTcs,
  getEmployeeTcsById,
  createEmployeeTcs,
  updateEmployeeTcs,
  deleteEmployeeTcs,
  getEmployeeTcsSummary
} from '../controller/tcsController.js';

const router = express.Router();


router.get('/:employee_id/tcs', getAllEmployeeTcs);
router.get('/:employee_id/tcs/:id', getEmployeeTcsById);
router.post('/:employee_id/tcs', createEmployeeTcs);
router.put('/:employee_id/tcs/:id', updateEmployeeTcs);
router.delete('/:employee_id/tcs/:id', deleteEmployeeTcs);
router.get('/:employee_id/tcs-summary', getEmployeeTcsSummary);

export default router;