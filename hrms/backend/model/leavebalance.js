import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Employee from "../model/addpersonalmodel.js";

const LeaveBalance = sequelize.define("LeaveBalance", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'employee_id',
    references: {
      model: Employee,
      key: 'employee_id'
    }
  },
  annual: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  sick: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  casual: {
    type: DataTypes.INTEGER,
    defaultValue: 14,
  }
}, {
  tableName: "leave_balances",
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


sequelize.query("SELECT to_regclass('public.leave_balances') as exists")
  .then(([results]) => {
    const tableExists = results[0].exists !== null;
    
    if (tableExists) {
      
      return sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'leave_balances' 
        AND column_name IN ('created_at', 'updated_at')
      `).then(([columns]) => {
        const hasTimestamps = columns.length === 2;
        
        if (!hasTimestamps) {
          console.log('Adding timestamp columns to existing table...');
         
          return sequelize.query(`
            ALTER TABLE leave_balances 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
            
            UPDATE leave_balances 
            SET created_at = NOW(), updated_at = NOW() 
            WHERE created_at IS NULL OR updated_at IS NULL;
            
            ALTER TABLE leave_balances 
            ALTER COLUMN created_at SET NOT NULL,
            ALTER COLUMN updated_at SET NOT NULL;
          `);
        }
        return Promise.resolve();
      });
    } else {
    
    
    }
  })
 
  LeaveBalance.belongsTo(Employee, { foreignKey: "employee_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

export default LeaveBalance;