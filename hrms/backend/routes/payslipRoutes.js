import express from "express";
import { generatePayslip, getEmployeeId, getEmployeesByTax, getMonthlyTaxByEmployee, getPayslipByEmployee, getTotalTaxCompany, getYearlyTaxByEmployee } from "../controller/payslipController.js";

const router = express.Router();

router.post("/generate", generatePayslip);
router.get("/:month/:year", getPayslipByEmployee);
router.get("/employee/tax/:month/:year",getEmployeesByTax)
router.get("/employee/tax/yearly/:employee_id/:year",getYearlyTaxByEmployee)
router.get("/employee/tax/monthly/:employee_id/:month/:year",getMonthlyTaxByEmployee)
router.get("/employee/tax/total/company/financial/:year",getTotalTaxCompany)

export default router;