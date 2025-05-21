// model/roadmapmodel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Project from "./projectmodel.js";
import Issue from "./issuemodel.js";

const RoadmapItem = sequelize.define('RoadmapItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'project_id'
    }
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'roadmap_items',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('initiative', 'epic', 'feature'),
    allowNull: false
  },
  epic_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Done', 'Blocked'),
    defaultValue: 'To Do',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'roadmap_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
RoadmapItem.belongsTo(Project, {
  foreignKey: 'project_id',
  onDelete: 'CASCADE'
});

// Self-referential relationship for parent-child items
RoadmapItem.belongsTo(RoadmapItem, {
  foreignKey: 'parent_id',
  as: 'parent'
});

RoadmapItem.hasMany(RoadmapItem, {
  foreignKey: 'parent_id',
  as: 'children'
});

// Create a junction table for many-to-many relationship between roadmap items and issues
const RoadmapItemIssue = sequelize.define('RoadmapItemIssue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'roadmap_item_issues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define many-to-many relationship with issues
RoadmapItem.belongsToMany(Issue, {
  through: RoadmapItemIssue,
  foreignKey: 'roadmap_item_id',
  otherKey: 'issue_id',
  as: 'linked_issues'
});

Issue.belongsToMany(RoadmapItem, {
  through: RoadmapItemIssue,
  foreignKey: 'issue_id',
  otherKey: 'roadmap_item_id',
  as: 'roadmap_items'
});

export default RoadmapItem;