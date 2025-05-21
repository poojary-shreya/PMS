import Employee from '../model/addpersonalmodel.js';
import Financial from '../model/addfinancialmodel.js';
import Role from '../model/addrolemodel.js';

// Get employee profile by ID - with authentication
export const getEmployeeProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const requestedEmployeeId = req.params.id;
    const loggedInEmployeeId = req.session.employee_id;
    
    // Only allow access to own profile unless admin
    if (requestedEmployeeId !== loggedInEmployeeId && !req.session.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile'
      });
    }
    
    // Validate input
    if (!requestedEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }
    
    const employee = await Employee.findOne({ where: { employee_id: requestedEmployeeId }});
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: employee
    });
    
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get employee profile by email - with authentication
export const getEmployeeProfileByEmail = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }
    
    const requestedEmail = req.params.email;
    const loggedInEmail = req.session.email;
    
    // Only allow looking up own email unless admin
    if (requestedEmail !== loggedInEmail && !req.session.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile'
      });
    }
    
    // Validate input
    if (!requestedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Try to find by company email first
    let employee = await Employee.findOne({ where: { companyemail: requestedEmail }});
    
    // If not found, try personal email
    if (!employee) {
      employee = await Employee.findOne({ where: { personalemail: requestedEmail }});
    }
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with this email'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: employee
    });
    
  } catch (error) {
    console.error('Error fetching employee profile by email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get financial details - with authentication
export const getFinancialDetails = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const requestedEmployeeId = req.params.id;
    const loggedInEmployeeId = req.session.employee_id;
    
    // Only allow access to own financial details unless admin
    if (requestedEmployeeId !== loggedInEmployeeId && !req.session.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own financial details'
      });
    }
    
    // Validate input
    if (!requestedEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }
    
    const financialDetails = await Financial.findOne({ where: { employee_id: requestedEmployeeId }});
    
    if (!financialDetails) {
      return res.status(404).json({
        success: false,
        message: 'Financial details not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: financialDetails
    });
    
  } catch (error) {
    console.error('Error fetching financial details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial details',
      error: error.message
    });
  }
};

// Get role details - with authentication
export const getRoleDetails = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const requestedEmployeeId = req.params.id;
    const loggedInEmployeeId = req.session.employee_id;
    
    // Only allow access to own role details unless admin
    if (requestedEmployeeId !== loggedInEmployeeId && !req.session.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own role details'
      });
    }
    
    // Validate input
    if (!requestedEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }
    
    const roleDetails = await Role.findOne({ where: { employee_id: requestedEmployeeId }});
    
    if (!roleDetails) {
      return res.status(404).json({
        success: false,
        message: 'Role details not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: roleDetails
    });
    
  } catch (error) {
    console.error('Error fetching role details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch role details',
      error: error.message
    });
  }
};

// Update employee profile - with authentication
export const updateEmployeeProfile = async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.employee_id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No employee session found'
        });
      }
      
      const requestedEmployeeId = req.params.id;
      const loggedInEmployeeId = req.session.employee_id;
      
      // Only allow updating own profile unless admin
      if (requestedEmployeeId !== loggedInEmployeeId && !req.session.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only update your own profile'
        });
      }
      
      // Validate input
      if (!requestedEmployeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }
      
      // Extract only the fields that employees are allowed to update
      const {
        personalemail,
        anniversary,
        phoneNumber,
        houseNumber,
        street,
        crossStreet,
        area,
        city,
        pinCode,
        mobile,
        landline,
        panNumber,       // Add PAN number
        adharCardNumber  // Add Aadhar card number
      } = req.body;
      
      // Check if employee exists
      const existingEmployee = await Employee.findOne({ where: { employee_id: requestedEmployeeId }});
      
      if (!existingEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Create update object with only provided fields
      const updateFields = {};
      
      // Only add fields that are not undefined
      if (personalemail !== undefined) updateFields.personalemail = personalemail;
      if (anniversary !== undefined) updateFields.anniversary = anniversary;
      if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
      if (houseNumber !== undefined) updateFields.houseNumber = houseNumber;
      if (street !== undefined) updateFields.street = street;
      if (crossStreet !== undefined) updateFields.crossStreet = crossStreet;
      if (area !== undefined) updateFields.area = area;
      if (city !== undefined) updateFields.city = city;
      if (pinCode !== undefined) updateFields.pinCode = pinCode;
      if (mobile !== undefined) updateFields.mobile = mobile;
      if (landline !== undefined) updateFields.landline = landline;
      if (panNumber !== undefined) updateFields.panNumber = panNumber;             // Add PAN number
      if (adharCardNumber !== undefined) updateFields.adharCardNumber = adharCardNumber; // Add Aadhar card number
      
      // Update only if there are fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }
      
      // Use Sequelize's update method instead of MongoDB's findOneAndUpdate
      await Employee.update(updateFields, {
        where: { employee_id: requestedEmployeeId }
      });
      
      // Fetch the updated employee data to return
      const updatedEmployee = await Employee.findOne({
        where: { employee_id: requestedEmployeeId }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedEmployee
      });
      
    } catch (error) {
      console.error('Error updating employee profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  };
// New endpoint: Get current user profile
export const getCurrentEmployeeProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const employeeId = req.session.employee_id;
    
    const employee = await Employee.findOne({ where: { employee_id: employeeId }});
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: employee
    });
    
  } catch (error) {
    console.error('Error fetching current employee profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// New endpoint: Get current user financial details
export const getCurrentFinancialDetails = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const employeeId = req.session.employee_id;
    
    const financialDetails = await Financial.findOne({ where: { employee_id: employeeId }});
    
    if (!financialDetails) {
      return res.status(404).json({
        success: false,
        message: 'Financial details not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: financialDetails
    });
    
  } catch (error) {
    console.error('Error fetching current financial details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial details',
      error: error.message
    });
  }
};

// New endpoint: Get current user role details
export const getCurrentRoleDetails = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No employee session found'
      });
    }

    const employeeId = req.session.employee_id;
    
    const roleDetails = await Role.findOne({ where: { employee_id: employeeId }});
    
    if (!roleDetails) {
      return res.status(404).json({
        success: false,
        message: 'Role details not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: roleDetails
    });
    
  } catch (error) {
    console.error('Error fetching current role details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch role details',
      error: error.message
    });
  }
};