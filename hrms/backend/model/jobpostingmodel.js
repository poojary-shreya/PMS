import { DataTypes } from 'sequelize';
import {sequelize} from '../config/db.js';

const JobRequisition = sequelize.define('JobRequisition', {
  jobId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employmentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  noOfPositions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budget: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobClosedDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hiringManagerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hiringManagerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'job_requisitions',
  underscored: true,
  timestamps: true,
});

export default JobRequisition;