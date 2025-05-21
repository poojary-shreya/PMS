import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Form12BB = sequelize.define("Form12BB", {
  id: {
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
    }
  },
  financial_year_from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  financial_year_to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
    defaultValue: 'DRAFT'
  },
  
  hra_claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hra_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  rent_paid: {
    type: DataTypes.DECIMAL(10, 2)
  },
  landlord_name: {
    type: DataTypes.STRING
  },
  landlord_address: {
    type: DataTypes.TEXT
  },
  landlord_pan: {
    type: DataTypes.STRING
  },
  rent_receipt_file: {
    type: DataTypes.STRING
  },
  

  ltc_claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ltc_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  travel_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  travel_bill_file: {
    type: DataTypes.STRING
  },
  

  home_loan_claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  home_loan_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  interest_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  lender_name: {
    type: DataTypes.STRING
  },
  lender_account: {
    type: DataTypes.STRING
  },
  loan_certificate_file: {
    type: DataTypes.STRING
  },
  

  chapter_via_claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  chapter_via_status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  chapter_via_details: {
    type: DataTypes.JSON,
    defaultValue: []
  },

}, {
  tableName: "form12bb",
  timestamps: true
});

Employee.hasMany(Form12BB, {
  foreignKey: "employee_id",
  as: "form12bb_submissions"
});

Form12BB.belongsTo(Employee, {
  foreignKey: "employee_id",
  as: "employee"
});

export default Form12BB;