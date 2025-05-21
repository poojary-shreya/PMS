import { DataTypes } from 'sequelize'; 
import { sequelize } from "../config/db.js"; 
import Employee from "../model/addpersonalmodel.js";  

const Feedback = sequelize.define('Feedback', {   
  id: {     
    type: DataTypes.INTEGER,     
    primaryKey: true,     
    autoIncrement: true   
  },   
  employee_id: {     
    type: DataTypes.STRING,     
    allowNull: false,     
    references: {       
      model: "personaldetails",       
      key: "employee_id"     
    }   
  },   
  type: {     
    type: DataTypes.ENUM('Manager', 'Peer', 'Self', 'Client', 'Team'),     
    defaultValue: 'Peer'   
  },   
  comment: {     
    type: DataTypes.TEXT,     
    allowNull: true   
  },   
  anonymous: {     
    type: DataTypes.BOOLEAN,     
    defaultValue: false   
  },   
  rating: {     
    type: DataTypes.INTEGER,     
    validate: {       
      min: 1,       
      max: 5     
    },     
    defaultValue: 3   
  },   
  date: {     
    type: DataTypes.DATEONLY,     
    defaultValue: DataTypes.NOW   
  } 
}, {   
  tableName: "feedback",   
  timestamps: false 
});  


Feedback.belongsTo(Employee, {   
  foreignKey: "employee_id",   
  targetKey: "employee_id",
  as: "personal" 
}); 

export default Feedback;