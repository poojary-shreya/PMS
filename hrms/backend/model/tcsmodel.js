import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const EmployeeTCS = sequelize.define('EmployeeTCS', {
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
    comment: 'TCS section under which tax was collected'
  },
  collectorName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the person/entity who collected tax'
  },
  collectorAddress: {
    type: DataTypes.TEXT,
    comment: 'Address of the collector'
  },
  collectorTan: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Tax Collection Account Number of the collector'
  },
  taxCollected: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Amount of tax collected in rupees'
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    comment: 'Date when the TCS was collected'
  },
  financialYear: {
    type: DataTypes.STRING,
    comment: 'Financial year of the transaction (e.g., 2024-25)'
  }
}, {
  tableName: 'employee_tcs_entries',
  timestamps: true
});


EmployeeTCS.associate = (models) => {
  EmployeeTCS.belongsTo(models.personal || Employee, { 
    foreignKey: 'employee_id', 
    as: 'employee' 
  });
};

export { EmployeeTCS };