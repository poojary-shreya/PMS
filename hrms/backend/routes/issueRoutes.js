// routes/issueroutes.js
import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getLabels,
  getIssuesByAssignee,
  updateIssueStatus,
  getIssuesByDateRange // Added missing controller import
} from '../controller/issuecontroller.js';

const router = express.Router();

// Issue routes
router.post('/', createIssue);
router.get('/', getIssues);
router.get('/labels', getLabels);
router.get('/date-range', getIssuesByDateRange); // Added new route for getting issues by date range
router.get('/:id', getIssueById);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.get('/assignee/:assignee_id', getIssuesByAssignee);
router.patch('/:id/status', updateIssueStatus);

export default router;