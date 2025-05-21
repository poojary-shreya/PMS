import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";
import Payroll from "./uploadsalrymodel.js";

const PayrollTax = sequelize.define("payrolltaxdetails", {
  payroll_id:{
    type:DataTypes.INTEGER,
    allowNull:false,
    references:{
      model: Payroll,
      key:"payroll_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
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
  base_salary: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  hra: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  pf: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  professional_tax: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  medical_allowance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  newspaper_allowance:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  dress_allowance:{
    type:DataTypes.FLOAT,
    allowNull:false
  },
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
  joining_bonus_paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  other_allowance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  standard_deduction: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80C_investment: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80CCC_investment: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  otherInvestment: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80D:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80CCD_1B:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80CCD_2:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section24_b:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80E:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  section80EEB:{
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  gross_salary: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  taxable_income: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  total_tax: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
},{

        tableName: "payrolltaxdetails",
        timestamps: true,
});

PayrollTax.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", targetKey:"employee_id", as:"personal" });
Employee.hasOne(PayrollTax, { foreignKey: "employee_id", targetKey:"employee_id" });



export default PayrollTax;