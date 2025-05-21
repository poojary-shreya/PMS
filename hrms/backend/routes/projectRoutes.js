import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByTemplate,
  addMemberToProject,
  removeMemberFromProject,getProjectDetails,createProjectType
} from "../controller/projectController.js";

const router = express.Router();

// Project CRUD routes
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.post("/type", createProjectType);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get('/projectname/:id',getProjectDetails);

// Get projects by template
router.get("/template/:template", getProjectsByTemplate);

// Project team management routes
router.post("/:projectId/members", addMemberToProject);
router.delete("/:projectId/members/:employeeId", removeMemberFromProject);

export default router;