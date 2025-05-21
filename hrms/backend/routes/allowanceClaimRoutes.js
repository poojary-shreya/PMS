import express from 'express';
import { allowanceClaim, getAllAllowanceClaims, getEmployeeAllowanceClaims, updateAllowanceClaimStatus } from '../controller/allowanceController.js';
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post('/submit', upload.array('file', 1), allowanceClaim);


router.get('/employee-claims', getEmployeeAllowanceClaims);
router.get("/all",getAllAllowanceClaims);
router.put("/update-status",updateAllowanceClaimStatus);

export default router;