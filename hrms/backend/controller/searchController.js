import Employee from '../model/addpersonalmodel.js';
import Financial from '../model/addfinancialmodel.js';
import Roles from '../model/addrolemodel.js';
import { Op } from 'sequelize';


export const searchEmployee = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
 
    const employee = await Employee.findOne({
      where: {
        [Op.or]: [
          { employee_id: query },
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { companyemail: { [Op.iLike]: `%${query}%` } },
          { personalemail: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee found with the provided details"
      });
    }
    
  
    const financialData = await Financial.findOne({ 
      where: { employee_id: employee.employee_id }
    });
    
    const roleData = await Roles.findOne({ 
      where: { employee_id: employee.employee_id }
    });
    
 
    const employeePlain = employee ? employee.get({ plain: true }) : null;
    const financialPlain = financialData ? financialData.get({ plain: true }) : null;
    const rolePlain = roleData ? roleData.get({ plain: true }) : null;
    

    const combinedData = {
      ...employeePlain,
      financialData: financialPlain,
      roleData: rolePlain
    };
    
    res.json({
      success: true,
      data: combinedData
    });
  } catch (error) {
    console.error("Search employee error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching for employee",
      error: error.message
    });
  }
};


export const getReportingHierarchy = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Manager email is required"
      });
    }
    
   
    const manager = await Employee.findOne({ 
      where: { companyemail: email }
    });
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found"
      });
    }
    
  
    const managerRole = await Roles.findOne({ 
      where: { employee_id: manager.employee_id }
    });
    
  
    const directReports = await Roles.findAll({ 
      where: { reportingManager: email }
    });
    
 
    const reports = [];
    for (const report of directReports) {
      const employee = await Employee.findOne({ 
        where: { employee_id: report.employee_id }
      });
      
      if (employee) {
        const employeeRole = await Roles.findOne({
          where: { employee_id: employee.employee_id }
        });
        
      
        const nestedReports = await getNestedReports(employee.companyemail);
        
        reports.push({
          employee_id: employee.employee_id,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.companyemail,
          role: employeeRole ? (employeeRole.designation || employeeRole.roleType || 'Unknown') : 'Unknown',
          department: employeeRole ? employeeRole.department : null,
          reports: nestedReports
        });
      }
    }
    
  
    const hierarchy = {
      employee_id: manager.employee_id,
      name: `${manager.firstName} ${manager.lastName}`,
      email: manager.companyemail,
      role: managerRole ? (managerRole.designation || managerRole.roleType) : 'Unknown',
      department: managerRole ? managerRole.department : null,
      reports: reports
    };
    
    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error("Hierarchy fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reporting hierarchy",
      error: error.message
    });
  }
};


async function getNestedReports(managerEmail) {
  const reports = [];
  

  const directReports = await Role.findAll({ 
    where: { reportingManager: managerEmail }
  });
  
  for (const report of directReports) {
    const employee = await Employee.findOne({ 
      where: { employee_id: report.employee_id }
    });
    
    if (employee) {
      const employeeRole = await Role.findOne({
        where: { employee_id: employee.employee_id }
      });
      
    
      const nestedReports = await getNestedReports(employee.companyemail);
      
      reports.push({
        employee_id: employee.employee_id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.companyemail,
        role: employeeRole ? (employeeRole.designation || employeeRole.roleType || 'Unknown') : 'Unknown',
        department: employeeRole ? employeeRole.department : null,
        reports: nestedReports
      });
    }
  }
  
  return reports;
}


export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }
    
    const employee = await Employee.findOne({ 
      where: { employee_id: id }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    
 
    const financialData = await Financial.findOne({ 
      where: { employee_id: id }
    });
   
    const roleData = await Roles.findOne({ 
      where: { employee_id: id }
    });
    
  
    let managerData = null;
    if (roleData && roleData.reportingManager) {
      const manager = await Employee.findOne({
        where: { companyemail: roleData.reportingManager }
      });
      
      if (manager) {
        const managerRole = await Roles.findOne({
          where: { employee_id: manager.employee_id }
        });
        
        managerData = {
          employee_id: manager.employee_id,
          name: `${manager.firstName} ${manager.lastName}`,
          email: manager.companyemail,
          role: managerRole ? (managerRole.designation || managerRole.roleType) : 'Unknown'
        };
      }
    }
    
    const employeePlain = employee ? employee.get({ plain: true }) : null;
    const financialPlain = financialData ? financialData.get({ plain: true }) : null;
    const rolePlain = roleData ? roleData.get({ plain: true }) : null;
    
 
    const combinedData = {
      ...employeePlain,
      financialData: financialPlain,
      roleData: rolePlain,
      manager: managerData
    };
    
    res.json({
      success: true,
      data: combinedData
    });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee details",
      error: error.message
    });
  }
};


export const getAllEmployees = async (req, res) => {
  try {
 
    const employees = await Employee.findAll({
      include: [{
        model: Roles,
        as: 'roles'
      }]
    });
    
 
    const managerEmailToIdMap = {};
    
   
    const employeeData = await Promise.all(
      employees.map(async (employee) => {
        const emp = employee.get({ plain: true });
        const role = emp.role || {};
        
     
        if (emp.companyemail) {
          managerEmailToIdMap[emp.companyemail] = emp.employee_id;
        }
        
        return {
          employee_id: emp.employee_id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          companyemail: emp.companyemail,
          department: role.department || null,
          designation: role.designation || null,
          roleType: role.roleType || null,
          reportingManager: role.reportingManager || null,
  
          reportingManagerId: null
        };
      })
    );
    

    const employeesWithManagers = employeeData.map(emp => {
      if (emp.reportingManager) {
        emp.reportingManagerId = managerEmailToIdMap[emp.reportingManager] || null;
      }
      return emp;
    });
    

    res.json({
      success: true,
      data: employeesWithManagers
    });
  } catch (error) {
    console.error("Error fetching all employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee list",
      error: error.message
    });
  }
};