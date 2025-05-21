import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";
import Payroll from "./uploadsalrymodel.js";

const HraExemption = sequelize.define(
  "hra_exemption",
  {
    exemption_id: {
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
    fiscal_year: {
      type: DataTypes.STRING,
      allowNull: false
    },
    actual_hra_received: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    rent_paid: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    salary_for_period: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    city_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hra_exemption_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    taxable_hra: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: "hra_exemption",
    timestamps: true
  }
);

HraExemption.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default HraExemption;