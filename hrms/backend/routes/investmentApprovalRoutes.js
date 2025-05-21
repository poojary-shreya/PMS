import express from "express"
import { getAllInvestmentProofs, updateInvestmentProofStatus } from "../controller/investmentApproval.js"

const router = express.Router();

router.get("/all",getAllInvestmentProofs);
router.put('/update-status', updateInvestmentProofStatus);

export default router;