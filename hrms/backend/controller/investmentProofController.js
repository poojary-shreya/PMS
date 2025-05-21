import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import InvestmentProof from '../model/InvestmentProofModel.js';
import InvestmentDeclaration from '../model/investmentDecModel.js'; 
import Employee from '../model/addpersonalmodel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom upload directory for investment proofs
const createInvestmentProofDir = () => {
  const uploadDir = path.join(__dirname, "../uploads/investment-proofs");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};


export const submitInvestmentProof = async (req, res) => {
    try {
      // Ensure upload directory exists
      createInvestmentProofDir();
      
      const { employee_id, financial_year, category, comment, status } = req.body;
      const file = req.file;
      
      if (!employee_id || !financial_year || !category || !file) {
        // Delete uploaded file if request is invalid
        if (file && file.path) {
          fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
          success: false,
          message: 'Employee ID, Financial Year, Category, and Proof File are required'
        });
      }
  
      // Check if employee exists
      const employee = await Employee.findOne({ where: { employee_id } });
      
      if (!employee) {
        // Delete uploaded file if employee doesn't exist
        if (file && file.path) {
          fs.unlinkSync(file.path);
        }
        
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
  
      // Move file to investment-proofs directory
      const investmentProofDir = path.join(__dirname, "../uploads/investment-proofs");
      const newFilePath = path.join(investmentProofDir, file.filename);
      
      if (file.path !== newFilePath) {
        fs.renameSync(file.path, newFilePath);
      }
  
      // Create new investment proof record
      const investmentProof = await InvestmentProof.create({
        employee_id,
        financial_year,
        category,
        proof_file_path: file.filename,
        original_filename: file.originalname,
        comment: comment || null,
        status: status || 'Pending',
        submitted_at: new Date()
      });
  
      return res.status(201).json({
        success: true,
        message: 'Investment proof submitted successfully',
        data: {
          id: investmentProof.id,
          employee_id: investmentProof.employee_id,
          financial_year: investmentProof.financial_year,
          category: investmentProof.category,
          original_filename: investmentProof.original_filename,
          status: investmentProof.status,
          submitted_at: investmentProof.submitted_at
        }
      });
    } catch (error) {
      console.error('Error submitting investment proof:', error);
      
      // Delete uploaded file if an error occurs
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };






// Reuse the existing investment proof directory function


export const submitHRAProof = async (req, res) => {
  try {
    // Ensure upload directory exists - using the same directory as investment proofs
    createInvestmentProofDir();
    
    const { 
      employee_id, 
      financial_year, 
      hra_calculation_id, 
      comment, 
      status 
    } = req.body;
    
    const file = req.file;
    
    if (!employee_id || !financial_year || !hra_calculation_id || !file) {
      // Delete uploaded file if request is invalid
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Financial Year, HRA Calculation ID, and Proof File are required'
      });
    }
    
    // Check if employee exists
    const employee = await Employee.findOne({ where: { employee_id } });
    
    if (!employee) {
      // Delete uploaded file if employee doesn't exist
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if HRA calculation exists
    const hraCalculation = await HRACalculation.findOne({ 
      where: { 
        id: hra_calculation_id,
        employee_id,
        financial_year
      } 
    });
    
    if (!hraCalculation) {
      // Delete uploaded file if HRA calculation doesn't exist
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      
      return res.status(404).json({
        success: false,
        message: 'HRA Calculation not found for this employee and financial year'
      });
    }
    
    // Move file to investment-proofs directory (same as other investment proofs)
    const investmentProofDir = path.join(__dirname, "../uploads/investment-proofs");
    const newFilePath = path.join(investmentProofDir, file.filename);
    
    if (file.path !== newFilePath) {
      fs.renameSync(file.path, newFilePath);
    }
    
    // Create investment proof record with HRA as the category
    const investmentProof = await InvestmentProof.create({
      employee_id,
      financial_year,
      category: 'HRA',  // Using HRA as the category
      reference_id: hra_calculation_id, // Store the HRA calculation ID as reference
      proof_file_path: file.filename,
      original_filename: file.originalname,
      comment: comment || null,
      status: status || 'Pending',
      submitted_at: new Date()
    });
    
    // Update the HRA calculation to mark that proof was submitted
    await hraCalculation.update({
      proof_submitted: true,
      proof_id: investmentProof.id
    });
    
    return res.status(201).json({
      success: true,
      message: 'HRA proof submitted successfully',
      data: {
        id: investmentProof.id,
        hra_calculation_id: hra_calculation_id,
        employee_id: investmentProof.employee_id,
        financial_year: investmentProof.financial_year,
        category: investmentProof.category,
        original_filename: investmentProof.original_filename,
        status: investmentProof.status,
        submitted_at: investmentProof.submitted_at
      }
    });
  } catch (error) {
    console.error('Error submitting HRA proof:', error);
    
    // Delete uploaded file if an error occurs
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to get HRA proofs for a specific employee and financial year
export const getHRAProofs = async (req, res) => {
  try {
    const { employee_id, financial_year } = req.params;
    
    if (!employee_id || !financial_year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Financial Year are required'
      });
    }
    
    // Find HRA proofs via investment proofs with category = 'HRA'
    const hraProofs = await InvestmentProof.findAll({
      where: {
        employee_id,
        financial_year,
        category: 'HRA'
      },
      order: [['submitted_at', 'DESC']]
    });
    
    // Get related HRA calculation details
    const hraCalculations = await HRACalculation.findAll({
      where: {
        employee_id,
        financial_year
      },
      attributes: ['id', 'start_date', 'end_date', 'rent_amount', 'hra_address', 
                  'city', 'landlord_name', 'landlord_pan', 'claimed_hra', 'taxable_hra']
    });
    
    return res.status(200).json({
      success: true,
      data: {
        proofs: hraProofs,
        calculations: hraCalculations
      }
    });
  } catch (error) {
    console.error('Error fetching HRA proofs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



  export const getInvestmentDeclaration = async (req, res) => {
    try {
      const { employee_id, financial_year } = req.query;
      
      if (!employee_id || !financial_year) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID and Financial Year are required'
        });
      }
      
      // Check if employee exists
      const employee = await Employee.findOne({ 
        where: { employee_id } 
      });
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Fetch investment declaration
      const declaration = await InvestmentProof.findAll({
        where: {
          employee_id,
          financial_year
        }
      });
      
      if (!declaration) {
        return res.status(404).json({
          success: false,
          message: 'No investment declaration found for this employee and financial year'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Investment declaration retrieved successfully',
        data: declaration
      });
      
    } catch (error) {
      console.error('Error fetching investment declaration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
