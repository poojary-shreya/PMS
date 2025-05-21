import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Company from "./companyDetailsmodel.js";

const Employee = sequelize.define("personal", {
  employee_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  employmentStatus: {
    type: DataTypes.STRING,
    defaultValue: "Active"
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
  },
  fatherName: {
    type: DataTypes.STRING
  },
  companyemail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  personalemail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  company_registration_no: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Company,
      key: "registration_no",
    },
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  anniversary: {
    type: DataTypes.DATEONLY,
    allowNull: true  // Making explicitly nullable
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  panNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  panCardFile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  adharCardNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adharCardFile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  crossStreet: {
    type: DataTypes.STRING,
    allowNull: true
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: true
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  qualificationFile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issuedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  certificationFile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nomineeName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nomineeAge: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false
  },
  landline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  individualInsurance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  groupInsurance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  personalPhoto: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "personaldetails",
  timestamps: true,
});

Employee.associate = (models) => {
  Employee.hasOne(models.Financial, {
    foreignKey: "employee_id",
    as: "financial"
  });
  
  Employee.hasMany(models.Payroll, {
    foreignKey: "employee_id",
    as: "payrolls"
  });
  
  Employee.hasMany(models.Goal, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(sequelize.models.Leave, {
    foreignKey: "employee_id",
    as: "leaves"
  });
  
  Employee.hasOne(sequelize.models.LeaveBalance, {
    foreignKey: "employee_id",
    as: "leaveBalance"
  });
  
  Employee.hasMany(models.PIP, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(models.Review, {
    foreignKey: "employee_id",
  });
  
  Employee.hasMany(models.Onboarding, {
    foreignKey: "employee_id",
    as: "onboardings"
  });
  
  Employee.hasMany(models.Training, {
    foreignKey: "employee_id",
    as: "trainings"
  });

  Employee.hasMany(models.EmployeeTDS, { 
    foreignKey: 'employee_id', 
    as: 'tdsEntries' 
  });
  
  Employee.hasMany(models.EmployeeTCS ,{ 
    foreignKey: 'employee_id', 
    as: 'tcsEntries' 
    });
Employee.hasMany(models.Project, {
  foreignKey: "lead_id",
  as: "ledProjects"
});


};

Company.hasMany(Employee, { foreignKey: "company_registration_no", as: "personal" });
Employee.belongsTo(Company, { foreignKey: "company_registration_no", as: "company" });

export default Employee;