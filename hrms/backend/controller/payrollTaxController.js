import { Router } from "express";
import Payroll from "../model/uploadsalrymodel.js"
import PayrollTax from "../model/payrolltaxmodel.js";
import Employee from "../model/addpersonalmodel.js";
import Document from "../model/empUploadDocmodel.js";
import { Sequelize } from "sequelize";
import { sequelize } from "../config/db.js";

const router = Router();



export const calculatePayroll = async (req, res) => {
  try {
    const { 
      employee_id, 
      standard_deduction, 
      section80C_investment, 
      section80CCC_investment, 
      otherInvestment,
      section80D,
      section80CCD_1B,
      section80CCD_2, 
      section24_b,
      section80E,
      section80EEB
    } = req.body;

    let standardDeduction = Number(standard_deduction);
    let section80CInvestment = Number(section80C_investment);
    let section80CCCInvestment = Number(section80CCC_investment);
    let other_Investment = Number(otherInvestment);

    let section80CCD1B = Number(section80CCD_1B);
    let section80d = Number(section80D);
    let section80CCD2 = Number(section80CCD_2);
    let section24b = Number(section24_b);
    let section80e = Number(section80E);
    let section80eeb = Number(section80EEB);

    const result = await sequelize.query("SELECT employee_id FROM personaldetails LIMIT 1", { type: Sequelize.QueryTypes.SELECT });
    console.log(result);

    const payroll = await Payroll.findOne({
      where: { employee_id },  
      include: [{
        model: Employee,
        as: "personal",  
        attributes: ['employee_id','firstName', 'lastName'], 
      }],
    });

    console.log(payroll);
    console.log(JSON.stringify(payroll, null, 2));

    if (!payroll) {
      return res.status(404).json({ message: `Payroll record not found for employee_id: ${employee_id}` });
    }

   
    const { 
      payroll_id, 
      base_salary, 
      hra, 
      pf, 
      medical_allowance, 
      newspaper_allowance, 
      dress_allowance,
      other_allowance, 
      professional_tax,
      variable_salary = 0,
      joining_bonus = 0,
      joining_bonus_paid = false
    } = payroll;
    
    console.log("Current joining_bonus:", joining_bonus);
    console.log("Current joining_bonus_paid status:", joining_bonus_paid);

  
    const documents = await Document.findAll({ where: { employee_id } }) || [];
    console.log("Total documents found:", documents.length);

    const approvedDocuments = documents.filter(doc => doc.status === "Approved");
    console.log("Approved documents:", approvedDocuments.length);

   
 
    const hraDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "hra");
    const updatedHRA = hraDoc ? hraDoc.claimed_amount : 0;
    const taxableHRA = hraDoc ? (hraDoc.rem_taxable_income ?? 0) : hra;


    const medicalDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "medical_allowance");
    const updatedMedicalAllowance = medicalDoc ? medicalDoc.claimed_amount : 0;
    const taxableMedicalAllowance = medicalDoc ? (medicalDoc.rem_taxable_income ?? 0) : medical_allowance;

   
    const newspaperDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "newspaper_allowance");
    const updatedNewspaperAllowance = newspaperDoc ? newspaperDoc.claimed_amount : 0;
    const taxableNewspaperAllowance = newspaperDoc ? (newspaperDoc.rem_taxable_income ?? 0) : newspaper_allowance;

 
    const dressDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "dress_allowance");
    const updatedDressAllowance = dressDoc ? dressDoc.claimed_amount : 0;
    const taxableDressAllowance = dressDoc ? (dressDoc.rem_taxable_income ?? 0) : dress_allowance;

  
    const otherDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "other_allowance");
    const updatedOtherAllowance = otherDoc ? otherDoc.claimed_amount : 0;
    const taxableOtherAllowance = otherDoc ? (otherDoc.rem_taxable_income ?? 0) : other_allowance;

    console.log("Updated HRA:", updatedHRA, "Original HRA:", hra);
    console.log("Updated Medical Allowance:", updatedMedicalAllowance, "Original Medical Allowance:", medical_allowance);
    console.log("Updated Newspaper Allowance:", updatedNewspaperAllowance, "Original Newspaper Allowance:", newspaper_allowance);
    console.log("Updated Dress Allowance:", updatedDressAllowance, "Original Dress Allowance:", dress_allowance);
    console.log("Updated Other Allowance:", updatedOtherAllowance, "Original Other Allowance:", other_allowance);

    console.log("Taxable HRA:", taxableHRA);
    console.log("Taxable Medical Allowance:", taxableMedicalAllowance);
    console.log("Taxable Other Allowance:", taxableOtherAllowance);

  
    const joiningBonusToConsider = joining_bonus_paid ? 0 : joining_bonus;
    console.log("Joining bonus to consider:", joiningBonusToConsider);
    
    const gross_salary = base_salary + updatedHRA + updatedMedicalAllowance + 
                        updatedDressAllowance + updatedNewspaperAllowance + 
                        updatedOtherAllowance + variable_salary + joiningBonusToConsider;
                        
    console.log("Gross Salary:", gross_salary);

    const section80CDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80c_investment");
    section80CInvestment = section80CDoc ? section80CDoc.claimed_amount : section80CInvestment;

    const section80CCCDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80ccc_investment");
    section80CCCInvestment = section80CCCDoc ? section80CCCDoc.claimed_amount : section80CCCInvestment;

    const otherInvestmentDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "otherinvestment");
    other_Investment = otherInvestmentDoc ? otherInvestmentDoc.claimed_amount : other_Investment;

    const section80DDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80d");
    section80d = section80DDoc ? section80DDoc.claimed_amount : section80d;

    const section80CCD1BDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80ccd_1b");
    section80CCD1B = section80CCD1BDoc ? section80CCD1BDoc.claimed_amount : section80CCD1B;

    const section80CCD2Doc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80ccd_2");
    section80CCD2 = section80CCD2Doc ? section80CCD2Doc.claimed_amount : section80CCD2;

    const section24BDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section24_b");
    section24b = section24BDoc ? section24BDoc.claimed_amount : section24b;

    const section80EDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80e");
    section80e = section80EDoc ? section80EDoc.claimed_amount : section80e;

    const section80EEBDoc = approvedDocuments.find(doc => doc.category.toLowerCase() === "section80eeb");
    section80eeb = section80EEBDoc ? section80EEBDoc.claimed_amount : section80eeb;

    console.log("Investment (80C):", section80CInvestment);
    console.log("Investment (80CCC):", section80CCCInvestment);
    console.log("Other Investment:", other_Investment);
    console.log("section80eeb:", section80eeb);
    const total_deductions = standardDeduction + section80CInvestment + section80CCCInvestment + 
                           other_Investment + section80CCD1B + section80CCD2 +
                           section24b + section80e + section80eeb + section80d;

    console.log("Total Deductions:", total_deductions);

    const taxable_income = base_salary + taxableHRA + taxableMedicalAllowance + 
                         taxableNewspaperAllowance + taxableDressAllowance + 
                         taxableOtherAllowance + variable_salary + 
                         joiningBonusToConsider - total_deductions;
                         
    console.log("Taxable Income:", taxable_income);


    let total_tax = 0;
    if (taxable_income > 1200000) {
      total_tax += (taxable_income - 1200000) * 0.3 + 400000 * 0.2 + 400000 * 0.05;
    } else if (taxable_income > 800000) {
      total_tax += (taxable_income - 800000) * 0.2 + 400000 * 0.05;
    } else if (taxable_income >= 400000) {
      total_tax += (taxable_income - 400000) * 0.05;
    }

    if (taxable_income < 400000) {
      total_tax = 0;
    }


    total_tax += total_tax * 0.04; 
    console.log("Total Tax:", total_tax);

  
    const existingPayrollTax = await PayrollTax.findOne({ where: { employee_id } });
    console.log("Existing PayrollTax found:", !!existingPayrollTax);

    if (existingPayrollTax) {
      
      const currentJoiningBonusPaid = existingPayrollTax.joining_bonus_paid;
      console.log("Current joining_bonus_paid in PayrollTax:", currentJoiningBonusPaid);
      
      await existingPayrollTax.update({
        base_salary,
        hra: updatedHRA,  
        pf,
        professional_tax,
        medical_allowance: updatedMedicalAllowance,
        newspaper_allowance: updatedNewspaperAllowance,
        dress_allowance: updatedDressAllowance,
        other_allowance: updatedOtherAllowance,
        variable_salary,
        joining_bonus,  
        joining_bonus_paid: currentJoiningBonusPaid,  
        gross_salary,
        taxable_income,
        total_tax,
        standard_deduction: standardDeduction,
        section80C_investment: section80CInvestment,
        section80CCC_investment: section80CCCInvestment,
        otherInvestment: other_Investment,
        section80D: section80d,
        section80CCD_1B: section80CCD1B,
        section24_b: section24b,
        section80CCD_2: section80CCD2,
        section80E: section80e,
        section80EEB: section80eeb,
      });
      
      console.log("PayrollTax updated successfully, joining_bonus_paid remains:", currentJoiningBonusPaid);
    } else {
     
      await PayrollTax.create({
        payroll_id,
        employee_id,
        base_salary,
        hra: updatedHRA,
        pf,
        professional_tax,
        medical_allowance: updatedMedicalAllowance,
        newspaper_allowance: updatedNewspaperAllowance,
        dress_allowance: updatedDressAllowance,
        other_allowance: updatedOtherAllowance,
        variable_salary,
        joining_bonus,
        joining_bonus_paid,  
        gross_salary,
        taxable_income,
        total_tax,
        standard_deduction: standardDeduction,
        section80C_investment: section80CInvestment,
        section80CCC_investment: section80CCCInvestment,
        otherInvestment: other_Investment,
        section80D: section80d,
        section80CCD_1B: section80CCD1B,
        section24_b: section24b,
        section80CCD_2: section80CCD2,
        section80E: section80e,
        section80EEB: section80eeb,
      });
      
      console.log("New PayrollTax created with joining_bonus_paid:", joining_bonus_paid);
    }

  
    res.status(200).json({ 
      message: "Payroll calculated successfully", 
      payroll: {
        ...payroll.toJSON(),
        joining_bonus,
        joining_bonus_paid,  
        variable_salary,
        gross_salary,
        taxable_income,
        total_tax,
      
        hra: updatedHRA,
        medical_allowance: updatedMedicalAllowance,
        newspaper_allowance: updatedNewspaperAllowance,
        dress_allowance: updatedDressAllowance,
        other_allowance: updatedOtherAllowance
      }
    });

  } catch (error) {
    console.error("Error calculating payroll:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [
        {
          model: Employee,
          attributes: ["employee_id", "firstName", "lastName"],
        },
      ],
    });

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "No payroll records found" });
    }

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};




export const getPayrollById = async (req, res) => {
  try {
    console.log("Request Params:", req.params); 

    const { employee_id } = req.params;
    console.log("Extracted employee ID:", employee_id); 

    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const payroll = await Payroll.findOne({
      where: { employee_id },  
      include: [{ model: Employee }],
    });

    if (!payroll) {
      return res.status(404).json({ message: `No payroll record found for ID: ${employee_id}` });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    console.error("Error fetching payroll by ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};