import Employee from "../model/addpersonalmodel.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Form12BB from "../model/form12bbModel.js";

export const verifyEmployee = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    const { financial_year_from, financial_year_to } = req.body;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This function can only be accessed when logged in with company email"
      });
    }
    
    if (!employee_id) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const employee = await Employee.findOne({
      where: { employee_id },
      attributes: ['employee_id', 'firstName', 'lastName', 'companyemail']
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const employeeData = {
      employee_id: employee.employee_id,
      name: `${employee.firstName} ${employee.lastName}`,
      companyemail: employee.companyemail
    };

    return res.status(200).json({ 
      success: true, 
      message: "Employee verified successfully", 
      employee: employeeData
    });
  } catch (error) {
    console.error("Error verifying employee:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitHRADetails = async (req, res) => {
  try {
    const employee_id= req.session.employee_id;
    const { financial_year_from, financial_year_to, rentPaid, landlordName, landlordAddress, landlordPAN } = req.body;
    
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This function can only be accessed when logged in with company email"
      });
    }
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    let rentReceiptPath = null;
    if (req.file) {
      rentReceiptPath = req.file.filename;
    }

    let form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (form12BB) {
      await form12BB.update({
        hra_claimed: true,
        hra_status: 'PENDING', 
        rent_paid: rentPaid,
        landlord_name: landlordName,
        landlord_address: landlordAddress,
        landlord_pan: landlordPAN,
        rent_receipt_file: rentReceiptPath || form12BB.rent_receipt_file
      });
    } else {
      form12BB = await Form12BB.create({
        employee_id,
        financial_year_from,
        financial_year_to,
        hra_claimed: true,
        hra_status: 'PENDING',
        rent_paid: rentPaid,
        landlord_name: landlordName,
        landlord_address: landlordAddress,
        landlord_pan: landlordPAN,
        rent_receipt_file: rentReceiptPath,
        status: 'SUBMITTED'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "HRA details saved successfully", 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error submitting HRA details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitLTCDetails = async (req, res) => {
  try {
    const employee_id=req.session.employee_id;
    const { financial_year_from, financial_year_to, amount } = req.body;

    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This function can only be accessed when logged in with company email"
      });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    let travelBillPath = null;
    if (req.file) {
      travelBillPath = req.file.filename;
    }

    let form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (form12BB) {
      await form12BB.update({
        ltc_claimed: true,
        ltc_status: 'PENDING', 
        travel_amount: amount,
        travel_bill_file: travelBillPath || form12BB.travel_bill_file
      });
    } else {
      
      form12BB = await Form12BB.create({
        employee_id,
        financial_year_from,
        financial_year_to,
        ltc_claimed: true,
        ltc_status: 'PENDING',
        travel_amount: amount,
        travel_bill_file: travelBillPath,
        status: 'SUBMITTED'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "LTC details saved successfully", 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error submitting LTC details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitHomeLoanDetails = async (req, res) => {
  try {
    const employee_id=req.session.employee_id;
    const { financial_year_from, financial_year_to, interestAmount, lenderName, lenderAccountNo } = req.body;

        if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This function can only be accessed when logged in with company email"
      });
    }
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    let certificatePath = null;
    if (req.file) {
      certificatePath = req.file.filename;
    }

    let form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (form12BB) {
      
      await form12BB.update({
        home_loan_claimed: true,
        home_loan_status: 'PENDING', 
        interest_amount: interestAmount,
        lender_name: lenderName,
        lender_account: lenderAccountNo,
        loan_certificate_file: certificatePath || form12BB.loan_certificate_file
      });
    } else {

      form12BB = await Form12BB.create({
        employee_id,
        financial_year_from,
        financial_year_to,
        home_loan_claimed: true,
        home_loan_status: 'PENDING',
        interest_amount: interestAmount,
        lender_name: lenderName,
        lender_account: lenderAccountNo,
        loan_certificate_file: certificatePath,
        status: 'SUBMITTED'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Home Loan details saved successfully", 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error submitting Home Loan details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitChapterVIADetails = async (req, res) => {
  try {
    const employee_id=req.session.employee_id;
    const {financial_year_from, financial_year_to, deductionsCount } = req.body;

        if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This function can only be accessed when logged in with company email"
      });
    }
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const deductionsData = [];
    const count = parseInt(deductionsCount, 10);
    
    for (let i = 0; i < count; i++) {
      const section = req.body[`section_${i}`];
      const amount = req.body[`amount_${i}`];
      let receiptFile = null;
      
      if (req.files && req.files[`receipt_${i}`]) {
        receiptFile = req.files[`receipt_${i}`][0].filename;
      }
      
      deductionsData.push({
        section,
        amount,
        receipt_file: receiptFile
      });
    }

    let form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (form12BB) {
      
      await form12BB.update({
        chapter_via_claimed: true,
        chapter_via_status: 'PENDING', 
        chapter_via_details: deductionsData
      });
    } else {
      form12BB = await Form12BB.create({
        employee_id,
        financial_year_from,
        financial_year_to,
        chapter_via_claimed: true,
        chapter_via_status: 'PENDING',
        chapter_via_details: deductionsData,
        status: 'SUBMITTED'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Chapter VI-A details saved successfully", 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error submitting Chapter VI-A details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getForm12BBData = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { financial_year_from, financial_year_to } = req.query;
    
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const whereClause = { employee_id };
    
    if (financial_year_from && financial_year_to) {
      whereClause.financial_year_from = financial_year_from;
      whereClause.financial_year_to = financial_year_to;
    }

    const form12BB = await Form12BB.findOne({ where: whereClause });

    if (!form12BB) {
      return res.status(404).json({ success: false, message: "No form data found for this employee" });
    }

    return res.status(200).json({ 
      success: true, 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error fetching Form12BB data:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};






export const getAllForms = async (req, res) => {
  try {
    const { status, financial_year_from, financial_year_to } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (financial_year_from && financial_year_to) {
      whereClause.financial_year_from = financial_year_from;
      whereClause.financial_year_to = financial_year_to;
    }
    
    const forms = await Form12BB.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ['firstName', 'lastName', 'companyemail'],
          as: 'employee'
        }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    if (forms.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No form submissions found", 
        data: [] 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: forms 
    });
  } catch (error) {
    console.error("Error fetching Form12BB data:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateHRAStatus = async (req, res) => {
  try {
    const { employee_id, financial_year_from, financial_year_to, status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (!form12BB) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    await form12BB.update({
      hra_status: status
    });

    return res.status(200).json({ 
      success: true, 
      message: `HRA status updated to ${status}`, 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error updating HRA status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateLTCStatus = async (req, res) => {
  try {
    const { employee_id, financial_year_from, financial_year_to, status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (!form12BB) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    await form12BB.update({
      ltc_status: status
    });

    return res.status(200).json({ 
      success: true, 
      message: `LTC status updated to ${status}`, 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error updating LTC status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateHomeLoanStatus = async (req, res) => {
  try {
    const { employee_id, financial_year_from, financial_year_to, status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (!form12BB) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    await form12BB.update({
      home_loan_status: status
    });

    return res.status(200).json({ 
      success: true, 
      message: `Home Loan status updated to ${status}`, 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error updating Home Loan status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateChapterVIAStatus = async (req, res) => {
  try {
    const { employee_id, financial_year_from, financial_year_to, status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const form12BB = await Form12BB.findOne({ 
      where: { 
        employee_id,
        financial_year_from,
        financial_year_to
      }
    });

    if (!form12BB) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    await form12BB.update({
      chapter_via_status: status
    });

    return res.status(200).json({ 
      success: true, 
      message: `Chapter VI-A status updated to ${status}`, 
      data: form12BB 
    });
  } catch (error) {
    console.error("Error updating Chapter VI-A status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};