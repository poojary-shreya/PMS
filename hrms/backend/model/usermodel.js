
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('employee', 'manager',  'hr'),
      allowNull: false,
      defaultValue: 'employee',
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
 
  {
    tableName: 'users',      
    freezeTableName: true,   
    timestamps: true,        
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);


User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function() {
  return jwt.sign(
    { id: this.id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

User.prototype.generateRefreshToken = function() {
  return jwt.sign(
    { id: this.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
};


export default User;
