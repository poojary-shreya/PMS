import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

import Training from './trainingmodel.js';

const TestResult = sequelize.define('test_results', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trainingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});


const setupAssociations = () => {
  TestResult.belongsTo(Training, { foreignKey: 'trainingId' });
};

export { setupAssociations };
export default TestResult;