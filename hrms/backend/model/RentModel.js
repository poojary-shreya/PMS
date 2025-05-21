import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const HRACalculation = sequelize.define(
  "hra_calculations",
  {
    hra_id: {
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
    financial_year: {
      type: DataTypes.STRING,
      allowNull: false
    },    
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    rent_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Number of months for rent period"
    },
    rent_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Monthly rent amount"
    },
    hra_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    landlord_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    landlord_pan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    landlord_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hra:{
        type: DataTypes.FLOAT,
      allowNull: false,
    },
    claimed_hra: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "HRA amount claimed by employee"
    },
    taxable_hra: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "HRA amount that is taxable"
    }
  },
  {
    tableName: "hra_calculations",
    timestamps: true
  }
);

HRACalculation.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default HRACalculation;