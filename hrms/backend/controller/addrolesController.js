import Roles from "../model/addrolemodel.js";
import Employee from "../model/addpersonalmodel.js";
import { sequelize } from "../config/db.js";

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Roles.findAll({
      include: [
        {
          model: Employee,
          as: "employee", 
          attributes: ["firstName", "lastName", "companyemail"]
        }
      ],
      order: [["updatedAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching roles",
      error: error.message
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Roles.findOne({
      where: { employee_id: id },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["firstName", "lastName", "companyemail"]
        }
      ]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found for this employee"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching role",
      error: error.message
    });
  }
};

export const createRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      employee_id,
      fullName,
      email,
      designation,
      joiningDate,
      department,
      roleType,
      reportingManager,
      teamSize,
      selectedResponsibilities,
      additionalResponsibilities,
    } = req.body;


    const employee = await Employee.findByPk(employee_id, { transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Employee not found with the given ID"
      });
    }

   
    const existingRole = await Roles.findOne({
      where: { employee_id },
      transaction
    });

    if (existingRole) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Role already exists for this employee"
      });
    }

 
    const newRole = await Roles.create({
      employee_id,
      fullName,
      email,
      designation,
      joiningDate,
      department,
      roleType,
      reportingManager,
      teamSize,
      selectedResponsibilities,
      additionalResponsibilities,
    }, { transaction });

    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating role",
      error: error.message
    });
  }
};


export const updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      designation,
      joiningDate,
      department,
      roleType,
      reportingManager,
      teamSize,
      selectedResponsibilities,
      additionalResponsibilities,
    } = req.body;

   
    const role = await Roles.findOne({
      where: { employee_id: id },
      transaction
    });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found for this employee"
      });
    }

   
    await role.update({
      fullName,
      email,
      designation,
      joiningDate,
      department,
      roleType,
      reportingManager,
      teamSize,
      selectedResponsibilities,
      additionalResponsibilities,
    }, { transaction });

    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating role",
      error: error.message
    });
  }
};


export const deleteRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
   
    const role = await Roles.findOne({
      where: { employee_id: id },
      transaction
    });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found for this employee"
      });
    }

    await role.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: "Role deleted successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting role",
      error: error.message
    });
  }
};


export const getEmployeeList = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['employee_id', 'firstName', 'lastName', 'companyemail'],
      where: {
        employmentStatus: 'Active'
      },
      order: [['firstName', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      message: "Employee list fetched successfully",
      data: employees
    });
  } catch (error) {
    console.error("Error fetching employee list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching employee list",
      error: error.message
    });
  }
};


export const getEmployeesByRoleType = async (req, res) => {
  try {
    const { roleType } = req.params;
    
    
    const roles = await Roles.findAll({
      where: { roleType },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["employee_id", "firstName", "lastName", "companyemail"]
        }
      ]
    });
    
    
    const employees = roles.map(role => ({
      employee_id: role.employee.employee_id,
      name: `${role.employee.firstName} ${role.employee.lastName}`,
      companyemail: role.employee.companyemail
    }));
    
    return res.status(200).json({
      success: true,
      message: `Employees with role type ${roleType} fetched successfully`,
      data: employees
    });
  } catch (error) {
    console.error("Error fetching employees by role type:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching employees by role type",
      error: error.message
    });
  }
};


export const addManagerRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { email, roleType } = req.body;
    
  
    const responsibilities = {
      "Hiring Manager": ["Interview candidates", "Approve candidates", "Submit hiring requests"],
      "Project Manager": ["Manage project timeline", "Allocate resources", "Report to stakeholders"],
 
    };
    
  
    const employee = await Employee.findOne({
      where: {
        [sequelize.Op.or]: [
          { companyemail: email },
          { personalemail: email }
        ]
      },
      transaction
    });
    
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Employee not found with this email"
      });
    }
    
   
    const existingRole = await Roles.findOne({
      where: {
        employee_id: employee.employee_id,
        roleType
      },
      transaction
    });
    
    if (existingRole) {
      await transaction.rollback();
      return res.json({
        success: true,
        message: "Employee already has this role",
        data: existingRole
      });
    }
    
   
    const newRole = await Roles.create({
      employee_id: employee.employee_id,
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: email,
      roleType: roleType,
      selectedResponsibilities: responsibilities[roleType] || []
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      message: "Role added successfully",
      data: newRole
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding role",
      error: error.message
    });
  }
};


export const removeManagerRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { email } = req.params;
    
    const employee = await Employee.findOne({
      where: {
        [sequelize.Op.or]: [
          { companyemail: email },
          { personalemail: email }
        ]
      },
      transaction
    });
    
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Employee not found with this email"
      });
    }
    

    const role = await Roles.findOne({
      where: {
        employee_id: employee.employee_id,
        roleType: "Hiring Manager"
      },
      transaction
    });
    
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
    
    await role.destroy({ transaction });
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: "Role removed successfully"
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error removing role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing role",
      error: error.message
    });
  }
};