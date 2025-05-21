import express from 'express';
import { calculateAllowance} from '../controller/allowanceCalculationController.js';

const router = express.Router();

router.post('/calculateallowance', calculateAllowance);

export default router;