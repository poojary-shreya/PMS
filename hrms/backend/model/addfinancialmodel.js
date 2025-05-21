import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Financial = sequelize.define(
  "Financial",
  {
  
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey:true,  
      references: {
        model: "personaldetails",  
        key: "employee_id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resignationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    noticePeriod: DataTypes.STRING,
    advanceSalary: DataTypes.STRING,
    creditCardOffered: DataTypes.STRING,
    bankName: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    ifscCode: DataTypes.STRING,
    currentSalary: DataTypes.FLOAT,
    previousSalary: DataTypes.FLOAT,
    ctc: DataTypes.FLOAT,
    taxCalculation: DataTypes.FLOAT,
  },
  {
    tableName: "financialdetails",
    timestamps: true
  }
);

Financial.associate = (models) => {
  Financial.belongsTo(models.personal, {
    foreignKey: "employee_id",
    as: "personal"
  });
};

export default Financial;