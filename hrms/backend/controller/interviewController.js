import Interview from "../model/interviewmodel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});


const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


export const createInterview = async (req, res) => {
  try {
    const interviewData = {
      candidateEmail: req.body.email || "",
      name: req.body.name || "",
      positionApplied: req.body.positionApplied || "",
      skills: req.body.skills || "",
      experience: parseInt(req.body.experience) || 0,
      interviewDate: req.body.interviewDate || new Date(),
      interviewTime: req.body.interviewTime || "",
      interviewer: req.body.interviewer || "",
      round: req.body.round || "",
      hiringManagerEmail: req.body.hiringManagerEmail || "",
      status: "Scheduled"
    };

    const interview = await Interview.create(interviewData);

   
    await transporter.sendMail({
      from: `"Bridgeme HR Team" <${process.env.EMAIL_USER}>`,
      to: interviewData.candidateEmail,
      subject: `Interview Invitation for ${interviewData.positionApplied} at Bridgeme Technologies Pvt. Ltd.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Interview Invitation</h2>
          <p>Dear <strong>${interviewData.name}</strong>,</p>
          <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${interviewData.positionApplied}</strong> at Bridgeme Technologies Pvt. Ltd. Please find the interview details below:</p>
          <div>
            <p><strong>Date:</strong> ${formatDate(interviewData.interviewDate)}</p>
            <p><strong>Time:</strong> ${interviewData.interviewTime}</p>
            <p><strong>Round:</strong> ${interviewData.round}</p>
            <p><strong>Mode:</strong> Virtual</p>
            <p><strong>Venue / Link:</strong> [Meeting Link will be shared 1 hour before interview]</p>
            <p><strong>Interviewer:</strong> ${interviewData.interviewer}</p>
          </div>
          <p>Kindly confirm your availability by replying to this email.</p>
          <p>Warm regards,<br>HR Team<br>Bridgeme Technologies Pvt. Ltd.</p>
        </div>
      `,
    });

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


export const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result, feedback } = req.body;

    const interview = await Interview.findByPk(id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = status || interview.status;
    interview.result = result || interview.result;
    interview.feedback = feedback || interview.feedback;

    if (interview.round.toLowerCase().includes('hr') &&
        status === 'Completed' &&
        result === 'Selected') {
      interview.hrRoundCompleted = true;
    }

    await interview.save();

    if (status === 'Completed') {
    
      await transporter.sendMail({
        from: `"Bridgeme HR Team" <${process.env.EMAIL_USER}>`,
        to: interview.hiringManagerEmail,
        subject: `Interview Feedback – ${interview.name} for ${interview.positionApplied}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Interview Feedback</h2>
            <p>Dear Hiring Manager,</p>
            <p>Please find below the feedback for <strong>${interview.name}</strong> interviewed for the <strong>${interview.positionApplied}</strong> role:</p>
            <div>
              <p><strong>Interview Date:</strong> ${formatDate(interview.interviewDate)}</p>
              <p><strong>Interviewer:</strong> ${interview.interviewer}</p>
              <p><strong>Feedback Summary:</strong> ${interview.feedback || 'No feedback provided'}</p>
              <p><strong>Recommendation:</strong> ${interview.result === 'Selected' ? 'Hire' : 'No Hire'}</p>
            </div>
            <p>Please review and advise on the next steps.</p>
            <p>Best regards,<br>HR Team<br>Bridgeme Technologies Pvt. Ltd.</p>
          </div>
        `,
      });

      if (result === 'Selected') {
        await transporter.sendMail({
          from: `"Bridgeme HR Team" <${process.env.EMAIL_USER}>`,
          to: interview.candidateEmail,
          subject: `Congratulations! Interview Outcome for ${interview.positionApplied}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Congratulations!</h2>
              <p>Dear <strong>${interview.name}</strong>,</p>
              <p>We are delighted to inform you that you have been selected for the position of <strong>${interview.positionApplied}</strong> at Bridgeme Technologies Pvt. Ltd.</p>
              <p>We will be sending you the official offer letter shortly. Please confirm your acceptance within the mentioned timeline.</p>
              <p>Welcome aboard!</p>
              <p>Warm regards,<br>HR Team<br>Bridgeme Technologies Pvt. Ltd.</p>
            </div>
          `,
        });
      } else if (result === 'Rejected') {
        await transporter.sendMail({
          from: `"Bridgeme HR Team" <${process.env.EMAIL_USER}>`,
          to: interview.candidateEmail,
          subject: `Interview Feedback for ${interview.positionApplied} – Bridgeme Technologies`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Thank You for Your Time</h2>
              <p>Dear <strong>${interview.name}</strong>,</p>
              <p>Thank you for interviewing for the <strong>${interview.positionApplied}</strong> role. After careful consideration, we regret to inform you we're moving forward with other candidates.</p>
              <p>We appreciate your interest in Bridgeme Technologies and encourage you to apply for future opportunities.</p>
              <p>Best wishes for your future endeavors.</p>
              <p>Warm regards,<br>HR Team<br>Bridgeme Technologies Pvt. Ltd.</p>
            </div>
          `,
        });
      }
    }

    res.status(200).json({
      message: "Status updated successfully",
      interview
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
export const sendConfirmationEmail = async (
  name, candidateEmail, skills, experience, date, time, interviewer, round, hiringManagerEmail,positionApplied
) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      cc: interviewer.includes('@') ? interviewer : undefined,
      subject: `Interview Scheduled: ${round} on ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Interview Confirmation</h2>
          <p>Hello <strong>${name}</strong>,</p>
            <p>Your interview for <strong>${positionApplied}</strong> has been scheduled successfully.</p>
          <p>Your interview has been scheduled successfully.</p>
          <div>
            <p><strong>Skills:</strong> ${skills || 'Not specified'}</p>
            <p><strong>Experience:</strong> ${experience || 'Not specified'}</p>
            <p><strong>Round:</strong> ${round}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Interviewer:</strong> ${interviewer}</p>
          </div>
          <p>Best regards, <br> HR Team</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: hiringManagerEmail,
      subject: `Interview Scheduled: ${name} - ${round} on ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Interview Scheduled</h2>
             <p>An interview for <strong>${positionApplied}</strong> has been scheduled for <strong>${name}</strong>.</p>
          <p>Hello,</p>
          <p>An interview has been scheduled for <strong>${name}</strong>.</p>
          <div>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${candidateEmail}</p>
            <p><strong>Skills:</strong> ${skills || 'Not specified'}</p>
            <p><strong>Job Title:</strong> ${positionApplied}</p>
            <p><strong>Experience:</strong> ${experience || 'Not specified'}</p>
            <p><strong>Round:</strong> ${round}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Interviewer:</strong> ${interviewer}</p>
          </div>
          <p>Best regards, <br> HR Team</p>
        </div>
      `,
    });

    console.log(`Email sent to ${candidateEmail} and ${hiringManagerEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const getAllInterviews = async (req, res) => {
  try {
   
    const interviews = await Interview.findAll({
      attributes: [
        "interviewId", "candidateEmail", "positionApplied", "hiringManagerEmail",
        "name", "skills", "experience", "interviewDate", 
        "interviewTime", "interviewer", "round", "status", 
        "result", "feedback", "hrRoundCompleted", "offerSent", 
        "createdAt", "updatedAt"
      ],
      order: [['interviewDate', 'DESC']]
    });
    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews", error: error.message });
  }
};




export const sendInterviewSuccessEmail = async (interview) => {
  try {
    console.log("Sending success email to:", interview.candidateEmail);

    if (!interview.candidateEmail) {
      console.error("Error: Candidate email is missing.");
      return; 
    }

    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: interview.candidateEmail, 
      subject: `Interview Successful: ${interview.round}`,
      html: `<p>Congratulations! You have successfully passed the ${interview.round} round.</p>`
    });
    console.log(`Success email sent to ${interview.candidateEmail}`);
  } catch (error) {
    console.error("Error sending success email:", error);
    throw error;
  }
};

export const sendRejectionEmail = async (interview) => {
  try {
    await transporter.sendMail({
      from: `"HR Team" <${process.env.EMAIL_USER}>`,
      to: interview.candidateEmail,  
      subject: `Interview Update: ${interview.round}`,
      html: `<p>Thank you for your interest. Unfortunately, we are moving forward with other candidates.</p>`
    });
    console.log(`Rejection email sent to ${interview.candidateEmail}`);  
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
};

export const getHRCompletedCandidates = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      attributes: [
        "interviewId", "candidateEmail", "hiringManagerEmail",
        "name", "skills", "experience", "interviewDate", 
        "interviewTime", "interviewer", "round", "status", 
        "result", "feedback", "hrRoundCompleted", "offerSent", "positionApplied",
        "createdAt", "updatedAt"
      ],
      where: {
        hrRoundCompleted: true,
        offerSent: false,
        result: 'Selected'
      }
    });

    const candidates = interviews.map(interview => ({
      id: interview.interviewId, 
      name: interview.name,
      email: interview.candidateEmail,
      jobTitle: interview.positionApplied,
      hiringManagerEmail: interview.hiringManagerEmail || "",
      interviewDate: interview.interviewDate,
      interviewRound: interview.round
    }));

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching HR completed candidates:", error);
    res.status(500).json({ 
      message: "Failed to fetch HR completed candidates", 
      error: error.message 
    });
  }
};
export const getCandidateByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const candidate = await Interview.findOne({
      where: { 
        candidateEmail,
        hrRoundCompleted: true,
        result: "Selected"
      }
    });
    
    if (!candidate) {
      return res.status(404).json({ 
        message: "No HR-completed candidate found with this email" 
      });
    }
    
    res.status(200).json(candidate);
  } catch (error) {
    console.error("Error fetching candidate by email:", error);
    res.status(500).json({ 
      message: "Failed to fetch candidate", 
      error: error.message 
    });
  }
};

export const markOfferSent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const interview = await Interview.findByPk(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    interview.offerSent = true;
    await interview.save();
    
    res.status(200).json({ 
      message: "Candidate marked as offer sent successfully", 
      interview 
    });
  } catch (error) {
    console.error("Error marking offer sent:", error);
    res.status(500).json({ 
      message: "Failed to mark offer sent", 
      error: error.message 
    });
  }
};