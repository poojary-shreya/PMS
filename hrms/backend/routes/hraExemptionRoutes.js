import express from 'express';
import { 
  calculateHraExemption,
  getHraExemptionByEmployeeId,
  getAllHraExemptions
} from '../controller/hraExemptionController.js';


const router = express.Router();

router.post('/calculate',calculateHraExemption);

router.get('/employee/:employee_id',getHraExemptionByEmployeeId);

router.get('/all',getAllHraExemptions);

export default router;