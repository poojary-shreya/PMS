import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const ImprovementPlan = sequelize.define('ImprovementPlan', {
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
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'Extended', 'Terminated', 'Active'),
    defaultValue: 'Active'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  milestones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meetingFrequency: {
    type: DataTypes.ENUM('Daily', 'Weekly', 'Biweekly', 'Monthly'),
    defaultValue: 'Weekly'
  },
  taskCompletion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  progressUpdates: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('progressUpdates');
      return rawValue ? JSON.parse(JSON.stringify(rawValue)) : [];
    },
    set(value) {
      this.setDataValue('progressUpdates', value);
    },
    validate: {
      isValidProgressUpdates(value) {
        if (!value) return;
        if (!Array.isArray(value)) {
          throw new Error('Progress updates must be an array');
        }
        
        const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Extended', 'Terminated', 'Active'];
        
        for (const update of value) {
          if (!update.status || !validStatuses.includes(update.status)) {
            throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
          }
          
          if (typeof update.progress !== 'number' || update.progress < 0 || update.progress > 100) {
            throw new Error('Progress must be a number between 0 and 100');
          }
          
          if (!update.date) {
            throw new Error('Update must include a date');
          }
          if (!update.note || typeof update.note !== 'string') {
            throw new Error('Update must include a note');
          }
        }
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pips',
  timestamps: true,
  hooks: {
    beforeValidate: (review) => {
      if (!review.progressUpdates) {
        review.progressUpdates = [];
      }
      if (typeof review.progressUpdates === 'string') {
        try {
          review.progressUpdates = JSON.parse(review.progressUpdates);
        } catch (e) {
          review.progressUpdates = [];
        }
      }
      if (Array.isArray(review.progressUpdates)) {
        review.progressUpdates = review.progressUpdates.map(update => ({
          ...update,
          date: update.date ? new Date(update.date) : new Date(),
          timestamp: update.timestamp || new Date().toISOString()
        }));
      }
    },
    beforeSave: (review) => {
      if (Array.isArray(review.progressUpdates) && review.progressUpdates.length > 0) {
        const latestUpdate = review.progressUpdates[review.progressUpdates.length - 1];
        review.progress = latestUpdate.progress;
        review.status = latestUpdate.status;
      }
    }
  }
});

ImprovementPlan.belongsTo(Employee, {
  foreignKey: 'employee_id',
  targetKey: 'employee_id',
  as: 'personal'
});

export default ImprovementPlan;