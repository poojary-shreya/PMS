import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js";

const Bonafide = sequelize.define("Bonafide", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  candidateEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  hrEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
    allowNull: false,
  },
  certificate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificatePath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "bonafide_requests",
  timestamps: true,
});

Bonafide.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_id",
  as: "personal"
});

export default Bonafide;