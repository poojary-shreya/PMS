import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js"; // Assuming this is the Employee model file

const Team = sequelize.define("Team", {
  team_id: {
    type: DataTypes.INTEGER, 
    primaryKey: true,
    autoIncrement:true
  },
  team_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  members: {
    type: DataTypes.JSON, // Storing members as an array of objects (employee_id and role)
    allowNull: false,
  },
}, {
  tableName: "teams",
  timestamps: true,
});

Team.associate = (models) => {
  Team.hasMany(models.Employee, {
    foreignKey: "employee_id",
    as: "teamMembers",
  });
  
};




export default Team;