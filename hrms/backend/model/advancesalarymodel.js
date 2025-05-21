import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const AdvanceSalary = sequelize.define("AdvanceSalary", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.STRING, 
    allowNull: false,
    references: {
      model: Employee,  
      key: "employee_id", 
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salaryAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  candidateEmail: {  
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  hrEmail: {  
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
    allowNull: false
  }
}, {
  tableName: "salary_requests",
  timestamps: true,
});

AdvanceSalary.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_id", 
});

export default AdvanceSalary;
