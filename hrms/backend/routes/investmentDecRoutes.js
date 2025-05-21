import express from "express";
import { 
//   createOrUpdateInvestmentDeclaration, 
//   getInvestmentDeclaration, 
//   getAllEmployeeDeclarations,
  createTaxDeduction,
  getTaxDeduction,
} from "../controller/investmentDecController.js";


const router = express.Router();

router.post("/declarations", createTaxDeduction);
router.get('/proof/investment', getTaxDeduction);

// router.get("/declarations/:employee_id/:financial_year", getInvestmentDeclaration);


// router.get("/declarations/:employee_id", getAllEmployeeDeclarations);


export default router;