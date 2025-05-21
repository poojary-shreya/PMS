import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const AllowanceCalculation = sequelize.define(
  "AllowanceCalculation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    financial_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    annual_allowance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    claimed_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    claim_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    claimable_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    taxable_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: "allowance_calculations",
    freezeTableName: true,
    timestamps: true,
  }
);

Employee.hasMany(AllowanceCalculation, { foreignKey: "employee_id", onDelete: "CASCADE" });
AllowanceCalculation.belongsTo(Employee, { foreignKey: "employee_id", targetKey: 'employee_id', onDelete: "CASCADE" });

export default AllowanceCalculation;