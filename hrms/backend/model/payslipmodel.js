import { DataTypes } from "sequelize";
import {sequelize} from "../config/db.js"; 
import Employee from "./addpersonalmodel.js"; 
import Payroll from "./payrolltaxmodel.js"; 

const Payslip = sequelize.define("payslipdetails", {
  payslip_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Employee,
      key: "employee_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  financial_year: {
    type: DataTypes.STRING,
    allowNull: true,

  },
  base_salary: DataTypes.FLOAT,
  hra: DataTypes.FLOAT,
  pf: DataTypes.FLOAT,
  professional_tax: DataTypes.FLOAT,
  medical_allowance: DataTypes.FLOAT,
  newspaper_allowance: DataTypes.FLOAT,
  dress_allowance: DataTypes.FLOAT,
  other_allowance: DataTypes.FLOAT,
  variable_salary: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  joining_bonus: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  gross_salary: DataTypes.FLOAT,
  tax_regime: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "old_regime or new_regime"
  },
  monthly_tax: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    comment: "Monthly tax amount based on selected tax regime"
  },
  total_deductions: DataTypes.FLOAT,
  net_salary: DataTypes.FLOAT,
  total_tax: DataTypes.FLOAT,
},{
    tableName:"payslipdetails",
  timestamps: true, 
});


Payslip.belongsTo(Employee, { foreignKey: "employee_id" });
Payslip.belongsTo(Payroll, { foreignKey: "payroll_id" });

export default Payslip;