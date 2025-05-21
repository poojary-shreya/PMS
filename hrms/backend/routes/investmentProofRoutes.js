import express from "express";
import { submitInvestmentProof,getInvestmentDeclaration } from "../controller/investmentProofController.js";
import upload from "../config/multerConfig.js";




const router = express.Router();

router.post("/proof",upload.single("file"), submitInvestmentProof);
router.get('/investment', getInvestmentDeclaration);
 
export default router;