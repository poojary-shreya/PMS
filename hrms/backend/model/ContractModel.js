import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Contractor = sequelize.define('Contractor', {
    c_employee_id: {
      type: DataTypes.STRING,
      primaryKey:true,
      unique:true,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    companyEmail: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    aadhaarNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    aadharCardFile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    panCardFile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    contractStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contractEndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contractDuration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employmentType: {
      type: DataTypes.STRING,
      defaultValue: 'Contractor',
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleType: {
    type: DataTypes.STRING,
    allowNull: false
  },
    reportingManager: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'completed'),
      defaultValue: 'active',
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'contractors'
  });

export default Contractor;