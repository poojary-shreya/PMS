import express from 'express';
import {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  uploadFiles,getEmployeeImage,
  getEmployeeBasicDetails
} from '../controller/addpersonalController.js';

const router = express.Router();

router.post('/addEmployee', uploadFiles, addEmployee);
router.get('/viewpersonal', getEmployees);
router.get('/employees/:employee_id', getEmployeeById);
router.put('/updateEmployee/:employee_id', uploadFiles, updateEmployee);
router.get('/employees', getEmployees); // Ensure this route exists
router.get('/employee-image/:employeeId', getEmployeeImage);
router.get('/basicdetails',getEmployeeBasicDetails)

export default router;