import express from 'express';
import {
  getEmployeeProfile,
  getEmployeeProfileByEmail,
  updateEmployeeProfile,
  getFinancialDetails,
  getRoleDetails,
  getCurrentEmployeeProfile,
  getCurrentFinancialDetails,
  getCurrentRoleDetails
} from '../controller/employeeprofileController.js';

const router = express.Router();

// Current logged-in user endpoints - these don't need IDs as they use session
router.get('/profile', getCurrentEmployeeProfile);
router.get('/financial', getCurrentFinancialDetails);
router.get('/role', getCurrentRoleDetails);

// Specific ID endpoints - require authentication and authorization
router.get('/employees/email/:email', getEmployeeProfileByEmail);
router.get('/employees/:id', getEmployeeProfile);
router.get('/financial/:id', getFinancialDetails);
router.get('/roles/:id', getRoleDetails);

// Update endpoint
router.put('/updateEmployeeProfile/:id', updateEmployeeProfile);

export default router;