
import OnboardingDocument from '../model/docmodel.js';
import Onboarding from '../model/onboardingmodel.js';
import Employee from '../model/addpersonalmodel.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';


dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});


export const onboardingController = {

  async createOnboarding(req, res) {
    try {
      const employee_id=req.session.employee_id;
  
      console.log("Request body:", req.body);
      
    
      let requiredDocuments = req.body.requiredDocuments;
      if (typeof requiredDocuments === 'string') {
        try {
          requiredDocuments = JSON.parse(requiredDocuments);
        } catch (e) {
          console.error("Error parsing requiredDocuments:", e);
        }
      }

    
      const existingEmployee = await Employee.findOne({
        where: { employee_id: req.body.employee_id }
      });

      if (existingEmployee) {
    
        if (existingEmployee.personalemail !== req.body.candidateEmail && 
            existingEmployee.companyemail !== req.body.candidateEmail) {
          console.log("Warning: Email mismatch for existing employee ID");
        }
      } else {
        console.log("Creating onboarding for new employee ID:", req.body.employee_id);
      }
  
  
      const onboarding = await Onboarding.create({
        employee_id: req.body.employee_id,
        candidateName: req.body.candidateName,
        candidateEmail: req.body.candidateEmail,
        onboardingProcess: req.body.onboardingProcess,
        processDetails: req.body.processDetails,
        requiredDocuments: requiredDocuments,
        taskCompletionDate: req.body.taskCompletionDate,
        status: req.body.status || 'Pending'
      });

      if (req.files && req.files.length > 0) {
        const documentPromises = req.files.map(file => {
          return OnboardingDocument.create({
            onboardingId: onboarding.id,
            documentName: file.originalname,
            documentPath: file.path,
            documentType: file.mimetype
          });
        });
        await Promise.all(documentPromises);
      }

  
      try {
        await onboardingController.sendOnboardingEmail(onboarding);
        console.log("Email sent successfully to candidate");
      } catch (emailError) {
        console.error("Error sending email to candidate:", emailError);
      
      }

      return res.status(201).json({
        success: true,
        message: 'Onboarding process created successfully',
        data: onboarding
      });
    } catch (error) {
      console.error('Error creating onboarding process:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create onboarding process',
        error: error.message
      });
    }
  },
  
 
  async sendOnboardingEmail(candidateData) {
    try {
   
      let documentsList = '';
      if (candidateData.requiredDocuments && Array.isArray(candidateData.requiredDocuments)) {
        documentsList = candidateData.requiredDocuments.map(doc => `• ${doc}`).join('\n');
      }
  
    
      let jobTitle = 'New Team Member';
      if (candidateData.processDetails && typeof candidateData.processDetails === 'object') {
        jobTitle = candidateData.processDetails.jobTitle || jobTitle;
      } else if (typeof candidateData.processDetails === 'string') {
        try {
          const processDetails = JSON.parse(candidateData.processDetails);
          jobTitle = processDetails.jobTitle || jobTitle;
        } catch (e) {
   
        }
      }
  

      const joiningDate = candidateData.taskCompletionDate 
        ? new Date(candidateData.taskCompletionDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'To be confirmed';
  
 
      let venue = 'To be communicated';
      if (candidateData.processDetails) {
        if (typeof candidateData.processDetails === 'object') {
          venue = candidateData.processDetails.venue || venue;
        } else if (typeof candidateData.processDetails === 'string') {
          try {
            const processDetails = JSON.parse(candidateData.processDetails);
            venue = processDetails.venue || venue;
          } catch (e) {
   
          }
        }
      }
  
     
      const mailOptions = {
        from: `"HR Team" <${process.env.EMAIL_USER}>`,
        to: candidateData.candidateEmail,
        subject: `Welcome to Bridgeme Technologies – Onboarding Details and Employee ID`,
        html: `
          <p>Dear ${candidateData.candidateName},</p>
          <p>Congratulations once again on your selection as <strong>${jobTitle}</strong> at Bridgeme Technologies Pvt. Ltd.</p>
          
          <p style="font-size: 16px; font-weight: bold; color: #2c3e50; background-color: #f8f9fa; padding: 10px; border-left: 4px solid #3498db;">
            Your Employee ID is: ${candidateData.employee_id}
          </p>
          
          <p>Please find below your onboarding instructions:</p>
          <ul>
            <li><strong>Joining Date:</strong> ${joiningDate}</li>
            <li><strong>Reporting Time & Venue:</strong> ${venue}</li>
            <li><strong>Documents to Carry:</strong></li>
          </ul>
          <p>${documentsList}</p>
          
          <p>Please keep your Employee ID handy for all future communications with the company.</p>
          
          <p>Kindly acknowledge and confirm your availability for the same.</p>
          <p>Warm regards,<br><strong>HR Team</strong><br>Bridgeme Technologies Pvt. Ltd.</p>
        `
      };
  

      const info = await transporter.sendMail(mailOptions);
      console.log('Onboarding email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending onboarding email:', error);
      throw error; 
    }
  }
,


  
  async getAllOnboardings(req, res) {
    try {
      const onboardings = await Onboarding.findAll({
        include: [
          {
            model: OnboardingDocument,
            as: 'documents'
          },
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'firstName', 'lastName', 'personalemail', 'companyemail']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        count: onboardings.length,
        data: onboardings
      });
    } catch (error) {
      console.error('Error fetching onboarding processes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch onboarding processes',
        error: error.message
      });
    }
  },

  async getOnboardingById(req, res) {
    try {
      const { id } = req.params;
      
  
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid onboarding ID. ID must be a number.'
        });
      }
      
      const onboarding = await Onboarding.findByPk(parseInt(id), {
        include: [
          {
            model: OnboardingDocument,
            as: 'documents'
          },
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'firstName', 'lastName', 'personalemail', 'companyemail']
          }
        ]
      });

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding process not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: onboarding
      });
    } catch (error) {
      console.error('Error fetching onboarding process:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch onboarding process',
        error: error.message
      });
    }
  },


  async updateOnboarding(req, res) {
    try {
      const { id } = req.params;
      
     
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid onboarding ID. ID must be a number.'
        });
      }
      
     
      let requiredDocuments = req.body.requiredDocuments;
      if (typeof requiredDocuments === 'string') {
        try {
          requiredDocuments = JSON.parse(requiredDocuments);
        } catch (e) {
          console.error("Error parsing requiredDocuments:", e);
        }
      }

      const onboarding = await Onboarding.findByPk(parseInt(id));

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding process not found'
        });
      }

 
      if (req.body.candidateEmail && req.body.candidateEmail !== onboarding.candidateEmail) {
        const employee = await Employee.findOne({
          where: {
            [Op.or]: [
              { personalemail: req.body.candidateEmail },
              { companyemail: req.body.candidateEmail }
            ]
          }
        });

        if (!employee) {
          return res.status(404).json({
            success: false,
            message: 'No employee found with the new email address'
          });
        }

     
        req.body.employee_id = employee.employee_id;
      }

      await onboarding.update({
        employee_id: req.body.employee_id || onboarding.employee_id,
        candidateName: req.body.candidateName,
        candidateEmail: req.body.candidateEmail,
        onboardingProcess: req.body.onboardingProcess,
        processDetails: req.body.processDetails,
        requiredDocuments: requiredDocuments,
        taskCompletionDate: req.body.taskCompletionDate,
        status: req.body.status
      });

      if (onboarding.candidateEmail) {
        try {
          const mailOptions = {
            from: `"HR Team" <${process.env.EMAIL_USER}>`,
            to: onboarding.candidateEmail,
            subject: `Onboarding Details Updated - Bridgeme Technologies`,
            html: `
              <p>Dear ${onboarding.candidateName},</p>
              <p>Your onboarding process information has been updated. Please check the employee portal for the latest details.</p>
              <p>Warm regards,<br><strong>HR Team</strong><br>Bridgeme Technologies Pvt. Ltd.</p>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log('Update notification email sent to candidate');
        } catch (emailError) {
          console.error('Error sending update notification email:', emailError);
     
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Onboarding process updated successfully',
        data: onboarding
      });
    } catch (error) {
      console.error('Error updating onboarding process:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update onboarding process',
        error: error.message
      });
    }
  },

  async deleteOnboarding(req, res) {
    try {
      const { id } = req.params;
      

      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid onboarding ID. ID must be a number.'
        });
      }
      
      const onboarding = await Onboarding.findByPk(parseInt(id));
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding process not found'
        });
      }

   
      const candidateEmail = onboarding.candidateEmail;
      const candidateName = onboarding.candidateName;

   
      await OnboardingDocument.destroy({
        where: { onboardingId: id }
      });

      await onboarding.destroy();

      if (candidateEmail) {
        try {
          const mailOptions = {
            from: `"HR Team" <${process.env.EMAIL_USER}>`,
            to: candidateEmail,
            subject: `Important Notice - Onboarding Process Cancelled`,
            html: `
              <p>Dear ${candidateName},</p>
              <p>This is to inform you that your onboarding process has been cancelled or removed from our system.</p>
              <p>If you believe this is an error, please contact HR immediately.</p>
              <p>Warm regards,<br><strong>HR Team</strong><br>Bridgeme Technologies Pvt. Ltd.</p>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log('Deletion notification email sent to candidate');
        } catch (emailError) {
          console.error('Error sending deletion notification email:', emailError);
         
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Onboarding process deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting onboarding process:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete onboarding process',
        error: error.message
      });
    }
  },

 
  async getOnboardingsByStatus(req, res) {
    try {
      const { status } = req.params;
      
      const onboardings = await Onboarding.findAll({
        where: { status },
        include: [
          {
            model: OnboardingDocument,
            as: 'documents'
          },
          {
            model: Employee,
            as: 'employee',
            attributes: ['employee_id', 'firstName', 'lastName', 'personalemail', 'companyemail']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        count: onboardings.length,
        data: onboardings
      });
    } catch (error) {
      console.error('Error fetching onboarding processes by status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch onboarding processes',
        error: error.message
      });
    }
  },

  async getEmployeeOnboarding(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email parameter is required" });
      }

    
      const employee = await Employee.findOne({
        where: {
          [Op.or]: [
            { personalemail: email },
            { companyemail: email }
          ]
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found with the provided email'
        });
      }
  
 
      const onboardingData = await Onboarding.findAll({
        where: { 
          employee_id: employee.employee_id,
          status: ['Pending', 'In Progress'] 
        },
        include: [{
          model: OnboardingDocument,
          as: 'documents'
        }]
      });
  
      if (!onboardingData || onboardingData.length === 0) {
        return res.status(404).json({ success: false, message: "No onboarding found for this employee" });
      }
  
      res.status(200).json({ success: true, data: onboardingData });
    } catch (error) {
      console.error('Error fetching employee onboarding:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch onboarding processes",
        error: error.message
      });
    }
  },
  
  async getOnboardingByEmail(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email parameter is required" });
      }
      
     
      const employee = await Employee.findOne({
        where: {
          [Op.or]: [
            { personalemail: email },
            { companyemail: email }
          ]
        }
      });
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found with the provided email'
        });
      }
      
    
      const onboardingTasks = await Onboarding.findAll({
        where: { employee_id: employee.employee_id },
        include: [{
          model: OnboardingDocument,
          as: 'documents'
        }]
      });
      
      
      res.json({ 
        success: true, 
        data: onboardingTasks,
        employee: {
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          department: employee.department,
          email: email
        }
      });
    } catch (error) {
      console.error("Error in getOnboardingByEmail:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async getOnboardingByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }
  
      console.log(`Fetching onboarding data for employee ID: ${employeeId}`);
      
    
      const onboardingTasks = await Onboarding.findAll({
        where: { employee_id: employeeId },
        include: [{
          model: OnboardingDocument,
          as: 'documents'
        }]
      });
  
      return res.status(200).json({
        success: true,
        data: onboardingTasks,
        message: 'Onboarding tasks retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error in getOnboardingByEmployeeId:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch onboarding tasks',
        error: error.message
      });
    }
  },

  async sendReminderEmail(req, res) {
    try {
      const { id } = req.params;
   
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid onboarding ID. ID must be a number.'
        });
      }
      
      const onboarding = await Onboarding.findByPk(parseInt(id));
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding process not found'
        });
      }

   
      if (onboarding.candidateEmail) {
        try {
          const mailOptions = {
            from: `"HR Team" <${process.env.EMAIL_USER}>`,
            to: onboarding.candidateEmail,
            subject: `Reminder: Complete Your Onboarding Tasks - Bridgeme Technologies`,
            html: `
              <p>Dear ${onboarding.candidateName},</p>
              <p>This is a friendly reminder to complete your pending onboarding tasks by ${new Date(onboarding.taskCompletionDate).toLocaleDateString()}.</p>
              <p>Please log in to the employee portal to view and complete your pending tasks.</p>
              <p>Warm regards,<br><strong>HR Team</strong><br>Bridgeme Technologies Pvt. Ltd.</p>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log('Reminder email sent to candidate');
          
          return res.status(200).json({
            success: true,
            message: 'Reminder email sent successfully'
          });
        } catch (emailError) {
          console.error('Error sending reminder email:', emailError);
          return res.status(500).json({
            success: false,
            message: 'Failed to send reminder email',
            error: emailError.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Candidate email not found'
        });
      }
    } catch (error) {
      console.error('Error processing reminder request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process reminder request',
        error: error.message
      });
    }
  },
  
}

export default onboardingController;