// routes/kanbanRoutes.js
import express from 'express';
import * as boardController from '../controller/boardController.js';

const router = express.Router();

// Board routes
router.get('/boards', boardController.getAllBoards);
router.post('/boards', boardController.createBoard);
router.get('/boards/:id', boardController.getBoardById);
router.put('/boards/:id', boardController.updateBoard);
router.delete('/boards/:id', boardController.deleteBoard);

// Project-specific board routes
router.get('/projects/:projectId/board', boardController.getOrCreateProjectBoard);

// Column routes
router.post('/boards/:boardId/columns', boardController.createColumn);
router.put('/columns/:id', boardController.updateColumn);
router.delete('/columns/:id', boardController.deleteColumn);
router.put('/boards/:boardId/columns/reorder', boardController.reorderColumns);

// Issue-related routes for board
router.post('/boards/:boardId/columns/:columnId/issues', boardController.addIssueToColumn);
router.put('/issues/:id/move', boardController.moveIssue);
router.put('/columns/:columnId/issues/reorder', boardController.reorderIssues);

export default router;