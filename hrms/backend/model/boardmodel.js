// models/Board.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Board = sequelize.define('Board', {
  id: {
    type: DataTypes.UUID,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to the project ID in the main system'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'boards'
});

export default Board;