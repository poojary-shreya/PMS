
import express from 'express';
import { getAllowanceData } from '../controller/Exemption.js';

const router = express.Router();

router.get('/allowances', getAllowanceData);

export default router;