import express from 'express';
import {
  createTraining,
  getTrainings,

  updateTrainingProgress,
  notifyTrainingUpdate,
  getEmployeeTrainings,
  getEmployeeTrainingById,
  getEmployeeTrainingsByEmployeeId,
  getTrainingUpdateHistory

} from '../controller/trainingController.js';

const router = express.Router();


router.post('/add', createTraining);
router.get('/', getTrainings);

router.put('/:id/progress', updateTrainingProgress);
router.post('/notify', notifyTrainingUpdate);

router.get('/employee/:email', getEmployeeTrainings);
router.get('/employee/training/:id', getEmployeeTrainingById);
router.get('/employee/id/:employee_id', getEmployeeTrainingsByEmployeeId);
router.get('/:id/history', getTrainingUpdateHistory);

export default router;