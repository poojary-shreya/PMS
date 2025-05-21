import Employee from "../model/addpersonalmodel.js";
import SalaryDetail from "../model/uploadsalrymodel.js";
import HRAModel from "../model/RentModel.js";
import InvestmentDeclaration from "../model/investmentDecModel.js";
import InvestmentProof from "../model/InvestmentProofModel.js";
import TaxCalculation from "../model/TaxCalculationModel.js";
import AllowanceCalculation from "../model/allowanceCalModel.js";
import PropertyLoss from "../model/losspropertymodel.js";
import {EmployeeTCS} from "../model/tcsmodel.js";
import {EmployeeTDS} from "../model/tdsmodel.js";


// export const calculateTaxLiability = async (req, res) => {
//   try {
//     const { employee_id, financial_year } = req.params;
//     // Convert string 'false' to boolean false
//     const useInitialDeclarations = req.query.useInitialDeclarations !== 'false';

//     const employee = await Employee.findOne({ where: { employee_id } });
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     const salaryDetails = await SalaryDetail.findOne({
//       where: { employee_id}
//     });

//     if (!salaryDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "Salary details not found for this employee and financial year"
//       });
//     }

//     const hraDetails = await HRAModel.findOne({
//       where: { employee_id, financial_year }
//     });
//     const otherClaims = await AllowanceCalculation.findAll({
//       where: {employee_id, financial_year}
//     });
    
//     // Sum up all the claimed allowances
//     let totalOtherAllowances = 0;
//     if (otherClaims && otherClaims.length > 0) {
//       totalOtherAllowances = otherClaims.reduce((total, claim) => {

//         return total + (claim.claimed_amount || 0);
//       }, 0);
//     }

//     let deductionsData;
//     if (useInitialDeclarations) {
//       deductionsData = await getInitialDeductions(employee_id, financial_year);
//     } else {
//       deductionsData = await getFinalDeductions(employee_id, financial_year);
//     }

//     if (!deductionsData.success) {
//       return res.status(404).json({
//         success: false,
//         message: deductionsData.message
//       });
//     }

//     const grossSalary = salaryDetails.base_salary+salaryDetails.hra+salaryDetails.medical_allowance+
//     salaryDetails.newspaper_allowance+salaryDetails.dress_allowance+salaryDetails.other_allowance+salaryDetails.joining_bonus+salaryDetails.variable_salary;
//     console.log(grossSalary);

//     const newRegimeNetSalary = grossSalary;

//     const standardDeduction = 50000;
//     const professionalTax = 2400;
//     const totalStandardDeduction = standardDeduction + professionalTax;

//     const newRegimeNetTaxableSalary = Math.max(0, newRegimeNetSalary - totalStandardDeduction);

//     const newRegimeDeductions = 0;

//     const newRegimeTaxableIncome = Math.floor(newRegimeNetTaxableSalary);

//     let exemptionUnderSection10 = (hraDetails ? hraDetails.claimed_hra : 0) + totalOtherAllowances;

//     const oldRegimeNetSalary = grossSalary - exemptionUnderSection10;

//     const oldRegimeStandardDeduction = totalStandardDeduction;

//     const oldRegimeNetTaxableSalary = Math.max(0, oldRegimeNetSalary - oldRegimeStandardDeduction);

//     // Calculate house property income/loss
//     let housePropertyLoss = 0;
//     const declaration = await PropertyLoss.findOne({
//       where: { employeeId: employee_id, fiscalYear: financial_year }
//     });
//     console.log(declaration);
//     if (declaration) {

//       let selfOccupiedAmount = declaration.selfOccupiedAmount || 0;
//       let letOutLossAmount = declaration.letOutLossAmount || 0;
//      let totallossproperty=selfOccupiedAmount+letOutLossAmount;
//        housePropertyLoss = parseFloat(totallossproperty.replace(/,/g, '').replace(/(\.\d+)\./, '.')); // -> 200000.00

//       console.log("housePropertyLoss",housePropertyLoss);
//       housePropertyLoss = Math.min(housePropertyLoss, 200000); 
//     }
//     console.log("housePropertyLoss",housePropertyLoss);


//     const otherIncomes = 0;
//     const oldRegimeGrossTotalIncome = oldRegimeNetTaxableSalary - housePropertyLoss + otherIncomes;
//     let chapterVIADeductions;
//     if (useInitialDeclarations) {
//       chapterVIADeductions = deductionsData.data.total_eligible_deductions;
//     } else {
//       chapterVIADeductions = deductionsData.data.final_deductions.total_approved;
//     }
//     console.log(chapterVIADeductions);
    
//     // Calculate Taxable Income under old regime (Rounded Off)
//     const oldRegimeTaxableIncome = Math.floor(Math.max(0, oldRegimeGrossTotalIncome - chapterVIADeductions));

//     // Calculate tax based on slabs for NEW REGIME
//     let newRegimeTax = calculateTaxBasedOnNewRegimeSlabs(newRegimeTaxableIncome);
    
//     let oldRegimeTax = calculateTaxBasedOnOldRegimeSlabs(oldRegimeTaxableIncome);
    
//     let newRegimeRebate = 0;
//     if (newRegimeTaxableIncome <= 700000) {
//       newRegimeRebate = Math.min(newRegimeTax, 25000);
//     }
    
//     let oldRegimeRebate = 0;
//     if (oldRegimeTaxableIncome <= 500000) {
//       oldRegimeRebate = Math.min(oldRegimeTax, 12500);
//     }
    
//     // Calculate tax after rebate
//     const newRegimeTaxAfterRebate = Math.max(0, newRegimeTax - newRegimeRebate);
//     const oldRegimeTaxAfterRebate = Math.max(0, oldRegimeTax - oldRegimeRebate);
    
//     // Calculate health and education cess (4%)
//     const newRegimeCess = Math.ceil(newRegimeTaxAfterRebate * 0.04);
//     const oldRegimeCess = Math.ceil(oldRegimeTaxAfterRebate * 0.04);
    
//     // Calculate total tax payable
//     const newRegimeTotalTaxPayable = newRegimeTaxAfterRebate + newRegimeCess;
//     const oldRegimeTotalTaxPayable = oldRegimeTaxAfterRebate + oldRegimeCess;
    
//     // Calculate monthly tax
//     const newRegimeMonthlyTax = Math.ceil(newRegimeTotalTaxPayable / 12);
//     const oldRegimeMonthlyTax = Math.ceil(oldRegimeTotalTaxPayable / 12);
    
//     // Calculate difference between regimes
//     const taxDifference = newRegimeTotalTaxPayable - oldRegimeTotalTaxPayable;
    
//     // Determine which regime is better
//     const betterRegime = taxDifference > 0 ? "Old Regime" : "New Regime";
    
//     // Include deduction breakdown in the response
//     const deductionBreakdown = useInitialDeclarations 
//       ? deductionsData.data.initial_deductions 
//       : deductionsData.data.final_deductions;
    
//     // Prepare tax computation sheet
//     const taxComputationSheet = {
//       particulars: {
//         gross_salary: {
//           new_regime: grossSalary,
//           old_regime: grossSalary
//         },
//         exemption_us_10: {
//           new_regime: 0,
//           old_regime: exemptionUnderSection10
//         },
//         net_salary_after_section_10: {
//           new_regime: newRegimeNetSalary,
//           old_regime: oldRegimeNetSalary
//         },
//         standard_deduction_and_professional_tax: {
//           new_regime: totalStandardDeduction,
//           old_regime: oldRegimeStandardDeduction
//         },
//         net_taxable_salary: {
//           new_regime: newRegimeNetTaxableSalary,
//           old_regime: oldRegimeNetTaxableSalary
//         },
//         house_property_loss: {
//           new_regime: 0,
//           old_regime: housePropertyLoss
//         },
//         income_from_other_sources: {
//           new_regime: otherIncomes,
//           old_regime: otherIncomes
//         },
//         gross_total_income: {
//           new_regime: newRegimeNetTaxableSalary + otherIncomes,
//           old_regime: oldRegimeGrossTotalIncome
//         },
//         deduction_under_chapter_vi_a: {
//           new_regime: newRegimeDeductions,
//           old_regime: chapterVIADeductions
//         },
//         taxable_income: {
//           new_regime: newRegimeTaxableIncome,
//           old_regime: oldRegimeTaxableIncome
//         },
//         tax_payable_on_total_income: {
//           new_regime: newRegimeTax,
//           old_regime: oldRegimeTax
//         },
//         rebate_us_87a: {
//           new_regime: newRegimeRebate,
//           old_regime: oldRegimeRebate
//         },
//         tax_payable_after_section_87a_rebate: {
//           new_regime: newRegimeTaxAfterRebate,
//           old_regime: oldRegimeTaxAfterRebate
//         },
//         surcharge: {
//           new_regime: 0, // Assuming no surcharge
//           old_regime: 0  // Assuming no surcharge
//         },
//         cess: {
//           new_regime: newRegimeCess,
//           old_regime: oldRegimeCess
//         },
//         total_tax_payable: {
//           new_regime: newRegimeTotalTaxPayable,
//           old_regime: oldRegimeTotalTaxPayable
//         },
//         tax_per_month: {
//           new_regime: newRegimeMonthlyTax,
//           old_regime: oldRegimeMonthlyTax
//         }
//       },
//       tax_difference: {
//         amount: Math.abs(taxDifference),
//         will_increase: taxDifference > 0,
//         better_regime: betterRegime
//       },
//       deduction_breakdown: deductionBreakdown,
//       calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs"
//     };

//     // Create an object with all the calculated data to save in the database
//     const taxCalculationData = {
//       employee_id,
//       employee_name: `${employee.firstName} ${employee.lastName}`,
//       financial_year,
//       calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs",
//       gross_salary_new_regime: grossSalary,
//       gross_salary_old_regime: grossSalary,
//       exemption_us_10_new_regime: 0,
//       exemption_us_10_old_regime: exemptionUnderSection10,
//       net_salary_after_section_10_new_regime: newRegimeNetSalary,
//       net_salary_after_section_10_old_regime: oldRegimeNetSalary,
//       standard_deduction_and_professional_tax_new_regime: totalStandardDeduction,
//       standard_deduction_and_professional_tax_old_regime: oldRegimeStandardDeduction,
//       net_taxable_salary_new_regime: newRegimeNetTaxableSalary,
//       net_taxable_salary_old_regime: oldRegimeNetTaxableSalary,
//       house_property_loss_new_regime: 0,
//       house_property_loss_old_regime: housePropertyLoss,
//       income_from_other_sources_new_regime: otherIncomes,
//       income_from_other_sources_old_regime: otherIncomes,
//       gross_total_income_new_regime: newRegimeNetTaxableSalary + otherIncomes,
//       gross_total_income_old_regime: oldRegimeGrossTotalIncome,
//       deduction_under_chapter_vi_a_new_regime: newRegimeDeductions,
//       deduction_under_chapter_vi_a_old_regime: chapterVIADeductions,
//       taxable_income_new_regime: newRegimeTaxableIncome,
//       taxable_income_old_regime: oldRegimeTaxableIncome,
//       tax_payable_on_total_income_new_regime: newRegimeTax,
//       tax_payable_on_total_income_old_regime: oldRegimeTax,
//       rebate_us_87a_new_regime: newRegimeRebate,
//       rebate_us_87a_old_regime: oldRegimeRebate,
//       tax_payable_after_section_87a_rebate_new_regime: newRegimeTaxAfterRebate,
//       tax_payable_after_section_87a_rebate_old_regime: oldRegimeTaxAfterRebate,
//       surcharge_new_regime: 0,
//       surcharge_old_regime: 0,
//       cess_new_regime: newRegimeCess,
//       cess_old_regime: oldRegimeCess,
//       total_tax_payable_new_regime: newRegimeTotalTaxPayable,
//       total_tax_payable_old_regime: oldRegimeTotalTaxPayable,
//       tax_per_month_new_regime: newRegimeMonthlyTax,
//       tax_per_month_old_regime: oldRegimeMonthlyTax,
//       tax_difference_amount: Math.abs(taxDifference),
//       tax_will_increase: taxDifference > 0,
//       better_regime: betterRegime,
//       deduction_breakdown: JSON.stringify(deductionBreakdown)
//     };

//     // Check if tax calculation already exists for this employee and financial year
//     const existingTaxCalculation = await TaxCalculation.findOne({
//       where: { 
//         employee_id, 
//         financial_year,
//         calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs"
//       }
//     });

//     let savedTaxCalculation;
    
//     if (existingTaxCalculation) {
//       // Update existing calculation
//       await TaxCalculation.update(taxCalculationData, {
//         where: { id: existingTaxCalculation.id }
//       });
//       savedTaxCalculation = await TaxCalculation.findByPk(existingTaxCalculation.id);
//     } else {
//       // Create new calculation
//       savedTaxCalculation = await TaxCalculation.create(taxCalculationData);
//     }

//     return res.status(200).json({
//       success: true,
//       message: existingTaxCalculation 
//         ? "Tax liability updated successfully" 
//         : "Tax liability calculated and stored successfully",
//       data: {
//         calculation_id: savedTaxCalculation.id,
//         employee_id,
//         employee_name: `${employee.firstName} ${employee.lastName}`,
//         financial_year,
//         tax_computation_sheet: taxComputationSheet
//       }
//     });
    
//   } catch (error) {
//     console.error("Error calculating tax liability:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to calculate tax liability",
//       error: error.message
//     });
//   }
// };



// Helper function to fetch and calculate TDS and TCS totals
const getTdsAndTcsDetails = async (employee_id, financial_year) => {
  try {
    // Fetch all TDS entries for the employee in the given financial year
    const tdsEntries = await EmployeeTDS.findAll({
      where: { 
        employee_id, 
        financialYear: financial_year 
      }
    });
    
    // Fetch all TCS entries for the employee in the given financial year
    const tcsEntries = await EmployeeTCS.findAll({
      where: { 
        employee_id, 
        financialYear: financial_year 
      }
    });
    
    // Calculate totals
    let totalTdsAmount = 0;
    let totalTdsIncomeReceived = 0;
    let totalTcsAmount = 0;
    
    // Sum up TDS amounts and income received
    if (tdsEntries && tdsEntries.length > 0) {
      tdsEntries.forEach(entry => {
        totalTdsAmount += parseFloat(entry.taxDeducted || 0);
        totalTdsIncomeReceived += parseFloat(entry.incomeReceived || 0);
      });
    }
    console.log("totalTdsAmount",totalTdsAmount);
    console.log("totalTdsIncomeReceived",totalTdsIncomeReceived);
    
    // Sum up TCS amounts
    if (tcsEntries && tcsEntries.length > 0) {
      tcsEntries.forEach(entry => {
        totalTcsAmount += parseFloat(entry.taxCollected || 0);
      });
    }
    console.log("totalTcsAmount",totalTcsAmount);

    
    return {
      success: true,
      data: {
        tdsEntries,
        tcsEntries,
        totalTdsAmount,
        totalTdsIncomeReceived,
        totalTcsAmount,
        totalTaxDeductions: totalTdsAmount + totalTcsAmount,
        totalOtherIncome: totalTdsIncomeReceived
      }
    };
  } catch (error) {
    console.error("Error fetching TDS and TCS details:", error);
    return {
      success: false,
      message: "Failed to fetch TDS and TCS details",
      error: error.message
    };
  }
};

export { getTdsAndTcsDetails };


export const calculateTaxLiability = async (req, res) => {
  try {
    const { employee_id, financial_year } = req.params;
    // Convert string 'false' to boolean false
    const useInitialDeclarations = req.query.useInitialDeclarations !== 'false';

    const employee = await Employee.findOne({ where: { employee_id } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const salaryDetails = await SalaryDetail.findOne({
      where: { employee_id}
    });

    if (!salaryDetails) {
      return res.status(404).json({
        success: false,
        message: "Salary details not found for this employee and financial year"
      });
    }

    // Fetch TDS and TCS details
    const tdsAndTcsDetails = await getTdsAndTcsDetails(employee_id, financial_year);
    if (!tdsAndTcsDetails.success) {
      return res.status(500).json({
        success: false,
        message: tdsAndTcsDetails.message
      });
    }
    
    const hraDetails = await HRAModel.findOne({
      where: { employee_id, financial_year }
    });
    const otherClaims = await AllowanceCalculation.findAll({
      where: {employee_id, financial_year}
    });
    
    // Sum up all the claimed allowances
    let totalOtherAllowances = 0;
    if (otherClaims && otherClaims.length > 0) {
      totalOtherAllowances = otherClaims.reduce((total, claim) => {
        return total + (claim.claimed_amount || 0);
      }, 0);
    }

    let deductionsData;
    if (useInitialDeclarations) {
      deductionsData = await getInitialDeductions(employee_id, financial_year);
    } else {
      deductionsData = await getFinalDeductions(employee_id, financial_year);
    }

    if (!deductionsData.success) {
      return res.status(404).json({
        success: false,
        message: deductionsData.message
      });
    }

    const grossSalary = salaryDetails.base_salary+salaryDetails.hra+salaryDetails.medical_allowance+
    salaryDetails.newspaper_allowance+salaryDetails.dress_allowance+salaryDetails.other_allowance+salaryDetails.joining_bonus+salaryDetails.variable_salary;
    console.log(grossSalary);

    const newRegimeNetSalary = grossSalary;

    const standardDeduction = 50000;
    const professionalTax = 2400;
    const totalStandardDeduction = standardDeduction + professionalTax;

    const newRegimeNetTaxableSalary = Math.max(0, newRegimeNetSalary - totalStandardDeduction);

    const newRegimeDeductions = 0;

    const newRegimeTaxableIncome = Math.floor(newRegimeNetTaxableSalary);

    let exemptionUnderSection10 = (hraDetails ? hraDetails.claimed_hra : 0) + totalOtherAllowances;

    const oldRegimeNetSalary = grossSalary - exemptionUnderSection10;

    const oldRegimeStandardDeduction = totalStandardDeduction;

    const oldRegimeNetTaxableSalary = Math.max(0, oldRegimeNetSalary - oldRegimeStandardDeduction);

    // Calculate house property income/loss
    let housePropertyLoss = 0;
    const declaration = await PropertyLoss.findOne({
      where: { employeeId: employee_id, fiscalYear: financial_year }
    });
    console.log(declaration);
    if (declaration) {
      let selfOccupiedAmount = declaration.selfOccupiedAmount || 0;
      let letOutLossAmount = declaration.letOutLossAmount || 0;
      let totallossproperty = selfOccupiedAmount + letOutLossAmount;
      housePropertyLoss = parseFloat(totallossproperty.toString().replace(/,/g, '').replace(/(\.\d+)\./, '.')); // -> 200000.00

      console.log("housePropertyLoss", housePropertyLoss);
      housePropertyLoss = Math.min(housePropertyLoss, 200000); 
    }
    console.log("housePropertyLoss", housePropertyLoss);

    // Add TDS income received to other incomes
    const otherIncomes = tdsAndTcsDetails.data.totalOtherIncome || 0;
    
    const oldRegimeGrossTotalIncome = oldRegimeNetTaxableSalary - housePropertyLoss + otherIncomes;
    let chapterVIADeductions;
    if (useInitialDeclarations) {
      chapterVIADeductions = deductionsData.data.total_eligible_deductions;
    } else {
      chapterVIADeductions = deductionsData.data.final_deductions.total_approved;
    }
    console.log(chapterVIADeductions);
    
    // Calculate Taxable Income under old regime (Rounded Off)
    const oldRegimeTaxableIncome = Math.floor(Math.max(0, oldRegimeGrossTotalIncome - chapterVIADeductions));

    // Calculate tax based on slabs for NEW REGIME
    let newRegimeTax = calculateTaxBasedOnNewRegimeSlabs(newRegimeTaxableIncome);
    
    let oldRegimeTax = calculateTaxBasedOnOldRegimeSlabs(oldRegimeTaxableIncome);
    
    let newRegimeRebate = 0;
    if (newRegimeTaxableIncome <= 700000) {
      newRegimeRebate = Math.min(newRegimeTax, 25000);
    }
    
    let oldRegimeRebate = 0;
    if (oldRegimeTaxableIncome <= 500000) {
      oldRegimeRebate = Math.min(oldRegimeTax, 12500);
    }
    
    // Calculate tax after rebate
    const newRegimeTaxAfterRebate = Math.max(0, newRegimeTax - newRegimeRebate);
    const oldRegimeTaxAfterRebate = Math.max(0, oldRegimeTax - oldRegimeRebate);
    
    // Calculate health and education cess (4%)
    const newRegimeCess = Math.ceil(newRegimeTaxAfterRebate * 0.04);
    const oldRegimeCess = Math.ceil(oldRegimeTaxAfterRebate * 0.04);
    
    // Calculate total tax payable
    const newRegimeTotalTaxPayable = newRegimeTaxAfterRebate + newRegimeCess;
    const oldRegimeTotalTaxPayable = oldRegimeTaxAfterRebate + oldRegimeCess;
    
    // Get TDS and TCS values for storing separately as per the model
    const tdsAmountOldRegime = tdsAndTcsDetails.data.totalTdsAmount || 0;
    const tdsAmountNewRegime = tdsAndTcsDetails.data.totalTdsAmount || 0;
    const tcsAmountOldRegime = tdsAndTcsDetails.data.totalTcsAmount || 0;
    const tcsAmountNewRegime = tdsAndTcsDetails.data.totalTcsAmount || 0;
    
    // Calculate total prepaid tax (TDS + TCS)
    const totalPrePaidTax = tdsAmountOldRegime + tcsAmountOldRegime; // Same for both regimes
    
    // Calculate monthly tax
    const newRegimeMonthlyTax = Math.ceil((newRegimeTotalTaxPayable - totalPrePaidTax) / 12);
    const oldRegimeMonthlyTax = Math.ceil((oldRegimeTotalTaxPayable - totalPrePaidTax) / 12);
    
    // Calculate difference between regimes
    const taxDifference = newRegimeTotalTaxPayable - oldRegimeTotalTaxPayable;
    
    // Determine which regime is better
    const betterRegime = taxDifference > 0 ? "Old Regime" : "New Regime";
    
    // Prepare tax computation sheet for the response
    const taxComputationSheet = {
      particulars: {
        gross_salary: {
          new_regime: grossSalary,
          old_regime: grossSalary
        },
        exemption_us_10: {
          new_regime: 0,
          old_regime: exemptionUnderSection10
        },
        net_salary_after_section_10: {
          new_regime: newRegimeNetSalary,
          old_regime: oldRegimeNetSalary
        },
        standard_deduction_and_professional_tax: {
          new_regime: totalStandardDeduction,
          old_regime: oldRegimeStandardDeduction
        },
        net_taxable_salary: {
          new_regime: newRegimeNetTaxableSalary,
          old_regime: oldRegimeNetTaxableSalary
        },
        house_property_loss: {
          new_regime: 0,
          old_regime: housePropertyLoss
        },
        income_from_other_sources: {
          new_regime: otherIncomes,
          old_regime: otherIncomes
        },
        gross_total_income: {
          new_regime: newRegimeNetTaxableSalary + otherIncomes,
          old_regime: oldRegimeGrossTotalIncome
        },
        deduction_under_chapter_vi_a: {
          new_regime: newRegimeDeductions,
          old_regime: chapterVIADeductions
        },
        taxable_income: {
          new_regime: newRegimeTaxableIncome,
          old_regime: oldRegimeTaxableIncome
        },
        tax_payable_on_total_income: {
          new_regime: newRegimeTax,
          old_regime: oldRegimeTax
        },
        rebate_us_87a: {
          new_regime: newRegimeRebate,
          old_regime: oldRegimeRebate
        },
        tax_payable_after_section_87a_rebate: {
          new_regime: newRegimeTaxAfterRebate,
          old_regime: oldRegimeTaxAfterRebate
        },
        surcharge: {
          new_regime: 0, // Assuming no surcharge
          old_regime: 0  // Assuming no surcharge
        },
        cess: {
          new_regime: newRegimeCess,
          old_regime: oldRegimeCess
        },
        total_tax_payable: {
          new_regime: newRegimeTotalTaxPayable,
          old_regime: oldRegimeTotalTaxPayable
        },
        prepaid_tax: {
          tds_amount: tdsAmountOldRegime,
          tcs_amount: tcsAmountOldRegime,
          total: totalPrePaidTax
        },
        tax_per_month: {
          new_regime: newRegimeMonthlyTax,
          old_regime: oldRegimeMonthlyTax
        }
      },
      tax_difference: {
        amount: Math.abs(taxDifference),
        will_increase: taxDifference > 0,
        better_regime: betterRegime
      },
      calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs",
      tds_tcs_details: {
        tds_entries: tdsAndTcsDetails.data.tdsEntries,
        tcs_entries: tdsAndTcsDetails.data.tcsEntries,
        total_tds_amount: tdsAmountOldRegime,
        total_tds_income_received: tdsAndTcsDetails.data.totalTdsIncomeReceived,
        total_tcs_amount: tcsAmountOldRegime
      }
    };

    // Create an object with all the calculated data to save in the database
    // According to the database model, matching the exact field names
    const taxCalculationData = {
      employee_id,
      employee_name: `${employee.firstName} ${employee.lastName}`,
      financial_year,
      calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs",
      gross_salary_new_regime: grossSalary,
      gross_salary_old_regime: grossSalary,
      exemption_us_10_new_regime: 0,
      exemption_us_10_old_regime: exemptionUnderSection10,
      net_salary_after_section_10_new_regime: newRegimeNetSalary,
      net_salary_after_section_10_old_regime: oldRegimeNetSalary,
      standard_deduction_and_professional_tax_new_regime: totalStandardDeduction,
      standard_deduction_and_professional_tax_old_regime: oldRegimeStandardDeduction,
      net_taxable_salary_new_regime: newRegimeNetTaxableSalary,
      net_taxable_salary_old_regime: oldRegimeNetTaxableSalary,
      house_property_loss_new_regime: 0,
      house_property_loss_old_regime: housePropertyLoss,
      income_from_other_sources_new_regime: otherIncomes,
      income_from_other_sources_old_regime: otherIncomes,
      gross_total_income_new_regime: newRegimeNetTaxableSalary + otherIncomes,
      gross_total_income_old_regime: oldRegimeGrossTotalIncome,
      deduction_under_chapter_vi_a_new_regime: newRegimeDeductions,
      deduction_under_chapter_vi_a_old_regime: chapterVIADeductions,
      taxable_income_new_regime: newRegimeTaxableIncome,
      taxable_income_old_regime: oldRegimeTaxableIncome,
      tax_payable_on_total_income_new_regime: newRegimeTax,
      tax_payable_on_total_income_old_regime: oldRegimeTax,
      rebate_us_87a_new_regime: newRegimeRebate,
      rebate_us_87a_old_regime: oldRegimeRebate,
      tax_payable_after_section_87a_rebate_new_regime: newRegimeTaxAfterRebate,
      tax_payable_after_section_87a_rebate_old_regime: oldRegimeTaxAfterRebate,
      surcharge_new_regime: 0,
      surcharge_old_regime: 0,
      cess_new_regime: newRegimeCess,
      cess_old_regime: oldRegimeCess,
      total_tax_payable_new_regime: newRegimeTotalTaxPayable,
      total_tax_payable_old_regime: oldRegimeTotalTaxPayable,
      // Store TDS and TCS separately as per your model schema
      tax_recovered_tds_old_regime: tdsAmountOldRegime,
      tax_recovered_tds_new_regime: tdsAmountNewRegime,
      tax_recovered_tcs_old_regime: tcsAmountOldRegime,
      tax_recovered_tcs_new_regime: tcsAmountNewRegime,
      tax_per_month_new_regime: newRegimeMonthlyTax,
      tax_per_month_old_regime: oldRegimeMonthlyTax,
      tax_difference_amount: Math.abs(taxDifference),
      tax_will_increase: taxDifference > 0,
      better_regime: betterRegime
      // Removed deduction_breakdown and tds_tcs_details as per request
    };

    // Check if tax calculation already exists for this employee and financial year
    const existingTaxCalculation = await TaxCalculation.findOne({
      where: { 
        employee_id, 
        financial_year,
        calculation_mode: useInitialDeclarations ? "Initial Declarations" : "Verified Proofs"
      }
    });

    let savedTaxCalculation;
    
    if (existingTaxCalculation) {
      // Update existing calculation
      await TaxCalculation.update(taxCalculationData, {
        where: { id: existingTaxCalculation.id }
      });
      savedTaxCalculation = await TaxCalculation.findByPk(existingTaxCalculation.id);
    } else {
      // Create new calculation
      savedTaxCalculation = await TaxCalculation.create(taxCalculationData);
    }

    return res.status(200).json({
      success: true,
      message: existingTaxCalculation 
        ? "Tax liability updated successfully" 
        : "Tax liability calculated and stored successfully",
      data: {
        calculation_id: savedTaxCalculation.id,
        employee_id,
        employee_name: `${employee.firstName} ${employee.lastName}`,
        financial_year,
        tax_computation_sheet: taxComputationSheet
      }
    });
    
  } catch (error) {
    console.error("Error calculating tax liability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate tax liability",
      error: error.message
    });
  }
};














export const getTaxCalculations = async (req, res) => {
  try {
    const { employee_id, financial_year } = req.params;
    
    // Validate that both parameters are provided
    if (!employee_id || !financial_year) {
      return res.status(400).json({
        success: false,
        message: "Both employee_id and financial_year are required"
      });
    }

    // Query with both employee_id and financial_year
    const calculations = await TaxCalculation.findAll({
      where: { 
        employee_id,
        financial_year 
      },
      order: [['created_at', 'DESC']]
    });
    
    if (!calculations || calculations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No tax calculations found for employee ${employee_id} in financial year ${financial_year}`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Tax calculations retrieved successfully",
      data: calculations
    });
  } catch (error) {
    console.error("Error retrieving tax calculations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tax calculations",
      error: error.message
    });
  }
};


const getInitialDeductions = async (employee_id, financial_year) => {
  try {
    const declaration = await InvestmentDeclaration.findOne({
      where: { employee_id, financial_year }
    });

    if (!declaration) {
      return {
        success: false,
        message: "No investment declaration found for this employee and financial year"
      };
    }

    console.log("Raw data:", declaration.dataValues);

    // Initialize the deduction object
    let deductions = {
      section_80c: {
        declared: 0,
        details: {},
        final_deduction: 0
      },
      section_80d: {
        declared: 0,
        details: {},
        final_deduction: 0
      },
      other_deductions: {
        declared: 0,
        details: {},
        final_deduction: 0
      }
    };

    // Map categories to their respective sections (same as before)
    const categoryMapping = {
      // 80C Categories
      '80C_provident_fund': 'section_80c',
      '80C_housing_loan_principal': 'section_80c',
      '80C_mutual_fund': 'section_80c',
      '80C_ppf': 'section_80c',
      '80C_nsc': 'section_80c',
      '80C_nsc_interest': 'section_80c',
      '80C_ulip': 'section_80c',
      '80C_elss': 'section_80c',
      '80C_life_insurance': 'section_80c',
      '80C_mutual_fund_pension': 'section_80c',
      '80C_tuition_fees': 'section_80c',
      '80C_infrastructure_bond': 'section_80c',
      '80C_bank_fd': 'section_80c',
      '80C_senior_citizens_savings': 'section_80c',
      '80C_post_office_time_deposit': 'section_80c',
      '80C_nps_tier1': 'section_80c',
      '80C_atal_pension': 'section_80c',
      '80C_sukanya_samriddhi': 'section_80c',
      '80CCC_pension_fund': 'section_80c',
      
      // 80D Categories
      '80D_self_spouse_children_under60': 'section_80d',
      '80D_self_spouse_children_over60': 'section_80d',
      '80D_self_spouse_children_over60_no_insurance': 'section_80d',
      '80D_parents_under60': 'section_80d',
      '80D_parents_over60': 'section_80d',
      '80D_parents_over60_no_insurance': 'section_80d',
      
      // Other Deductions
      'rent_paid': 'other_deductions',
      '80E_education_loan': 'other_deductions',
      '80U_disability_40_to_80': 'other_deductions',
      '80U_disability_above_80': 'other_deductions',
      '80DD_disability_40_to_80': 'other_deductions',
      '80DD_disability_above_80': 'other_deductions',
      '80DDB_self_dependent': 'other_deductions',
      '80TTA_savings_interest': 'other_deductions',
      '80TTB_sr_citizen_interest': 'other_deductions',
      '80CCD_salary_deduction': 'other_deductions',
      '80CCD1B_additional_nps': 'other_deductions',
      '80CCD1B_atal_pension': 'other_deductions',
      '80CCD1B_nps_vatsalya': 'other_deductions',
      '80CCD2_employer_contribution': 'other_deductions',
      '80EE_additional_housing_loan': 'other_deductions',
      '80EEA_housing_loan_benefit': 'other_deductions',
      '80EEB_electric_vehicle_loan': 'other_deductions'
    };

    let totalDeclared = 0;
    
    for (const [key, value] of Object.entries(declaration.dataValues)) {
      if (!categoryMapping[key] || value == null) {
        continue;
      }

      const amount = parseFloat(value);
      
      if (isNaN(amount) || amount === 0) {
        continue;
      }

      const section = categoryMapping[key];

      deductions[section].declared += amount;
      
      deductions[section].details[key] = amount;
      
      totalDeclared += amount;

      console.log(`Added ${key}: ${amount} to ${section}`);
    }

    deductions.section_80c.final_deduction = deductions.section_80c.declared;
    deductions.section_80d.final_deduction = deductions.section_80d.declared;
    deductions.other_deductions.final_deduction = deductions.other_deductions.declared;

    const totalEligibleDeductions = 
      deductions.section_80c.final_deduction + 
      deductions.section_80d.final_deduction + 
      deductions.other_deductions.final_deduction;

    console.log("Final deductions:", deductions);
    console.log("Total eligible:", totalEligibleDeductions);

    return {
      success: true,
      data: {
        employee_id,
        financial_year,
        initial_deductions: deductions,
        total_eligible_deductions: totalEligibleDeductions,
        total_declared: totalDeclared
      }
    };
  } catch (error) {
    console.error("Error in getInitialDeductions:", error);
    return {
      success: false,
      message: "Failed to calculate initial deductions",
      error: error.message
    };
  }
};


const getFinalDeductions = async (employee_id, financial_year) => {
  try {
    const declaration = await InvestmentDeclaration.findOne({
      where: { employee_id, financial_year }
    });

    if (!declaration) {
      return {
        success: false,
        message: "No investment declaration found for this employee and financial year"
      };
    }

    const proofs = await InvestmentProof.findAll({
      where: { employee_id, financial_year }
    });
    console.log(proofs);

    let finalDeductions = {
      total_declared: 0,
      total_approved: 0,
      total_pending: 0,
      total_rejected: 0,
      section_80c: {
        declared: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        details: {}
      },
      section_80d: {
        declared: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        details: {}
      },
      other_deductions: {
        declared: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        details: {}
      }
    };

    const categoryMapping = {
      '80C_provident_fund': 'section_80c',
      '80C_housing_loan_principal': 'section_80c',
      '80C_mutual_fund': 'section_80c',
      '80C_ppf': 'section_80c',
      '80C_nsc': 'section_80c',
      '80C_nsc_interest': 'section_80c',
      '80C_ulip': 'section_80c',
      '80C_elss': 'section_80c',
      '80C_life_insurance': 'section_80c',
      '80C_mutual_fund_pension': 'section_80c',
      '80C_tuition_fees': 'section_80c',
      '80C_infrastructure_bond': 'section_80c',
      '80C_bank_fd': 'section_80c',
      '80C_senior_citizens_savings': 'section_80c',
      '80C_post_office_time_deposit': 'section_80c',
      '80C_nps_tier1': 'section_80c',
      '80C_atal_pension': 'section_80c',
      '80C_sukanya_samriddhi': 'section_80c',
      '80CCC_pension_fund': 'section_80c',
      
      '80D_self_spouse_children_under60': 'section_80d',
      '80D_self_spouse_children_over60': 'section_80d',
      '80D_self_spouse_children_over60_no_insurance': 'section_80d',
      '80D_parents_under60': 'section_80d',
      '80D_parents_over60': 'section_80d',
      '80D_parents_over60_no_insurance': 'section_80d',
      
      'rent_paid': 'other_deductions',
      '80E_education_loan': 'other_deductions',
      '80U_disability_40_to_80': 'other_deductions',
      '80U_disability_above_80': 'other_deductions',
      '80DD_disability_40_to_80': 'other_deductions',
      '80DD_disability_above_80': 'other_deductions',
      '80DDB_self_dependent': 'other_deductions',
      '80TTA_savings_interest': 'other_deductions',
      '80TTB_sr_citizen_interest': 'other_deductions',
      '80CCD_salary_deduction': 'other_deductions',
      '80CCD1B_additional_nps': 'other_deductions',
      '80CCD1B_atal_pension': 'other_deductions',
      '80CCD1B_nps_vatsalya': 'other_deductions',
      '80CCD2_employer_contribution': 'other_deductions',
      '80EE_additional_housing_loan': 'other_deductions',
      '80EEA_housing_loan_benefit': 'other_deductions',
      '80EEB_electric_vehicle_loan': 'other_deductions'
    };

    for (const [key, value] of Object.entries(declaration.dataValues)) {
      if (!categoryMapping[key] || typeof value !== 'number' || value === 0) {
        continue;
      }

      const section = categoryMapping[key];
      const category = key;
      const declaredAmount = parseFloat(value);

      finalDeductions.total_declared += declaredAmount;
      finalDeductions[section].declared += declaredAmount;

      if (!finalDeductions[section].details[category]) {
        finalDeductions[section].details[category] = {
          declared: declaredAmount,
          approved: 0,
          pending: 0,
          rejected: 0
        };
      } else {
        finalDeductions[section].details[category].declared = declaredAmount;
      }
    }

    const proofsByCategory = {};
    for (const proof of proofs) {
      const category = proof.category;
      if (!categoryMapping[category]) continue;
      
      if (!proofsByCategory[category]) {
        proofsByCategory[category] = {
          Approved: [],
          Pending: [],
          Rejected: []
        };
      }
      
      proofsByCategory[category][proof.status].push(proof);
    }

    for (const [category, statusGroups] of Object.entries(proofsByCategory)) {
      if (!categoryMapping[category]) continue;
      
      const section = categoryMapping[category];
      const declaredAmount = declaration.dataValues[category] ? parseFloat(declaration.dataValues[category]) : 0;
      
      if (!finalDeductions[section].details[category]) {
        finalDeductions[section].details[category] = {
          declared: declaredAmount,
          approved: 0,
          pending: 0,
          rejected: 0
        };
      }
      
      if (statusGroups.Approved.length > 0) {
        finalDeductions[section].approved += declaredAmount;
        finalDeductions.total_approved += declaredAmount;
        finalDeductions[section].details[category].approved = declaredAmount;
      } else if (statusGroups.Pending.length > 0) {
        finalDeductions[section].pending += declaredAmount;
        finalDeductions.total_pending += declaredAmount;
        finalDeductions[section].details[category].pending = declaredAmount;
      } else if (statusGroups.Rejected.length > 0) {
        finalDeductions[section].rejected += declaredAmount;
        finalDeductions.total_rejected += declaredAmount;
        finalDeductions[section].details[category].rejected = declaredAmount;
      }
    }


    const section80CLimit = 150000;
    if (finalDeductions.section_80c.approved > section80CLimit) {
      finalDeductions.section_80c.approved = section80CLimit;
    }
    

    const unverifiedDeductions = finalDeductions.total_declared - 
                                (finalDeductions.total_approved + 
                                 finalDeductions.total_pending + 
                                 finalDeductions.total_rejected);
                                 
    console.log(unverifiedDeductions);
    console.log(finalDeductions);

    return {
      success: true,
      data: {
        employee_id,
        financial_year,
        final_deductions: finalDeductions,
        unverified_deductions: unverifiedDeductions
      }
    };
  } catch (error) {
    console.error("Error in getFinalDeductions:", error);
    return {
      success: false,
      message: "Failed to calculate final deductions",
      error: error.message
    };
  }
};


const calculateTaxBasedOnNewRegimeSlabs = (taxableIncome) => {
  console.log(taxableIncome);
  let tax = 0;
  
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 600000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 900000) {
    tax = 15000 + (taxableIncome - 600000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 45000 + (taxableIncome - 900000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 90000 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 150000 + (taxableIncome - 1500000) * 0.30;
  }
  console.log("tax",tax);
  
  return tax;
};

const calculateTaxBasedOnOldRegimeSlabs = (taxableIncome) => {
  let tax = 0;
  
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.2;
  } else {
    tax = 112500 + (taxableIncome - 1000000) * 0.3;
  }
  
  return tax;
};