import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Roles = sequelize.define("Roles", {
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "personaldetails",
      key: "employee_id"
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  fullName: DataTypes.STRING,
  email: DataTypes.STRING,
  designation: DataTypes.STRING,
  joiningDate: DataTypes.DATE,
  department: DataTypes.STRING,
  roleType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportingManager: DataTypes.STRING,
  teamSize: DataTypes.INTEGER,
  selectedResponsibilities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  additionalResponsibilities: DataTypes.TEXT,
}, {
  tableName: "rolesresponsibilities",
  timestamps: true
});

Roles.associate = (models) => {
  Roles.belongsTo(models.personal, {
    foreignKey: "employee_id",
    as: "employee"
  });
};


Roles.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });
Employee.hasOne(Roles, { foreignKey: "employee_id", as: "roles" });



export default Roles;