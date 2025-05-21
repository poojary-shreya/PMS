import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const EmployeeTDS = sequelize.define('EmployeeTDS', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'personaldetails', 
      key: 'employee_id'
    },
    comment: 'Foreign key to employee record'
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'TDS section under which tax was deducted'
  },
  deductorName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the person/entity who deducted tax'
  },
  deductorAddress: {
    type: DataTypes.TEXT,
    comment: 'Address of the deductor'
  },
  deductorTan: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Tax Deduction Account Number of the deductor'
  },
  taxDeducted: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Amount of tax deducted in rupees'
  },
  incomeReceived: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Gross amount of income received before tax deduction'
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    comment: 'Date when the TDS was deducted'
  },
  financialYear: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'employee_tds_entries',
  timestamps: true
});


EmployeeTDS.associate = (models) => {
  EmployeeTDS.belongsTo(models.personal || Employee, { 
    foreignKey: 'employee_id', 
    as: 'employee' 
  });
};


const getFinancialYear = (transactionDate) => {
  if (!transactionDate) return null;
  
  const date = new Date(transactionDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; 
  

  if (month >= 1 && month <= 3) {
    return `${year-1}-${year}`;
  } else {
    return `${year}-${year+1}`;
  }
};

export { EmployeeTDS, getFinancialYear };