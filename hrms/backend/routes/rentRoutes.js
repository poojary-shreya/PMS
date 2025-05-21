import express from 'express';
import { calculateHRA } from '../controller/RentController.js';


const router = express.Router();

// Route to calculate HRA
router.post('/calculate', calculateHRA);

export default router;