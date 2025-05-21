import Taxform from "../model/formpartAmodel.js";
import Rent from "../model/RentModel.js";
import AllowanceCalculation from "../model/allowanceCalModel.js";
import TaxCalculation from "../model/TaxCalculationModel.js";
import InvestmentProof from "../model/InvestmentProofModel.js";
import Form16B from "../model/formpartBmodel.js";
import InvestmentDeclaration from "../model/investmentDecModel.js";
import Payroll from "../model/uploadsalrymodel.js";
const fetchTaxCalculationData = async (employee_id, financialYear) => {
  try {
    const taxCalculation = await TaxCalculation.findOne({
      where: {
        employee_id,
        financial_year: financialYear,
        calculation_mode: 'Verified Proofs'
      }
    });
    
    return taxCalculation;
  } catch (error) {
    console.error("Error fetching tax calculation data:", error);
    return null;
  }
};


const fetchHraExemption = async (employee_id, financialYear) => {
  try {
    const rentClaims = await Rent.findAll({
      where: {
        employee_id,
        financial_year: financialYear
      }
    });
    
    return rentClaims.reduce((total, claim) => 
      total + (parseFloat(claim.claimed_hra) || 0), 0);
  } catch (error) {
    console.error("Error fetching HRA exemption:", error);
    return 0;
  }
};


const fetchAllowanceExemptions = async (employee_id, financialYear) => {
  try {
    const allowanceCalculations = await AllowanceCalculation.findAll({
      where: {
        employee_id,
        financial_year: financialYear
      }
    });
    
    let medicalExemption = 0;
    let newspaperExemption = 0;
    let dressExemption = 0;
    let otherExemption = 0;
    
    allowanceCalculations.forEach(calculation => {
      const claimedAmount = parseFloat(calculation.claimed_amount) || 0;
      
      switch (calculation.purpose) {
        case 'medical_allowance':
          medicalExemption += claimedAmount;
          break;
        case 'newspaper_allowance':
          newspaperExemption += claimedAmount;
          break;
        case 'dress_allowance':
          dressExemption += claimedAmount;
          break;
        case 'other_allowance':
          otherExemption += claimedAmount;
          break;
      }
    });
    
    return {
      medical_exemption: medicalExemption,
      newspaper_exemption: newspaperExemption,
      dress_exemption: dressExemption,
      other_exemption: otherExemption
    };
  } catch (error) {
    console.error("Error fetching allowance exemptions:", error);
    return {
      medical_exemption: 0,
      newspaper_exemption: 0,
      dress_exemption: 0,
      other_exemption: 0
    };
  }
};

const fetchInvestmentProofs = async (employee_id, financialYear, exemptions) => {
  try {
    console.log(`Fetching investment proofs for employee: ${employee_id}, FY: ${financialYear}`);
    
    // Get approved investment proofs - these only contain category information, no amounts
    const approvedInvestments = await InvestmentProof.findAll({
      where: {
        employee_id,
        financial_year: financialYear,
        status: 'Approved'
      },
      raw: true
    });
    
    // Extract just the approved categories
    const approvedCategories = approvedInvestments.map(inv => inv.category);
    console.log(`Approved categories:`, approvedCategories);
    
    // Get the declaration data which contains the amount values
    const declaration = await InvestmentDeclaration.findOne({
      where: {
        employee_id,
        financial_year: financialYear
      },
      raw: true
    });
    
    if (declaration) {
      console.log(`Found declaration for employee: ${employee_id}, FY: ${financialYear}`);
    } else {
      console.log(`No declaration found for employee: ${employee_id}, FY: ${financialYear}`);
      // Return default values if no declaration exists
      return {
        standard_deduction: 50000,
        professional_tax: 2400,
        hra_exemption: exemptions.hra_exemption || 0,
        medical_exemption: exemptions.medical_exemption || 0,
        newspaper_exemption: exemptions.newspaper_exemption || 0,
        dress_exemption: exemptions.dress_exemption || 0,
        other_exemption: exemptions.other_exemption || 0
      };
    }
    
    // Initialize investment values with default values
    const investmentValues = {
      salary_income: 0,
      standard_deduction: 50000,
      professional_tax: 2400, 
      
      '80D_self_spouse_children_under60': 0,
      '80D_self_spouse_children_over60': 0,
      '80D_parents_under60': 0,
      '80D_parents_over60': 0,
      '80D_self_spouse_children_over60_no_insurance': 0,
      '80D_parents_over60_no_insurance': 0,
      '80E_education_loan': 0,
      '80U_disability_40_to_80': 0,
      '80U_disability_above_80': 0,
      '80DD_disability_40_to_80': 0,
      '80DD_disability_above_80': 0,
      '80DDB_self_dependent': 0,
      '80TTA_savings_interest': 0,
      '80TTB_sr_citizen_interest': 0,
      '80CCD_salary_deduction': 0,
      '80CCD1B_additional_nps': 0,
      '80CCD1B_atal_pension': 0,
      '80CCD1B_nps_vatsalya': 0,
      '80CCD2_employer_contribution': 0,
      '80EE_additional_housing_loan': 0,
      '80EEA_housing_loan_benefit': 0,
      '80EEB_electric_vehicle_loan': 0,
      '80CCC_pension_fund': 0,
      '80C_provident_fund': 0,
      '80C_housing_loan_principal': 0,
      '80C_mutual_fund': 0,
      '80C_ppf': 0,
      '80C_nsc': 0,
      '80C_nsc_interest': 0,
      '80C_ulip': 0,
      '80C_elss': 0,
      '80C_life_insurance': 0,
      '80C_mutual_fund_pension': 0,
      '80C_tuition_fees': 0,
      '80C_infrastructure_bond': 0,
      '80C_bank_fd': 0,
      '80C_senior_citizens_savings': 0,
      '80C_post_office_time_deposit': 0,
      '80C_nps_tier1': 0,
      '80C_atal_pension': 0,
      '80C_sukanya_samriddhi': 0,
      
      hra_exemption: exemptions.hra_exemption || 0,
      medical_exemption: exemptions.medical_exemption || 0,
      newspaper_exemption: exemptions.newspaper_exemption || 0,
      dress_exemption: exemptions.dress_exemption || 0,
      other_exemption: exemptions.other_exemption || 0
    };
    
    // Process each field in investmentValues
    for (const fieldName in investmentValues) {
      // Skip fields that aren't tax deductions
      if (!fieldName.startsWith('80') && 
          fieldName !== 'professional_tax' && 
          fieldName !== 'standard_deduction') {
        continue;
      }
      
      // Check if this field is directly approved
      if (approvedCategories.includes(fieldName)) {
        // If it's approved and exists in declaration, use declaration value
        if (declaration[fieldName] !== undefined) {
          investmentValues[fieldName] = parseFloat(declaration[fieldName]) || 0;
          console.log(`Set ${fieldName} = ${investmentValues[fieldName]} (direct match)`);
        }
      }
    }
    
    // For debugging, show all values that were set
    console.log("Final investment values:");
    for (const [field, value] of Object.entries(investmentValues)) {
      if (value > 0) {
        console.log(`${field}: ${value}`);
      }
    }
    
    return investmentValues;
    
  } catch (error) {
    console.error("Error fetching investment proofs:", error);
    console.error(error.stack);
    return null;
  }
};

const fetchSalaryDetails = async (employee_id, financialYear) => {
  try {
    const salaryDetails = await Salary.findOne({
      where: {
        employee_id,
        financial_year: financialYear
      }
    });
    
    return salaryDetails ? parseFloat(salaryDetails.total_salary) || 0 : 0;
  } catch (error) {
    console.error("Error fetching salary details:", error);
    return 0;
  }
};



const fetchPayrollData = async (employee_id) => {
  try {

    
    const payrollData = await Payroll.findOne({
      where: { employee_id },
      attributes: [
        'base_salary',
        'medical_allowance',
        'newspaper_allowance',
        'dress_allowance',
        'other_allowance',
        'gross_salary',
        'hra'
      ]
    });
    
    if (!payrollData) {
      console.error(`Payroll data not found for employee: ${employee_id}`);
      return null;
    }
    
    // Return the required payroll components
    return {
      base_salary: payrollData.base_salary,
      medical_allowance: payrollData.medical_allowance,
      newspaper_allowance: payrollData.newspaper_allowance,
      dress_allowance: payrollData.dress_allowance,
      other_allowance: payrollData.other_allowance,
      gross_salary: payrollData.gross_salary,
      hra: payrollData.hra
    };
    
  } catch (error) {
    console.error(`Error fetching payroll data: ${error.message}`);
    return null;
  }
};






const calculateTotalDeductions = (investmentValues) => {
  const total80C = Math.min(150000, Object.keys(investmentValues)
    .filter(key => key.startsWith('80C_'))
    .reduce((sum, key) => sum + investmentValues[key], 0));
    
  return total80C + 
    investmentValues.standard_deduction +
    investmentValues.professional_tax +
    investmentValues['80CCC_pension_fund'] +
    investmentValues['80CCD_salary_deduction'] +
    investmentValues['80CCD1B_additional_nps'] +
    investmentValues['80CCD1B_atal_pension'] +
    investmentValues['80CCD1B_nps_vatsalya'] +
    investmentValues['80CCD2_employer_contribution'] +
    investmentValues['80D_self_spouse_children_under60'] +
    investmentValues['80D_self_spouse_children_over60'] +
    investmentValues['80D_self_spouse_children_over60_no_insurance'] +
    investmentValues['80D_parents_under60'] +
    investmentValues['80D_parents_over60'] +
    investmentValues['80D_parents_over60_no_insurance'] +
    investmentValues['80E_education_loan'] +
    investmentValues['80U_disability_40_to_80'] +
    investmentValues['80U_disability_above_80'] +
    investmentValues['80DD_disability_40_to_80'] +
    investmentValues['80DD_disability_above_80'] +
    investmentValues['80DDB_self_dependent'] +
    investmentValues['80TTA_savings_interest'] +
    investmentValues['80TTB_sr_citizen_interest'] +
    investmentValues['80EE_additional_housing_loan'] +
    investmentValues['80EEA_housing_loan_benefit'] +
    investmentValues['80EEB_electric_vehicle_loan'];
};


export const generateForm16B = async (req, res) => {
  try {
    const { employee_id, certificate_no } = req.body;
    
    if (!employee_id || !certificate_no) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }
    
    const taxForm = await Taxform.findOne({
      where: { certifiacte_no: certificate_no }
    });
    
    if (!taxForm) {
      return res.status(404).json({
        success: false,
        message: "Tax Form not found"
      });
    }

    const payrollData = await fetchPayrollData(employee_id);
    
    if (!payrollData) {
      return res.status(404).json({
        success: false,
        message: "Payroll data not found for the employee"
      });
    }

    
    const financialYearFrom = new Date(taxForm.financial_year_from);
    const financialYearTo = new Date(taxForm.financial_year_to);
    
    const financialYear = `${financialYearFrom.getFullYear()}-${financialYearTo.getFullYear()}`;
    console.log(financialYear);
    
    const taxCalculation = await fetchTaxCalculationData(employee_id, financialYear);
    
    if (!taxCalculation) {
      return res.status(404).json({
        success: false,
        message: "Tax calculation data not found"
      });
    }
    
    const betterRegime = taxCalculation.better_regime;
    console.log(`Better regime for ${employee_id}: ${betterRegime}`);
    
    const grossSalary = betterRegime === 'Old Regime' 
      ? taxCalculation.gross_salary_old_regime 
      : taxCalculation.gross_salary_new_regime;
    
    const taxableIncome = betterRegime === 'Old Regime'
      ? taxCalculation.taxable_income_old_regime
      : taxCalculation.taxable_income_new_regime;
    
    const taxPayable = betterRegime === 'Old Regime'
      ? taxCalculation.tax_payable_on_total_income_old_regime
      : taxCalculation.tax_payable_on_total_income_new_regime;
    
    const educationCess = betterRegime === 'Old Regime'
      ? taxCalculation.cess_old_regime
      : taxCalculation.cess_new_regime;
    
    const totalTax = betterRegime === 'Old Regime'
      ? taxCalculation.total_tax_payable_old_regime
      : taxCalculation.total_tax_payable_new_regime;
    
    // Step 3: Fetch HRA exemption
    const hraExemption = await fetchHraExemption(employee_id, financialYear);
    console.log(`HRA Exemption for ${employee_id}: ${hraExemption}`);
    
    // Step 4: Fetch allowance exemptions
    const allowanceExemptions = await fetchAllowanceExemptions(employee_id, financialYear);
    console.log(`Allowance exemptions for ${employee_id}:`, allowanceExemptions);
    
    // Prepare exemptions object
    const exemptions = {
      hra_exemption: hraExemption,
      ...allowanceExemptions
    };
    
    // Step 5: Fetch approved investment proofs
    const investmentValues = await fetchInvestmentProofs(employee_id, financialYear, exemptions);
    
    if (!investmentValues) {
      return res.status(404).json({
        success: false,
        message: "Failed to fetch investment proofs"
      });
    }
    
    // Step 6: Update salary income
    investmentValues.salary_income = grossSalary;
    
    // Step 7: Calculate total deductions
    const totalDeductions = calculateTotalDeductions(investmentValues);
    
    // Step 8: Create Form 16 Part B with all collected data
    const form16PartB = await Form16B.create({
      employee_id,
      certifiacte_no: certificate_no,
      
      // Add salary and exemptions
      salary_income: grossSalary,
      hra_exemption: exemptions.hra_exemption,
      medical_exemption: exemptions.medical_exemption,
      newspaper_exemption: exemptions.newspaper_exemption,
      dress_exemption: exemptions.dress_exemption,
      other_exemption: exemptions.other_exemption,
      
      // Add all investment values
      ...investmentValues,
      
      // Add calculated totals and tax data from TaxCalculation table
      total_deductions: totalDeductions,
      gross_total_income: grossSalary ,
      taxable_income: taxableIncome,
      tax_payable: taxPayable,
      education_cess: educationCess,
      total_tax: totalTax,
      better_regime: betterRegime,
      
      // Set status
      status: 'draft'
    });
    
    return res.status(201).json({
      success: true,
      message: "Form 16 Part B created successfully",
      data: {
        form16_partB: form16PartB,
        exemption_details: {
          hra_exemption: exemptions.hra_exemption,
          medical_exemption: exemptions.medical_exemption,
          newspaper_exemption: exemptions.newspaper_exemption,
          dress_exemption: exemptions.dress_exemption,
          other_exemption: exemptions.other_exemption
        },
        payrollDetails:{
          base_salary: payrollData.base_salary,
          medical_allowance: payrollData.medical_allowance,
          newspaper_allowance: payrollData.newspaper_allowance,
          dress_allowance: payrollData.dress_allowance,
          other_allowance: payrollData.other_allowance,
          gross_salary: payrollData.gross_salary,
          hra: payrollData.hra,
        },
        tax_details: {
          gross_total_income: grossSalary - (
            exemptions.hra_exemption + 
            exemptions.medical_exemption + 
            exemptions.newspaper_exemption + 
            exemptions.dress_exemption + 
            exemptions.other_exemption
          ),
          total_deductions: totalDeductions,
          taxable_income: taxableIncome,
          tax_payable: taxPayable,
          education_cess: educationCess,
          total_tax: totalTax,
          better_regime: betterRegime
        }
      }
    });
    
  } catch (error) {
    console.error("Error creating Form 16 Part B:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Form 16 Part B",
      error: error.message
    });
  }
};