
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Interview from "./interviewmodel.js";
import { Candidate } from "./trackingmodel.js";

const Offer = sequelize.define('Offer', {
  offerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  interviewId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Interview,
      key: 'interviewId'
    }
  },
  candidateEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Candidate,
      key: 'email'
    }
  },
  hiringManagerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  jobTitle: { type: DataTypes.STRING, allowNull: false },
  offerDate: { type: DataTypes.DATEONLY, allowNull: false },
  salaryFixed: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  salaryVariable: { type: DataTypes.DECIMAL(10, 2) },
  joiningBonus: { type: DataTypes.DECIMAL(10, 2) },
  esop: { type: DataTypes.STRING },
  joiningDate: { type: DataTypes.DATEONLY, allowNull: false },
  noticePeriod: { type: DataTypes.STRING },
  offerLetterPath: { 
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Sent', 'Accepted', 'Rejected', 'Negotiating'),
    defaultValue: 'Draft'
  },
  approvedBy: {
    type: DataTypes.STRING
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  approvalComments: {
    type: DataTypes.TEXT
  },
  emailSent: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: "offers",
  timestamps: true,
});


Offer.belongsTo(Interview, { foreignKey: 'interviewId' });
Offer.belongsTo(Candidate, { foreignKey: 'candidateEmail' });

export default Offer;