import express from "express";
import { calculatePayroll, getPayroll, getPayrollById,  } from "../controller/payrollTaxController.js";


const router = express.Router();

router.post("/calculate", calculatePayroll);
router.get("/all", getPayroll);
router.get("/salary/:employee_id",getPayrollById)

export default router;