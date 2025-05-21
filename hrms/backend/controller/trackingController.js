// Fixed trackingController.js
import { Op } from "sequelize";
import { Candidate } from "../model/trackingmodel.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getCandidates = async (req, res) => {
  const { skills, experience, search } = req.query;
  const whereClause = {};
  
  try {
    if (skills) {
      whereClause.skills = {
        [Op.contains]: [skills]
      };
    }
    
    if (experience) {
      whereClause.experience = experience;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { skills: { [Op.contains]: [search] } }
      ];
    }
    
    const candidates = await Candidate.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(candidates);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch candidates",
      details: error.message
    });
  }
};

export const getCandidateResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching resume for candidate ID: ${id}`);
    
    // Find the candidate by ID
    const candidate = await Candidate.findOne({
      where: { id: parseInt(id) }
    });
    
    if (!candidate) {
      console.log(`Candidate with ID ${id} not found`);
      return res.status(404).json({
        message: "Candidate not found"
      });
    }
    
    console.log(`Found candidate: ${candidate.name}, resume path: ${candidate.resumePath}`);
    
    // Check if the resume path exists
    if (!candidate.resumePath) {
      console.log("No resume path found for candidate");
      return res.status(404).json({
        message: "No resume found for this candidate"
      });
    }
    
    // Get the absolute path of the resume
    const resumePath = path.join(__dirname, '..', 'uploads', candidate.resumePath);
    console.log(`Resolved resume path: ${resumePath}`);
    
    // Check if the file exists
    if (!fs.existsSync(resumePath)) {
      console.log(`Resume file not found at path: ${resumePath}`);
      return res.status(404).json({
        message: "Resume file not found"
      });
    }
    
    // Determine mime type based on file extension
    const fileExtension = path.extname(resumePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      contentType = 'application/msword';
    } else if (['.txt'].includes(fileExtension)) {
      contentType = 'text/plain';
    }
    
    console.log(`Sending file with content type: ${contentType}`);
    
    // Set the appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(resumePath)}"`);
    
    // Stream the file to the client
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error retrieving resume:", error);
    res.status(500).json({
      error: "Failed to retrieve candidate resume",
      details: error.message
    });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const candidate = await Candidate.findOne({ 
      where: { id: parseInt(id) }
    });
    
    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }
    
    const updatedCandidate = await candidate.update({
      status: "Interview Scheduled",
      lastUpdated: new Date()
    });
    
    res.json({
      message: "Interview scheduled successfully!",
      candidate: updatedCandidate
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to schedule interview",
      details: error.message
    });
  }
};