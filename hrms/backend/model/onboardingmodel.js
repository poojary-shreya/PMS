import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const Onboarding = sequelize.define('Onboarding', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
 
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Employee,
      key: 'employee_id'
    }
  },
  candidateName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  candidateEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  onboardingProcess: {
    type: DataTypes.STRING,
    allowNull: false
  },
  processDetails: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requiredDocuments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  taskCompletionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true,
  tableName: 'onboardings',
});

export default Onboarding;