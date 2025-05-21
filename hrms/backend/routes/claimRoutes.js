import express from 'express';
import { submitClaim, getEmployeeClaims, updateClaimStatus,getAllClaims } from '../controller/claimController.js';
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post('/submit', upload.array('proofDocuments', 1), submitClaim);

router.get('/employee-claims', getEmployeeClaims);
router.put('/status/:employee_id', updateClaimStatus);
router.get('/all', getAllClaims);
export default router;