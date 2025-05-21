import SuccessionPlan from '../model/successionmodel.js';
import Employee from '../model/addpersonalmodel.js';

export const createPlan = async (req, res) => {
  try {
    const { employee_id, position, potentialSuccessors, ...rest } = req.body;
    
        // const employee_id = req.session.employee_id;
    if (!employee_id || !position) {
      return res.status(400).json({ error: "Missing required fields" });
    }

   
    let successorsValue = potentialSuccessors;
    
 
    if (typeof potentialSuccessors !== 'string') {
    
      if (Array.isArray(potentialSuccessors)) {
        successorsValue = potentialSuccessors.join(', ');
      } else {
      
        successorsValue = '';
      }
    }

    const plan = await SuccessionPlan.create({
      ...rest,
      employee_id,
      position,
      potentialSuccessors: successorsValue, 
      timeline: req.body.timeline ? new Date(req.body.timeline) : null
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating succession plan:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPlans = async (req, res) => {
  try {
    
    const plans = await SuccessionPlan.findAll({
      attributes: [
        'id',
        'employee_id',
        'position',
        'potentialSuccessors',
        'readinessLevel',
        'developmentNeeds',
        'timeline' 
      ],
      include: [{
        model: Employee,
        as: 'personal',
        attributes: ['firstName', 'lastName']
      }],
      order: [['id', 'DESC']]
    });
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['employee_id', 'firstName', 'lastName'],
      order: [['firstName', 'ASC']]
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPlanById = async (req, res) => {
  const { id } = req.params;


  const planId = parseInt(id, 10);

  if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
      const plan = await SuccessionPlan.findByPk(planId, {
          include: [{ model: Employee, as: 'personal' }] 
      });

      if (!plan) {
          return res.status(404).json({ error: 'Plan not found' });
      }

      res.status(200).json(plan);
  } catch (error) {
      console.error('Error fetching succession plan:', error);
      res.status(500).json({ error: 'Server error' });
  }
};


export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    

    const plan = await SuccessionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: "Succession plan not found" });
    }
    
 
    const { employee_id, position, readinessLevel, developmentNeeds, timeline, potentialSuccessors } = req.body;
    
    if (!employee_id || !position || !readinessLevel || !developmentNeeds) {
      return res.status(400).json({ 
        error: "Missing required fields. Please provide employee_id, position, readinessLevel, and developmentNeeds." 
      });
    }
  
    if (employee_id) {
      const employee = await Employee.findByPk(employee_id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
    }
    
 
    let updatedData = {...req.body};
    
    if (potentialSuccessors !== undefined) {
      if (typeof potentialSuccessors !== 'string') {
       
        if (Array.isArray(potentialSuccessors)) {
          updatedData.potentialSuccessors = potentialSuccessors.join(', ');
        } else {
        
          updatedData.potentialSuccessors = '';
        }
      }
    }
    

    await plan.update(updatedData);
    

    const updatedPlan = await SuccessionPlan.findByPk(id, {
      include: [{
        model: Employee,
        as: "personal",
        attributes: ['employee_id', 'firstName', 'lastName']
      }]
    });
    
    res.json(updatedPlan);
  } catch (error) {
    console.error("Error updating succession plan:", error);
    res.status(500).json({ error: error.message });
  }
};


export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
 
    const plan = await SuccessionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: "Succession plan not found" });
    }
    

    await plan.destroy();
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting succession plan:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getPlansByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: failed to submit can only be accessed when logged in with company email" 
      });
    }
  
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
 
    const plans = await SuccessionPlan.findAll({
      where: { employee_id: employeeId },
      order: [['id', 'DESC']]
    });
    
    res.json(plans);
  } catch (error) {
    console.error("Error fetching succession plans by employee:", error);
    res.status(500).json({ error: error.message });
  }
};
