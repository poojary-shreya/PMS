import Issue from '../model/issuemodel.js';
import { Op } from 'sequelize';
import Project from '../model/projectmodel.js';
import { sequelize } from '../config/db.js';
import Employee from '../model/addpersonalmodel.js'

// Create a new issue
export const createIssue = async (req, res) => {
  try {
    const {
      project_id, 
      issueType,
      summary,
      description,
      assignee,
      // Don't use productOwner from request body - we'll fetch it from the project
      priority,
      severity,
      status,
      labels,
      startDate,  // Changed from dueDate to startDate
      endDate,    // Added endDate
      timeEstimate
    } = req.body;

    // Validate required fields
    if (!project_id || !issueType || !summary) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['project_id', 'issueType', 'summary']
      });
    }

    // Check if project exists and fetch the product owner at the same time
    const projectExists = await Project.findByPk(project_id);
    if (!projectExists) {
      return res.status(400).json({ message: 'Invalid project selected' });
    }

    // Automatically get the product owner from the project's lead_id
    const productOwner = projectExists.lead_id;

    // Generate the issue key (e.g., PROJECT-123)
    const projectPrefix = projectExists.key;
    const lastIssue = await Issue.findOne({
      where: { project: project_id },
      order: [['id', 'DESC']]
    });
    const issueNumber = lastIssue ? parseInt(lastIssue.key.split('-')[1]) + 1 : 1;
    const key = `${projectPrefix}-${issueNumber}`;

    // Format labels to ensure it's an array
    const formattedLabels = Array.isArray(labels) ? labels : 
                           (labels ? [labels] : []);

    // Create the issue with the productOwner from project
    const newIssue = await Issue.create({
      key,
      project: project_id, 
      issueType: parseInt(issueType),
      summary,
      description: description || '',
      assignee: assignee || null,
      productOwner: productOwner, // Use the automatically fetched productOwner
      priority: parseInt(priority) || 3,
      severity: parseInt(severity) || 3,
      status: parseInt(status) || 1,
      labels: formattedLabels,
      startDate: startDate || null,  // Updated from dueDate to startDate
      endDate: endDate || null,      // Added endDate field
      timeEstimate: timeEstimate || null,
      created: new Date(),
      updated: new Date()
    });

    res.status(201).json({
      message: 'Issue created successfully',
      data: newIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      message: 'Error creating issue',
      error: error.message
    });
  }
};

// Get all issues with optional filtering
export const getIssues = async (req, res) => {
  try {
    const { 
      project, 
      issueType, 
      status, 
      assignee,
      productOwner,
      priority,
      severity,
      labels,
      startDate,  // Added startDate filter
      endDate     // Added endDate filter
    } = req.query;

    const whereCondition = {};

    if (project) whereCondition.project = project;
    if (issueType) whereCondition.issueType = parseInt(issueType);
    if (status) whereCondition.status = parseInt(status);
    if (assignee) whereCondition.assignee = assignee;
    if (productOwner) whereCondition.productOwner = productOwner;
    if (priority) whereCondition.priority = parseInt(priority);
    if (severity) whereCondition.severity = parseInt(severity);
    
    // Handle date range filtering
    if (startDate || endDate) {
      const dateConditions = {};
      
      if (startDate) {
        dateConditions[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        dateConditions[Op.lte] = new Date(endDate);
      }
      
      whereCondition.startDate = dateConditions;
    }
    
    // Handle labels filtering properly
    if (labels) {
      // If database supports array containment
      if (sequelize.options.dialect === 'postgres') {
        whereCondition.labels = {
          [Op.overlap]: Array.isArray(labels) ? labels : [labels]
        };
      } else {
        // For other databases, use LIKE query (less efficient)
        const labelList = Array.isArray(labels) ? labels : [labels];
        const labelConditions = labelList.map(label => ({
          [Op.like]: `%${label}%`
        }));
        whereCondition.labels = {
          [Op.or]: labelConditions
        };
      }
    }

    const issues = await Issue.findAll({
      where: whereCondition,
      order: [['created', 'DESC']],
      include: [
        {
          model: Project,
          as: 'projectDetails',
          attributes: ['project_id', 'name', 'key', 'lead_id']
        }
      ]
    });

    res.status(200).json({
      message: 'Issues retrieved successfully',
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

// Get a single issue by ID
export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'projectDetails',
          attributes: ['project_id', 'name', 'key', 'lead_id'],
          include: [
            {
              model: Employee,
              as: 'lead',
              attributes: ['employee_id', 'firstName', 'lastName', 'phoneNumber']
            }
          ]
        }
      ]
    });
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Format response with lead information
    const issueData = issue.toJSON();
    if (issueData.projectDetails && issueData.projectDetails.lead) {
      issueData.projectDetails.lead_name = 
        `${issueData.projectDetails.lead.firstName} ${issueData.projectDetails.lead.lastName}`;
    } else {
      issueData.projectDetails.lead_name = 'Not assigned';
    }
    
    res.status(200).json({
      message: 'Issue retrieved successfully',
      data: issueData
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      message: 'Error fetching issue',
      error: error.message
    });
  }
};

// Update an existing issue
export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Format labels to ensure it's an array if present
    let updateData = { ...req.body, updated: new Date() };
    
    if (updateData.labels) {
      updateData.labels = Array.isArray(updateData.labels) ? 
                         updateData.labels : [updateData.labels];
    }
    
    // Convert string number values to integers
    if (updateData.issueType) updateData.issueType = parseInt(updateData.issueType);
    if (updateData.priority) updateData.priority = parseInt(updateData.priority);
    if (updateData.severity) updateData.severity = parseInt(updateData.severity);
    if (updateData.status) updateData.status = parseInt(updateData.status);

    // If project_id changes, update the productOwner automatically
    if (updateData.project) {
      const project = await Project.findByPk(updateData.project);
      if (project) {
        updateData.productOwner = project.lead_id;
      }
    }

    const [updated] = await Issue.update(updateData, {
      where: { id }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const updatedIssue = await Issue.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'projectDetails',
          attributes: ['project_id', 'name', 'key', 'lead_id']
        }
      ]
    });

    res.status(200).json({
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({
      message: 'Error updating issue',
      error: error.message
    });
  }
};

// Delete an issue
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Issue.destroy({
      where: { id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ 
      message: 'Issue deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      message: 'Error deleting issue',
      error: error.message
    });
  }
};

// Get labels for autocomplete
export const getLabels = async (req, res) => {
  try {
    // Get all distinct labels from issues
    const issues = await Issue.findAll({
      attributes: ['labels'],
      where: {
        labels: {
          [Op.ne]: []  // Not empty array
        }
      }
    });
    
    // Extract unique labels
    const labelSet = new Set();
    issues.forEach(issue => {
      if (Array.isArray(issue.labels)) {
        issue.labels.forEach(label => labelSet.add(label));
      }
    });
    
    // Convert to array of objects matching frontend format
    const labels = Array.from(labelSet).map((name, index) => ({
      id: index + 1,
      name,
      color: getRandomColor(name)  // Helper function to assign consistent colors
    }));
    
    res.status(200).json({
      message: 'Labels retrieved successfully',
      data: labels
    });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({
      message: 'Error fetching labels',
      error: error.message
    });
  }
};

// Helper function to generate consistent colors for labels
function getRandomColor(str) {
  // Sample colors from frontend
  const colors = [
    '#0052cc', '#00875a', '#8777d9', '#ff7452', '#ff5630',
    '#00a3bf', '#998dd9', '#4c9aff', '#36b37e'
  ];
  
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get issues by assignee
export const getIssuesByAssignee = async (req, res) => {
  try {
    const { assignee_id } = req.params;

    // Validate if assignee_id is provided
    if (!assignee_id) {
      return res.status(400).json({
        message: 'Missing required parameter',
        required: ['assignee_id']
      });
    }

    // Find all issues assigned to the specified employee
    const issues = await Issue.findAll({
      where: { assignee: assignee_id },
      order: [['updated', 'DESC']]
    });

    // If no issues found for the assignee
    if (issues.length === 0) {
      return res.status(200).json({
        message: 'No issues assigned to this employee',
        data: []
      });
    }

    // Return the issues
    res.status(200).json({
      message: 'Issues retrieved successfully',
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues by assignee:', error);
    res.status(500).json({
      message: 'Error retrieving issues',
      error: error.message
    });
  }
};

// Update issue status
export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, updatedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        message: 'Missing required field: status'
      });
    }
    
    // Find the current issue to get its existing status
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    const oldStatus = issue.status;
    const newStatus = parseInt(status);
    
    // Only proceed if status is actually changing
    if (oldStatus === newStatus) {
      return res.status(200).json({
        message: 'No status change detected',
        data: issue
      });
    }
    
    // Create a status history entry
    const statusUpdate = {
      fromStatus: oldStatus,
      toStatus: newStatus,
      comment: comment || '',
      updatedBy: updatedBy || 'system',
      timestamp: new Date()
    };
    
    // Update issue with new status and add to status history
    // Note: This assumes the Issue model has a JSONB/array field called 'statusHistory'
    const updatedIssue = await Issue.update({
      status: newStatus,
      updated: new Date(),
      statusHistory: issue.statusHistory 
        ? [...issue.statusHistory, statusUpdate]
        : [statusUpdate]
    }, {
      where: { id },
      returning: true // Return the updated instance (for PostgreSQL)
    });
    
    // For MySQL/MariaDB where 'returning' is not supported, fetch the updated issue
    const result = updatedIssue[1] 
      ? updatedIssue[1][0] 
      : await Issue.findByPk(id);
    
    res.status(200).json({
      message: 'Issue status updated successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({
      message: 'Error updating issue status',
      error: error.message
    });
  }
};

// Get issues by date range
export const getIssuesByDateRange = async (req, res) => {
  try {
    const { startAfter, endBefore } = req.query;
    
    const whereCondition = {};
    
    if (startAfter) {
      whereCondition.startDate = {
        [Op.gte]: new Date(startAfter)
      };
    }
    
    if (endBefore) {
      whereCondition.endDate = {
        [Op.lte]: new Date(endBefore)
      };
    }
    
    const issues = await Issue.findAll({
      where: whereCondition,
      order: [['startDate', 'ASC']],
      include: [
        {
          model: Project,
          as: 'projectDetails',
          attributes: ['project_id', 'name', 'key']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Issues retrieved successfully',
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues by date range:', error);
    res.status(500).json({
      message: 'Error retrieving issues',
      error: error.message
    });
  }
};