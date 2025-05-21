import Goal from "../model/goalmodel.js";
import Employee from "../model/addpersonalmodel.js";

export const createGoal = async (req, res) => {
  try {
    const {employee_id  } = req.body;
    // const employee_id = req.session.employee_id;

    const employee = await Employee.findOne({
      where: { employee_id }
    });
    
    if (!employee) {
      return res.status(400).json({ message: "Employee not found with the provided ID" });
    }
    
    const goalData = {
      ...req.body,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim()
    };
    
    const goal = await Goal.create(goalData);
    
   
    const createdGoal = await Goal.findByPk(goal.id, {
      include: [{ model: Employee, as: "personal" }]
    });
    
    return res.status(201).json(createdGoal);
  } catch (error) {
    console.error("Error creating goal:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      include: [{ model: Employee, as: "personal" }],
      order: [['createdAt', 'DESC']]
 
    });
    
    return res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress, status, note } = req.body;
    
    const goal = await Goal.findByPk(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const newProgress = Math.min(
      100, 
      Math.max(
        0, 
        parseInt(progress ?? goal.progress, 10)
      )
    );

   
    const progressUpdate = {
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      progress: newProgress,
      status: status || goal.status,
      note: note || ''
    };

   
    const updatedProgressUpdates = [
      ...(goal.progressUpdates || []),
      progressUpdate
    ];

    const updateData = {
      progress: newProgress,
      status: status || goal.status,
      progressUpdates: updatedProgressUpdates
    };


    if (status) updateData.status = status;

    await goal.update(updateData);


    const updatedGoal = await Goal.findByPk(goalId, {
      include: [{ model: Employee, as: "personal" }]
    });
    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
};


export const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Goal.destroy({ where: { id } });
    
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: "Goal not found" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getGoalsByEmployee = async (req, res) => {
  const { employeeId } = req.params;
  
  try {
    const employee_id = req.session.employee_id;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: failed to submit can only be accessed when logged in with company email" 
      });
    }
    const goals = await Goal.findAll({
      where: { employee_id: employeeId },
      include: [{ model: Employee, as: "personal" }],
      order: [['createdAt', 'DESC']]

    });
    
    return res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching goals by employee:", error);
    return res.status(500).json({ message: "Failed to fetch employee goals", error: error.message });
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
    console.error("Error fetching all employees:", error);
    res.status(500).json({ error: error.message });
  }
};
