import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';


const LetOutProperty = sequelize.define('LetOutProperty', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyLossId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'property_losses',
      key: 'id'
    }
  },
  address: {
    type: DataTypes.TEXT
  },
  occupationDate: {
    type: DataTypes.DATE
  },
  rentalIncome: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  municipalTax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  netAnnualValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  repairsValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  netRentalIncome: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  interestOnLoan: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalInterestPaid: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lenderName: {
    type: DataTypes.STRING
  },
  carryForwardLoss: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  intraHeadSetOff: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lenderAddress: {
    type: DataTypes.TEXT
  },
  lenderPAN: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'let_out_properties',
  timestamps: true
});

export default LetOutProperty;