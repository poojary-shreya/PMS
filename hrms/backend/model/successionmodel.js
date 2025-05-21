import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from "./addpersonalmodel.js";

const SuccessionPlan = sequelize.define('SuccessionPlan', {
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
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  potentialSuccessors: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  readinessLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  developmentNeeds: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timeline: {   
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
},
 {
  tableName: "succession_plans",
  timestamps: false, 
  freezeTableName: true
});


SuccessionPlan.belongsTo(Employee, { foreignKey: 'employee_id', as: "personal" });

export default SuccessionPlan;