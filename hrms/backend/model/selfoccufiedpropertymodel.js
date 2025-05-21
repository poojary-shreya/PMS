import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';


const SelfOccupiedProperty = sequelize.define('SelfOccupiedProperty', {
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
  propertyNumber: {
    type: DataTypes.INTEGER,  
    allowNull: false
  },
  isFirstResidential: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: false,
    defaultValue: 'No'
  },
  interestAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  address: {
    type: DataTypes.TEXT
  },
  occupationDate: {
    type: DataTypes.DATE
  },
  city: {
    type: DataTypes.STRING
  },
  loanSanctionDate: {
    type: DataTypes.DATE
  },
  houseValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lenderName: {
    type: DataTypes.STRING
  },
  lenderAddress: {
    type: DataTypes.TEXT
  },
  lenderPAN: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'self_occupied_properties',
  timestamps: true
});

export default SelfOccupiedProperty;