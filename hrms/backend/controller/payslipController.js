import Payslip from "../model/payslipmodel.js";
import Payroll from "../model/payrolltaxmodel.js";
import PayrollTax from "../model/uploadsalrymodel.js"
import Employee from "../model/addpersonalmodel.js";
import Financial from "../model/addfinancialmodel.js"; 
import Company from "../model/companyDetailsmodel.js";
import HRACalculation from "../model/RentModel.js";
import AllowanceCalculation from "../model/allowanceCalModel.js";
import TaxCalculation from "../model/TaxCalculationModel.js";
import { Op } from "sequelize";


export const getEmployeeId=async(req,res)=>{
  try{
    const payroll=await Payroll.findByPk(req.params.payroll_id);
    if(!payroll){
      return res.status(404).json({ message: "Payroll not found" });

    }
    res.json({ employee_id: payroll.employee_id });

  }catch(err){
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: "Server error" });
  }
}


// export const generatePayslip = async (req, res) => {
//   try {
//     let { employee_id, month, year } = req.body;
  
//     const payroll = await Payroll.findOne({
//       where: { employee_id: employee_id },
//       include: [{
//         model: Employee,
//         as: "personal",
//         attributes: ["employee_id", "firstName", "lastName", "phoneNumber"]
//       }],
//     });
    
//     if (!payroll) {
//       return res.status(404).json({ message: `Payroll record not found for payroll_id: ${employee_id}` });
//     }
    
//     const financialDetails = await Financial.findOne({
//       where: { employee_id: employee_id },
//       attributes: ["bankName", "accountNumber", "ifscCode", "department"]
//     });
    
//     if (!financialDetails) {
//       return res.status(404).json({ message: "Financial details not found for this employee" });
//     }
    
//     const { 
//       base_salary, 
//       hra, 
//       pf, 
//       professional_tax, 
//       medical_allowance, 
//       newspaper_allowance, 
//       dress_allowance, 
//       other_allowance, 
//       variable_salary = 0,
//       joining_bonus = 0,
//       joining_bonus_paid = false 
//     } = payroll;
    
//     console.log("Original joining_bonus value:", joining_bonus);
//     console.log("Original joining_bonus_paid status:", joining_bonus_paid);
    
   
//     const shouldIncludeJoiningBonus = joining_bonus > 0 && !joining_bonus_paid;
   
//     const monthly_variable = variable_salary / 12;

//     const joiningBonusForThisMonth = shouldIncludeJoiningBonus ? joining_bonus : 0;
//     console.log("Joining bonus amount for this month:", joiningBonusForThisMonth);
    

//     const annual_gross_salary = base_salary + hra + medical_allowance + newspaper_allowance + dress_allowance + other_allowance + variable_salary;
//     console.log("Annual gross salary (without bonus):", annual_gross_salary);
    
//     const monthly_gross_salary = annual_gross_salary / 12 + joiningBonusForThisMonth;
//     console.log("Monthly gross salary (with bonus if applicable):", monthly_gross_salary);
  
//     const payrollTax = await PayrollTax.findOne({ where: { employee_id } });
//     console.log(payrollTax);
    
//     const total_tax = payroll?.total_tax || 0;
//     console.log(total_tax);
//     const total_deductions = payroll ? (
//       payroll.standard_deduction + 
//       payroll.section80C_investment + 
//       payroll.section80CCC_investment + 
//       payroll.otherInvestment + 
//       payroll.section80D + 
//       payroll.section80CCD_1B +
//       payroll.section80CCD_2 + 
//       payroll.section24_b + 
//       payroll.section80E + 
//       payroll.section80EEB
//     ) : 0;
//     console.log("totaldeduction:", total_deductions);
    
//     const monthlyPf = pf / 12;
//     const monthly_deductions = total_deductions / 12;
//     const monthly_tax = total_tax / 12;
    
 
//     const monthly_net_salary = monthly_gross_salary - monthly_tax - professional_tax - monthlyPf;
    
//     const employeeDetails = {
//       employee_id: payroll.personal?.employee_id,
//       firstName: payroll.personal?.firstName,
//       lastName: payroll.personal?.lastName,
//     };
    
    
//     const payslipData = {
//       employee_id: payroll.employee_id,
//       month,
//       year,
//       base_salary: base_salary / 12,
//       hra: hra / 12,
//       pf: monthlyPf,
//       professional_tax,
//       medical_allowance: medical_allowance / 12,
//       newspaper_allowance: newspaper_allowance / 12,
//       dress_allowance: dress_allowance / 12,
//       other_allowance: other_allowance / 12,
//       variable_salary: monthly_variable,             
//       joining_bonus: joiningBonusForThisMonth,      
//       gross_salary: monthly_gross_salary,
//       total_deductions: monthly_deductions,
//       total_tax: monthly_tax,
//       net_salary: monthly_net_salary,
//     };
    
//     console.log("Payslip data joining_bonus:", payslipData.joining_bonus);
    
//     const existingPayslip = await Payslip.findOne({
//       where: { employee_id: payroll.employee_id, month, year },
//     });
    
//     let payslip;
 
//     const shouldUpdateJoiningBonusPaid = joiningBonusForThisMonth > 0;
    
//     if (existingPayslip) {
//       await existingPayslip.update(payslipData);
//       payslip = existingPayslip;
      
     
//       if (shouldUpdateJoiningBonusPaid) {
//         console.log("Updating joining_bonus_paid to true");
//         await payroll.update({ joining_bonus_paid: true });
        
  
//         if (payrollTax) {
//           await payrollTax.update({ joining_bonus_paid: true });
//         }
//       }
      
//       res.status(200).json({ 
//         message: "Payslip updated successfully", 
//         payslip,
//         employeeDetails,
//         financialDetails 
//       });
//     } else {
//       payslip = await Payslip.create(payslipData);
      
   
//       if (shouldUpdateJoiningBonusPaid) {
//         console.log("Updating joining_bonus_paid to true");
//         await payroll.update({ joining_bonus_paid: true });
        

//         if (payrollTax) {
//           await payrollTax.update({ joining_bonus_paid: true });
//         }
//       }
      
//       res.status(201).json({ 
//         message: "Payslip generated successfully", 
//         payslip,
//         employeeDetails,
//         financialDetails 
//       });
//     }
//   } catch (error) {
//     console.error("Error generating payslip:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const getPayslipByEmployee = async (req, res) => {
  try {
    const {month, year } = req.params;
    const employee_id=req.session.employee_id;
    console.log("Session object:", req.session);
    console.log("Employee ID from session:", req.session.employee_id);
    console.log(employee_id||"N/A");
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({ message: "Unauthorized: No employee session found" });
    }

    const loggedInEmail = req.session.email;
    const employee = await Employee.findOne({ 
      where: { employee_id: employee_id } 
    });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
 
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
    const Month = month.trim();
    const Year = Number(year); 

    console.log("Received Params:", { employee_id, Month, Year });

      const months = ["April", "May", "June", "July", "August", "September", 
                      "October", "November", "December", "January", "February", "March"];
      const index = months.indexOf(Month);

      if (index === -1) return res.status(400).json({ message: "Invalid month provided" });


    let financialYearStart = Year - (Month === 'January' || Month === 'February' || Month === 'March' ? 1 : 0);
    console.log(financialYearStart);
let financialYearEnd = financialYearStart + 1;
console.log(financialYearEnd);


    const requiredMonths = months.slice(0, index + 1);
    console.log(`Fetching payslips from Financial Year: ${financialYearStart} - ${financialYearEnd}`);
    console.log("Months included:", requiredMonths);


    const payslip = await Payslip.findOne({
      where: { employee_id, month: Month, year: Year },
      include: [
        { 
          model: Employee, 
          as: "personal", 
          include: [
            { 
              model: Company, 
              as: "company", 
              attributes: ["companyname", "tan", "companyLogo","address","branchLocation"] 
            }
          ]
        }
      ],
    });

    if (!payslip) {
      return res.status(404).json({ message: "No payslip found for this employee, month, and year" });
    }

    const financialDetails = await Financial.findOne({
      where: { employee_id: employee_id },
      attributes: ["bankName", "accountNumber", "ifscCode", "department"]
    });

    if (!financialDetails) {
      return res.status(404).json({ message: "Financial details not found for this employee" });
    }
    const pfDetails=await PayrollTax.findOne({
      where:{employee_id:employee_id},
      attributes:["pfno","uan"]
    });
    if(!pfDetails){
      return res.status(404).json({message:"pfno and UAN details not found for this employee"})
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;



    const previousPayslips = await Payslip.findAll({
      where: {
        employee_id: employee_id,
        [Op.or]: [
          { 
            year: financialYearStart, 
            month: { [Op.in]: months.slice(0, index+1) } 
          },
          { 
            year: Year, 
            month: { [Op.in]: months.slice(9, index + 1) } 
          }
        ]
      }
    });
    console.log("Actual Payslips Retrieved:");
previousPayslips.forEach(p => console.log(`Year: ${p.year}, Month: ${p.month}`));
console.log("Total payslips fetched:", previousPayslips.length);

    let cumulativeBaseSalary = 0;
    let cumulativeHRA = 0;
    let cumulativePF=0;
    let cumulativeProfessionalTax = 0;
    let cumulativeMedicalAllowance = 0;
    let cumulativeNewspaperAllowance = 0;
    let cumulativeDressAllowance = 0;
    let cumulativeOtherAllowance = 0;
    let cumulativeGrossSalary = 0;
    let cumulativeDeductions = 0;
    let cumulativeTax = 0;
    let cumulativeNetSalary = 0;
    let cumulativeVariableSalary = 0;
let cumulativeJoiningBonus = 0;
let cumulativeMonthlyTax = 0;

    previousPayslips.forEach(slip => {
      cumulativeBaseSalary += slip.base_salary;
      cumulativeHRA += slip.hra;
      cumulativePF += slip.pf;
      cumulativeProfessionalTax += slip.professional_tax;
      cumulativeMedicalAllowance += slip.medical_allowance;
      cumulativeNewspaperAllowance += slip.newspaper_allowance;
      cumulativeDressAllowance += slip.dress_allowance;
      cumulativeOtherAllowance += slip.other_allowance;
      cumulativeGrossSalary += slip.gross_salary;
      cumulativeDeductions += slip.total_deductions;
      cumulativeTax += slip.total_tax;
      cumulativeNetSalary += slip.net_salary;
      cumulativeVariableSalary += slip.variable_salary || 0;
      cumulativeJoiningBonus += slip.joining_bonus || 0;
      cumulativeMonthlyTax += slip.monthly_tax || 0;
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        ...payslip.toJSON(),
        financial_details:{
          bankName: financialDetails.bankName,
          accountNumber: financialDetails.accountNumber,
          ifscCode: financialDetails.ifscCode,
          department: financialDetails.department
        },
        pfDetails:{
          pfno: pfDetails.pfno,
          UAN: pfDetails.uan
        },
        company_details: {
          companyName: payslip.personal?.company?.companyname || null,
          tan: payslip.personal?.company?.tan || null,
          address:payslip.personal?.company?.address||null,
          branchLocation:payslip.personal?.company?.branchLocation || null,  
          companyLogo: payslip.personal?.company?.companyLogo 
        ? `${baseUrl}/uploads/${payslip.personal.company.companyLogo}` 
        : null
        },
        cumulative_salary_details: {
          base_salary: { current: payslip.base_salary, cumulative: cumulativeBaseSalary },
          hra: { current: payslip.hra, cumulative: cumulativeHRA },
          pf:{current:payslip.pf, cumulative: cumulativePF},
          professional_tax: { current: payslip.professional_tax, cumulative: cumulativeProfessionalTax },
          medical_allowance: { current: payslip.medical_allowance, cumulative: cumulativeMedicalAllowance },
          newspaper_allowance: { current: payslip.newspaper_allowance, cumulative: cumulativeNewspaperAllowance },
          dress_allowance: { current: payslip.dress_allowance, cumulative: cumulativeDressAllowance },
          other_allowance: { current: payslip.other_allowance, cumulative: cumulativeOtherAllowance },
          gross_salary: { current: payslip.gross_salary, cumulative: cumulativeGrossSalary },
          total_deductions: { current: payslip.total_deductions, cumulative: cumulativeDeductions },
          total_tax: { current: payslip.total_tax, cumulative: cumulativeTax },
          net_salary: { current: payslip.net_salary, cumulative: cumulativeNetSalary },
          variable_salary: { current: payslip.variable_salary || 0, cumulative: cumulativeVariableSalary },
joining_bonus: { current: payslip.joining_bonus || 0, cumulative: cumulativeJoiningBonus },
monthly_tax: { current: payslip.monthly_tax || 0, cumulative: cumulativeMonthlyTax },
        }
      }
    });
    console.log("Fetching payslips from:", financialYearStart, "to", financialYearEnd);
console.log("Total payslips fetched:", previousPayslips.length);

  } catch (error) {
    console.error("Error fetching payslip:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


  export const getEmployeesByTax = async (req, res) => {
    try {
      const { month,year} = req.params;
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) ||5;
      const offset = (page - 1) * limit;
  
      if (!month) {
        return res.status(400).json({ message: "Month is required" });
      }
      
      const employees = await Payslip.findAll({
        where: { month,year },
        include: [
          {
            model: Employee,
            as:"personal",
            
            attributes: ["employee_id", "firstName", "lastName", "panNumber"],
            include: [
              {
                model: Company,
                as: "company", 
                attributes: ["tan","address","branchLocation","companyname"], 
              }
            ],
          },
        ],
        attributes: ["payroll_id","monthly_tax"],
        order: [["monthly_tax", "DESC"]],
        offset,
        limit,
      });
      const totalEmployees = await Payslip.count({
        where: { month, year },
      });
      const totalPages = Math.ceil(totalEmployees / limit);

  
      if (!employees.length) {
        return res.status(404).json({ message: "No employees found for the given month" });
      }

      const formattedEmployees = await Promise.all(
        employees.map(async (payslip) => {
          const employee_id = payslip.personal.employee_id;
          const companyDetails = payslip.personal.company
          ? {
              TAN: payslip.personal.company.tan,
              address: payslip.personal.company.address,
              branchLocation: payslip.personal.company.branchLocation,
              companyname: payslip.personal.company.companyname,
            }
          : null;
  
          const pfDetails = await PayrollTax.findOne({
            where: { employee_id },
            attributes: ["pfno", "uan"],
          });
      return {
        payroll_id: payslip.payroll_id,
        employee_id,
        firstname: payslip.personal.firstName,
        lastname: payslip.personal.lastName,
        panNumber: payslip.personal.panNumber,
        total_tax: payslip.monthly_tax,
        year,
        companyDetails,
        pfDetails: pfDetails
          ? {
              pfno: pfDetails.pfno,
              UAN: pfDetails.uan,
            }
          : null, 
      };
    })
  );
      res.status(200).json({ success: true,
         data: formattedEmployees,
        totalEmployees,
        currentPage:parseInt(page),
        totalPages
        });
    } catch (error) {
      console.error("Error fetching employees by tax:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };


  export const getYearlyTaxByEmployee = async (req, res) => {
    try {
      const { employee_id, year } = req.params; 
  
      if (!year) {
        return res.status(400).json({ message: "Year is required" });
      }
  
    
      const employee = await Employee.findOne({
        where: { employee_id },
        attributes: ["firstName", "lastName", "panNumber", ],
        include: [
          {
            model: Company,
            as: "company",
            attributes: ["tan","address","branchLocation","companyname"], 
          }
        ],

      });
  
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const companyDetails = employee.company
      ? {
          TAN: employee.company.tan,
          address: employee.company.address,
          branchLocation: employee.company.branchLocation,
          companyname:employee.company.companyname,
        }
      : null;
  
      const payslip = await Payslip.findOne({
        where: { employee_id },
        attributes: ["monthly_tax"],
      });
  
      if (!payslip) {
        return res.status(404).json({ message: `No payroll record found for ${year}` });
      }
  
      const totalYearlyTax = payslip.total_tax;
  
      const payslips = await Payslip.findAll({
        where: { employee_id, year },
        attributes: ["month", "monthly_tax"],
      });
  
      const monthOrder = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
      };
  
      const sortedPayslips = payslips.sort((a, b) => {
        return monthOrder[a.month] - monthOrder[b.month];
      });
  
      const monthlyTaxDetails = sortedPayslips.map(payslip => ({
        month: payslip.month,
        totalTax: payslip.monthly_tax,
      }));
      const pfDetails=await PayrollTax.findOne({
        where:{employee_id:employee_id},
        attributes:["pfno","uan",]
      });
      if(!pfDetails){
        return res.status(404).json({message:"pfno and UAN details not found for this employee"})
      }
  
      const taxPaidTillNow = monthlyTaxDetails.reduce((sum, payslip) => sum + payslip.totalTax, 0);
  
      const remainingTax = totalYearlyTax - taxPaidTillNow;
  
      res.status(200).json({
        success: true,
        employee_id,
        year, 
        firstname: employee.firstName,
        lastname: employee.lastName,
        panNumber: employee.panNumber,
        totalYearlyTax,
        taxPaidTillNow,
        remainingTax,
        monthlyTaxDetails,
        pfDetails:{
          pfno: pfDetails.pfno,
          UAN: pfDetails.uan,
        },
        companyDetails,

      });
  
    } catch (error) {
      console.error("Error fetching yearly tax:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };


export const getMonthlyTaxByEmployee = async (req, res) => {
  try {
    const { employee_id, year, month } = req.params;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    const employee = await Employee.findOne({
      where: { employee_id },
      attributes: ["firstName", "lastName", "panNumber"],
      include: [
        {
          model: Company,
          as: "company", 
          attributes: ["tan","address","branchLocation","companyname"],
        }
      ],

    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const companyDetails = employee.company
    ? {
        TAN: employee.company.tan,
        address: employee.company.address,
        branchLocation: employee.company.branchLocation,
        companyname:employee.company.companyname,
      }
    : null;

    
    const payslip = await Payslip.findOne({
      where: { employee_id, year, month },
      attributes: ["monthly_tax"],
    });

    if (!payslip) {
      return res.status(404).json({
        message: `No payroll record found for ${month} ${year}`,
      });
    }

    const pfDetails = await PayrollTax.findOne({
      where: { employee_id },
      attributes: ["pfno", "uan"],
    });

    res.status(200).json({
      success: true,
      employee_id,
      firstname: employee.firstName,
      lastname: employee.lastName,
      panNumber: employee.panNumber,
      month,
      year,
      totalTaxPaid: payslip.monthly_tax,
      pfDetails: pfDetails
        ? {
            pfno: pfDetails.pfno,
            UAN: pfDetails.uan,
          }
        : { message: "PF, TAN, and UAN details not found" },
        companyDetails,

    });
  } catch (error) {
    console.error("Error fetching monthly tax by employee:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export const getTotalTaxCompany = async (req, res) => {
  try {
    const { year } = req.params;
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) ||12; 

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    const startYear = parseInt(year);
    const endYear = startYear + 1;

    const financialYearMonths = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];

    const offset = (page - 1) * limit; 

    const availableRecords = await Payslip.findAll({
                where: {
                    [Op.or]: [
                        { year: startYear, month: { [Op.in]: financialYearMonths.slice(0, 9) } }, 
                        { year: endYear, month: { [Op.in]: financialYearMonths.slice(9) } }       
                    ],
                },
                order: [["year", "DESC"], ["month", "DESC"]], 
            });
            availableRecords.forEach(rec=>{
              console.log(`fetched payslip=month: ${rec.month}, year :${rec.year}`);
            })
      
            if (!availableRecords || availableRecords.length === 0) {
                return res.status(404).json({ message: "No data available for this financial year" });
            }


                  const lastAvailableRecord = availableRecords[0]; 
      const latestMonth = lastAvailableRecord.month;
      const latestYear = lastAvailableRecord.year;

      
      let validMonthsStartYear = [];
let validMonthsEndYear = [];
let reachedLatestMonth = false;

for (let month of financialYearMonths) {
    if (month === latestMonth) {
        reachedLatestMonth = true;
    }

    if (reachedLatestMonth) {
        if (["April", "May", "June", "July", "August", "September", "October", "November", "December"].includes(month)) {
            validMonthsStartYear.push(month);
        } else {
            validMonthsEndYear.push(month);
        }
    }
}

if (!validMonthsStartYear.includes(latestMonth)) {
    validMonthsStartYear.push(latestMonth);
}


console.log(`Fetching Payslips for: Year ${startYear}:`, financialYearMonths.slice(0, 9));
console.log(`Fetching Payslips for: Year ${endYear}:`, financialYearMonths.slice(9));
console.log("Fetching Payslips for:");
      

    const totalCompanyTax = await Payslip.sum("monthly_tax", {
      where: {
        [Op.or]: [
          { year: startYear, month: { [Op.in]: financialYearMonths.slice(0, 9) } },
          { year: endYear, month: { [Op.in]: financialYearMonths.slice(9) } },
        ],
      },
    });

    const employeeTaxDetails = await Payslip.findAll({
      where: {
        [Op.or]: [
          { year: startYear, month: { [Op.in]: financialYearMonths.slice(0, 9) } },
          { year: endYear, month: { [Op.in]: financialYearMonths.slice(9) } },
        ],
      },
      attributes: ["monthly_tax", "month", "year"],
      include: [
        {
          model: Employee,
          as: "personal",
          attributes: ["employee_id", "firstName", "lastName", "panNumber"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["tan", "address", "branchLocation"],
            },
          ],
        },
      ],
     
      order: [["year", "DESC"], ["month", "DESC"]],
    });
          console.log(`total Emplyee fetched: ${employeeTaxDetails.length}`);


    const totalPages = Math.ceil(availableRecords / limit);

    const employeeWithPFDetails = await Promise.all(
      employeeTaxDetails.map(async (record) => {
        const employee = record.personal;
        if (!employee) return record;

        const pfDetails = await PayrollTax.findOne({
          where: { employee_id: employee.employee_id },
          attributes: ["pfno", "uan"],
        });

        return {
          ...record.toJSON(),
          personal: {
            ...employee.toJSON(),
            pfDetails: pfDetails || { message: "PF and UAN details not found" },
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      financialYear: `${startYear}-${endYear}`,
      totalCompanyTax: totalCompanyTax || 0,
      employees: employeeWithPFDetails || [],
      pagination: {
        currentPage: page,
        totalPages,
        availableRecords,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching total company tax and employee details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};






// Helper function to determine financial year based on month and year
const determineFinancialYear = (month, year) => {
  const monthNames = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12
  };

  let monthNum;

  if (typeof month === 'string') {
    // Handle both numeric string and name string
    const lowerMonth = month.toLowerCase();
    monthNum = monthNames[lowerMonth] || parseInt(month); // will work for "04", "April"
  } else {
    monthNum = month;
  }

  const yearNum = parseInt(year);

  if (monthNum >= 4 && monthNum <= 12) {
    return `${yearNum}-${yearNum + 1}`;
  } else {
    return `${yearNum - 1}-${yearNum}`;
  }
};


// Helper function to get employee allowances
export const getEmployeeAllowances = async (employeeId, financialYear) => {
  try {
    const hraData = await HRACalculation.findOne({
      where: {
        employee_id: employeeId,
        financial_year: financialYear
      },
      attributes: ["claimed_hra"]
    });
    
    const allowances = await AllowanceCalculation.findAll({
      where: {
        employee_id: employeeId,
        financial_year: financialYear
      },
      attributes: ['purpose', 'claimed_amount']
    });
    
    const result = {
      employee_id: employeeId,
      financial_year: financialYear,
      hra: hraData ? hraData.claimed_hra : 0
    };
    
    const allowanceTypes = ['medical', 'newspaper', 'dress', 'other'];
    
    allowanceTypes.forEach(type => {
      result[`${type}_allowance`] = 0;
    });
    
    allowances.forEach(allowance => {
      const purpose = allowance.purpose.toLowerCase();
      
      for (const type of allowanceTypes) {
        if (purpose.includes(type)) {
          result[`${type}_allowance`] = allowance.claimed_amount;
          break;
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching employee allowances:", error);
    throw new Error("Failed to fetch employee allowances");
  }
};

// Function to fetch tax data for an employee
const getEmployeeTaxData = async (employeeId, financialYear) => {
  try {
    const taxCalculation = await TaxCalculation.findOne({
      where: { 
        employee_id: employeeId, 
        financial_year: financialYear,
        // Prioritize verified proofs over initial declarations if available
        calculation_mode: "Verified Proofs" 
      }
    });

    // If no verified proof calculation found, try to get the initial declaration
    if (!taxCalculation) {
      const initialTaxCalculation = await TaxCalculation.findOne({
        where: { 
          employee_id: employeeId, 
          financial_year: financialYear,
          calculation_mode: "Initial Declarations" 
        }
      });
      
      return initialTaxCalculation;
    }
    
    return taxCalculation;
  } catch (error) {
    console.error("Error fetching tax data:", error);
    throw new Error("Failed to fetch tax data");
  }
};

export const generatePayslip = async (req, res) => {
  try {
    let { employee_id, month, year } = req.body;
    
    // Validate inputs
    if (!employee_id || !month || !year) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID, month, and year are required" 
      });
    }

    // Determine the financial year based on month and year
    const financialYear = determineFinancialYear(month, year);
    console.log(`Generating payslip for financial year: ${financialYear}`);
    
    // Fetch payroll information
    const payroll = await PayrollTax.findOne({
      where: { employee_id: employee_id },
      include: [{
        model: Employee,
        as: "personal",
        attributes: ["employee_id", "firstName", "lastName", "phoneNumber"]
      }],
    });
    
    if (!payroll) {
      return res.status(404).json({ 
        success: false,
        message: `Payroll record not found for employee_id: ${employee_id}` 
      });
    }
    
    // Fetch financial details
    const financialDetails = await Financial.findOne({
      where: { employee_id: employee_id },
      attributes: ["bankName", "accountNumber", "ifscCode", "department"]
    });
    
    if (!financialDetails) {
      return res.status(404).json({ 
        success: false,
        message: "Financial details not found for this employee" 
      });
    }
    
    // Get the tax data for this employee and financial year
    const taxData = await getEmployeeTaxData(employee_id, financialYear);
    
    // Determine which tax regime to use
    let taxRegime = "old_regime";
    let monthlyTax = 0;
    
    if (taxData) {
      // Use the better regime identified in tax calculation
      taxRegime = taxData.better_regime === "Old Regime" ? "old_regime" : "new_regime";
      // Get monthly tax based on selected regime
      monthlyTax = taxRegime === "old_regime" 
        ? taxData.tax_per_month_old_regime 
        : taxData.tax_per_month_new_regime;
    }
    
    // Get claimed allowances from tax declarations if available
    let claimedAllowances = null;
    
    try {
      claimedAllowances = await getEmployeeAllowances(employee_id, financialYear);
      console.log("Claimed allowances:", claimedAllowances);
    } catch (error) {
      console.warn("Could not fetch claimed allowances:", error.message);
      // Continue without claimed allowances - will use zeros
      claimedAllowances = {
        hra: 0,
        medical_allowance: 0,
        newspaper_allowance: 0,
        dress_allowance: 0,
        other_allowance: 0
      };
    }
    
    // Extract salary components from payroll
    const { 
      base_salary, 
      pf, 
      professional_tax,
      variable_salary = 0,
      joining_bonus = 0,
      joining_bonus_paid = false,
      variable_salary_paid = false  // Added variable_salary_paid status check
    } = payroll;
    
    console.log("Original joining_bonus value:", joining_bonus);
    console.log("Original joining_bonus_paid status:", joining_bonus_paid);
    console.log("Original variable_salary value:", variable_salary);
    console.log("Original variable_salary_paid status:", variable_salary_paid);
    
    // Handle joining bonus - only include if not already paid
    const shouldIncludeJoiningBonus = joining_bonus > 0 && !joining_bonus_paid;
    const joiningBonusForThisMonth = shouldIncludeJoiningBonus ? joining_bonus : 0;
    console.log("Joining bonus amount for this month:", joiningBonusForThisMonth);
    
    // Handle variable salary - only include if not already paid
    const shouldIncludeVariableSalary = variable_salary > 0 && !variable_salary_paid;
    const variableSalaryForThisMonth = shouldIncludeVariableSalary ? variable_salary : 0;
    console.log("Variable salary amount for this month:", variableSalaryForThisMonth);

    // Get allowance values from claimed allowances
    const hra = claimedAllowances.hra || 0;
    const medical_allowance = claimedAllowances.medical_allowance || 0;
    const newspaper_allowance = claimedAllowances.newspaper_allowance || 0;
    const dress_allowance = claimedAllowances.dress_allowance || 0;
    const other_allowance = claimedAllowances.other_allowance || 0;

    // Calculate annual and monthly gross salary using claimed allowances
    // Don't include variable_salary here since we're handling it separately now
    const annual_gross_salary = base_salary + hra + medical_allowance + newspaper_allowance + 
                               dress_allowance + other_allowance;
    console.log("Annual gross salary (without bonus and variable):", annual_gross_salary);
    
    // Calculate monthly base gross (without special payments)
    const monthly_base_gross = annual_gross_salary / 12;
    
    // Add special payments to get total monthly gross
    const monthly_gross_salary = monthly_base_gross + joiningBonusForThisMonth + variableSalaryForThisMonth;
    console.log("Monthly gross salary (with bonus and variable if applicable):", monthly_gross_salary);
    
    // Calculate monthly deductions  
    const monthlyPf = pf / 12;
    
    // Use tax data if available, otherwise calculate net salary based on payroll data
    let monthly_net_salary;
    
    if (taxData) {
      // Use tax calculation from the tax system
      monthly_net_salary = monthly_gross_salary - monthlyTax - professional_tax - monthlyPf;
    } else {
      // Fallback if tax data not available
      const estimated_monthly_tax = 0; // You might want to add a simple estimation here
      monthly_net_salary = monthly_gross_salary - professional_tax - monthlyPf - estimated_monthly_tax;
    }
    
    // Create employee details object
    const employeeDetails = {
      employee_id: payroll.personal?.employee_id,
      firstName: payroll.personal?.firstName,
      lastName: payroll.personal?.lastName,
    };
    
    // Create payslip data object
    const payslipData = {
      employee_id: payroll.employee_id,
      month,
      year,
      financial_year: financialYear,
      base_salary: base_salary / 12,
      hra: hra / 12, // Using claimed HRA
      pf: monthlyPf,
      professional_tax,
      medical_allowance: medical_allowance / 12, // Using claimed medical allowance
      newspaper_allowance: newspaper_allowance / 12, // Using claimed newspaper allowance
      dress_allowance: dress_allowance / 12, // Using claimed dress allowance
      other_allowance: other_allowance / 12, // Using claimed other allowance
      variable_salary: variableSalaryForThisMonth, // Full amount if not yet paid
      joining_bonus: joiningBonusForThisMonth, // Full amount if not yet paid
      gross_salary: monthly_gross_salary,
      tax_regime: taxRegime,
      monthly_tax: monthlyTax,
      net_salary: monthly_net_salary,
    };
    
    console.log("Payslip data joining_bonus:", payslipData.joining_bonus);
    console.log("Payslip data variable_salary:", payslipData.variable_salary);
    console.log("Tax regime used:", payslipData.tax_regime);
    console.log("Monthly tax applied:", payslipData.monthly_tax);
    
    // Check if payslip already exists
    const existingPayslip = await Payslip.findOne({
      where: { employee_id: payroll.employee_id, month, year },
    });
    
    let payslip;
    const shouldUpdateJoiningBonusPaid = joiningBonusForThisMonth > 0;
    const shouldUpdateVariableSalaryPaid = variableSalaryForThisMonth > 0;
    
    // Update or create payslip record
    if (existingPayslip) {
      await existingPayslip.update(payslipData);
      payslip = existingPayslip;
      
      // Update status flags if needed
      const payrollUpdateData = {};
      
      if (shouldUpdateJoiningBonusPaid) {
        console.log("Updating joining_bonus_paid to true");
        payrollUpdateData.joining_bonus_paid = true;
      }
      
      if (shouldUpdateVariableSalaryPaid) {
        console.log("Updating variable_salary_paid to true");
        payrollUpdateData.variable_salary_paid = true;
      }
      
      // Only update if there are changes to make
      if (Object.keys(payrollUpdateData).length > 0) {
        await payroll.update(payrollUpdateData);
        
        // Also update in payroll tax if it exists
        const payrollTax = await PayrollTax.findOne({ where: { employee_id } });
        if (payrollTax) {
          await payrollTax.update(payrollUpdateData);
        }
      }
      
      res.status(200).json({ 
        success: true,
        message: "Payslip updated successfully", 
        payslip,
        employeeDetails,
        financialDetails,
        tax_details: taxData ? {
          regime: taxRegime,
          financial_year: financialYear,
          monthly_tax: monthlyTax
        } : null
      });
    } else {
      payslip = await Payslip.create(payslipData);
      
      // Update status flags if needed
      const payrollUpdateData = {};
      
      if (shouldUpdateJoiningBonusPaid) {
        console.log("Updating joining_bonus_paid to true");
        payrollUpdateData.joining_bonus_paid = true;
      }
      
      if (shouldUpdateVariableSalaryPaid) {
        console.log("Updating variable_salary_paid to true");
        payrollUpdateData.variable_salary_paid = true;
      }
      
      // Only update if there are changes to make
      if (Object.keys(payrollUpdateData).length > 0) {
        await payroll.update(payrollUpdateData);
        
        // Also update in payroll tax if it exists
        const payrollTax = await PayrollTax.findOne({ where: { employee_id } });
        if (payrollTax) {
          await payrollTax.update(payrollUpdateData);
        }
      }
      
      res.status(201).json({ 
        success: true,
        message: "Payslip generated successfully", 
        payslip,
        employeeDetails,
        financialDetails,
        tax_details: taxData ? {
          regime: taxRegime,
          financial_year: financialYear,
          monthly_tax: monthlyTax
        } : null
      });
    }
  } catch (error) {
    console.error("Error generating payslip:", error);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



// export const generatePayslip = async (req, res) => {
//   try {
//     let { employee_id, month, year } = req.body;
    
//     // Validate inputs
//     if (!employee_id || !month || !year) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Employee ID, month, and year are required" 
//       });
//     }

//     // Determine the financial year based on month and year
//     const financialYear = determineFinancialYear(month, year);
//     console.log(`Generating payslip for financial year: ${financialYear}`);
    
//     // Fetch payroll information
//     const payroll = await PayrollTax.findOne({
//       where: { employee_id: employee_id },
//       include: [{
//         model: Employee,
//         as: "personal",
//         attributes: ["employee_id", "firstName", "lastName", "phoneNumber"]
//       }],
//     });
    
//     if (!payroll) {
//       return res.status(404).json({ 
//         success: false,
//         message: `Payroll record not found for employee_id: ${employee_id}` 
//       });
//     }
    
//     // Fetch financial details
//     const financialDetails = await Financial.findOne({
//       where: { employee_id: employee_id },
//       attributes: ["bankName", "accountNumber", "ifscCode", "department"]
//     });
    
//     if (!financialDetails) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Financial details not found for this employee" 
//       });
//     }
    
//     // Get the tax data for this employee and financial year
//     const taxData = await getEmployeeTaxData(employee_id, financialYear);
    
//     // Determine which tax regime to use
//     let taxRegime = "old_regime";
//     let monthlyTax = 0;
    
//     if (taxData) {
//       // Use the better regime identified in tax calculation
//       taxRegime = taxData.better_regime === "Old Regime" ? "old_regime" : "new_regime";
//       // Get monthly tax based on selected regime
//       monthlyTax = taxRegime === "old_regime" 
//         ? taxData.tax_per_month_old_regime 
//         : taxData.tax_per_month_new_regime;
//     }
    
//     // Get claimed allowances from tax declarations if available
//     let claimedAllowances = null;
    
//     try {
//       claimedAllowances = await getEmployeeAllowances(employee_id, financialYear);
//       console.log("Claimed allowances:", claimedAllowances);
//     } catch (error) {
//       console.warn("Could not fetch claimed allowances:", error.message);
//       // Continue without claimed allowances - will use zeros
//       claimedAllowances = {
//         hra: 0,
//         medical_allowance: 0,
//         newspaper_allowance: 0,
//         dress_allowance: 0,
//         other_allowance: 0
//       };
//     }
    
//     // Extract only base salary, pf, variable salary and joining bonus from payroll
//     const { 
//       base_salary, 
//       pf, 
//       professional_tax,
//       variable_salary = 0,
//       joining_bonus = 0,
//       joining_bonus_paid = false 
//     } = payroll;
    
//     console.log("Original joining_bonus value:", joining_bonus);
//     console.log("Original joining_bonus_paid status:", joining_bonus_paid);
    
//     // Handle joining bonus - only include if not already paid
//     const shouldIncludeJoiningBonus = joining_bonus > 0 && !joining_bonus_paid;
//     const joiningBonusForThisMonth = shouldIncludeJoiningBonus ? joining_bonus : 0;
//     console.log("Joining bonus amount for this month:", joiningBonusForThisMonth);
    
//     // Calculate monthly variable pay
//     const monthly_variable = variable_salary / 12;

//     // Get allowance values from claimed allowances
//     const hra = claimedAllowances.hra || 0;
//     const medical_allowance = claimedAllowances.medical_allowance || 0;
//     const newspaper_allowance = claimedAllowances.newspaper_allowance || 0;
//     const dress_allowance = claimedAllowances.dress_allowance || 0;
//     const other_allowance = claimedAllowances.other_allowance || 0;

//     // Calculate annual and monthly gross salary using claimed allowances
//     const annual_gross_salary = base_salary + hra + medical_allowance + newspaper_allowance + 
//                                dress_allowance + other_allowance + variable_salary;
//     console.log("Annual gross salary (without bonus):", annual_gross_salary);
    
//     const monthly_gross_salary = annual_gross_salary / 12 + joiningBonusForThisMonth;
//     console.log("Monthly gross salary (with bonus if applicable):", monthly_gross_salary);
    
//     // Calculate monthly deductions
//     console.log("pf",pf)
//     const monthlyPf = pf / 12;
    
//     // Use tax data if available, otherwise calculate net salary based on payroll data
//     let monthly_net_salary;
    
//     if (taxData) {
//       // Use tax calculation from the tax system
//       monthly_net_salary = monthly_gross_salary - monthlyTax - professional_tax - monthlyPf;
//     } else {
//       // Fallback if tax data not available
//       const estimated_monthly_tax = 0; // You might want to add a simple estimation here
//       monthly_net_salary = monthly_gross_salary - professional_tax - monthlyPf - estimated_monthly_tax;
//     }
    
//     // Create employee details object
//     const employeeDetails = {
//       employee_id: payroll.personal?.employee_id,
//       firstName: payroll.personal?.firstName,
//       lastName: payroll.personal?.lastName,
//     };
    
//     // Create payslip data object
//     const payslipData = {
//       employee_id: payroll.employee_id,
//       month,
//       year,
//       financial_year: financialYear,
//       base_salary: base_salary / 12,
//       hra: hra / 12, // Using claimed HRA
//       pf: monthlyPf,
//       professional_tax,
//       medical_allowance: medical_allowance / 12, // Using claimed medical allowance
//       newspaper_allowance: newspaper_allowance / 12, // Using claimed newspaper allowance
//       dress_allowance: dress_allowance / 12, // Using claimed dress allowance
//       other_allowance: other_allowance / 12, // Using claimed other allowance
//       variable_salary: monthly_variable,             
//       joining_bonus: joiningBonusForThisMonth,      
//       gross_salary: monthly_gross_salary,
//       tax_regime: taxRegime,
//       monthly_tax: monthlyTax,
//       net_salary: monthly_net_salary,
//     };
    
//     console.log("Payslip data joining_bonus:", payslipData.joining_bonus);
//     console.log("Tax regime used:", payslipData.tax_regime);
//     console.log("Monthly tax applied:", payslipData.monthly_tax);
    
//     // Check if payslip already exists
//     const existingPayslip = await Payslip.findOne({
//       where: { employee_id: payroll.employee_id, month, year },
//     });
    
//     let payslip;
//     const shouldUpdateJoiningBonusPaid = joiningBonusForThisMonth > 0;
    
//     // Update or create payslip record
//     if (existingPayslip) {
//       await existingPayslip.update(payslipData);
//       payslip = existingPayslip;
      
//       if (shouldUpdateJoiningBonusPaid) {
//         console.log("Updating joining_bonus_paid to true");
//         await payroll.update({ joining_bonus_paid: true });
        
//         // Also update in payroll tax if it exists
//         const payrollTax = await PayrollTax.findOne({ where: { employee_id } });
//         if (payrollTax) {
//           await payrollTax.update({ joining_bonus_paid: true });
//         }
//       }
      
//       res.status(200).json({ 
//         success: true,
//         message: "Payslip updated successfully", 
//         payslip,
//         employeeDetails,
//         financialDetails,
//         tax_details: taxData ? {
//           regime: taxRegime,
//           financial_year: financialYear,
//           monthly_tax: monthlyTax
//         } : null
//       });
//     } else {
//       payslip = await Payslip.create(payslipData);
      
//       if (shouldUpdateJoiningBonusPaid) {
//         console.log("Updating joining_bonus_paid to true");
//         await payroll.update({ joining_bonus_paid: true });
        
//         // Also update in payroll tax if it exists
//         const payrollTax = await PayrollTax.findOne({ where: { employee_id } });
//         if (payrollTax) {
//           await payrollTax.update({ joining_bonus_paid: true });
//         }
//       }
      
//       res.status(201).json({ 
//         success: true,
//         message: "Payslip generated successfully", 
//         payslip,
//         employeeDetails,
//         financialDetails,
//         tax_details: taxData ? {
//           regime: taxRegime,
//           financial_year: financialYear,
//           monthly_tax: monthlyTax
//         } : null
//       });
//     }
//   } catch (error) {
//     console.error("Error generating payslip:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };