// controllers/kanbanController.js
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

// Import models
import Board from '../model/boardmodel.js';
import Column from '../model/columnmodel.js';
import Issue from '../model/issuemodel.js';
import Project from '../model/projectmodel.js';

export const getAllBoards = async (req, res) => {
    try {
      // Get all boards with column and issue counts
      const boards = await Board.findAll({
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM columns
                WHERE columns."boardId" = "Board"."id"
              )`),
              'columnCount'
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM issues
                INNER JOIN columns ON issues."columnId" = columns."id"
                WHERE columns."boardId" = "Board"."id"
              )`),
              'issueCount'
            ]
          ]
        },
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json(boards);
    } catch (error) {
      console.error('Error fetching boards:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  export const getBoardById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const board = await Board.findByPk(id, {
        include: [
          {
            model: Column,
            as: 'columns',
            include: [
              {
                model: Issue,
                as: 'issues',
                attributes: [
                  'id', 'key', 'summary', 'description', 'priority', 
                  'assignee', 'reporter', 'status', 'dueDate', 'order'
                ],
                order: [['order', 'ASC']]
              }
            ],
            order: [['order', 'ASC']]
          }
        ]
      });
      
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
      
      res.status(200).json(board);
    } catch (error) {
      console.error('Error fetching board:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Rest of the controller code remains the same...
  // (All other functions remain unchanged)
  
  export const createBoard = async (req, res) => {
    try {
      const { title, columns, projectId } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: 'Board title is required' });
      }
      
      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ message: 'At least one column is required' });
      }
      
      // Use transaction to ensure data consistency
      const result = await sequelize.transaction(async (transaction) => {
        // Create board
        const board = await Board.create({
          title,
          projectId: projectId || null
        }, { transaction });
        
        // Create columns with order
        const columnPromises = columns.map((column, index) => {
          return Column.create({
            title: column.title,
            boardId: board.id,
            order: index,
            statusId: column.statusId || null // Map to your existing status IDs if provided
          }, { transaction });
        });
        
        const createdColumns = await Promise.all(columnPromises);
        
        return {
          ...board.toJSON(),
          columns: createdColumns,
          columnCount: createdColumns.length,
          issueCount: 0
        };
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating board:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const board = await Board.findByPk(id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    await board.update({ title });
    
    res.status(200).json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const board = await Board.findByPk(id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Use transaction to ensure all related data is deleted
    await sequelize.transaction(async (transaction) => {
      // Get all columns for this board
      const columns = await Column.findAll({
        where: { boardId: id },
        transaction
      });
      
      // Don't delete issues, just remove their column association
      if (columns.length > 0) {
        const columnIds = columns.map(col => col.id);
        await Issue.update(
          { columnId: null },
          { 
            where: { columnId: { [Op.in]: columnIds } },
            transaction
          }
        );
      }
      
      // Delete columns
      await Column.destroy({
        where: { boardId: id },
        transaction
      });
      
      // Delete board
      await board.destroy({ transaction });
    });
    
    res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Column operations
export const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, statusId } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Column title is required' });
    }
    
    // Check if board exists
    const board = await Board.findByPk(boardId);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Get current highest order
    const maxOrderColumn = await Column.findOne({
      where: { boardId },
      order: [['order', 'DESC']]
    });
    
    const newOrder = maxOrderColumn ? maxOrderColumn.order + 1 : 0;
    
    // Create column
    const column = await Column.create({
      title,
      boardId,
      order: newOrder,
      statusId: statusId || null
    });
    
    res.status(201).json({
      ...column.toJSON(),
      issues: []
    });
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, statusId } = req.body;
    
    const column = await Column.findByPk(id);
    
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    await column.update({ 
      title: title || column.title,
      statusId: statusId !== undefined ? statusId : column.statusId
    });
    
    res.status(200).json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    
    const column = await Column.findByPk(id);
    
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    // Use transaction to ensure all related data is deleted
    await sequelize.transaction(async (transaction) => {
      // Don't delete issues, just remove their column association
      await Issue.update(
        { columnId: null },
        { 
          where: { columnId: id },
          transaction
        }
      );
      
      // Delete column
      await column.destroy({ transaction });
      
      // Reorder remaining columns
      const remainingColumns = await Column.findAll({
        where: { 
          boardId: column.boardId,
          order: { [Op.gt]: column.order }
        },
        order: [['order', 'ASC']],
        transaction
      });
      
      // Update order for each remaining column
      const updatePromises = remainingColumns.map((col, idx) => {
        return col.update({
          order: column.order + idx
        }, { transaction });
      });
      
      await Promise.all(updatePromises);
    });
    
    res.status(200).json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const reorderColumns = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columnOrder } = req.body;
    
    if (!columnOrder || !Array.isArray(columnOrder)) {
      return res.status(400).json({ message: 'Column order array is required' });
    }
    
    // Use transaction to ensure all updates are atomic
    await sequelize.transaction(async (transaction) => {
      const updatePromises = columnOrder.map((columnId, index) => {
        return Column.update(
          { order: index },
          { 
            where: { 
              id: columnId,
              boardId // Ensure column belongs to the board
            },
            transaction
          }
        );
      });
      
      await Promise.all(updatePromises);
    });
    
    // Get updated columns
    const columns = await Column.findAll({
      where: { boardId },
      order: [['order', 'ASC']]
    });
    
    res.status(200).json(columns);
  } catch (error) {
    console.error('Error reordering columns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Issue operations for Kanban integration
export const addIssueToColumn = async (req, res) => {
  try {
    const { boardId, columnId } = req.params;
    const { issueId } = req.body;
    
    if (!issueId) {
      return res.status(400).json({ message: 'Issue ID is required' });
    }
    
    // Check if column exists and belongs to the board
    const column = await Column.findOne({
      where: { id: columnId, boardId }
    });
    
    if (!column) {
      return res.status(404).json({ message: 'Column not found or does not belong to the board' });
    }
    
    // Check if issue exists
    const issue = await Issue.findByPk(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Get current highest order
    const maxOrderIssue = await Issue.findOne({
      where: { columnId },
      order: [['order', 'DESC']]
    });
    
    const newOrder = maxOrderIssue ? maxOrderIssue.order + 1 : 0;
    
    // Update issue to associate with column
    await issue.update({
      columnId,
      order: newOrder,
      // If column has statusId, update issue status to match
      status: column.statusId || issue.status
    });
    
    // Get updated issue with details
    const updatedIssue = await Issue.findByPk(issueId);
    
    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error adding issue to column:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const moveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceColumnId, targetColumnId, boardId } = req.body;
    
    // Validate inputs
    if (!sourceColumnId || !targetColumnId || !boardId) {
      return res.status(400).json({ 
        message: 'Source column ID, target column ID, and board ID are required' 
      });
    }
    
    // Check if issue exists
    const issue = await Issue.findByPk(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Check if source and target columns exist and belong to the same board
    const sourceColumn = await Column.findOne({
      where: { id: sourceColumnId, boardId }
    });
    
    const targetColumn = await Column.findOne({
      where: { id: targetColumnId, boardId }
    });
    
    if (!sourceColumn || !targetColumn) {
      return res.status(404).json({ 
        message: 'Source or target column not found or does not belong to the board' 
      });
    }
    
    // Use transaction to ensure data consistency
    await sequelize.transaction(async (transaction) => {
      // Get the highest order in the target column
      const maxOrderIssue = await Issue.findOne({
        where: { columnId: targetColumnId },
        order: [['order', 'DESC']],
        transaction
      });
      
      const newOrder = maxOrderIssue ? maxOrderIssue.order + 1 : 0;
      
      // Update the issue
      await issue.update({
        columnId: targetColumnId,
        order: newOrder,
        // If target column has statusId, update issue status to match
        status: targetColumn.statusId || issue.status
      }, { transaction });
      
      // Reorder issues in the source column
      const sourceIssues = await Issue.findAll({
        where: { 
          columnId: sourceColumnId,
          order: { [Op.gt]: issue.order }
        },
        order: [['order', 'ASC']],
        transaction
      });
      
      // Update order for each issue in source column
      const sourceUpdatePromises = sourceIssues.map((iss, idx) => {
        return iss.update({
          order: issue.order + idx
        }, { transaction });
      });
      
      await Promise.all(sourceUpdatePromises);
    });
    
    // Get updated issue
    const updatedIssue = await Issue.findByPk(id);
    
    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error moving issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const reorderIssues = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { issueOrder } = req.body;
    
    if (!issueOrder || !Array.isArray(issueOrder)) {
      return res.status(400).json({ message: 'Issue order array is required' });
    }
    
    // Use transaction to ensure all updates are atomic
    await sequelize.transaction(async (transaction) => {
      const updatePromises = issueOrder.map((issueId, index) => {
        return Issue.update(
          { order: index },
          { 
            where: { 
              id: issueId,
              columnId // Ensure issue belongs to the column
            },
            transaction
          }
        );
      });
      
      await Promise.all(updatePromises);
    });
    
    // Get updated issues
    const issues = await Issue.findAll({
      where: { columnId },
      order: [['order', 'ASC']]
    });
    
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error reordering issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to find or create a board for a specific project
export const getOrCreateProjectBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
    
    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if board already exists for this project
    let board = await Board.findOne({
      where: { projectId }
    });
    
    // If board doesn't exist, create it with default columns
    if (!board) {
      const boardTitle = title || `${project.name} Board`;
      
      // Create board with default columns in a transaction
      const result = await sequelize.transaction(async (transaction) => {
        // Create board
        const newBoard = await Board.create({
          title: boardTitle,
          projectId
        }, { transaction });
        
        // Default columns for software development
        const defaultColumns = [
          { title: 'To Do', statusId: 1 },      // Default "To Do" status
          { title: 'In Progress', statusId: 2 }, // Default "In Progress" status
          { title: 'Code Review', statusId: 3 }, // Default "Code Review" status
          { title: 'Done', statusId: 4 }        // Default "Done" status
        ];
        
        // Create columns with order
        const columnPromises = defaultColumns.map((column, index) => {
          return Column.create({
            title: column.title,
            boardId: newBoard.id,
            order: index,
            statusId: column.statusId
          }, { transaction });
        });
        
        const createdColumns = await Promise.all(columnPromises);
        
        return {
          ...newBoard.toJSON(),
          columns: createdColumns
        };
      });
      
      board = result;
    } else {
      // Get board with columns and issues
      board = await Board.findByPk(board.id, {
        include: [
          {
            model: Column,
            as: 'columns',
            include: [
              {
                model: Issue,
                as: 'issues',
                where: { project: projectId },
                required: false,
                order: [['order', 'ASC']]
              }
            ],
            order: [['order', 'ASC']]
          }
        ]
      });
    }
    
    res.status(200).json(board);
  } catch (error) {
    console.error('Error getting or creating project board:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};