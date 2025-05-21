
import express from 'express';
import {
  searchEmployee,
  getReportingHierarchy,
  getEmployeeById,
  getAllEmployees
} from '../controller/searchController.js';

const router = express.Router();


router.get('/search-employee', searchEmployee);
router.get('/reporting-hierarchy', getReportingHierarchy);
router.get('/employee/:id', getEmployeeById);
router.get('/employees', getAllEmployees);

export default router;