import dotenv from "dotenv";
import Bonafide from "../model/bonafiedmodel.js";
import Employee from "../model/addpersonalmodel.js";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";

dotenv.config();


const sendEmail = async (to, subject, text, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/certificates/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `certificate-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

export const createBonafideRequest = async (req, res) => {
  try {
    const { name, department, reason, address, candidateEmail, hrEmail } = req.body;
    const employee_id = req.session.employee_id;

    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Failed to submit the request can only be accessed when logged in with company email" 
      });
    }

    if (!name || !employee_id || !department || !reason || !address || !candidateEmail || !hrEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRequest = await Bonafide.create({
      name,
      employee_id,
      department,
      reason,
      address,          
      candidateEmail,
      hrEmail,
    });

    console.log("Bonafide request created, sending email...");

    await sendEmail(
      hrEmail,
      "New Bonafide Request",
      `A new bonafide request has been submitted by ${name}. Please review it.`
    );

    console.log("Email sent to HR successfully.");

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating bonafide request:", error);
    res.status(500).json({ message: "Failed to submit bonafide request" });
  }
};

export const updateBonafideStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await Bonafide.findByPk(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await request.update({ status });

    await sendEmail(
      request.candidateEmail,
      "Bonafide Request Status Update",
      `Your bonafide request has been ${status}.

Sincerely,
HR Department
Bridgeme Technologies Pvt. Ltd.`
    );

    console.log("Status updated and email sent to candidate.");
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};


export const uploadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Bonafide.findByPk(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const certificatePath = req.file.path.replace(/\\/g, "/");

    await request.update({
      certificate: certificatePath,
      certificatePath: certificatePath,
    });

    const emailContent = `Dear ${request.name},

Your Bonafide Certificate has been processed successfully.

You can find the attached Bonafide Certificate issued for ${request.reason}.

Best regards,
HR Department
Bridgeme Technologies Pvt. Ltd.`;

    await sendEmail(
      request.candidateEmail,
      "Bonafide Certificate Ready",
      emailContent,
      [{ filename: `bonafide_${request.employee_id}.pdf`, path: certificatePath }]
    );

    res.status(200).json({
      message: "Certificate uploaded and email sent successfully",
      certificatePath,
    });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    res.status(500).json({ message: "Failed to upload certificate" });
  }
};


export const getAllBonafideRequests = async (req, res) => {
  try {
    const requests = await Bonafide.findAll({
      include: {
        model: Employee,
        as: "personal",
        attributes: ["firstName", "lastName", "phoneNumber"],
      },
    });
    

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching bonafide requests:", error);
    res.status(500).json({ message: "Failed to fetch bonafide requests" });
  }
};


export const getCertificatesByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;
  if (!req.session.isCompanyEmail) {
    return res.status(403).json({ 
      message: "Access denied: Failed to submit the request can only be accessed when logged in with company email" 
    });
  }

  try {
    const certificates = await Bonafide.findAll({
      where: {
        employee_id: employeeId,
        status: "Approved",
        certificate: { [Op.ne]: null }, 
      },
    });

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates by employee ID:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};


export const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    const certificate = await Bonafide.findByPk(id);

    if (!certificate || !certificate.certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const filePath = path.resolve(certificate.certificate);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate file not found" });
    }

    res.download(filePath, `bonafide_${certificate.employee_id}.pdf`);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(500).json({ message: "Failed to download certificate" });
  }
};
export const getCertificatesByEmployeeEmail = async (req, res) => {
  const { email } = req.params;

  try {
   
    const certificates = await Bonafide.findAll({
      where: {
        candidateEmail: email,
        status: "Approved",
        certificate: { [Op.ne]: null }, 
      },
    });

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates by email:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};