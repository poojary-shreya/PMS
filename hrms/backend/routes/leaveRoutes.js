import express from "express";
import {   
  applyLeave,   
  getLeaveHistory,   
  getLeaveBalance,   
  updateLeaveStatus,   
  getPendingLeavesByManager,
  getEmployeeManager 
} from "../controller/leaveController.js";  

const router = express.Router();   

// Leave balance and history
router.get("/balance", getLeaveBalance); 
router.get("/history", getLeaveHistory);  

// Apply for leave
router.post("/apply", applyLeave);   

// Manager routes
router.get("/pending/:manager_id", getPendingLeavesByManager); 
router.put("/update/:id", updateLeaveStatus);

// Get manager information for an employee
router.get("/manager/:employeeId?", getEmployeeManager);

export default router;