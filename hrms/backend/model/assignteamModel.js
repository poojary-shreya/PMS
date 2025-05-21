import { DataTypes } from "sequelize"; 
import { sequelize } from "../config/db.js"; 
import Team from "./createTeamModel.js"; 
import Project from "./projectmodel.js"; 
import Employee from "./addpersonalmodel.js"; 
import Contractor from "./ContractModel.js";  

const TeamMember = sequelize.define(
  "TeamMember",
  {
    team_member_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "project_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Team,
        key: "team_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    member_type: {
      type: DataTypes.ENUM('Employee', 'Contractor'),
      allowNull: false,
      defaultValue: 'Employee',
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    allocation_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: 1,
        max: 100,
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    tableName: "team_members",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["project_id", "team_id", "employee_id"],
        name: "team_member_unique_assignment"
      },
    ],
  }
);

// Modified associations
TeamMember.belongsTo(Project, {
  foreignKey: "project_id",
  as: "project",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

TeamMember.belongsTo(Team, {
  foreignKey: "team_id",
  as: "team", 
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Project.hasMany(TeamMember, {
  foreignKey: "project_id",
  as: "teamMembers",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Team.hasMany(TeamMember, {
  foreignKey: "team_id",
  as: "member",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

// Employee association - only applies when member_type is 'Employee'
TeamMember.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee",
  constraints: false,  // Important: disable the foreign key constraint
});

Employee.hasMany(TeamMember, {
  foreignKey: "employee_id",
  as: "teamAssignments",
  constraints: false,  // Important: disable the foreign key constraint
});

// Contractor association - only applies when member_type is 'Contractor'
TeamMember.belongsTo(Contractor, {
  foreignKey: "employee_id",
  as: "contractor",
  constraints: false,  // Important: disable the foreign key constraint
});

Contractor.hasMany(TeamMember, {
  foreignKey: "employee_id",
  as: "teamAssignments",
  constraints: false,  // Important: disable the foreign key constraint
});

export default TeamMember;