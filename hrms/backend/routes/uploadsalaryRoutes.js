import express from "express";
import { addPayroll, createPayroll, getPayrolls,getPayrollByEmployeeId,getPayrollDetails } from "../controller/uploadsalaryController.js";


const router = express.Router();
router.post("/cp",addPayroll)
router.post("/createPayroll", createPayroll);
router.post("/salary", getPayrolls);
router.get("/projectedtax",getPayrollByEmployeeId)
router.get("/viewctc",getPayrollDetails);
export default router;