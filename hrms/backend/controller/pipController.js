import ImprovementPlan from '../model/pipmodel.js';
import Employee from '../model/addpersonalmodel.js';

export const createPlan = async (req, res) => {
  try {
   
    const requiredFields = ['reason', 'objectives', 'startDate', 'endDate'];
    const employee_id = req.session.employee_id;
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    let formattedData = { ...req.body };
    
  
    const plan = await ImprovementPlan.create(formattedData);
    

    const createdPlan = await ImprovementPlan.findByPk(plan.id, {
      include: [
        {
          model: Employee,
          as: 'personal',
          attributes: ['firstName', 'lastName']
        }
      ]
    });
    
 
    const response = {
      ...createdPlan.get({ plain: true }),
      employeeName: createdPlan.personal ? 
        `${createdPlan.personal.firstName || ''} ${createdPlan.personal.lastName || ''}`.trim() : 
        req.body.employeeName || 'Employee'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getPlans = async (req, res) => {
  try {
  
    const whereCondition = {};
    if (req.query.employee_id) {
      whereCondition.employee_id = req.query.employee_id;
    }
    // if (!req.session.isCompanyEmail) {
    //   return res.status(403).json({ 
    //     message: "Access denied: failed to submit can only be accessed when logged in with company email" 
    //   });
    // }

    const plans = await ImprovementPlan.findAll({
      where: whereCondition,
      include: [
        {
          model: Employee,
          as: 'personal',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['id', 'DESC']]
    });
    
    const formattedPlans = plans.map(plan => {
      const plainPlan = plan.get({ plain: true });
      return {
        ...plainPlan,
        employeeName: plainPlan.personal ? 
          `${plainPlan.personal.firstName || ''} ${plainPlan.personal.lastName || ''}`.trim() : 
          plainPlan.employeeName || 'Employee'
      };
    });
    
    res.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressUpdates, ...otherUpdates } = req.body;
    
    const plan = await ImprovementPlan.findByPk(id);
    
    if (!plan) return res.status(404).json({ message: "Improvement plan not found" });

    if (progressUpdates) {
      const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Extended', 'Terminated', 'Active'];
      
      const validatedUpdates = progressUpdates.map(update => {
       
        if (!update.status || !validStatuses.includes(update.status)) {
          throw new Error(`Invalid status: ${update.status}`);
        }
        if (typeof update.progress !== 'number' || update.progress < 0 || update.progress > 100) {
          throw new Error('Progress must be between 0-100');
        }
        if (!update.date) throw new Error('Missing date in update');
        if (!update.note?.trim()) throw new Error('Note is required');
        
        return {
          date: new Date(update.date).toISOString(),
          status: update.status,
          progress: update.progress,
          note: update.note.trim(),
          timestamp: update.timestamp || new Date().toISOString()
        };
      });

  
      otherUpdates.progressUpdates = validatedUpdates;
    }

   
    await plan.update(otherUpdates);
    
    
    const updatedPlan = await ImprovementPlan.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'personal',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    return res.json({
      message: "Plan updated successfully",
      plan: {
        ...updatedPlan.get({ plain: true }),
        employeeName: updatedPlan.personal ? 
          `${updatedPlan.personal.firstName} ${updatedPlan.personal.lastName}`.trim() : 
          'Employee'
      }
    });
    
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(400).json({ message: error.message });
  }
};


export const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    
    const planToDelete = await ImprovementPlan.findByPk(planId);
    if (!planToDelete) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    await planToDelete.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: [
        ['employee_id', 'employee_id'], 
        ['firstName', 'first_name'], 
        ['lastName', 'last_name']
      ],
      order: [['firstName', 'ASC']]
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching all employees:", error);
    res.status(500).json({ error: error.message });
  }
};