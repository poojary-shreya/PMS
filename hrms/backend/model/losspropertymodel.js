import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import SelfOccupiedProperty from './selfoccufiedpropertymodel.js';
import LetOutProperty from './letoutproperty.js';


const PropertyLoss = sequelize.define('PropertyLoss', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fiscalYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  claimingLoss: {
    type: DataTypes.ENUM('Yes', 'No'),
    allowNull: false,
    defaultValue: 'Yes'
  },
  selfOccupiedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  letOutLossAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  letOutIncomeAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: 'property_losses',
  timestamps: true
});


PropertyLoss.hasMany(SelfOccupiedProperty, {
  foreignKey: 'propertyLossId',
  as: 'selfOccupiedProperties'
});

PropertyLoss.hasOne(LetOutProperty, {
  foreignKey: 'propertyLossId',
  as: 'letOutProperty'
});


SelfOccupiedProperty.belongsTo(PropertyLoss, {
  foreignKey: 'propertyLossId'
});

LetOutProperty.belongsTo(PropertyLoss, {
  foreignKey: 'propertyLossId'
});

export default PropertyLoss;