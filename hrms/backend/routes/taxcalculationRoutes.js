import express from "express";
import { calculateTaxLiability, getTaxCalculations } from "../controller/taxcalculation.js"
const router =express.Router();
router.post('/calculate/:employee_id/:financial_year', calculateTaxLiability);
router.get('/calculatedtax/:employee_id/:financial_year', getTaxCalculations);
export default router;
