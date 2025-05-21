import Payroll from "../model/uploadsalrymodel.js";
import Employee from "../model/addpersonalmodel.js";


export const addPayroll = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const newPayroll = await Payroll.create(req.body, {
      logging: console.log 
    });

    res.status(201).json(newPayroll);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPayrollDetails = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    
    // Check if user is logged in with company email
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Payroll information can only be accessed when logged in with company email" 
      });
    }
    
    // First check if employee exists
    const employee = await Employee.findOne({ where: { employee_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if logged in user is accessing their own information
    const loggedInEmail = req.session.email;
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({ 
        message: "Access denied: You can only access your own payroll information" 
      });
    }
    
    console.log("Fetching payroll for employee_id:", employee_id || "N/A");
    
    // Get payroll data
    const payroll = await Payroll.findOne({ where: { employee_id } });
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found for this employee" });
    }
    
    return res.status(200).json({
      message: "Payroll retrieved successfully",
      payroll: {
        // Employee details
        employee_id: payroll.employee_id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phoneNumber,
        companyemail: employee.companyemail,
        
        // Payroll details
        pfno: payroll.pfno,
        uan: payroll.uan,
        ctc: payroll.ctc,
        base_salary: payroll.base_salary,
        hra: payroll.hra,
        pf: payroll.pf,
        professional_tax: payroll.professional_tax,
        medical_allowance: payroll.medical_allowance,
        newspaper_allowance: payroll.newspaper_allowance,
        dress_allowance: payroll.dress_allowance,
        other_allowance: payroll.other_allowance,
        variable_salary: payroll.variable_salary,
        joining_bonus: payroll.joining_bonus,
        joining_bonus_paid: payroll.joining_bonus_paid,
        total_tax: payroll.total_tax,
        monthly_tax: payroll.monthly_tax
      }
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createPayroll = async (req, res) => {
  try {
    console.log(req.body);
    const { 
      employee_id, 
      ctc,
      pfno,
      uan, 
      joining_bonus = 0, 
      variable_salary = 0,
      is_joining_bonus_paid = false,
      is_variable_salary_paid = false
    } = req.body;
    
    console.log("Checking Employee existence with id:", employee_id);
    const employee = await Employee.findOne({where:{employee_id}});
    console.log("employee:", employee);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check existing payroll to determine bonus/variable payment status
    const existingPayroll = await Payroll.findOne({ where: {employee_id: employee_id } });
    
    // Handle joining bonus and variable salary payment logic
    let joiningBonusAmount = Number(joining_bonus) || 0;
    let variableSalaryAmount = Number(variable_salary) || 0;
    
    // Initialize payment status variables (for storage only)
    let joiningBonusPaid = false;
    let variableSalaryPaid = false;
    
    if (existingPayroll) {
      // For existing payroll records, check if payment status should be updated
      joiningBonusPaid = is_joining_bonus_paid !== undefined ? 
        Boolean(is_joining_bonus_paid) : existingPayroll.joining_bonus_paid;
        
      variableSalaryPaid = is_variable_salary_paid !== undefined ? 
        Boolean(is_variable_salary_paid) : existingPayroll.variable_salary_paid;
    } else {
      // For new records, use the provided payment status
      joiningBonusPaid = Boolean(is_joining_bonus_paid);
      variableSalaryPaid = Boolean(is_variable_salary_paid);
    }
    
    // IMPORTANT CHANGE: Always include full bonus/variable amounts in calculations
    // regardless of payment status to match frontend behavior
    
    console.log("Joining Bonus:", joiningBonusAmount, "Paid:", joiningBonusPaid);
    console.log("Variable Salary:", variableSalaryAmount, "Paid:", variableSalaryPaid);
     
    // Calculate components as percentages of CTC
    const base_salary = ctc * 0.50;
    const employeeCity = employee.city || "non-metro";
    
    let hra;
    if (["mumbai", "delhi", "kolkata", "chennai", "bangalore", "hyderabad","ahmedabad","bengaluru"].includes(employeeCity.toLowerCase())) {
      hra = base_salary * 0.50; // 50% for metro cities
    } else {
      hra = base_salary * 0.40; // 40% for non-metro cities
    }
    
    const employerPf = base_salary * 0.12;
    const employeePf = base_salary * 0.12;
    const pf = employeePf + employerPf;
    
    // Calculate PT based on salary range or as a small percentage
    const professional_tax = Math.min(200, ctc * 0.002); // Cap at 200 or 0.2% of CTC
    
    // Calculate allowances as percentages of base salary
    const medical_allowance = base_salary * 0.10; // 10% of base salary
    const newspaper_allowance = base_salary * 0.04; // 4% of base salary
    const dress_allowance = base_salary * 0.04; // 4% of base salary
    
    // Calculate remaining amount for other allowances
    const other_allowance = ctc - (base_salary + hra + pf + (professional_tax * 12) + 
                             medical_allowance + newspaper_allowance + dress_allowance);
    
    const deduction = pf + (professional_tax * 12);
    
    // IMPORTANT CHANGE: Use full amounts regardless of payment status
    // Always include joining bonus and variable salary in gross salary calculations
    const gross_salary = base_salary + hra + medical_allowance + newspaper_allowance + 
                         dress_allowance + other_allowance + joiningBonusAmount + 
                         variableSalaryAmount;
                         
    const taxable_income = gross_salary - deduction;

    // Calculate tax based on old regime WITH rebate applied before cess
    const calculateOldRegimeTax = (taxableIncome) => {
      let tax = 0;
      
      // Store standard deduction value for reporting only
      const standard_deduction = 50000;
      
      // HRA exemption calculation (for reporting only)
      let hraExemption = 0;
      if (["mumbai", "delhi", "kolkata", "chennai", "bangalore", "hyderabad","ahmedabad","bengaluru"].includes(employeeCity.toLowerCase())) {
        hraExemption = Math.min(hra, base_salary * 0.50, hra - (0.10 * base_salary));
      } else {
        hraExemption = Math.min(hra, base_salary * 0.40, hra - (0.10 * base_salary));
      }
      
      // Apply tax slabs for old regime
      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        tax += 500000 * 0.20;
        tax += 250000 * 0.05;
      } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        tax += 250000 * 0.05;
      } else if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
      }
      
      // Apply rebate of Rs 12,500 for income up to Rs 5 lakhs
      if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
      }
      
      // Calculate tax before cess for reporting
      const taxBeforeCess = tax;
      
      // Add cess of 4%
      tax += tax * 0.04;
      
      return { 
        tax, 
        taxBeforeCess,
        exemptions: standard_deduction + hraExemption, // For reporting only
        finalTaxableIncome: taxableIncome // No exemptions applied
      };
    };
    
    // Calculate tax based on new regime WITH rebate applied before cess
    const calculateNewRegimeTax = (taxableIncome) => {
      let tax = 0;
      
      // Store standard deduction for reporting only
      const standard_deduction = 50000;
      
      // Apply tax slabs for new regime directly on taxable income
      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
        tax += 500000 * 0.20;
        tax += 500000 * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.20;
        tax += 500000 * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (taxableIncome > 750000) {
        tax += (taxableIncome - 750000) * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.10;
        tax += 200000 * 0.05;
      } else if (taxableIncome > 300000) {
        tax += (taxableIncome - 300000) * 0.05;
      }
      
      // Apply rebate of Rs 25,000 for income up to Rs 7 lakhs in new regime
      if (taxableIncome <= 700000) {
        tax = Math.max(0, tax - 25000);
      }
      
      // Calculate tax before cess for reporting
      const taxBeforeCess = tax;
      
      // Add cess of 4%
      tax += tax * 0.04;
      
      return { 
        tax, 
        taxBeforeCess,
        exemptions: standard_deduction, // For reporting only
        finalTaxableIncome: taxableIncome // No exemptions applied
      };
    };
    
    // Calculate both regimes
    const oldRegimeResult = calculateOldRegimeTax(taxable_income);
    const newRegimeResult = calculateNewRegimeTax(taxable_income);
    
    // Auto select the regime with lower tax
    const tax_regime_used = oldRegimeResult.tax <= newRegimeResult.tax ? "old" : "new";
    const total_tax = tax_regime_used === "old" ? oldRegimeResult.tax : newRegimeResult.tax;
    const tax_savings = Math.abs(oldRegimeResult.tax - newRegimeResult.tax);
    const monthly_tax = total_tax / 12;
    
    console.log("Old Regime Tax:", oldRegimeResult.tax);
    console.log("New Regime Tax:", newRegimeResult.tax);
    console.log("Selected Regime:", tax_regime_used);
    console.log("Total Tax:", total_tax);
    
    // Data to be stored in the database
    const payrollData = {
      ctc,
      pfno,
      uan,
      base_salary,
      hra,
      pf,
      professional_tax,
      medical_allowance,
      newspaper_allowance,
      dress_allowance,
      other_allowance,
      variable_salary: variableSalaryAmount,
      joining_bonus: joiningBonusAmount,
      joining_bonus_paid: joiningBonusPaid,
      variable_salary_paid: variableSalaryPaid,
      gross_salary,
      taxable_income,
      old_regime_tax: oldRegimeResult.tax,
      new_regime_tax: newRegimeResult.tax,
      old_regime_tax_before_cess: oldRegimeResult.taxBeforeCess,
      new_regime_tax_before_cess: newRegimeResult.taxBeforeCess,
      recommended_tax_regime: tax_regime_used,
      tax_savings: tax_savings > 0 ? tax_savings : 0,
      total_tax,
      monthly_tax
    };

    if (existingPayroll) {
      // No need to check for recalculation as we always include the full amounts
      await existingPayroll.update(payrollData);
      
      return res.status(200).json({ 
        message: "Payroll updated successfully", 
        payroll: {
          employee_id,
          ...payrollData,
          salary_breakdown: {
            base_salary,
            hra,
            medical_allowance,
            newspaper_allowance,
            dress_allowance,
            other_allowance,
            pf,
            professional_tax: professional_tax * 12,
            joining_bonus: joiningBonusAmount, // IMPORTANT: Use full amount regardless of payment status
            variable_salary: variableSalaryAmount // IMPORTANT: Use full amount regardless of payment status
          },
          bonus_status: {
            joining_bonus: joiningBonusAmount,
            joining_bonus_paid: joiningBonusPaid,
            variable_salary: variableSalaryAmount,
            variable_salary_paid: variableSalaryPaid
          },
          tax_details: {
            old_regime: {
              tax: oldRegimeResult.tax,
              taxBeforeCess: oldRegimeResult.taxBeforeCess,
              taxable_income: oldRegimeResult.finalTaxableIncome
            },
            new_regime: {
              tax: newRegimeResult.tax,
              taxBeforeCess: newRegimeResult.taxBeforeCess,
              taxable_income: newRegimeResult.finalTaxableIncome
            },
            recommended_regime: tax_regime_used,
            tax_savings: tax_savings > 0 ? tax_savings : 0
          }
        }
      });
    } else {
      await Payroll.create({
        employee_id,
        ...payrollData
      });
      console.log(payrollData);
      
      return res.status(201).json({ 
        message: "Payroll created successfully", 
        payroll: {
          employee_id,
          ...payrollData,
          salary_breakdown: {
            base_salary,
            hra,
            medical_allowance,
            newspaper_allowance,
            dress_allowance,
            other_allowance,
            pf,
            professional_tax: professional_tax * 12,
            joining_bonus: joiningBonusAmount, // IMPORTANT: Use full amount regardless of payment status
            variable_salary: variableSalaryAmount // IMPORTANT: Use full amount regardless of payment status
          },
          bonus_status: {
            joining_bonus: joiningBonusAmount,
            joining_bonus_paid: joiningBonusPaid,
            variable_salary: variableSalaryAmount,
            variable_salary_paid: variableSalaryPaid
          },
          tax_details: {
            old_regime: {
              tax: oldRegimeResult.tax,
              taxBeforeCess: oldRegimeResult.taxBeforeCess,
              taxable_income: oldRegimeResult.finalTaxableIncome
            },
            new_regime: {
              tax: newRegimeResult.tax,
              taxBeforeCess: newRegimeResult.taxBeforeCess,
              taxable_income: newRegimeResult.finalTaxableIncome
            },
            recommended_regime: tax_regime_used,
            tax_savings: tax_savings > 0 ? tax_savings : 0
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPayrollByEmployeeId = async (req, res) => {
  try {
    // const { employee_id } = req.params;
    const employee_id=req.session.employee_id;
    const payroll = await Payroll.findOne({ where: { employee_id } });
    const employee = await Employee.findOne({ where: { employee_id } });

    if (!payroll || !employee) {
      return res.status(404).json({ message: 'Payroll or Employee not found' });
    }
    const loggedInEmail = req.session.email; 
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Payslip information can only be accessed when logged in with company email" 
      });
    }
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({ 
        message: "Access denied: Payslip information can only be accessed when logged in with company email" 
      });
    }
    console.log(req.session.employee_id||"N/A");

    res.status(200).json({
      ...payroll.dataValues,
      employee: employee.dataValues
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [
        {
          model: Employee,
          attributes: ["first_name", "last_name", "phone_number"],
        },
      ],
    });

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "No payroll records found" });
    }

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};