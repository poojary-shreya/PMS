import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Project from './projectmodel.js';

const Sprint = sequelize.define('Sprint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  projectKey: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Project,
      key: 'key'
    }
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2 // default 2 weeks
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'FUTURE', // FUTURE, ACTIVE, COMPLETED
    validate: {
      isIn: [['FUTURE', 'ACTIVE', 'COMPLETED']]
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
  tableName: 'sprints',
  timestamps: false
});

// Add associations directly in the model
Sprint.belongsTo(Project, {
  foreignKey: 'projectKey',
  targetKey: 'key',
  as: 'project'
});

// This will be used when we associate issues with sprints
Sprint.associate = (models) => {
  if (models.Issue) {
    Sprint.hasMany(models.Issue, {
      foreignKey: 'sprintId',
      as: 'issues'
    });
  }
};

export default Sprint;