import { Candidate } from '../model/trackingmodel.js';
import Employee from "../model/addpersonalmodel.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export const createReferral = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      experience,
      positionApplied,
      referralreason,
      noticePeriod,
      referrerRelation
    } = req.body;

    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({ message: "Unauthorized: No employee session found" });
    }

    const employee = await Employee.findOne({ 
      where: { employee_id: req.session.employee_id } 
    });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const referrerName = employee.firstName;
    const referrerEmail = employee.companyemail;

    const resumePath = req.file ? path.basename(req.file.path) : null;

    const existingCandidate = await Candidate.findByPk(email);
    if (existingCandidate) {
      if (resumePath) {
        const filePath = path.join(__dirname, '..', 'uploads', resumePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(409).json({ message: 'Candidate with this email already exists' });
    }

    const newCandidate = await Candidate.create({
      email,
      name,
      phone,
      skills: Array.isArray(skills) ? skills : JSON.parse(skills || '[]'),
      experience: experience ? parseInt(experience) : 0,
      positionApplied,
      noticePeriod,
      referralreason,
      resumePath,      
      referrerName,    
      referrerEmail,   
      referrerRelation
    });

    res.status(201).json({
      message: 'Candidate referred successfully',
      candidate: newCandidate
    });

  } catch (error) {
    console.error("Error creating referral:", error);

    if (req.file && req.file.path) {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(req.file.path));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      message: 'Failed to create referral',
      error: error.message
    });
  }
};



export const quickResumeUpload = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: 'Candidate email is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({ message: "Unauthorized: No employee session found" });
    }

    // Get referrer (employee) information
    const employee = await Employee.findOne({ 
      where: { employee_id: req.session.employee_id } 
    });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const referrerName = employee.firstName;
    const referrerEmail = employee.companyemail;

    // Handle the resume file
    const resumePath = req.file ? path.basename(req.file.path) : null;

    // Check if candidate already exists
    const existingCandidate = await Candidate.findByPk(email);
    if (existingCandidate) {
      if (resumePath) {
        const filePath = path.join(__dirname, '..', 'uploads', resumePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(409).json({ message: 'Candidate with this email already exists' });
    }

    // Create new candidate with minimal information
    const newCandidate = await Candidate.create({
      email,
      name: name || 'To be updated',
      phone: req.body.phone || '0000000000',
      skills: [],
      experience: 0,
      positionApplied: 'To be determined',
      noticePeriod: 'To be determined',
      referralreason: 'Quick resume upload for further review',
      resumePath,
      referrerName,
      referrerEmail,
      referrerRelation: req.body.referrerRelation || 'Professional'
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      candidate: newCandidate
    });

  } catch (error) {
    console.error("Error uploading resume:", error);

    // Clean up the uploaded file if there was an error
    if (req.file && req.file.path) {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(req.file.path));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      message: 'Failed to upload resume',
      error: error.message
    });
  }
};

export const getReferrerInfo = async (req, res) => {
    try {
      if (!req.session || !req.session.employee_id) {
        return res.status(401).json({ message: "Unauthorized: No employee session found" });
      }
  
      const employee = await Employee.findOne({ 
        where: { employee_id: req.session.employee_id },
        attributes: ['firstName', 'companyemail'] 
      });
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      console.log("Employee found:", employee);
console.log("Returning data:", {
  referrerName: employee.firstName,
  referrerEmail: employee.companyemail
});
  
      res.status(200).json({
        referrerName: employee.firstName,
        referrerEmail: employee.companyemail
      });
    } catch (error) {
      console.error("Error fetching referrer info:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };

export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Candidate.findAll({
      where: {
        referrerName: {
          [sequelize.Op.ne]: null
        }
      }
    });
    
    res.status(200).json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ 
      message: 'Failed to fetch referrals', 
      error: error.message 
    });
  }
};
