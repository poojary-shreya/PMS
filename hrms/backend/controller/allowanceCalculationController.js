import { Op } from "sequelize";
import Payroll from "../model/uploadsalrymodel.js";
import AllowanceClaim from "../model/allowanceModel.js";
import AllowanceCalculation from "../model/allowanceCalModel.js";

export const calculateAllowance = async (req, res) => {
    try {
      const {
        employee_id,
        financial_year,
        purpose,
        claim_amount,
        comments
      } = req.body;
  
      // Add logging to check received values
      console.log("Received request body:", req.body);
      console.log("Financial Year:", financial_year);
      console.log("Purpose:", purpose);
  
      if (!employee_id || !financial_year || !purpose || !claim_amount) {
        return res.status(400).json({
          success: false,
          message: "Employee ID, financial year, purpose and claim amount are required"
        });
      }
  
      // Validate purpose
      const validPurposes = ['medical_allowance', 'newspaper_allowance', 'dress_allowance', 'other_allowance'];
      if (!validPurposes.includes(purpose)) {
        return res.status(400).json({
          success: false,
          message: "Invalid purpose. Must be one of: medical_allowance, newspaper_allowance, dress_allowance, or other_allowance"
        });
      }
  
      // Get payroll details for the employee
      const payrollDetails = await Payroll.findOne({
        where: { employee_id }
      });
  
      if (!payrollDetails) {
        return res.status(404).json({
          success: false,
          message: "Payroll details not found for this employee"
        });
      }
  
      // Get the annual allowance limit based on purpose
      let annualAllowance;
      switch (purpose) {
        case 'medical_allowance':
          annualAllowance = payrollDetails.medical_allowance;
          break;
        case 'newspaper_allowance':
          annualAllowance = payrollDetails.newspaper_allowance;
          break;
        case 'dress_allowance':
          annualAllowance = payrollDetails.dress_allowance;
          break;
        case 'other_allowance':
          annualAllowance = payrollDetails.other_allowance;
          break;
        default:
          annualAllowance = 0;
      }
  
      // Get the current calculation record if it exists
      let existingCalculation = await AllowanceCalculation.findOne({
        where: {
          employee_id,
          financial_year,
          purpose
        }
      });
  
      // Use the claimed amount from the calculation record if it exists
      // This is more accurate than summing claims since it contains our running total
      const alreadyClaimedAmount = existingCalculation 
        ? parseFloat(existingCalculation.claimed_amount) || 0
        : 0;
  
      // Calculate how much can still be claimed
      const remainingAllowance = Math.max(0, annualAllowance - alreadyClaimedAmount);
      
      // Determine claimable amount (minimum of claim amount and remaining allowance)
      const claimableAmount = Math.min(claim_amount, remainingAllowance);
      
      // Calculate taxable amount as the remaining allowance after this claim
      const taxableAmount = Math.max(0, annualAllowance - (alreadyClaimedAmount + claimableAmount));
  
      // Log calculation data
      console.log("Allowance calculation data:", {
        employee_id,
        financial_year,
        purpose,
        annual_allowance: annualAllowance,
        already_claimed: alreadyClaimedAmount,
        remaining_allowance: remainingAllowance,
        claim_amount,
        claimable_amount: claimableAmount,
        taxable_amount: taxableAmount
      });
  
      // Get the current claimed amount from the calculation table (if it exists)
      let allowanceCalculation = await AllowanceCalculation.findOne({
        where: {
          employee_id,
          financial_year,
          purpose
        }
      });
  
      let currentClaimedAmount = 0;
      let message = "";
  
      if (allowanceCalculation) {
        // Get the current claimed amount from the existing record
        currentClaimedAmount = parseFloat(allowanceCalculation.claimed_amount) || 0;
  
        // Calculate new claimed amount (not exceeding the annual allowance)
        const newClaimedAmount = Math.min(
          annualAllowance, 
          currentClaimedAmount + claimableAmount
        );
  
        // Update existing calculation
        await allowanceCalculation.update({
          annual_allowance: annualAllowance,
          claimed_amount: newClaimedAmount,
          claim_amount,
          claimable_amount: claimableAmount,
          taxable_amount: taxableAmount,
          comments: comments || allowanceCalculation.comments // Keep old comments if none provided
        });
        message = "Allowance calculation updated successfully";
      } else {
        // For new records, the claimed amount is just the claimable portion of the current claim
        const newClaimedAmount = Math.min(annualAllowance, claimableAmount);
        
        // Create new calculation if none exists
        allowanceCalculation = await AllowanceCalculation.create({
          employee_id,
          financial_year,
          purpose,
          annual_allowance: annualAllowance,
          claimed_amount: newClaimedAmount,
          claim_amount,
          claimable_amount: claimableAmount,
          taxable_amount: taxableAmount,
          comments: comments || ''
        });
        message = "Allowance calculation saved successfully";
      }
  
      return res.status(200).json({
        success: true,
        message,
        data: {
          allowance_calculation: allowanceCalculation,
          details: {
            financial_year,
            purpose,
            annual_allowance: annualAllowance,
            already_claimed: alreadyClaimedAmount,
            remaining_allowance: remainingAllowance,
            current_claim: claim_amount,
            claimable_amount: claimableAmount,
            taxable_amount: taxableAmount
          }
        }
      });
  
    } catch (error) {
      console.error("Error calculating allowance:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to calculate allowance",
        error: error.message
      });
    }
  };