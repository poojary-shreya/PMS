import Leave from "../model/leavemodel.js";
import LeaveBalance from "../model/leavebalance.js";
import Employee from "../model/addpersonalmodel.js"; 
import Role from "../model/addrolemodel.js"; // Import role model to fetch manager info
import { sequelize } from "../config/db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASSWORD 
  }
});

const calculateDuration = (startDate, endDate, isHalfDay, isLastDayHalf) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (isHalfDay) days -= 0.5;
  if (isLastDayHalf) days -= 0.5;

  return days;
};

const sendLeaveNotification = async (leaveDetails, employeeName) => {
  try {
    const startDate = new Date(leaveDetails.startDate).toLocaleDateString();
    const endDate = new Date(leaveDetails.endDate).toLocaleDateString();

    const managerMailOptions = {
      from: `"HR System" <${process.env.EMAIL_USER}>`,
      to: leaveDetails.managerEmail,
      subject: `Leave Request for ${startDate} to ${endDate} - ${employeeName}`,
      text: `Dear Manager,

I would like to request ${leaveDetails.leaveType} leave from ${startDate} to ${endDate} due to ${leaveDetails.reason}. Please let me know if you need any further information. I will ensure proper handover and coverage during my absence.

Thanks & Regards,
${employeeName}`
    };

    const employeeMailOptions = {
      from: `"HR System" <${process.env.EMAIL_USER}>`,
      to: leaveDetails.email,
      subject: "Leave Request Received",
      text: `Dear ${employeeName},

Your ${leaveDetails.leaveType} leave request from ${startDate} to ${endDate} has been submitted successfully.

Status: Pending Approval

You will be notified once your manager reviews the request.`
    };

    await transporter.sendMail(managerMailOptions);
    await transporter.sendMail(employeeMailOptions);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.session.employee_id;
    const { leaveType, startDate, endDate, reason, lastDayType, email, managerEmail } = req.body;
    
    // Check if user is logged in
    if (!employeeId) {
      return res.status(401).json({ error: "Please login to apply for leave" });
    }
    
    // Verify employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found in personnel records" });
    }
    
    // Verify company email (modified the check to avoid circular reference)
    const loggedInEmail = req.session.email;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        error: "Access denied: Leave application can only be accessed when logged in with company email" 
      });
    }
    
    // Check dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ error: "End date cannot be before start date" });
    }
    
    const isLastDayHalf = lastDayType === 'half';
    const duration = calculateDuration(start, end, false, isLastDayHalf);
    
    const result = await sequelize.transaction(async (t) => {
      // Check or create leave balance
      const [balance] = await LeaveBalance.findOrCreate({
        where: { employeeId },
        defaults: {
          annual: 20,
          sick: 10,
          casual: 14
        },
        transaction: t
      });
      
      // Check if enough balance available
      if (balance[leaveType] < duration) {
        throw new Error(`Insufficient ${leaveType} leave balance. Available: ${balance[leaveType]} days, Requested: ${duration} days`);
      }
      
      // Create leave request
      const leave = await Leave.create({
        employeeId,
        email,
        managerEmail,
        leaveType,
        startDate: start,
        endDate: end,
        halfDay: false,
        lastDay: isLastDayHalf,
        reason,
        status: 'Pending'
      }, { transaction: t });
      
      return leave;
    });
    
    // Send notifications
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    await sendLeaveNotification({
      employeeId,
      email, 
      managerEmail,
      leaveType,
      startDate,
      endDate,
      reason,
      lastDayType
    }, employeeName);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Application Error:', error);
    res.status(500).json({
      error: 'Leave application failed',
      details: error.message
    });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: [
        {
          model: Employee,
          attributes: ['firstName', 'lastName', 'department']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(leaves);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({
      error: 'Failed to fetch leave requests',
      details: error.message
    });
  }
};

export const getLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.session.employee_id;
    
    // Check if user is logged in
    if (!employeeId) {
      return res.status(401).json({ error: "Please login to view leave balance" });
    }
    
    // Check company email
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        error: "Access denied: Leave application can only be accessed when logged in with company email" 
      });
    }
    
    const balance = await LeaveBalance.findOne({
      where: { employeeId }
    });
    
    if (!balance) {
      // Create default balance if not exists
      const defaultBalance = await LeaveBalance.create({
        employeeId,
        annual: 20,
        sick: 10,
        casual: 14
      });
      
      return res.json(defaultBalance);
    }
    
    res.json(balance);
  } catch (error) {
    console.error('Balance Error:', error);
    res.status(500).json({
      error: 'Failed to fetch leave balance',
      details: error.message
    });
  }
};

export const getLeaveHistory = async (req, res) => {
  try {
    const employeeId = req.session.employee_id;
    
    // Check if user is logged in
    if (!employeeId) {
      return res.status(401).json({ error: "Please login to view leave history" });
    }
    
    // Check company email
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        error: "Access denied: Leave application can only be accessed when logged in with company email" 
      });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found in personnel records" });
    }

    const leaves = await Leave.findAll({
      where: { employeeId }, 
      order: [['created_at', 'DESC']]
    });
    
    res.json(leaves);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add an endpoint to get employee's manager information from roles
export const getEmployeeManager = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.session.employee_id;
    
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
    
    const role = await Role.findOne({
      where: { employee_id: employeeId }
    });
    
    if (!role || !role.manager_email) {
      return res.status(404).json({ error: "Manager information not found for this employee" });
    }
    
    res.json({
      manager_email: role.manager_email,
      manager_name: role.manager_name || "Manager",
      role: role.role
    });
    
  } catch (error) {
    console.error('Manager Info Error:', error);
    res.status(500).json({ error: error.message });
  }
};


export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, manager_comment, managerName } = req.body;


    const leave = await Leave.findByPk(id);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

   
    const employee = await Employee.findByPk(leave.employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

  
    leave.status = status;
    leave.manager_comment = manager_comment;
    await leave.save();

    if (status === 'Approved') {
      const duration = calculateDuration(
        leave.startDate,
        leave.endDate,
        leave.halfDay,
        leave.lastDay
      );

      const balance = await LeaveBalance.findOne({
        where: { employeeId: leave.employeeId }
      });

      if (balance) {
        balance[leave.leaveType] = parseFloat(balance[leave.leaveType]) - duration;
        await balance.save();
      }
    }
    
  
    await sendStatusUpdateNotification(leave, employee, managerName);

    res.json(leave);
  } catch (error) {
    console.error('Status Update Error:', error);
    res.status(500).json({
      error: 'Failed to update leave status',
      details: error.message
    });
  }
};


const sendStatusUpdateNotification = async (leave, employee, managerName) => {
  try {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const startDate = new Date(leave.startDate).toLocaleDateString();
    const endDate = new Date(leave.endDate).toLocaleDateString();

    const mailOptions = {
      from: `"HR System" <${process.env.EMAIL_USER}>`,
      to: leave.email,
      subject: `Leave ${leave.status} from ${startDate} to ${endDate}`,
      text: `Dear ${employeeName},

Your leave request for the period ${startDate} to ${endDate} has been ${leave.status.toLowerCase()}.
${leave.status === 'Approved' ? 'Please ensure all work is handed over prior to your absence.\n\nWishing you well.' : ''}
${leave.manager_comment ? `\nManager Comments: ${leave.manager_comment}` : ''}

Best regards,

${employee.department ? `${employee.department} Manager` : "Manager"}`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Status email error:", error);
    return false;
  }
};


export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: Employee,
          attributes: ['firstName', 'lastName', 'department']
        }
      ]
    });
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json(leave);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({
      error: 'Failed to fetch leave request',
      details: error.message
    });
  }
};

export const getEmployeeLeaves = async (req, res) => {
  try {
    const employeeId = req.session.employee_id;
    
    if (!employeeId) {
      return res.status(401).json({ error: "Please login to view leave history" });
    }
    
    const leaves = await Leave.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(leaves);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({
      error: 'Failed to fetch employee leave history',
      details: error.message
    });
  }
};



export const getPendingLeavesByManager = async (req, res) => {
  try {
    const { manager_id } = req.params;

    if (!manager_id) {
      return res.status(400).json({ error: "Manager ID is required" });
    }

    const pendingLeaves = await Leave.findAll({
      where: { status: 'Pending' },
      order: [['created_at', 'DESC']]
    });

    const leavesWithEmployeeDetails = await Promise.all(
      pendingLeaves.map(async (leave) => {
        const employee = await Employee.findByPk(leave.employeeId);
        return {
          ...leave.toJSON(),
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
          employeeEmail: employee ? employee.email : null
        };
      })
    );

    res.json(leavesWithEmployeeDetails);
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    res.status(500).json({ error: "Error fetching pending leaves" });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.session.employee_id;
    
    const leave = await Leave.findByPk(id);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    if (leave.employeeId !== employeeId) {
      return res.status(403).json({ error: 'Not authorized to cancel this leave' });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot cancel leave that is already ${leave.status.toLowerCase()}` });
    }
    
    leave.status = 'Cancelled';
    await leave.save();
    
   
    await sendStatusUpdateNotification(leave, "System");
    
    res.json({ message: 'Leave request cancelled successfully', leave });
  } catch (error) {
    console.error('Cancellation Error:', error);
    res.status(500).json({
      error: 'Failed to cancel leave request',
      details: error.message
    });
  }
};