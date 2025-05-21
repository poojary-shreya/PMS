import { EmployeeTDS, getFinancialYear } from '../model/tdsmodel.js';
import Employee from '../model/addpersonalmodel.js';
import { sequelize } from '../config/db.js';

export const getAllEmployeeTds = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
   
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const tdsEntries = await EmployeeTDS.findAll({
      where: { employee_id },
      order: [['transactionDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: tdsEntries.length,
      data: tdsEntries
    });
  } catch (error) {
    console.error('Error fetching employee TDS entries:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const getEmployeeTdsById = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tdsEntry = await EmployeeTDS.findOne({
      where: { id, employee_id }
    });
    
    if (!tdsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TDS entry not found for this employee'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: tdsEntry
    });
  } catch (error) {
    console.error('Error fetching employee TDS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createEmployeeTds = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const {
      section,
      deductorName,
      deductorAddress,
      deductorTan,
      taxDeducted,
      incomeReceived,
      transactionDate
    } = req.body;
    
 
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
  
    if (!section || !deductorName || !deductorTan || !taxDeducted) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: section, deductorName, deductorTan, taxDeducted'
      });
    }
    
    const financialYear = getFinancialYear(transactionDate);
    
    const newTdsEntry = await EmployeeTDS.create({
      employee_id,
      section,
      deductorName,
      deductorAddress,
      deductorTan,
      taxDeducted,
      incomeReceived: incomeReceived || 0,
      transactionDate,
      financialYear
    });
    
    return res.status(201).json({
      success: true,
      message: 'TDS entry created successfully for employee',
      data: newTdsEntry
    });
  } catch (error) {
    console.error('Error creating employee TDS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const updateEmployeeTds = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tdsEntry = await EmployeeTDS.findOne({
      where: { id, employee_id }
    });
    
    if (!tdsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TDS entry not found for this employee'
      });
    }
    
    const {
      section,
      deductorName,
      deductorAddress,
      deductorTan,
      taxDeducted,
      incomeReceived,
      transactionDate
    } = req.body;
    

    const financialYear = transactionDate ? getFinancialYear(transactionDate) : tdsEntry.financialYear;
    
    const updatedTdsEntry = await tdsEntry.update({
      section: section || tdsEntry.section,
      deductorName: deductorName || tdsEntry.deductorName,
      deductorAddress: deductorAddress !== undefined ? deductorAddress : tdsEntry.deductorAddress,
      deductorTan: deductorTan || tdsEntry.deductorTan,
      taxDeducted: taxDeducted !== undefined ? taxDeducted : tdsEntry.taxDeducted,
      incomeReceived: incomeReceived !== undefined ? incomeReceived : tdsEntry.incomeReceived,
      transactionDate: transactionDate || tdsEntry.transactionDate,
      financialYear
    });
    
    return res.status(200).json({
      success: true,
      message: 'TDS entry updated successfully for employee',
      data: updatedTdsEntry
    });
  } catch (error) {
    console.error('Error updating employee TDS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const deleteEmployeeTds = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tdsEntry = await EmployeeTDS.findOne({
      where: { id, employee_id }
    });
    
    if (!tdsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TDS entry not found for this employee'
      });
    }
    
    await tdsEntry.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'TDS entry deleted successfully for employee'
    });
  } catch (error) {
    console.error('Error deleting employee TDS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const getEmployeeTdsSummary = async (req, res) => {
  try {
    const { employee_id } = req.params;
    

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
 
    const { financialYear } = req.query;
    
    const whereClause = { employee_id };
    if (financialYear) {
      whereClause.financialYear = financialYear;
    }
    
    const tdsEntries = await EmployeeTDS.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('taxDeducted')), 'totalTaxDeducted'],
        [sequelize.fn('SUM', sequelize.col('incomeReceived')), 'totalIncomeReceived'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalEntries'],
        [sequelize.fn('MIN', sequelize.col('transactionDate')), 'firstTransactionDate'],
        [sequelize.fn('MAX', sequelize.col('transactionDate')), 'lastTransactionDate']
      ],
      raw: true
    });
    
 
    let financialYearSummary = [];
    if (!financialYear) {
      financialYearSummary = await EmployeeTDS.findAll({
        where: { employee_id },
        attributes: [
          'financialYear',
          [sequelize.fn('SUM', sequelize.col('taxDeducted')), 'yearTaxDeducted'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'yearEntries']
        ],
        group: ['financialYear'],
        order: [['financialYear', 'DESC']],
        raw: true
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        totalTaxDeducted: parseFloat(tdsEntries[0].totalTaxDeducted || 0),
        totalIncomeReceived: parseFloat(tdsEntries[0].totalIncomeReceived || 0),
        totalEntries: parseInt(tdsEntries[0].totalEntries || 0),
        firstTransactionDate: tdsEntries[0].firstTransactionDate,
        lastTransactionDate: tdsEntries[0].lastTransactionDate,
        financialYearSummary: financialYear ? [] : financialYearSummary
      }
    });
  } catch (error) {
    console.error('Error fetching employee TDS summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};