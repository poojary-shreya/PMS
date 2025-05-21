import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "./addpersonalmodel.js"

const TaxCalculation = sequelize.define('TaxCalculation', {
  id: {
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
  employee_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  financial_year: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calculation_mode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gross_salary_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  gross_salary_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  exemption_us_10_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  exemption_us_10_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  net_salary_after_section_10_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  net_salary_after_section_10_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  standard_deduction_and_professional_tax_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  standard_deduction_and_professional_tax_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  net_taxable_salary_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  net_taxable_salary_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  house_property_loss_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  house_property_loss_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  income_from_other_sources_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  income_from_other_sources_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  gross_total_income_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  gross_total_income_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  deduction_under_chapter_vi_a_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  deduction_under_chapter_vi_a_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  taxable_income_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  taxable_income_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_payable_on_total_income_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_payable_on_total_income_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rebate_us_87a_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rebate_us_87a_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_payable_after_section_87a_rebate_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_payable_after_section_87a_rebate_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  surcharge_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  surcharge_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cess_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cess_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total_tax_payable_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total_tax_payable_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_recovered_tds_old_regime:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_recovered_tds_new_regime:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_recovered_tcs_old_regime:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_recovered_tcs_new_regime:{
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_per_month_new_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_per_month_old_regime: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_difference_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax_will_increase: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  better_regime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'tax_calculations'
});

export default TaxCalculation;
TaxCalculation.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
