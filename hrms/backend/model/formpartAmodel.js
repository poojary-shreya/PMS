import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";
import Company from "./companyDetailsmodel.js";

const TaxForm = sequelize.define("taxform", {
  certifiacte_no:{
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey:true,
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
  employer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employer_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employer_tan:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  cit:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  employer_pan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assessment_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  financial_year_from: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  financial_year_to: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  q1_amount_paid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q1_tax_deducted: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q2_amount_paid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q2_tax_deducted: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q3_amount_paid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q3_tax_deducted: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q4_amount_paid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  q4_tax_deducted: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total_amount_paid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total_tax_deducted: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  tableName: "form16a",
  timestamps: true,
});

TaxForm.belongsTo(Employee, { foreignKey: "employee_id" });
Employee.hasMany(TaxForm, { foreignKey: "employee_id" });


export default TaxForm;