import HRACalculation from "../model/RentModel.js";
import Payroll from "../model/uploadsalrymodel.js";
import Employee from "../model/addpersonalmodel.js";
import { Op } from "sequelize";

export const calculateHRA = async (req, res) => {
  try {
    const {
      employee_id,
      financial_year,
      start_date,
      end_date,
      rent_amount,
      hra_address,
      city,
      landlord_name,
      landlord_pan,
      landlord_address
    } = req.body;

    // Add logging to check received values
    console.log("Received request body:", req.body);
    console.log("Financial Year:", financial_year);

    if (!employee_id || !financial_year || !start_date || !end_date || !rent_amount || !hra_address ||
        !city || !landlord_name || !landlord_pan || !landlord_address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    const payrollDetails = await Payroll.findOne({
      where: { employee_id }
    });

    if (!payrollDetails) {
      return res.status(404).json({
        success: false,
        message: "Payroll details not found for this employee"
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const rentPeriod = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth()) + 1;

    if (rentPeriod <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range. End date must be after start date."
      });
    }

    const annualHRA = payrollDetails.hra;
        
    const effectiveRentPeriod = Math.min(rentPeriod, 12);
    const rentAnnually = rent_amount * effectiveRentPeriod;
        
    const hraDifference = annualHRA - rentAnnually;
        
    let claimedHRA, taxableHRA;
        
    if (hraDifference < 0) {
      claimedHRA = annualHRA;
      taxableHRA = 0;
    } else {
      claimedHRA = rentAnnually;
      taxableHRA = hraDifference;
    }
    
    // Log data before creating record
    console.log("Creating HRA calculation with data:", {
      employee_id,
      financial_year,
      start_date: startDate,
      end_date: endDate,
      rent_period: rentPeriod,
      rent_amount,
      hra_address,
      city,
      landlord_name,
      landlord_pan,
      landlord_address,
      hra: annualHRA,
      claimed_hra: claimedHRA,
      taxable_hra: taxableHRA
    });
        
    const hraCalculation = await HRACalculation.create({
      employee_id,
      financial_year,
      start_date: startDate,
      end_date: endDate,
      rent_period: rentPeriod,
      rent_amount,
      hra_address,
      city,
      landlord_name,
      landlord_pan,
      landlord_address,
      hra: annualHRA,
      claimed_hra: claimedHRA,
      taxable_hra: taxableHRA
    });

    return res.status(201).json({
      success: true,
      message: "HRA calculation saved successfully",
      data: {
        hra_calculation: hraCalculation,
        details: {
          financial_year,
          annual_hra: annualHRA,
          rent_annually: rentAnnually,
          effective_rent_period: effectiveRentPeriod,
          claimed_hra: claimedHRA,
          taxable_hra: taxableHRA
        }
      }
    });
      
  } catch (error) {
    console.error("Error calculating HRA:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate HRA",
      error: error.message
    });
  }
};