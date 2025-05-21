// routes/roadmapRoutes.js
import express from "express";
import {
  getProjectRoadmap,
  getProjectIssues,
  getRoadmapItem,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  updateRoadmapOrder,
  linkIssuesToRoadmapItem,
  unlinkIssuesFromRoadmapItem,
  getEpicIssues // Add this new controller function
} from "../controller/roadmapController.js";

const router = express.Router();

// Project roadmap routes
router.get("/project/:projectId/roadmap", getProjectRoadmap);
router.post("/project/:projectId/roadmap", createRoadmapItem);
router.put("/project/:projectId/roadmap/order", updateRoadmapOrder);
router.get("/project/:projectId/issues", getProjectIssues);


router.get("/project/:projectId/issues", getEpicIssues);
// Roadmap item routes
router.get("/roadmap-items/:itemId", getRoadmapItem);
router.put("/roadmap-items/:itemId", updateRoadmapItem);
router.delete("/roadmap-items/:itemId", deleteRoadmapItem);

// Issue linking routes
router.post("/roadmap-items/:itemId/link-issues", linkIssuesToRoadmapItem);
router.post("/roadmap-items/:itemId/unlink-issues", unlinkIssuesFromRoadmapItem);

export default router;