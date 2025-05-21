import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const Leave = sequelize.define("Leave", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'employee_id',
    references: {
      model: Employee,
      key: 'employee_id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    },
    field: 'email'
  },
  managerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    },
    field: 'manager_email'
  }
,
  leaveType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'leave_type'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  halfDay: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'half_day'
  },
  lastDay: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'last_day'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending"
  },
  manager_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "leaves",
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


Leave.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });



export default Leave;

