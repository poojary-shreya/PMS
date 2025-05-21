// controller/roadmapController.js
import RoadmapItem from "../model/roadmapmodel.js";
import Issue from "../model/issuemodel.js";
import Project from "../model/projectmodel.js";
import { sequelize } from "../config/db.js";

// Get project roadmap
export const getProjectRoadmap = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Validate project existence
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // Find all roadmap items for this project
    const roadmapItems = await RoadmapItem.findAll({
      where: { project_id: projectId },
      order: [['order', 'ASC']],
      include: [{
        model: Issue,
        as: 'linked_issues',
        attributes: ['id', 'key', 'summary', 'issueType', 'status', 'priority', 'assignee']
      }]
    });
    
    return res.status(200).json({
      status: "success",
      data: roadmapItems
    });
  } catch (error) {
    console.error("Error fetching project roadmap:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch project roadmap"
    });
  }
};

// Get all issues for a project - this is the key function you need for showing issues in the roadmap
export const getProjectIssues = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Validate project existence
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // Find all issues for this project
    const issues = await Issue.findAll({
      where: { project: projectId },
      order: [['created', 'DESC']]
    });
    
    return res.status(200).json({
      status: "success",
      data: issues
    });
  } catch (error) {
    console.error("Error fetching project issues:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch project issues"
    });
  }
};

// Get issues for a specific epic
export const getEpicIssues = async (req, res) => {
  try {
    const { projectId, epicId } = req.params;
    
    // Validate project existence
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // Validate epic existence
    const epic = await RoadmapItem.findOne({
      where: { 
        id: epicId,
        project_id: projectId,
        type: 'epic'
      }
    });
    
    if (!epic) {
      return res.status(404).json({
        status: "error",
        message: "Epic not found in this project"
      });
    }
    
    // Find issues linked to this epic
    // There are two ways issues might be linked to epics:
    // 1. Via the junction table (RoadmapItemIssue)
    // 2. Via the epic_id field in the Issue model directly
    
    // First, get issues from the junction table relationship
    const linkedIssues = await epic.getLinked_issues({
      where: { project: projectId }
    });
    
    // Then, get issues that have this epic as their epic_id
    const directEpicIssues = await Issue.findAll({
      where: { 
        project: projectId,
        epic_id: epicId
      }
    });
    
    // Combine and deduplicate results
    const allIssues = [...linkedIssues];
    
    // Add direct epic issues if they're not already included
    directEpicIssues.forEach(directIssue => {
      if (!allIssues.some(issue => issue.id === directIssue.id)) {
        allIssues.push(directIssue);
      }
    });
    
    return res.status(200).json({
      status: "success",
      data: allIssues
    });
  } catch (error) {
    console.error("Error fetching epic issues:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch epic issues"
    });
  }
};

// Get a specific roadmap item
export const getRoadmapItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const roadmapItem = await RoadmapItem.findByPk(itemId, {
      include: [{
        model: Issue,
        as: 'linked_issues',
        attributes: ['id', 'key', 'summary', 'issueType', 'status', 'priority', 'assignee']
      }]
    });
    
    if (!roadmapItem) {
      return res.status(404).json({
        status: "error",
        message: "Roadmap item not found"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: roadmapItem
    });
  } catch (error) {
    console.error("Error fetching roadmap item:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch roadmap item"
    });
  }
};

// Create a new roadmap item
export const createRoadmapItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { projectId } = req.params;
    const { 
      name, 
      description, 
      type, 
      epic_type, 
      status, 
      priority, 
      start_date, 
      end_date, 
      parent_id 
    } = req.body;
    
    // Validate project existence
    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // If parent_id is provided, validate it exists
    if (parent_id) {
      const parent = await RoadmapItem.findByPk(parent_id);
      if (!parent) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Parent roadmap item not found"
        });
      }
    }
    
    // Get the highest order value to append the new item at the end
    const maxOrderItem = await RoadmapItem.findOne({
      where: { project_id: projectId },
      order: [['order', 'DESC']],
      transaction
    });
    
    const order = maxOrderItem ? maxOrderItem.order + 1 : 0;
    
    // Create the new roadmap item
    const newRoadmapItem = await RoadmapItem.create({
      project_id: projectId,
      parent_id,
      name,
      description,
      type,
      epic_type,
      status,
      priority,
      start_date,
      end_date,
      order
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      status: "success",
      data: newRoadmapItem
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating roadmap item:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create roadmap item"
    });
  }
};

// Update a roadmap item
export const updateRoadmapItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { 
      name, 
      description, 
      type, 
      epic_type, 
      status, 
      priority, 
      start_date, 
      end_date, 
      parent_id 
    } = req.body;
    
    const roadmapItem = await RoadmapItem.findByPk(itemId);
    
    if (!roadmapItem) {
      return res.status(404).json({
        status: "error",
        message: "Roadmap item not found"
      });
    }
    
    // If parent_id is provided and changed, validate it exists
    if (parent_id && parent_id !== roadmapItem.parent_id) {
      const parent = await RoadmapItem.findByPk(parent_id);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "Parent roadmap item not found"
        });
      }
    }
    
    // Update the roadmap item
    await roadmapItem.update({
      name: name || roadmapItem.name,
      description: description !== undefined ? description : roadmapItem.description,
      type: type || roadmapItem.type,
      epic_type: epic_type !== undefined ? epic_type : roadmapItem.epic_type,
      status: status || roadmapItem.status,
      priority: priority || roadmapItem.priority,
      start_date: start_date || roadmapItem.start_date,
      end_date: end_date !== undefined ? end_date : roadmapItem.end_date,
      parent_id: parent_id !== undefined ? parent_id : roadmapItem.parent_id
    });
    
    return res.status(200).json({
      status: "success",
      data: roadmapItem
    });
  } catch (error) {
    console.error("Error updating roadmap item:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update roadmap item"
    });
  }
};

// Delete a roadmap item
export const deleteRoadmapItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    
    const roadmapItem = await RoadmapItem.findByPk(itemId);
    
    if (!roadmapItem) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Roadmap item not found"
      });
    }
    
    // Update children to point to parent of deleted item
    await RoadmapItem.update(
      { parent_id: roadmapItem.parent_id },
      { 
        where: { parent_id: itemId },
        transaction
      }
    );
    
    // Delete the roadmap item
    await roadmapItem.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      status: "success",
      message: "Roadmap item deleted successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting roadmap item:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete roadmap item"
    });
  }
};

// Update roadmap item order
export const updateRoadmapOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { projectId } = req.params;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Items must be an array of roadmap item IDs with order"
      });
    }
    
    // Update the order of each item
    for (const item of items) {
      if (!item.id || item.order === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Each item must have an id and order"
        });
      }
      
      await RoadmapItem.update(
        { order: item.order },
        { 
          where: { 
            id: item.id,
            project_id: projectId
          },
          transaction
        }
      );
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      status: "success",
      message: "Roadmap order updated successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating roadmap order:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update roadmap order"
    });
  }
};

// Link issues to a roadmap item
export const linkIssuesToRoadmapItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { issueIds } = req.body;
    
    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "issueIds must be a non-empty array"
      });
    }
    
    const roadmapItem = await RoadmapItem.findByPk(itemId);
    
    if (!roadmapItem) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Roadmap item not found"
      });
    }
    
    // Verify all issues exist
    const issues = await Issue.findAll({
      where: { id: issueIds }
    });
    
    if (issues.length !== issueIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "One or more issues not found"
      });
    }
    
    // Link issues to roadmap item
    await roadmapItem.addLinked_issues(issues, { transaction });
    
    // If this is an epic, also update the epic_id field in the issues
    if (roadmapItem.type === 'epic') {
      await Issue.update(
        { epic_id: itemId },
        { 
          where: { id: issueIds },
          transaction
        }
      );
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      status: "success",
      message: "Issues linked successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error linking issues:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to link issues"
    });
  }
};

// Unlink issues from a roadmap item
export const unlinkIssuesFromRoadmapItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { issueIds } = req.body;
    
    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "issueIds must be a non-empty array"
      });
    }
    
    const roadmapItem = await RoadmapItem.findByPk(itemId);
    
    if (!roadmapItem) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Roadmap item not found"
      });
    }
    
    // Unlink issues from roadmap item
    await roadmapItem.removeLinked_issues(issueIds, { transaction });
    
    // If this is an epic, also clear the epic_id field in the issues
    if (roadmapItem.type === 'epic') {
      await Issue.update(
        { epic_id: null },
        { 
          where: { 
            id: issueIds,
            epic_id: itemId
          },
          transaction
        }
      );
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      status: "success",
      message: "Issues unlinked successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error unlinking issues:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to unlink issues"
    });
  }
};