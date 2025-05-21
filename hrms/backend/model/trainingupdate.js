import { DataTypes } from 'sequelize';
import {sequelize} from '../config/db.js';
import Training from './trainingmodel.js';

const TrainingUpdate = sequelize.define('TrainingUpdate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trainingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Training,
      key: 'id'
    }
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  progressPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  completionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updateDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

TrainingUpdate.belongsTo(Training, { foreignKey: 'trainingId' });
Training.hasMany(TrainingUpdate, { foreignKey: 'trainingId' });

export default TrainingUpdate;