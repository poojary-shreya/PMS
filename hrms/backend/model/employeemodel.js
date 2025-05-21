import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db.js"; 

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "employees", 
  timestamps: false,
});

export default Employee;
