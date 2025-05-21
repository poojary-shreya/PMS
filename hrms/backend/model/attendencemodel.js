import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Employee from './addpersonalmodel.js';  

const Attendance = sequelize.define('Attendance', {
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
      key: 'employee_id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent'),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  in_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  out_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  in_latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  in_longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  out_latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  out_longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  total_hours: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [
   
    {
      fields: ['employee_id', 'date', 'in_time']
    }
  ]

});

Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });

export default Attendance;