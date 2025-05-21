import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const InvestmentProof = sequelize.define(
    "investmentproof",
    {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proof_file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending',
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    review_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'investment_proofs',
    timestamps: true,
  });

InvestmentProof.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default InvestmentProof;