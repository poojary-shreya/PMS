import nodemailer from 'nodemailer';
import Training from '../model/trainingmodel.js';
import TrainingUpdate from '../model/trainingupdate.js';
import Employee from '../model/addpersonalmodel.js';  
import { findSuitableVideo } from './videoController.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const createTraining = async (req, res) => {
  try {
    const { email, title, startDate, endDate, trainer, skillCategory, skillContent } = req.body;
  
    const today = new Date().toISOString().split('T')[0];

    if (!email || !title || !startDate || !endDate || !trainer) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    let videoUrl = null;
    if (skillCategory && skillContent) {
      videoUrl = await findSuitableVideo(skillCategory, skillContent);
    }

    const trainingData = {
      ...req.body,
      status: req.body.startDate <= today ? 'In Progress' : 'Planned',
      videoUrl 
    };

    const training = await Training.create(trainingData);

   
    await TrainingUpdate.create({
      trainingId: training.id,
      employeeId: req.body.employee_id || 'HR',
      employeeName: 'HR Administrator',
      status: trainingData.status,
      progressPercentage: 0,
      completionNotes: 'Training created',
      updateDate: new Date()
    });

    const mailOptions = {
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Training Program Enrollment: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .main-table { width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #1a237e; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f8f9fa; }
            .footer { background-color: #f1f3f4; padding: 20px; text-align: center; font-size: 12px; }
            .training-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .training-table th { background-color: #e8eaf6; text-align: left; padding: 12px; }
            .training-table td { padding: 12px; border-bottom: 1px solid #ddd; }
            .company-logo { height: 40px; }
            .cta-button {
              background-color: #1a237e;
              color: white !important;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <table class="main-table">
            <tr class="content">
              <td>
                <h2 style="color: #1a237e; margin-bottom: 25px;">Training Program Enrollment Notification</h2>
                
                <p>Dear Employee,</p>
                
                <p>We are pleased to inform you that you have been enrolled in the following training program 
                as part of your professional development:</p>
    
                <table class="training-table">
                  <tr><th>Program Title</th><td>${title}</td></tr>
                  <tr><th>Lead Trainer</th><td>${trainer}</td></tr>
                  <tr><th>Duration</th><td>${new Date(startDate).toDateString()} - ${new Date(endDate).toDateString()}</td></tr>
                  <tr><th>Program Overview</th><td>${skillContent || 'Professional skills development'}</td></tr>
                </table>
    
                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Review training schedule in your calendar</li>
                  <li>Complete any pre-requisite materials</li>
                  <li>Ensure availability for the entire duration</li>
                </ul>
    
                <p style="margin-top: 20px;">Best regards,</p>
          
                <p><strong>HR Team</strong><br>
                Bridgeme Technologies<br>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: "Training created and notification sent successfully",
      training
    });

  } catch (error) {
    console.error("Error:", error);
    
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        message: "Email configuration error",
        error: "Invalid email credentials"
      });
    }

    const errorMessage = error.errors?.map(e => e.message) || error.message;
    res.status(500).json({
      message: error.message.includes("email") 
        ? "Training created but failed to send email"
        : "Failed to add training",
      error: errorMessage
    });
  }
};

export const getTrainings = async (req, res) => {
  try {
    
    const trainings = await Training.findAll();
    
    const today = new Date().toISOString().split('T')[0];
    const updatedTrainings = [];
    
    for (const training of trainings) {
      if (training.status === 'Planned' && training.startDate <= today && training.endDate >= today) {
        await training.update({ status: 'In Progress' });
        
     
        await TrainingUpdate.create({
          trainingId: training.id,
          employeeId: 'SYSTEM',
          employeeName: 'System Update',
          status: 'In Progress',
          progressPercentage: training.progressPercentage || 0,
          completionNotes: 'Status automatically updated to In Progress as start date has passed',
          updateDate: new Date()
        });
      }
      updatedTrainings.push(training);
    }
    
    res.status(200).json(updatedTrainings);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      message: "Server error fetching trainings",
      error: error.message
    });
  }
};

export const getEmployeeTrainingsByEmployeeId = async (req, res) => {
  try {
  
    const employee_id = req.session.employee_id;
    
  
    if (!employee_id) {
      return res.status(400).json({ message: "No employee ID found in session. Please log in." });
    }
    

    const trainings = await Training.findAll({
      where: { employee_id },
      order: [['startDate', 'DESC']]
    });
    
    res.status(200).json(trainings);
  } catch (error) {
    console.error("Error fetching employee trainings:", error);
    res.status(500).json({
      message: "Failed to fetch trainings for employee",
      error: error.message
    });
  }
};

export const getEmployeeTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const training = await Training.findByPk(id);
    
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    
    res.status(200).json(training);
  } catch (error) {
    console.error("Error fetching training details:", error);
    res.status(500).json({
      message: "Failed to fetch training details",
      error: error.message
    });
  }
};

export const getEmployeeTrainings = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const trainings = await Training.findAll({
      where: { email },
      order: [['startDate', 'DESC']]
    });
    
    res.status(200).json(trainings);
  } catch (error) {
    console.error("Error fetching employee trainings:", error);
    res.status(500).json({
      message: "Failed to fetch trainings for employee",
      error: error.message
    });
  }
};

export const updateTrainingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progressPercentage, completionNotes, employeeId, employeeName } = req.body;
    
    const training = await Training.findByPk(id);
    
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    

    await training.update({
      status,
      progressPercentage,
      completionNotes,
      lastUpdated: new Date() 
    });
    
 
    if (status === "Completed" && progressPercentage !== 100) {
      await training.update({ progressPercentage: 100 });
    }
    
    
    await TrainingUpdate.create({
      trainingId: id,
      employeeId: employeeId || 'UNKNOWN',
      employeeName: employeeName || 'Employee',
      status,
      progressPercentage: status === "Completed" ? 100 : progressPercentage,
      completionNotes,
      updateDate: new Date()
    });
    
    res.status(200).json({
      message: "Training progress updated successfully",
      training
    });
  } catch (error) {
    console.error("Error updating training progress:", error);
    res.status(500).json({
      message: "Failed to update training progress",
      error: error.message
    });
  }
};

export const getTrainingUpdateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Training ID is required" });
    }
    
    // Get all update records for this training ID
    const updates = await TrainingUpdate.findAll({
      where: { trainingId: id },
      order: [['updateDate', 'DESC']], // Most recent updates first
    });
    
    res.status(200).json(updates);
  } catch (error) {
    console.error("Error fetching training update history:", error);
    res.status(500).json({
      message: "Failed to fetch update history",
      error: error.message
    });
  }
};

export const getRecentUpdates = async (req, res) => {
  try {

    const recentUpdates = await TrainingUpdate.findAll({
      order: [['updateDate', 'DESC']],
      limit: 5,
      include: [{
        model: Training,
        attributes: ['title', 'employee', 'email'] 
      }]
    });
    

    const formattedUpdates = recentUpdates.map(update => ({
      id: update.trainingId,
      employee: update.employeeName || update.Training.employee || 'Employee',
      title: update.Training.title,
      progressPercentage: update.progressPercentage,
      status: update.status,
      lastUpdated: update.updateDate
    }));
    
    res.status(200).json(formattedUpdates);
  } catch (error) {
    console.error("Error fetching recent updates:", error);
    res.status(500).json({
      message: "Failed to fetch recent updates",
      error: error.message
    });
  }
};

export const notifyTrainingUpdate = async (req, res) => {
  try {
    const { trainingId, message } = req.body;
    
    if (!trainingId || !message) {
      return res.status(400).json({ message: "Training ID and message are required" });
    }
    
    const training = await Training.findByPk(trainingId);
    
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    
    // Send email notification about the training update
    const mailOptions = {
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: training.email,
      subject: `Update for Training: ${training.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .main-table { width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .content { padding: 30px 20px; background-color: #f8f9fa; }
            .footer { background-color: #f1f3f4; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <table class="main-table">
            <tr class="content">
              <td>
                <h2 style="color: #1a237e; margin-bottom: 25px;">Training Update Notification</h2>
                
                <p>Dear Employee,</p>
                
                <p>There has been an update regarding your training program: <strong>${training.title}</strong></p>
    
                <div style="padding: 15px; background-color: #e8eaf6; border-left: 4px solid #1a237e; margin: 20px 0;">
                  ${message}
                </div>
    
                <p style="margin-top: 20px;">Best regards,</p>
          
                <p><strong>HR Team</strong><br>
                Bridgeme Technologies<br>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      message: "Notification sent successfully"
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      message: "Failed to send notification",
      error: error.message
    });
  }
};


