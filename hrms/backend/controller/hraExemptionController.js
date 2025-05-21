import HraExemption from "../model/hraExemptionModel.js";
import Employee from "../model/addpersonalmodel.js";
import Payroll from "../model/uploadsalrymodel.js";

export const calculateHraExemption = async (req, res) => {
  try {
    const {
      employee_id,
      fiscal_year,
      rent_paid,
      months_rented = 12
    } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ where: { employee_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get employee's payroll information
    const payroll = await Payroll.findOne({ where: { employee_id } });
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found for this employee" });
    }

    // Get city type - metro or non-metro
    const cityType = ["mumbai", "delhi", "kolkata", "chennai", "bangalore", "hyderabad"]
      .includes(employee.city?.toLowerCase()) ? "metro" : "non-metro";

    // Calculate HRA exemption amount
    // HRA exemption is the minimum of these three:
    // 1. Actual HRA received
    // 2. Rent paid minus 10% of salary
    // 3. 50% of salary (for metro) or 40% of salary (for non-metro)

    // Calculate annual values
 
    
    const annualHra = payroll.hra;
    const annualSalary = payroll.base_salary;
    const annualRentPaid = rent_paid * months_rented;

    const monthlyHra = annualHra/12;
    const monthlySalary = annualSalary/12;

    // Calculate each condition
    const actualHraReceived = annualHra;
    const rentMinus10PercentSalary = annualRentPaid - (0.1 * annualSalary);
    const percentageOfSalary = cityType === "metro" ? 0.5 * annualSalary : 0.4 * annualSalary;

    // HRA exemption is the minimum of the three
    let hraExemptionAmount = Math.min(
      actualHraReceived,
      Math.max(0, rentMinus10PercentSalary), // Ensure it's not negative
      percentageOfSalary
    );

    // Calculate taxable HRA (HRA received minus exemption)
    const taxableHra = actualHraReceived - hraExemptionAmount;

    // Create or update HRA exemption record
    const existingExemption = await HraExemption.findOne({
      where: { employee_id, fiscal_year }
    });

    const exemptionData = {
      employee_id,
      fiscal_year,
      actual_hra_received: actualHraReceived,
      rent_paid: annualRentPaid,
      salary_for_period: annualSalary,
      city_type: cityType,
      hra_exemption_amount: hraExemptionAmount,
      taxable_hra: taxableHra
    };

    let result;
    if (existingExemption) {
      await existingExemption.update(exemptionData);
      result = { message: "HRA exemption updated successfully", data: exemptionData };
    } else {
      const newExemption = await HraExemption.create(exemptionData);
      result = { message: "HRA exemption calculated successfully", data: newExemption };
    }

    // Return the HRA exemption details
    return res.status(200).json({
      ...result,
      details: {
        employee_name: `${employee.firstName} ${employee.lastName}`,
        fiscal_year,
        city_type: cityType,
        monthly_hra: monthlyHra,
        monthly_salary: monthlySalary,
        rent_paid_monthly: rent_paid,
        months_rented,
        calculations: {
          actual_hra_received: actualHraReceived,
          rent_minus_10_percent_salary: rentMinus10PercentSalary,
          percentage_of_salary: percentageOfSalary,
          hra_exemption_amount: hraExemptionAmount,
          taxable_hra: taxableHra
        }
      }
    });
  } catch (error) {
    console.error("Error calculating HRA exemption:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getHraExemptionByEmployeeId = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { fiscal_year } = req.query;

    // Check if user is authorized
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        message: "Access denied: HRA exemption information can only be accessed when logged in with company email"
      });
    }

    const whereClause = { employee_id };
    if (fiscal_year) {
      whereClause.fiscal_year = fiscal_year;
    }

    const exemptions = await HraExemption.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ["firstName", "lastName", "companyemail"]
        }
      ],
      order: [["fiscal_year", "DESC"]]
    });

    if (!exemptions || exemptions.length === 0) {
      return res.status(404).json({ message: "No HRA exemption records found for this employee" });
    }

    // Check if logged in user is the employee or an admin
    const loggedInEmail = req.session.email;
    if (loggedInEmail !== exemptions[0].Employee.companyemail && !req.session.isAdmin) {
      return res.status(403).json({
        message: "Access denied: You can only access your own HRA exemption information"
      });
    }

    return res.status(200).json({
      message: "HRA exemption details retrieved successfully",
      data: exemptions
    });
  } catch (error) {
    console.error("Error fetching HRA exemption:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllHraExemptions = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({
        message: "Access denied: Only admins can access all HRA exemption records"
      });
    }

    const { fiscal_year } = req.query;
    const whereClause = {};
    
    if (fiscal_year) {
      whereClause.fiscal_year = fiscal_year;
    }

    const exemptions = await HraExemption.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ["firstName", "lastName", "companyemail", "city"]
        }
      ],
      order: [["fiscal_year", "DESC"], ["employee_id", "ASC"]]
    });

    if (!exemptions || exemptions.length === 0) {
      return res.status(404).json({ message: "No HRA exemption records found" });
    }

    return res.status(200).json({
      message: "All HRA exemption details retrieved successfully",
      data: exemptions
    });
  } catch (error) {
    console.error("Error fetching all HRA exemptions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};