import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const Review = sequelize.define('Review', {
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
  reviewer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Scheduled'
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completionDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
        if (!Array.isArray(value)) {
          throw new Error('Progress updates must be an array');
        }
        for (const update of value) {
          if (!update.date) {
            throw new Error('Update must include a date');
          }
          if (typeof update.progress !== 'number' || update.progress < 0 || update.progress > 100) {
            throw new Error('Progress must be a number between 0 and 100');
          }
          if (!update.status || !['Not Started', 'In Progress', 'Completed', 'Overdue'].includes(update.status)) {
            throw new Error('Update must include a valid status');
          }
          
        }
      }
    }
  }
}, {
  tableName: 'reviews',
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

Review.belongsTo(Employee, { foreignKey: 'employee_id', as: 'personal' });

export default Review;
