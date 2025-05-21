import Contractor from "../model/ContractModel.js";

const generateEmployeeId = async () => {
  let isUnique = false;
  let generatedId;
  
  while (!isUnique) {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentDate = new Date().toISOString().slice(5, 10).replace("-", "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    generatedId = `C${currentYear}${currentDate}${randomNum}`;
    
    const existing = await Contractor.findOne({ where: { c_employee_id: generatedId } });
    if (!existing) isUnique = true;
  }
  
  return generatedId;
};

const generateCompanyEmail = async (fullName) => {
  if (!fullName) return null;
  
  // Create base email from full name
  const nameParts = fullName.trim().toLowerCase().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  
  let companyEmail = `${firstName}.${lastName}@bridgemetechnologies.com`;
  
  // Check if email already exists
  let existing = await Contractor.findOne({ where: { companyEmail } });
  
  // If email exists, add a random number
  if (existing) {
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    companyEmail = `${firstName}.${lastName}${uniqueNum}@bridgemetechnologies.com`;
  }
  
  return companyEmail;
};

export const createContractor = async (req, res) => {
  try {
    // Generate employee ID and company email
    const c_employee_id = await generateEmployeeId();
    const companyEmail = await generateCompanyEmail(req.body.fullName);
    
    // Parse form data
    const formData = { ...req.body };
    
    // Convert projectBudget to a number
    if (formData.projectBudget) {
      formData.projectBudget = parseFloat(formData.projectBudget);
    }
    
    // Handle file uploads
    const fileData = {};
    if (req.files) {
      if (req.files.aadharCard && req.files.aadharCard.length > 0) {
        fileData.aadharCardFile = req.files.aadharCard[0].filename;
      }
      
      if (req.files.panCard && req.files.panCard.length > 0) {
        fileData.panCardFile = req.files.panCard[0].filename;
      }
    }
    
    // Create contractor record
    const contractor = await Contractor.create({
      ...formData,
      ...fileData,
      c_employee_id,
      companyEmail
    });
    
    res.status(201).json({
      success: true,
      message: 'Contractor created successfully',
      data: contractor
    });
  } catch (error) {
    console.error('Create Contractor Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create contractor'
    });
  }
};

// Get all contractors
export const getAllContractors = async (req, res) => {
  try {
    const contractors = await Contractor.findAll();
    res.status(200).json({
      success: true,
      count: contractors.length,
      data: contractors
    });
  } catch (error) {
    console.error('Get All Contractors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contractors'
    });
  }
};

// Get contractor by ID
export const getContractorById = async (req, res) => {
  try {
    const { c_employee_id } = req.params;
    const contractor = await Contractor.findByPk(c_employee_id);
    
    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contractor
    });
  } catch (error) {
    console.error('Get Contractor Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contractor'
    });
  }
};

export const updateContractor = async (req, res) => {
  try {
    const { c_employee_id } = req.params;
    const contractor = await Contractor.findByPk(c_employee_id);
    
    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found'
      });
    }
    
    // Parse form data
    const formData = { ...req.body };
    
    // Handle file uploads
    const fileData = {};
    if (req.files) {
      if (req.files.aadharCard && req.files.aadharCard.length > 0) {
        fileData.aadharCardFile = req.files.aadharCard[0].filename;
      }
      
      if (req.files.panCard && req.files.panCard.length > 0) {
        fileData.panCardFile = req.files.panCard[0].filename;
      }
    }
    
    // Update record
    await contractor.update({
      ...formData,
      ...fileData
    });
    
    res.status(200).json({
      success: true,
      message: 'Contractor updated successfully',
      data: contractor
    });
  } catch (error) {
    console.error('Update Contractor Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update contractor'
    });
  }
};