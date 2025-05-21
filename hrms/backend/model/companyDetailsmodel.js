import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Company = sequelize.define(
  "companydetails",
  {
    companyname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_no: {
      type: DataTypes.STRING,
      primaryKey:true,
      allowNull: false,
    },
    contactemail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hq:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    branchLocation:{
        type:DataTypes.STRING,
        allowNull:false
    },
    tan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pfTrustName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pfRegno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pfAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyLogo: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    accounts: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [], 
      validate: {
        isValidAccounts(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("At least one account is required.");
          }
          value.forEach((account) => {
            if (
              !account.accountNumber ||
              !account.purpose ||
              !account.bankname ||
              !account.ifsc ||
              typeof account.accountNumber !== "string" ||
              typeof account.purpose !== "string" ||
              typeof account.bankname !== "string" ||
              typeof account.ifsc !== "string"
            ) {
              throw new Error(
                "Each account must have a valid accountNumber, purpose, bankname, and ifsc code."
              );
            }
          });
        },
      },
    },
    
  },
  {
    tableName: "companydetails",
    timestamps: false, 
  }
);



export default Company;