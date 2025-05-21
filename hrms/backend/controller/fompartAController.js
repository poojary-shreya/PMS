import Employee from "../model/addpersonalmodel.js";
import Company from "../model/companyDetailsmodel.js";
import Payslip from "../model/payslipmodel.js";
import TaxForm from "../model/formpartAmodel.js";




export const createTaxForm = async (req, res) => {
  try {
    let { 
      employee_id, 
      employer_name, 
      employer_address, 
      employer_pan, 
      cit,
      assessment_year, 
      financial_year_from, 
      financial_year_to 
    } = req.body;

    if (!employee_id || !assessment_year || !financial_year_from || !financial_year_to) {
      return res.status(400).json({ 
        success: false, 
        message: "Required fields are missing" 
      });
    }

  
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: "Employee not found" 
      });
    }

   
    const company = await Company.findByPk(employee.company_registration_no);
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: "Company details not found" 
      });
    }
    const tan =company.tan

    const generateCertificateNumber = () => {
      const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
      }
      return result;
    };
    
 
    const certificateNumber = generateCertificateNumber();


    const fromDate = new Date(financial_year_from);
    const toDate = new Date(financial_year_to);
    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth() + 1; 
    const toYear = toDate.getFullYear();
    const toMonth = toDate.getMonth() + 1;
   
    
    
    fromDate.setDate(1);
    
    const lastDay = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate();
    if (toDate.getDate() !== lastDay) {
      toDate.setDate(lastDay);
    }
    

    financial_year_from = fromDate.toISOString();
    financial_year_to = toDate.toISOString();

  
    let q1AmountPaid = 0, q1TaxDeducted = 0;
    let q2AmountPaid = 0, q2TaxDeducted = 0;
    let q3AmountPaid = 0, q3TaxDeducted = 0;
    let q4AmountPaid = 0, q4TaxDeducted = 0;
    
    const payslips = await Payslip.findAll({
      where: { employee_id },
      attributes: ['month', 'year', 'gross_salary', 'total_tax', 'net_salary'],
    });
    console.log(payslips);
    
    console.log(`Found ${payslips.length} payslips for employee ${employee_id}`);
    
 
    const getIndianFinancialQuarter = (month) => {
      if (month >= 4 && month <= 6) return 1;        
      else if (month >= 7 && month <= 9) return 2;   
      else if (month >= 10 && month <= 12) return 3; 
      else return 4;                                 
    };

   
    payslips.forEach(payslip => {
      const payslipYear = parseInt(payslip.year);

      const monthNameToNumber = {
        January: 1, February: 2, March: 3,
        April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9,
        October: 10, November: 11, December: 12
      };
    
      const payslipMonth = monthNameToNumber[payslip.month] || parseInt(payslip.month); 
    

      if (isNaN(payslipMonth) || isNaN(payslipYear)) {
        console.log(`Invalid payslip month/year for payslip:`, payslip);
        return;
      }
      
    
      const isInFinancialYear = (
    
        (payslipYear === fromYear && payslipMonth >= fromMonth && fromMonth === 4) ||
      
        (payslipYear === toYear && payslipMonth <= toMonth && toMonth === 3) ||
      
        (payslipYear > fromYear && payslipYear < toYear)
      );
      
      if (isInFinancialYear) {
        console.log(`Processing payslip: ${payslipMonth}/${payslipYear}, salary: ${payslip.gross_salary}, Tax: ${payslip.total_tax}`);
        
        const quarter = getIndianFinancialQuarter(payslipMonth);
        const net_salary = parseFloat(payslip.net_salary) || 0;
        const totalTax = parseFloat(payslip.total_tax) || 0;
        
        switch (quarter) {
          case 1:
            q1AmountPaid += net_salary;
            q1TaxDeducted += totalTax;
            console.log(`Added to Q1: ${net_salary} salary, ${totalTax} tax`);
            break;
          case 2:
            q2AmountPaid += net_salary;
            q2TaxDeducted += totalTax;
            console.log(`Added to Q2: ${net_salary} salary, ${totalTax} tax`);
            break;
          case 3:
            q3AmountPaid += net_salary;
            q3TaxDeducted += totalTax;
            console.log(`Added to Q3: ${net_salary} salary, ${totalTax} tax`);
            break;
          case 4:
            q4AmountPaid += net_salary;
            q4TaxDeducted += totalTax;
            console.log(`Added to Q4: ${net_salary} salary, ${totalTax} tax`);
            break;
        }
      } else {
        console.log(`Skipping payslip: ${payslipMonth}/${payslipYear} - outside financial year range`);
      }
    });
    

    const totalAmountPaid = q1AmountPaid + q2AmountPaid + q3AmountPaid + q4AmountPaid;
    const totalTaxDeducted = q1TaxDeducted + q2TaxDeducted + q3TaxDeducted + q4TaxDeducted;


    const taxForm = await TaxForm.create({
      employee_id,
      certifiacte_no: certificateNumber,
      cit,
      employer_name: employer_name ,
      employer_address: employer_address ,
      employer_pan,
      employer_tan:tan,
      assessment_year,
      financial_year_from,
      financial_year_to,
      q1_amount_paid: q1AmountPaid,
      q1_tax_deducted: q1TaxDeducted,
      q2_amount_paid: q2AmountPaid,
      q2_tax_deducted: q2TaxDeducted,
      q3_amount_paid: q3AmountPaid,
      q3_tax_deducted: q3TaxDeducted,
      q4_amount_paid: q4AmountPaid,
      q4_tax_deducted: q4TaxDeducted,
      total_amount_paid: totalAmountPaid,
      total_tax_deducted: totalTaxDeducted
    });

    return res.status(201).json({
      success: true,
      message: "Tax form created successfully",
      data: taxForm
    });
  } catch (error) {
    console.error("Error creating tax form:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating tax form",
      error: error.message
    });
  }
};
export const getEmployeeForTaxForm = async (req, res) => {
    try {
      const { employee_id } = req.params;
  
      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required"
        });
      }
  
      const employee = await Employee.findByPk(employee_id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });
      }
  

      const company = await Company.findByPk(employee.company_registration_no);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company details not found"
        });
      }
  
      return res.status(200).json({
        success: true,
        data: {
          employee: {
            id: employee.employee_id,
            name: `${employee.firstName} ${employee.lastName}`,
            address: `${employee.houseNumber}, ${employee.street}, ${employee.area}, ${employee.city} - ${employee.pinCode}`,
            panNumber: employee.panNumber
          },
          company: {
            name: company.companyname,
            tan: company.tan,
            address: company.address
          }
        }
      });
    } catch (error) {
      console.error("Error fetching employee for tax form:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching employee details",
        error: error.message
      });
    }
  };