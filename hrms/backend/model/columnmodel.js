// models/Column.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Column = sequelize.define('Column', {
  id: {
    type: DataTypes.INTEGER,
  
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statusId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to the status ID in the main issue tracking system'
  }
}, {
  tableName: 'columns'
});

Column.associate = (models) => {
  Column.belongsTo(models.Board, { 
    foreignKey: 'boardId', 
    as: 'board' 
  });
  
  Column.hasMany(models.Issue, { 
    foreignKey: 'columnId', 
    as: 'issues',
    constraints: false // Make this a soft constraint
  });
};

export default Column;