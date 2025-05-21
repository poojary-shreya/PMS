import { EmployeeTCS } from '../model/tcsmodel.js';
import Employee from '../model/addpersonalmodel.js';
import { sequelize } from '../config/db.js';


const getFinancialYear = (transactionDate) => {
  if (!transactionDate) return '';
  
  const date = new Date(transactionDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; 
  

  if (month >= 1 && month <= 3) {
    return `${year-1}-${year}`;
  } else {
    return `${year}-${year+1}`;
  }
};

export const getAllEmployeeTcs = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
 
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    const tcsEntries = await EmployeeTCS.findAll({
      where: { employee_id },
      order: [['transactionDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: tcsEntries.length,
      data: tcsEntries
    });
  } catch (error) {
    console.error('Error fetching employee TCS entries:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const getEmployeeTcsById = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tcsEntry = await EmployeeTCS.findOne({
      where: { id, employee_id }
    });
    
    if (!tcsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TCS entry not found for this employee'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: tcsEntry
    });
  } catch (error) {
    console.error('Error fetching employee TCS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const createEmployeeTcs = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const {
      section,
      collectorName,
      collectorAddress,
      collectorTan,
      taxCollected,
      transactionDate
    } = req.body;
    

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
  
    if (!section || !collectorName || !collectorTan || !taxCollected) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: section, collectorName, collectorTan, taxCollected'
      });
    }
    

    const financialYear = getFinancialYear(transactionDate);
    
    const newTcsEntry = await EmployeeTCS.create({
      employee_id,
      section,
      collectorName,
      collectorAddress,
      collectorTan,
      taxCollected,
      transactionDate,
      financialYear
    });
    
    return res.status(201).json({
      success: true,
      message: 'TCS entry created successfully for employee',
      data: newTcsEntry
    });
  } catch (error) {
    console.error('Error creating employee TCS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const updateEmployeeTcs = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tcsEntry = await EmployeeTCS.findOne({
      where: { id, employee_id }
    });
    
    if (!tcsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TCS entry not found for this employee'
      });
    }
    
    const {
      section,
      collectorName,
      collectorAddress,
      collectorTan,
      taxCollected,
      transactionDate
    } = req.body;
    

    const financialYear = transactionDate ? getFinancialYear(transactionDate) : tcsEntry.financialYear;
    
    const updatedTcsEntry = await tcsEntry.update({
      section: section || tcsEntry.section,
      collectorName: collectorName || tcsEntry.collectorName,
      collectorAddress: collectorAddress !== undefined ? collectorAddress : tcsEntry.collectorAddress,
      collectorTan: collectorTan || tcsEntry.collectorTan,
      taxCollected: taxCollected !== undefined ? taxCollected : tcsEntry.taxCollected,
      transactionDate: transactionDate || tcsEntry.transactionDate,
      financialYear
    });
    
    return res.status(200).json({
      success: true,
      message: 'TCS entry updated successfully for employee',
      data: updatedTcsEntry
    });
  } catch (error) {
    console.error('Error updating employee TCS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const deleteEmployeeTcs = async (req, res) => {
  try {
    const { employee_id, id } = req.params;
    
    const tcsEntry = await EmployeeTCS.findOne({
      where: { id, employee_id }
    });
    
    if (!tcsEntry) {
      return res.status(404).json({
        success: false,
        message: 'TCS entry not found for this employee'
      });
    }
    
    await tcsEntry.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'TCS entry deleted successfully for employee'
    });
  } catch (error) {
    console.error('Error deleting employee TCS entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


export const getEmployeeTcsSummary = async (req, res) => {
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
    
    const tcsEntries = await EmployeeTCS.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('taxCollected')), 'totalTaxCollected'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalEntries'],
        [sequelize.fn('MIN', sequelize.col('transactionDate')), 'firstTransactionDate'],
        [sequelize.fn('MAX', sequelize.col('transactionDate')), 'lastTransactionDate']
      ],
      raw: true
    });
    
  
    let financialYearSummary = [];
    if (!financialYear) {
      financialYearSummary = await EmployeeTCS.findAll({
        where: { employee_id },
        attributes: [
          'financialYear',
          [sequelize.fn('SUM', sequelize.col('taxCollected')), 'yearTaxCollected'],
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
        totalTaxCollected: parseFloat(tcsEntries[0]?.totalTaxCollected || 0),
        totalEntries: parseInt(tcsEntries[0]?.totalEntries || 0),
        firstTransactionDate: tcsEntries[0]?.firstTransactionDate || null,
        lastTransactionDate: tcsEntries[0]?.lastTransactionDate || null,
        financialYearSummary: financialYear ? [] : financialYearSummary
      }
    });
  } catch (error) {
    console.error('Error fetching employee TCS summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};