import Sprint from '../model/sprintmodel.js';
import Project from '../model/projectmodel.js';
import Issue from '../model/issuemodel.js';

// Create a new sprint
export const createSprint = async (req, res) => {
  try {
    const { name, goal, startDate, endDate, duration, projectKey, status } = req.body;

    // Check if project exists
    const project = await Project.findOne({ where: { key: projectKey } });
    if (!project) {
      return res.status(404).json({ message: `Project with key ${projectKey} not found` });
    }

    // Create sprint
    const newSprint = await Sprint.create({
      name,
      goal,
      startDate,
      endDate,
      duration,
      projectKey,
      status: status || 'FUTURE'
    });

    return res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: newSprint
    });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating sprint',
      error: error.message
    });
  }
};

// Get all sprints for a project
export const getProjectSprints = async (req, res) => {
  try {
    const { projectKey } = req.params;

    // Check if project exists
    const project = await Project.findOne({ where: { key: projectKey } });
    if (!project) {
      return res.status(404).json({ message: `Project with key ${projectKey} not found` });
    }

    // Get all sprints for the project
    const sprints = await Sprint.findAll({
      where: { projectKey },
      order: [['startDate', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: sprints.length,
      data: sprints
    });
  } catch (error) {
    console.error('Error getting project sprints:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting project sprints',
      error: error.message
    });
  }
};

// Get sprint by ID
export const getSprintById = async (req, res) => {
  try {
    const { id } = req.params;

    const sprint = await Sprint.findByPk(id, {
      include: [{
        model: Issue,
        as: 'issues'
      }]
    });

    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    console.error('Error getting sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting sprint',
      error: error.message
    });
  }
};

// Update sprint
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, duration, status } = req.body;

    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${id} not found` });
    }

    // Update sprint
    const updatedSprint = await sprint.update({
      name: name || sprint.name,
      goal: goal || sprint.goal,
      startDate: startDate || sprint.startDate,
      endDate: endDate || sprint.endDate,
      duration: duration || sprint.duration,
      status: status || sprint.status,
      updatedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Sprint updated successfully',
      data: updatedSprint
    });
  } catch (error) {
    console.error('Error updating sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating sprint',
      error: error.message
    });
  }
};

// Delete sprint
export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;

    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${id} not found` });
    }

    // Check if there are any issues associated with this sprint
    const issuesCount = await Issue.count({ where: { sprintId: id } });
    if (issuesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete sprint with ${issuesCount} associated issues. Please remove issues first.`
      });
    }

    // Delete sprint
    await sprint.destroy();

    return res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting sprint',
      error: error.message
    });
  }
};

// Add issue to sprint
export const addIssueToSprint = async (req, res) => {
  try {
    const { sprintId, issueKey } = req.body;

    // Find sprint
    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${sprintId} not found` });
    }

    // Find issue
    const issue = await Issue.findOne({ where: { key: issueKey } });
    if (!issue) {
      return res.status(404).json({ message: `Issue with key ${issueKey} not found` });
    }

    // Add issue to sprint
    await issue.update({ sprintId });

    return res.status(200).json({
      success: true,
      message: `Issue ${issueKey} added to sprint successfully`
    });
  } catch (error) {
    console.error('Error adding issue to sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding issue to sprint',
      error: error.message
    });
  }
};

// Remove issue from sprint
export const removeIssueFromSprint = async (req, res) => {
  try {
    const { issueKey } = req.params;

    // Find issue
    const issue = await Issue.findOne({ where: { key: issueKey } });
    if (!issue) {
      return res.status(404).json({ message: `Issue with key ${issueKey} not found` });
    }

    // Remove issue from sprint
    await issue.update({ sprintId: null });

    return res.status(200).json({
      success: true,
      message: `Issue ${issueKey} removed from sprint successfully`
    });
  } catch (error) {
    console.error('Error removing issue from sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing issue from sprint',
      error: error.message
    });
  }
};

// Change sprint status
export const changeSprintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['FUTURE', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Status must be one of: FUTURE, ACTIVE, COMPLETED' 
      });
    }

    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${id} not found` });
    }

    // Change sprint status
    await sprint.update({ status });

    return res.status(200).json({
      success: true,
      message: `Sprint status changed to ${status} successfully`,
      data: sprint
    });
  } catch (error) {
    console.error('Error changing sprint status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing sprint status',
      error: error.message
    });
  }
};

// Get all issues in a sprint
export const getSprintIssues = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sprint exists
    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: `Sprint with ID ${id} not found` });
    }

    // Get all issues for the sprint
    const issues = await Issue.findAll({
      where: { sprintId: id },
      order: [['order', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error getting sprint issues:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting sprint issues',
      error: error.message
    });
  }
};