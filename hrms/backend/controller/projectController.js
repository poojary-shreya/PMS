// controller/projectController.js - updated with fix
import Project from "../model/projectmodel.js";
import { sequelize } from "../config/db.js";
import  Employee  from "../model/addpersonalmodel.js";

export const getAllProjects = async (req, res) => {
  try {
    console.log('Getting all projects...');
    const projects = await Project.findAll();
    console.log(`Found ${projects.length} projects`);
    
    return res.status(200).json({
      status: "success",
      data: projects
    });
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return res.status(500).json({ 
      status: "error",
      message: 'Failed to fetch projects', 
      error: error.message 
    });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: {
        model: Employee,
        as: "lead", // Changed from "personal" to "lead" to match association
        attributes: ["employee_id", "firstName", "lastName", "phoneNumber"],
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Format response with lead information
    const projectData = {
      ...project.toJSON(),
      lead_name: project.lead ? `${project.lead.firstName} ${project.lead.lastName}` : 'Not assigned'
    };

    res.status(200).json({
      message: 'Project retrieved successfully',
      data: projectData
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      message: 'Error fetching project',
      error: error.message
    });
  }
};



export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting project by ID: ${id}`);
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      console.log(`Project with ID ${id} not found`);
      return res.status(404).json({ 
        status: "error",
        message: 'Project not found' 
      });
    }
    
    console.log(`Found project: ${project.name}`);
    return res.status(200).json({
      status: "success",
      data: project
    });
  } catch (error) {
    console.error(`Error fetching project by ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: "error",
      message: 'Failed to fetch project', 
      error: error.message 
    });
  }
};

export const createProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("Create project request body:", JSON.stringify(req.body, null, 2));
    
    // Extract data from request based on frontend structure
    const {
      basicInfo = {},
      timeline = {},
      selectedTemplate
    } = req.body;
    
    // Map frontend structure to database structure
    const name = basicInfo.name ? String(basicInfo.name) : null;
    const key = basicInfo.key ? String(basicInfo.key) : null;
    const projectType = basicInfo.projectType ? String(basicInfo.projectType) : null;
    const description = basicInfo.description ? String(basicInfo.description) : null;
    
    // Parse date strings into proper date formats
    const startDate = timeline.startDate ? new Date(timeline.startDate) : null;
    const endDate = timeline.endDate ? new Date(timeline.endDate) : null;
    
    // Convert budget to decimal
    const budget = timeline.budget ? Number(timeline.budget) : null;
    
    // Get template ID directly (handle both object notation and direct value)
    const template = typeof selectedTemplate === 'object' ? 
      (selectedTemplate?.id ? String(selectedTemplate.id) : "kanban") : 
      (selectedTemplate ? String(selectedTemplate) : "kanban");
    
    const status = "Active"; // Default status
    
    // Validate required fields
    if (!name || !key || !projectType || !startDate || !endDate || budget === null || !template) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
        errors: {
          name: !name ? "Project name is required" : undefined,
          key: !key ? "Project key is required" : undefined,
          projectType: !projectType ? "Project type is required" : undefined,
          startDate: !startDate ? "Start date is required" : undefined,
          endDate: !endDate ? "End date is required" : undefined,
          budget: budget === null ? "Budget is required" : undefined,
          template: !template ? "Project template is required" : undefined
        }
      });
    }
    
    // Validate template value
    const validTemplates = ["kanban", "scrum", "business"];
    if (!validTemplates.includes(template)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid template value",
        errors: {
          template: `Template must be one of: ${validTemplates.join(", ")}`
        }
      });
    }
    
    // Format dates to ISO strings (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Create project data object
    const projectData = {
      name,
      key: key.toUpperCase(),
      projectType,
      description,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      budget,
      template,
      status
    };
    
    console.log("Creating project with data:", JSON.stringify(projectData, null, 2));
    
    // Create the project with explicit type conversions
    const newProject = await Project.create(projectData, { transaction });
    
    console.log("Project created successfully:", newProject.project_id);
    
    // Commit transaction
    await transaction.commit();
    
    res.status(201).json({
      status: "success",
      message: "Project created successfully",
      data: newProject
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error("Error creating project:", error);
    
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "error",
        message: "A project with this key already exists",
        errors: {
          key: "This project key is already in use"
        }
      });
    }
    
    if (error.name === "SequelizeValidationError") {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      status: "error",
      message: "Failed to create project",
      error: error.message
    });
  }
};

export const createProjectType = async (req, res) => {
  try {
    const { value, label } = req.body;
    
    if (!value || !label) {
      return res.status(400).json({
        status: "error",
        message: "Project type value and label are required"
      });
    }
    
    // Since we don't have a separate model for project types,
    // we can just return success with the data they provided
    // In a real implementation, you might store this in the database
    
    return res.status(201).json({
      status: "success",
      data: {
        value,
        label,
        is_custom: true
      },
      message: "Project type acknowledged"
    });
  } catch (error) {
    console.error("Error processing project type:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export const updateProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // Extract data from request
    const {
      basicInfo = {},
      timeline = {},
      selectedTemplate = {},
    } = req.body;
    
    // Map frontend structure to database structure with explicit type conversions
    const name = basicInfo.name !== undefined ? String(basicInfo.name) : undefined;
    const key = basicInfo.key !== undefined ? String(basicInfo.key) : undefined;
    const projectType = basicInfo.projectType !== undefined ? String(basicInfo.projectType) : undefined;
    const description = basicInfo.description !== undefined ? String(basicInfo.description) : undefined;
    
    // Parse dates
    const startDate = timeline.startDate ? new Date(timeline.startDate) : undefined;
    const endDate = timeline.endDate ? new Date(timeline.endDate) : undefined;
    
    // Convert numeric fields
    const budget = timeline.budget !== undefined ? Number(timeline.budget) : undefined;
    
    const template = selectedTemplate.id || req.body.template;
    const status = req.body.status;
    
    // Convert completion percentage to number
    const completionPercentage = req.body.completionPercentage !== undefined ? 
      Number(req.body.completionPercentage) : undefined;
    
    const notes = req.body.notes !== undefined ? String(req.body.notes) : undefined;
    
    // Make sure this exactly matches the model's validation
    const validStatuses = ["Active", "Completed", "On Hold", "Cancelled"];
    
    // Validate status if it's being updated
    if (status && !validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid status value",
        errors: {
          status: `Status must be one of: ${validStatuses.join(", ")}`
        }
      });
    }
    
    // Validate template if it's being updated
    const validTemplates = ["kanban", "scrum", "business"];
    if (template && !validTemplates.includes(template)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid template value",
        errors: {
          template: `Template must be one of: ${validTemplates.join(", ")}`
        }
      });
    }
    
    // Format dates to ISO strings (YYYY-MM-DD) if they exist
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (key !== undefined) updateData.key = key.toUpperCase();
    if (projectType !== undefined) updateData.projectType = projectType;
    if (description !== undefined) updateData.description = description;
    if (formattedStartDate !== undefined) updateData.start_date = formattedStartDate;
    if (formattedEndDate !== undefined) updateData.end_date = formattedEndDate;
    if (budget !== undefined) updateData.budget = budget;
    if (template !== undefined) updateData.template = template;
    if (status !== undefined) updateData.status = status;
    if (completionPercentage !== undefined) updateData.completionPercentage = completionPercentage;
    if (notes !== undefined) updateData.notes = notes;
    
    // Update the project
    await project.update(updateData, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Fetch the updated project to return the most current data
    const updatedProject = await Project.findByPk(id);
    
    res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      data: updatedProject
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error("Error updating project:", error);
    
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        status: "error",
        message: "A project with this key already exists",
        errors: {
          key: "This project key is already in use"
        }
      });
    }
    
    if (error.name === "SequelizeValidationError") {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      status: "error",
      message: "Failed to update project",
      error: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await Project.findByPk(id);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Project not found"
      });
    }
    
    // Delete project
    await project.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      status: "success",
      message: "Project deleted successfully"
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error("Error deleting project:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete project",
      error: error.message
    });
  }
};

export const getProjectsByTemplate = async (req, res) => {
  try {
    const { template } = req.params;
    
    // Validate template parameter
    const validTemplates = ["kanban", "scrum", "business"];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid template value",
        errors: {
          template: `Template must be one of: ${validTemplates.join(", ")}`
        }
      });
    }
    
    // Find projects with the specified template
    const projects = await Project.findAll({
      where: { template }
    });
    
    return res.status(200).json({
      status: "success",
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects by template:', error);
    return res.status(500).json({
      status: "error",
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

export const addMemberToProject = async (req, res) => {
  res.status(501).json({
    status: "error",
    message: "This functionality requires ProjectTeam and Employee models to be implemented"
  });
};

export const removeMemberFromProject = async (req, res) => {
  res.status(501).json({
    status: "error",
    message: "This functionality requires ProjectTeam model to be implemented"
  });
};

