import express from "express"
import { createAssignTeam, fetchAllTeams, fetchTeamMembers, getActiveProjects, getAllEmployees, getEmployeeAllocations, getEmployeeAvailableAllocation, getProjectsWithTeams, getProjectTeamMembers, removeTeamMember,  } from "../controller/assignTeamController.js"
const router =express.Router()
router.post("/",createAssignTeam);
router.get("/employees",getAllEmployees)
router.get("/project/active",getActiveProjects)
// router.get('/project/:projectId/team', getTeamMembersByProject);
router.get('/team/projects-with-teams', getProjectsWithTeams);
router.get('/members/teams', fetchAllTeams);
router.get("/teams/:teamId/members", fetchTeamMembers);
router.delete("/team-members/:teamMemberId", removeTeamMember);
router.get('/project/:projectId', getProjectTeamMembers);
router.get('/employees/available-allocation', getEmployeeAvailableAllocation);
router.get('/employees/allocations',getEmployeeAllocations);
export default router