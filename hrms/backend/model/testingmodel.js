

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import TrainingVideo from './videomodel.js';

const TestQuestion = sequelize.define('TestQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
 
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidOptions(value) {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error('At least two options are required');
        }
      }
    }
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false
  }
,
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skillCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillContent: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
    defaultValue: 'Medium'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TrainingVideo,
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'test_questions',
  timestamps: true
});


TestQuestion.belongsTo(TrainingVideo, { foreignKey: 'videoId', as: 'relatedVideo' });

export default TestQuestion;