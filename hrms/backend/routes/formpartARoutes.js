import express from "express"
import { createTaxForm,getEmployeeForTaxForm
 } from "../controller/fompartAController.js";

const router = express.Router();                 
 router.post("/create", createTaxForm);
 router.get("/employee/:employee_id", getEmployeeForTaxForm);
export default router;