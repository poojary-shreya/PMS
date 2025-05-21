import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Onboarding from "./onboardingmodel.js"

const OnboardingDocument = sequelize.define('OnboardingDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  onboardingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Onboarding,
      key: 'id'
    }
  },
  documentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  documentType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'documents',
});

export default OnboardingDocument;