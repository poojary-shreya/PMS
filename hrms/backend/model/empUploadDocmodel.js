import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
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
    document_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    claimed_amount: { 
      type: DataTypes.FLOAT, 
      allowNull: false,
      defaultValue: 0,
    },
    rem_taxable_income: {
      type: DataTypes.FLOAT,
      defaultValue: 0, 
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending", 
    },
  },
  {
    tableName: "empdocumentdetails", 
    freezeTableName: true, 
    timestamps: true,
  }
);

Employee.hasMany(Document, { foreignKey: "employee_id", onDelete: "CASCADE" });
Document.belongsTo(Employee, { foreignKey: "employee_id",targetKey: 'employee_id', onDelete: "CASCADE" });
export default Document;