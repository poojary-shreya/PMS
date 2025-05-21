import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const AllowanceClaim = sequelize.define(
  "AllowanceClaim",
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
        allowNull: false
      }, 

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    proof_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    review_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
  },
  {
    tableName: "employeeallowanceclaims",
    freezeTableName: true,
    timestamps: true,
  }
);

Employee.hasMany(AllowanceClaim, { foreignKey: "employee_id", onDelete: "CASCADE" });
AllowanceClaim.belongsTo(Employee, { foreignKey: "employee_id", targetKey: 'employee_id', onDelete: "CASCADE" });

export default AllowanceClaim;