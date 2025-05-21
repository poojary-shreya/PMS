import Employee from "../model/addpersonalmodel.js";
import TaxForm from "../model/formpartAmodel.js";
import Form16B from "../model/formpartBmodel.js";
import Financial from "../model/addfinancialmodel.js";
import Payroll from "../model/uploadsalrymodel.js";
import { Op } from "sequelize";
import Company from "../model/companyDetailsmodel.js";




export const getForm16ByEmployeeAndYear = async (req, res) => {
  try {
    const { financial_year_from, financial_year_to } = req.query;
    const employee_id=req.session.employee_id;

    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Failed to submit the request can only be accessed when logged in with company email" 
      });
    }


    if (!employee_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Employee ID is required" 
      });
    }

  
    const whereConditions = { employee_id };
    
 
    if (financial_year_from && financial_year_to) {
      whereConditions.financial_year_from = financial_year_from;
      whereConditions.financial_year_to = financial_year_to;
    }


    const taxFormData = await TaxForm.findOne({
      where: whereConditions,
      include: [
        {
          model: Employee,
          attributes: ['employee_id', 'firstName', 'lastName', 'panNumber', 'houseNumber','street','area','city','pinCode']
        }
      ],
      
    });

    if (!taxFormData) {
      return res.status(404).json({ 
        success: false, 
        message: "Form 16A not found for the specified employee and financial year" 
      });
    }
    console.log("taxFormData",taxFormData);

    const payrollData = await Payroll.findOne({
      where: { employee_id },
      attributes: [
        'base_salary','medical_allowance', 'newspaper_allowance',
        'dress_allowance', 'other_allowance','hra', "gross_salary"
      ]
    });


   
    const form16BData = await Form16B.findOne({
      where: {
        employee_id,
        certifiacte_no: taxFormData.certifiacte_no
      }
    });
    console.log("form16BData",form16BData);

    const financialData = await Financial.findOne({
      where: { employee_id },
      attributes: ['department'
      ]
    });
    console.log(form16BData);

  
    const form16CompleteData = {
      partA: taxFormData,
      partB: form16BData || null,
      employeeDetails: taxFormData.Employee,
      payrollDetails:payrollData || null,
      financialDetails:financialData || null,
    };

    return res.status(200).json({
      success: true,
      message: "Form 16 data retrieved successfully",
      data: form16CompleteData
    });

  } catch (error) {
    console.error("Error retrieving Form 16 data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Form 16 data",
      error: error.message
    });
  }
};