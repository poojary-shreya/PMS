import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const Payroll = sequelize.define(
  "payrolldetails",
  {
    payroll_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "employee_id"
      },
      onDelete: "CASCADE"
    },
    ctc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    pfno: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uan: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    base_salary: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    hra: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    pf: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    professional_tax: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    medical_allowance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    newspaper_allowance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    dress_allowance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    other_allowance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    gross_salary: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    taxable_income: {
      type: DataTypes.FLOAT,
      allowNull: false
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
    // Added boolean flags for tracking payment status
    joining_bonus_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    variable_salary_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Tax calculation fields
    old_regime_tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    new_regime_tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    old_regime_tax_before_cess: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    new_regime_tax_before_cess: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    recommended_tax_regime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "auto"
    },
    tax_savings: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    total_tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    monthly_tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "payrolldetails",
    timestamps: true
  }
);

Payroll.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default Payroll;