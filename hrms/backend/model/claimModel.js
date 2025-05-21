import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Claim = sequelize.define(
  "Claim",
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
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
  },
  {
    tableName: "employeeclaims",
    freezeTableName: true,
    timestamps: true,
  }
);

Employee.hasMany(Claim, { foreignKey: "employee_id", onDelete: "CASCADE" });
Claim.belongsTo(Employee, { foreignKey: "employee_id", targetKey: 'employee_id', onDelete: "CASCADE" });

export default Claim;