
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';

const Training = sequelize.define('Training', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trainer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employee: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Employee,
      key: "employee_id"
    },
    comment: "Unique identifier for the employee"
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  skillCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillContent: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'Planned', 'In Progress', 'Completed', 'Deferred', 'Paused'),
    defaultValue: 'Planned'
  },
  progressPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  progressUpdates: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  completedTasks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  completionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    }
  },
  lastUpdated: {
    type: DataTypes.DATE
  },
  lastUpdatedBy: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'trainings',
  timestamps: true,
  hooks: {
    beforeCreate: (training) => {
      const today = new Date().toISOString().split('T')[0];
      const { startDate, endDate } = training;
      
      if (startDate <= today && endDate >= today) {
        training.status = 'In Progress';
      } else if (endDate < today) {
        training.status = 'Completed';
      }
    }
  }
});


Training.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "personal"
});

export default Training;