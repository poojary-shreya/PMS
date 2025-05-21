
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TrainingVideo = sequelize.define('TrainingVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    }
  },
  skillCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skillContent: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'training_videos',
  timestamps: true
});

export default TrainingVideo;