import Team from "../model/createTeamModel.js";
import Contractor from "../model/ContractModel.js";
import Employee from "../model/addpersonalmodel.js"; // Assuming this is the Employee model

export const createTeam = async (req, res) => {
  const { team_name, members } = req.body;

  try {
    // Validate all members exist (either as employees or contractors)
    for (const member of members) {
      const employeeId = member.employee_id;
      
      // Check if this is a regular employee
      const employeeExists = await Employee.findOne({ 
        where: { employee_id: employeeId } 
      });
      
      // If not found in employees, check if it's a contractor
      const contractorExists = !employeeExists ? await Contractor.findOne({
        where: { c_employee_id: employeeId }
      }) : null;
      
      // If not found in either model, return an error
      if (!employeeExists && !contractorExists) {
        return res.status(400).json({ 
          message: `Personnel with ID ${employeeId} does not exist in either employees or contractors.` 
        });
      }
      
      // Add member type to the member object for future reference
      member.member_type = employeeExists ? 'Employee' : 'Contractor';
    }

    // Create the team
    const newTeam = await Team.create({
      team_name,
      members,
    });

    res.status(201).json({ 
      message: "Team created successfully", 
      team: newTeam 
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ 
      message: "Failed to create team", 
      error: error.message 
    });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to fetch teams", error: error.message });
  }
};

export const getTeamById = async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findOne({ where: { team_id: id } });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ message: "Failed to fetch team", error: error.message });
  }
};