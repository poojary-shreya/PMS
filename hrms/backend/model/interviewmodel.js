
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Candidate } from "./trackingmodel.js";

const Interview = sequelize.define('Interview', {
  interviewId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  candidateEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Candidate,
      key: 'email'
    }
  },
  positionApplied: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hiringManagerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  name: { type: DataTypes.STRING, allowNull: false },
  skills: { type: DataTypes.STRING, allowNull: false },
  experience: { type: DataTypes.INTEGER, allowNull: false },
  interviewDate: { type: DataTypes.DATEONLY, allowNull: false },
  interviewTime: { type: DataTypes.TIME, allowNull: false },
  interviewer: { type: DataTypes.STRING, allowNull: false },
  round: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  },
  result: {
    type: DataTypes.ENUM('Selected', 'Rejected', 'On Hold'),
    allowNull: true
  },
  feedback: { type: DataTypes.TEXT },
  hrRoundCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  offerSent: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: "interviews",
  timestamps: true,
});


Interview.belongsTo(Candidate, {
  foreignKey: 'candidateEmail',
  targetKey: 'email',
  as: 'candidate' 
});

export default Interview;