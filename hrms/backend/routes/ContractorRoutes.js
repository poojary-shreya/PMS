import express from "express";
import upload from "../config/multerConfig.js";
import { 
  createContractor, 
 
  getAllContractors, 
  getContractorById, 
  updateContractor 
} from "../controller/ContractController.js";

const router = express.Router();

// Route for creating a contractor with file uploads
router.post('/', upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]), createContractor);

router.get('/', getAllContractors);
router.get('/:c_employee_id', getContractorById);

// For update route, you might also need file upload handling
router.put('/:c_employee_id', upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]), updateContractor);



export default router;