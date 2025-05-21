import express from 'express';
import {
  getAllEmployeeTds,
  getEmployeeTdsById,
  createEmployeeTds,
  updateEmployeeTds,
  deleteEmployeeTds,
  getEmployeeTdsSummary
} from '../controller/tdsController.js';

const router = express.Router();


router.get('/:employee_id/tds', getAllEmployeeTds);
router.get('/:employee_id/tds/:id', getEmployeeTdsById);
router.post('/:employee_id/tds', createEmployeeTds);
router.put('/:employee_id/tds/:id', updateEmployeeTds);
router.delete('/:employee_id/tds/:id', deleteEmployeeTds);
router.get('/:employee_id/tds-summary', getEmployeeTdsSummary);

export default router;