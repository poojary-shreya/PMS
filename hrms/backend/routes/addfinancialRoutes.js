import express from "express";
import {
  addFinancialDetails,
  getFinancialDetails,
  updateFinancialDetails,
  getFinancialRecord
} from "../controller/addfinancialController.js";

const router = express.Router();

router.post("/financial", addFinancialDetails);
router.get("/viewallfinancial", getFinancialDetails);
router.put('/financial/:employee_id', updateFinancialDetails);
router.get('/financial/:employee_id', getFinancialRecord);

export default router;