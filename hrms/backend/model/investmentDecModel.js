import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const InvestmentDeclaration = sequelize.define(
  "investmentdeclaration",
  {
    declaration_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Employee,
        key: "employee_id"
      },
      onDelete: "CASCADE"
    },
    financial_year: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rent_paid: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80D - Medical Insurance
      '80D_self_spouse_children_under60': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80D_self_spouse_children_over60': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80D_self_spouse_children_over60_no_insurance': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80D_parents_under60': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80D_parents_over60': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80D_parents_over60_no_insurance': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80E - Education Loan
      '80E_education_loan': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80U - Disability
      '80U_disability_40_to_80': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80U_disability_above_80': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80DD - Handicapped Dependent
      '80DD_disability_40_to_80': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80DD_disability_above_80': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80DDB - Medical Treatment
      'selectedMedicalCategory': {
        type: DataTypes.STRING,
        defaultValue: 'not_senior_citizen'
      },
      'superSeniorCitizen': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      '80DDB_self_dependent': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // Other Deductions
      '80TTA_savings_interest': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80TTB_sr_citizen_interest': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80CCD_salary_deduction': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80CCD1B_additional_nps': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80CCD1B_atal_pension': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80CCD1B_nps_vatsalya': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80CCD2_employer_contribution': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80EE_additional_housing_loan': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80EEA_housing_loan_benefit': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80EEB_electric_vehicle_loan': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80CCE - Right Side Deductions
      '80CCC_pension_fund': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      // 80C Investments
      '80C_provident_fund': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_housing_loan_principal': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_mutual_fund': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_ppf': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_nsc': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_nsc_interest': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_ulip': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_elss': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_life_insurance': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_mutual_fund_pension': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_tuition_fees': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_infrastructure_bond': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_bank_fd': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_senior_citizens_savings': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_post_office_time_deposit': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_nps_tier1': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_atal_pension': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      '80C_sukanya_samriddhi': {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
  },
  {
    tableName: "investmentdeclaration",
    timestamps: true
  }
);

InvestmentDeclaration.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default InvestmentDeclaration;