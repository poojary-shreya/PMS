import express from 'express';
import { 
  savePropertyLoss,
  getPropertyLossByEmployeeAndYear,
  getAllPropertyLossesByEmployee,
  deletePropertyLoss, getAllPropertyLosses
} from '../controller/losspropertyController.js';

const router = express.Router();

router.post('/property-loss', savePropertyLoss);

router.get('/property-loss/:employeeId/:fiscalYear', getPropertyLossByEmployeeAndYear);


router.get('/property-loss/employee/:employeeId', getAllPropertyLossesByEmployee);
router.get('/property-loss/all', getAllPropertyLosses);

router.delete('/property-loss/:id', deletePropertyLoss);

export default router;