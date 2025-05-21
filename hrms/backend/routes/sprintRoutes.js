import express from 'express';
import {
  createSprint,
  getProjectSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  addIssueToSprint,
  removeIssueFromSprint,
  changeSprintStatus,
  getSprintIssues
} from '../controller/sprintController.js';

const router = express.Router();

// Create a new sprint
router.post('/', createSprint);

// Get all sprints for a project
router.get('/project/:projectKey', getProjectSprints);

// Get sprint by ID
router.get('/:id', getSprintById);

// Update sprint
router.put('/:id', updateSprint);

// Delete sprint
router.delete('/:id', deleteSprint);

// Add issue to sprint
router.post('/add-issue', addIssueToSprint);

// Remove issue from sprint
router.delete('/remove-issue/:issueKey', removeIssueFromSprint);

// Change sprint status
router.patch('/:id/status', changeSprintStatus);

// Get all issues in a sprint
router.get('/:id/issues', getSprintIssues);

export default router;