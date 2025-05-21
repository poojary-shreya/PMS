import express from "express";
import {
  createGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
  getGoalsByEmployee,
  getAllEmployees
} from "../controller/goalController.js";

const router = express.Router();


router.post("/create", createGoal);
router.get("/", getAllGoals);
router.get("/employee/:employeeId", getGoalsByEmployee);
router.put('/:goalId', updateGoal);
router.delete("/:id", deleteGoal);


router.get("/employees", getAllEmployees);

export default router;