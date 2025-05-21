import Employee from "../model/addpersonalmodel.js";
import TaxDeduction from "../model/investmentDecModel.js";


const validateEmployee = async (employee_id) => {
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  };

export const createTaxDeduction = async (req, res) => {
    try {
      const { employee_id, financial_year, ...deductionData } = req.body;
      
      // Validate if employee exists
      await validateEmployee(employee_id);
      
      // Check if a record already exists for this employee and financial year
      const existingRecord = await TaxDeduction.findOne({
        where: { 
          employee_id,
          financial_year
        }
      });
      
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: `Tax deduction record already exists for employee ID ${employee_id} and financial year ${financial_year}. Use update instead.`
        });
      }
      
      // Create new tax deduction record
      const newTaxDeduction = await TaxDeduction.create({
        employee_id,
        financial_year,
        ...deductionData
      });
      
      return res.status(201).json({
        success: true,
        message: 'Tax deduction record created successfully',
        data: newTaxDeduction
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create tax deduction record',
        error: error.message
      });
    }
  };
  

  export const getTaxDeduction = async (req, res) => {
    try {
      const { employee_id, financial_year } = req.query;
  
      // Validate if employee exists
      await validateEmployee(employee_id);
  
      // Find the tax deduction record
      const taxDeductionRecord = await TaxDeduction.findOne({
        where: {
          employee_id,
          financial_year
        }
      });
  
      if (!taxDeductionRecord) {
        return res.status(404).json({
          success: false,
          message: `No tax deduction record found for employee ID ${employee_id} and financial year ${financial_year}.`
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Tax deduction record fetched successfully',
        data: taxDeductionRecord
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tax deduction record',
        error: error.message
      });
    }
  };
  