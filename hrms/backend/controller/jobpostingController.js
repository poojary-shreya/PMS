import JobRequisition from '../model/jobpostingmodel.js';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASSWORD 
  }
});


const sendJobRequisitionEmail = async (jobDetails, hiringManagerEmail) => {
  try {
    const emailSubject = `New Job Requisition Created: ${jobDetails.jobTitle} [${jobDetails.jobId}]`;
    
    const emailBody = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2a5885; }
          .job-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Job Requisition</h1>
          <p>A new job requisition has been created in the HRMS system that requires your attention.</p>
          
          <div class="job-details">
            <div class="field">
              <span class="label">Job ID:</span> ${jobDetails.jobId}
            </div>
            <div class="field">
              <span class="label">Job Title:</span> ${jobDetails.jobTitle}
            </div>
            <div class="field">
              <span class="label">Department:</span> ${jobDetails.department}
            </div>
            <div class="field">
              <span class="label">Location:</span> ${jobDetails.location}
            </div>
            <div class="field">
              <span class="label">Employment Type:</span> ${jobDetails.employmentType}
            </div>
            <div class="field">
              <span class="label">Number of Positions:</span> ${jobDetails.noOfPositions}
            </div>
            <div class="field">
              <span class="label">Experience Required:</span> ${jobDetails.experience}
            </div>
            <div class="field">
              <span class="label">Budget:</span> ${jobDetails.budget}
            </div>
            <div class="field">
              <span class="label">Job Closing Date:</span> ${jobDetails.jobClosedDate}
            </div>
            <div class="field">
              <span class="label">Description:</span><br>
              ${jobDetails.description}
            </div>
          </div>
          
          <p>Please review this job requisition and take appropriate action.</p>
          
          <div class="footer">
            <p>This is an automated message from the HRMS system. </p>
          </div>
        </div>
      </body>
    </html>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: hiringManagerEmail,
      subject: emailSubject,
      html: emailBody
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const createJobRequisition = async (req, res) => {
  try {
    console.log("Request body received:", req.body);
    
    const {
      jobId,
      jobTitle,
      department,
      location,
      employmentType,
      noOfPositions,
      experience,
      budget,
      jobClosedDate,
      hiringManagerName,
      hiringManagerEmail, 
      description,
    } = req.body;

   
    if (
      !jobId ||
      !jobTitle ||
      !department ||
      !location ||
      !employmentType ||
      !noOfPositions ||
      !experience ||
      !budget ||
      !jobClosedDate ||
      !hiringManagerName ||
      !hiringManagerEmail || 
      !description
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: Object.entries({
          jobId,
          jobTitle,
          department,
          location,
          employmentType,
          noOfPositions,
          experience,
          budget,
          jobClosedDate,
          hiringManagerName,
          hiringManagerEmail,
          description,
        })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      });
    }

  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hiringManagerEmail)) {
      return res.status(400).json({
        message: "Invalid email format for hiring manager",
        providedValue: hiringManagerEmail
      });
    }

    
    const allowedEmploymentTypes = ["Full Time", "Part Time", "Remote", "Contract", "Consultant"];
    if (!allowedEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({
        message: "Invalid employment type",
        allowedValues: allowedEmploymentTypes,
        providedValue: employmentType
      });
    }


    const positions = parseInt(noOfPositions);
    if (isNaN(positions) || positions < 1) {
      return res.status(400).json({
        message: "Number of positions must be a number greater than 0",
        providedValue: noOfPositions
      });
    }


    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(jobClosedDate)) {
      return res.status(400).json({
        message: "Job closed date must be in YYYY-MM-DD format",
        providedValue: jobClosedDate
      });
    }


    const existingJob = await JobRequisition.findOne({ where: { jobId } });
    if (existingJob) {
      return res.status(400).json({
        message: "A job with this Job ID already exists",
        jobId
      });
    }

    const newRequisition = await JobRequisition.create({
      jobId,
      jobTitle,
      department,
      location,
      employmentType,
      noOfPositions: positions, 
      experience,
      budget,
      jobClosedDate,
      hiringManagerName,
      hiringManagerEmail, 
      description,
    });


    const emailSent = await sendJobRequisitionEmail(newRequisition, hiringManagerEmail);

    return res.status(201).json({
      message: "Job Requisition created successfully",
      requisition: newRequisition,
      emailStatus: emailSent ? "Email notification sent to hiring manager" : "Failed to send email notification"
    });
  } catch (error) {
    console.error("Detailed error:", error);
    

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Unique constraint violation",
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        message: "Database error",
        error: error.message,
        originalError: error.original ? error.original.message : null
      });
    }
    
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error,
    });
  }
};


const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobId,
      jobTitle,
      department,
      location,
      employmentType,
      noOfPositions,
      experience,
      budget,
      jobClosedDate,
      hiringManagerName,
      hiringManagerEmail, 
      description,
    } = req.body;
    
 
    if (
      !jobId ||
      !jobTitle ||
      !department ||
      !location ||
      !employmentType ||
      !noOfPositions ||
      !experience ||
      !budget ||
      !jobClosedDate ||
      !hiringManagerName ||
      !hiringManagerEmail || 
      !description
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: Object.entries({
          jobId,
          jobTitle,
          department,
          location,
          employmentType,
          noOfPositions,
          experience,
          budget,
          jobClosedDate,
          hiringManagerName,
          hiringManagerEmail,
          description,
        })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      });
    }
    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hiringManagerEmail)) {
      return res.status(400).json({
        message: "Invalid email format for hiring manager",
        providedValue: hiringManagerEmail
      });
    }
    
  
    const allowedEmploymentTypes = ["Full Time", "Part Time", "Remote", "Contract", "Consultant"];
    if (!allowedEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({
        message: "Invalid employment type",
        allowedValues: allowedEmploymentTypes,
        providedValue: employmentType
      });
    }
    
    const job = await JobRequisition.findByPk(id);
    
    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }
    

    if (jobId !== job.jobId) {
      const existingJob = await JobRequisition.findOne({ where: { jobId } });
      if (existingJob && existingJob.id !== parseInt(id)) {
        return res.status(400).json({
          message: "A job with this Job ID already exists",
          jobId
        });
      }
    }
    
 
    await job.update({
      jobId,
      jobTitle,
      department,
      location,
      employmentType,
      noOfPositions: parseInt(noOfPositions),
      experience,
      budget,
      jobClosedDate,
      hiringManagerName,
      hiringManagerEmail,
      description,
    });
    
 
    const significantChanges = 
      job.jobTitle !== jobTitle || 
      job.department !== department || 
      job.location !== location || 
      job.employmentType !== employmentType || 
      job.noOfPositions !== parseInt(noOfPositions);
    

    if (significantChanges || job.hiringManagerEmail !== hiringManagerEmail) {
      await sendJobRequisitionEmail(job, hiringManagerEmail);
    }
    
    return res.status(200).json({
      message: "Job posting updated successfully",
      job,
      emailStatus: significantChanges ? "Update notification sent to hiring manager" : "No notification sent (minor changes)"
    });
  } catch (error) {
    console.error("Detailed error:", error);
    
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Unique constraint violation",
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error
    });
  }
};

const getAllJobListings = async (req, res) => {
  try {
    const jobs = await JobRequisition.findAll({
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      message: "Job listings retrieved successfully",
      jobs
    });
  } catch (error) {
    console.error("Error retrieving job listings:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error
    });
  }
};


const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobRequisition.findByPk(id);
    
    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }
    
    return res.status(200).json({
      message: "Job retrieved successfully",
      job
    });
  } catch (error) {
    console.error("Error retrieving job:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error
    });
  }
};


const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobRequisition.findByPk(id);
    
    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }
    
    await job.destroy();
    
    return res.status(200).json({
      message: "Job posting deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting job posting:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error
    });
  }
};

export { 
  createJobRequisition, 
  getAllJobListings,
  getJobById,
  updateJobPosting,
  deleteJobPosting
};