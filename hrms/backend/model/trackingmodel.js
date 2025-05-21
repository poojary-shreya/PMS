import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Candidate = sequelize.define('Candidate', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
    validate: { isEmail: true }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: { 
    type: DataTypes.STRING 
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    validate: { min: 0 }
  },
  positionApplied: { 
    type: DataTypes.STRING 
  },
  noticePeriod: { 
    type: DataTypes.STRING 
  },
  referralreason:{
    type: DataTypes.STRING
  },
  resumePath: {
    type: DataTypes.STRING
  },
  referrerName: {
    type: DataTypes.STRING
  },
  referrerEmail: {
    type: DataTypes.STRING,
    validate: { isEmail: true }
  },
  referrerRelation: {
    type: DataTypes.STRING
  },
  isReferred: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.referrerName ? 'Yes' : 'No';
    }
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
}, {
  tableName: 'candidates',
  timestamps: true
});

export { Candidate };