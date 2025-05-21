import AdvanceSalary from "../model/advancesalarymodel.js";
import Employee from "../model/addpersonalmodel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const createSalaryRequest = async (req, res) => {
  try {
    const { name,  department, salaryAmount, candidateEmail, hrEmail, reason, designation } = req.body;
    const employee_id = req.session.employee_id;
    if (!name || !employee_id || !department || !salaryAmount || !candidateEmail || !hrEmail || !reason || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: failed to submit can only be accessed when logged in with company email" 
      });
    }


    const newRequest = await AdvanceSalary.create({ 
      name, 
      employee_id, 
      department, 
      salaryAmount,
      candidateEmail, 
      hrEmail,        
      reason,
      designation,
      status: "Pending" 
    });

    const emailTemplate = `Subject: Request for Advance Salary – ${name}

Dear Manager/HR,

I am writing to request an advance salary of ₹${salaryAmount} for ${reason}. I understand the policies governing such requests and agree to the necessary deductions from my upcoming salary.

Kindly consider and approve my request at the earliest.

Thanks & Regards,
${name}
${designation}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: hrEmail,
      subject: `Request for Advance Salary – ${name}`,
      text: emailTemplate,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error submitting salary request:", error);
    res.status(500).json({ message: "Failed to submit request", error: error.message });
  }
};

export const updateSalaryRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, candidateEmail, name } = req.body;

  try {
    const request = await AdvanceSalary.findByPk(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();

    const emailTemplate = `Subject: Your Salary Advance Request is ${status}

Dear ${name},

Your advance salary request has been ${status}.

Thanks & Regards,
HR department
Bridgeme Technologies Pvt. Ltd.
`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Your Salary Advance Request is ${status}`,
      text: emailTemplate,
    });

    res.status(200).json({ message: "Status updated and mail sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const getAllSalaryRequests = async (req, res) => {
  try {
    const requests = await AdvanceSalary.findAll({
      include: {
        model: Employee,
        as: "personal",  
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching advance salary requests:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
