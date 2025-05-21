// associations.js
import Training from './model/trainingmodel.js';
import TrainingVideo from './model/videomodel.js';
import { sequelize } from '../backend/config/db.js';
import { DataTypes } from 'sequelize';

// Define the junction table
const TrainingTrainingVideo = sequelize.define('TrainingTrainingVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trainingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trainings',
      key: 'id'
    }
  },
  trainingVideoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'training_videos',
      key: 'id'
    }
  },
  assignedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'training_training_videos',
  timestamps: true
});

// Set up associations
Training.belongsToMany(TrainingVideo, { 
  through: TrainingTrainingVideo, 
  foreignKey: 'trainingId', 
  otherKey: 'trainingVideoId',
  as: 'trainingVideos' 
});

TrainingVideo.belongsToMany(Training, { 
  through: TrainingTrainingVideo, 
  foreignKey: 'trainingVideoId', 
  otherKey: 'trainingId',
  as: 'trainings' 
});

export { TrainingTrainingVideo };