import Feedback from '../model/feedbackmodel.js';
import Employee from "../model/addpersonalmodel.js";


export const createFeedback = async (req, res) => {
  try {
   
    const employee = await Employee.findByPk(req.body.employee_id);
  
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    

    const feedback = await Feedback.create({
      ...req.body,
      date: new Date() 
    });
    
  
    const createdFeedback = await Feedback.findByPk(feedback.id, {
      include: [{
        model: Employee,
        as: 'personal',
        attributes: ['employee_id', 'firstName']
      }]
    });
    
    res.status(201).json(createdFeedback);
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
  

    const feedbacks = await Feedback.findAll({
      include: [{
        model: Employee,
        as: 'personal',
        attributes: ['employee_id', 'firstName']  
      }],
      order: [['date', 'DESC']]
    });
    
 
    const formattedFeedbacks = feedbacks.map(feedback => {
      const plainFeedback = feedback.get({ plain: true });
      return {
        ...plainFeedback,
       
        employeeName: plainFeedback.personal ? plainFeedback.personal.employee_id : 'Unknown',
        firstName: plainFeedback.personal ? plainFeedback.personal.firstName : 'Unknown',
      };
    });
    
    res.json(formattedFeedbacks);
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getFeedbackEmp = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    const loggedInEmail = req.session.email;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        error: "Access denied: Leave application can only be accessed when logged in with company email" 
      });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({ 
        error: "Access denied: Leave application can only be accessed when logged in with company email" 
      });
    }
    const feedbacks = await Feedback.findAll({
      include: [{
        model: Employee,
        as: 'personal',
        attributes: ['employee_id', 'firstName']  
      }],
      order: [['date', 'DESC']]
    });
    
 
    const formattedFeedbacks = feedbacks.map(feedback => {
      const plainFeedback = feedback.get({ plain: true });
      return {
        ...plainFeedback,
       
        employeeName: plainFeedback.personal ? plainFeedback.personal.employee_id : 'Unknown',
        firstName: plainFeedback.personal ? plainFeedback.personal.firstName : 'Unknown',
      };
    });
    
    res.json(formattedFeedbacks);
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    await feedback.update(req.body);
    
    const updatedFeedback = await Feedback.findByPk(id, {
      include: [{
        model: Employee,
        as: 'personal',
        attributes: ['employee_id', 'firstName']
      }]
    });
    
    const plainFeedback = updatedFeedback.get({ plain: true });
    const formattedFeedback = {
      ...plainFeedback,
      employeeName: plainFeedback.personal ? plainFeedback.personal.employee_id : 'Unknown',
      firstName: plainFeedback.personal ? plainFeedback.personal.firstName : 'Unknown',
    };
    
    res.json(formattedFeedback);
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(400).json({ error: error.message });
  }
};


export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    await feedback.destroy();
    
    res.json({ message: "Feedback deleted successfully", id });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(400).json({ error: error.message });
  }
};


export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['employee_id',  'firstName', 'lastName']
    });
    res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ error: error.message });
  }
};