import express from "express";
import { createTeam, getTeams, getTeamById } from "../controller/createTeamController.js";

const router = express.Router();

// Route to create a new team
router.post("/", createTeam);

// Route to fetch all teams
router.get("/teams", getTeams);

// Route to fetch a specific team by ID
router.get("/teams/:id", getTeamById);

export default router;