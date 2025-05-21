import HRACalculation from "../model/RentModel.js";
import AllowanceCalculation from "../model/allowanceCalModel.js";

export const getEmployeeAllowances = async (employeeId, financialYear) => {
    try {
      const hraData = await HRACalculation.findOne({
        where: {
          employee_id: employeeId,
          financial_year: financialYear
        },
        attributes: ["claimed_hra"]
      });
      console.log(hraData);
  
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


  export const getAllowanceData = async (req, res) => {
    try {
      const { employee_id, financial_year } = req.query;
      
      if (!employee_id || !financial_year) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee ID and financial year are required' 
        });
      }
      
      const allowanceData = await getEmployeeAllowances(employee_id, financial_year);
      
      return res.status(200).json({
        success: true,
        data: allowanceData
      });
      
    } catch (error) {
      console.error('Error fetching employee allowances:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching allowance data',
        error: error.message
      });
    }
  };