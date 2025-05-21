import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Goal = sequelize.define('Goal', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'Overdue'),
    defaultValue: 'Not Started'
  },
  metrics: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  team: {
    type: DataTypes.STRING,
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
  tableName: "goals",
  timestamps: true,
  hooks: {
    beforeValidate: (goal) => {
   
      if (!goal.progressUpdates) {
        goal.progressUpdates = [];
      }
      
    
      if (typeof goal.progressUpdates === 'string') {
        try {
          goal.progressUpdates = JSON.parse(goal.progressUpdates);
        } catch (e) {
          goal.progressUpdates = [];
        }
      }
      
   
      if (goal.changed('progressUpdates') && Array.isArray(goal.progressUpdates)) {
      
        const currentTime = new Date();
        
      
        goal.progressUpdates = goal.progressUpdates.map(update => {
          
          if (!update.date) {
            return {
              ...update,
              date: currentTime,
            };
          }
          
         
          return {
            ...update,
            date: new Date(update.date)
          };
        });
      }
    },
    beforeSave: (goal) => {
     
      if (Array.isArray(goal.progressUpdates) && goal.progressUpdates.length > 0) {
        const latestUpdate = goal.progressUpdates[goal.progressUpdates.length - 1];
        goal.progress = latestUpdate.progress;
        goal.status = latestUpdate.status;
      }
    }
  }
});

Goal.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_id",
  as: "personal"
});

export default Goal;