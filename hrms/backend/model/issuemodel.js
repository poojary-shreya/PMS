import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Project from './projectmodel.js';
import Sprint from './sprintmodel.js';
const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  project: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'project_id'
    }
  },
  epic_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sprintId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sprints',
      key: 'id'
    }
  },
  issueType: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  assignee: {
    type: DataTypes.STRING
  },
  productOwner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 3 // Medium priority
  },
  severity: {
    type: DataTypes.INTEGER,
    defaultValue: 3 // Major severity
  },
  labels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  // Removed dueDate and added startDate and endDate
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  timeEstimate: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // Default to "To Do"
  },
  // Kanban Board related fields
  columnId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'issues',
  timestamps: false
});

// Add associations directly in the model
Issue.belongsTo(Project, {
  foreignKey: 'project',
  as: 'projectDetails'
});

Issue.belongsTo(Sprint, {
  foreignKey: 'sprintId',
  as: 'sprint'
});

// Associate with Kanban Column (if using Kanban board)
Issue.associate = (models) => {
  if (models.Column) {
    Issue.belongsTo(models.Column, {
      foreignKey: 'columnId',
      as: 'column',
      constraints: false // Make this a soft constraint
    });
  }
  
  // Add Epic association if you have an Epic model
  if (models.Epic) {
    Issue.belongsTo(models.Epic, {
      foreignKey: 'epic_id',
      as: 'epic',
      constraints: false
    });
  }
};

export default Issue;