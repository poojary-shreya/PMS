import Project from '../model/projectmodel.js';
import Employee from '../model/addpersonalmodel.js';
import TeamMember from '../model/assignteamModel.js';
import Roles from '../model/addrolemodel.js';
import Contractor from '../model/ContractModel.js';
import Team from '../model/createTeamModel.js'
import { sequelize } from "../config/db.js";
import { Op } from 'sequelize';

export async function getActiveProjects(req, res) {
  try {
    const projects = await Project.findAll({
      attributes: ['project_id', 'name', 'key', 'status','start_date','end_date', 'projectType'],
      where: {
        status: ['Active', 'On Hold'] 
      },
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching active projects:', error);
    return res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
}

export async function getAllEmployees(req, res) {
  try {
    // Fetch regular employees with their roles
    const employees = await Employee.findAll({
      attributes: [
        'employee_id',
        'firstName',
        'lastName',
      ],
      include: [{
        model: Roles,
        as: 'roles',
        attributes: ['roleType'],
        required: false
      }],
      where: {
        employmentStatus: 'Active' // Only fetch active employees
      },
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    // Fetch contractors
    const contractors = await Contractor.findAll({
      attributes: [
        'c_employee_id',
        'fullName',
        'roleType'
      ],
      where: {
        status: 'active' // Only fetch active contractors
      },
      order: [['fullName', 'ASC']]
    });

    // Format employee data for frontend
    const formattedEmployees = employees.map(emp => ({
      employee_id: emp.employee_id,
      name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
      type: 'Employee',
      roleType: emp.roles ? emp.roles.roleType : null
    }));

    // Format contractor data to match employee format
    const formattedContractors = contractors.map(cont => ({
      employee_id: cont.c_employee_id,
      name: cont.fullName,
      type: 'Contractor',
      roleType: cont.roleType
    }));

    // Combine both arrays
    const allPersonnel = [...formattedEmployees, ...formattedContractors];
    
    // Sort by name for consistent display
    allPersonnel.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json(allPersonnel);
  } catch (error) {
    console.error('Error fetching employees and contractors:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch employees and contractors', 
      error: error.message 
    });
  }
}


// export async function createAssignTeam(req, res) {
//   const { projectId, teamId, teamMembers } = req.body;
  
//   try {
//     if (!projectId) {
//       return res.status(400).json({ message: 'Project ID is required' });
//     }
    
//     if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
//       return res.status(400).json({ message: 'At least one team member is required' });
//     }
    
//     // Check if project exists and is active or on hold
//     const project = await Project.findOne({
//       where: {
//         project_id: projectId,
//         status: ['Active', 'On Hold']
//       }
//     });
    
//     if (!project) {
//       return res.status(404).json({ message: 'Active project not found' });
//     }
    
//     const t = await sequelize.transaction();
    
//     try {
//       // Get existing team members for this project
//       const existingTeamMembers = await TeamMember.findAll({
//         where: { project_id: projectId },
//         transaction: t
//       });
      
//       // Create a map of existing member IDs for easy lookup
//       const existingMemberIds = new Set(
//         existingTeamMembers.map(member => member.employee_id)
//       );
      
//       // Validate all team members first
//       for (const member of teamMembers) {
//         if (!member.employeeId || !member.role) {
//           await t.rollback();
//           return res.status(400).json({
//             message: 'Each team member requires an employee ID and role',
//             invalidMember: member
//           });
//         }
        
//         // Check if the employee ID format indicates a contractor (starts with 'C')
//         const isContractor = member.employeeId.startsWith('C');
        
//         if (isContractor) {
//           // Check if the member is a contractor
//           const contractor = await Contractor.findOne({
//             where: {
//               c_employee_id: member.employeeId,
//               status: 'active'
//             },
//             transaction: t
//           });
          
//           if (!contractor) {
//             await t.rollback();
//             return res.status(404).json({
//               message: `Contractor with ID ${member.employeeId} not found or not active`
//             });
//           }
          
//           member.memberType = 'Contractor';
//         } else {
//           // Check if the member is a regular employee
//           const employee = await Employee.findOne({
//             where: {
//               employee_id: member.employeeId,
//               employmentStatus: 'Active'
//             },
//             transaction: t
//           });
          
//           if (!employee) {
//             await t.rollback();
//             return res.status(404).json({
//               message: `Employee with ID ${member.employeeId} not found or not active`
//             });
//           }
          
//           member.memberType = 'Employee';
//         }
//       }
      
//       // Only add new team members that don't already exist
//       const newTeamMembers = teamMembers.filter(
//         member => !existingMemberIds.has(member.employeeId)
//       );
      
//       // Add only new team members
//       if (newTeamMembers.length > 0) {
//         await Promise.all(
//           newTeamMembers.map(member =>
//             TeamMember.create({
//               project_id: projectId,
//               team_id: teamId,
//               employee_id: member.employeeId,
//               role: member.role,
//               member_type: member.memberType, // Now we have this field in the model
//               allocation_percentage: member.allocation || 100,
//               start_date: member.startDate || new Date(),
//               end_date: member.endDate || null,
//               is_active: true
//             }, { transaction: t })
//           )
//         );
//       }
      
//       // Update existing team members if needed
//       for (const member of teamMembers) {
//         if (existingMemberIds.has(member.employeeId)) {
//           await TeamMember.update(
//             {
//               role: member.role,
//               team_id: teamId,
//               member_type: member.memberType,
//               allocation_percentage: member.allocation || 100,
//               start_date: member.startDate,
//               end_date: member.endDate
//             },
//             {
//               where: {
//                 project_id: projectId,
//                 employee_id: member.employeeId
//               },
//               transaction: t
//             }
//           );
//         }
//       }
      
//       const projectManager = teamMembers.find(member => member.isProjectManager === true);
//       if (projectManager) {
//         if (projectManager.memberType === 'Contractor') {
//           await t.rollback();
//           return res.status(400).json({
//             message: 'Only regular employees can be assigned as project managers'
//           });
//         }
        
//         await Project.update(
//           { lead_id: projectManager.employeeId },
//           {
//             where: { project_id: projectId },
//             transaction: t
//           }
//         );
//       }
      
//       await t.commit();
      
//       const totalTeamSize = await TeamMember.count({
//         where: { project_id: projectId }
//       });
      
//       return res.status(200).json({
//         message: 'Team updated successfully',
//         projectId,
//         teamId,
//         previousTeamSize: existingTeamMembers.length,
//         newMembersAdded: newTeamMembers.length,
//         totalTeamSize: totalTeamSize
//       });
//     } catch (error) {
//       await t.rollback();
//       console.error('Transaction error:', error);
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error updating team:', error);
//     return res.status(500).json({ message: 'Failed to update team', error: error.message });
//   }
// }



export async function createAssignTeam(req, res) {
  const { projectId, teamId, teamMembers } = req.body;
  
  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({ message: 'At least one team member is required' });
    }
    
    // Check if project exists and is active or on hold
    const project = await Project.findOne({
      where: {
        project_id: projectId,
        status: ['Active', 'On Hold']
      }
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Active project not found' });
    }
    
    const t = await sequelize.transaction();
    
    try {
      // Get existing team members for this project
      const existingTeamMembers = await TeamMember.findAll({
        where: { project_id: projectId },
        transaction: t
      });
      
      // Create a map of existing member IDs for easy lookup
      const existingMemberIds = new Set(
        existingTeamMembers.map(member => member.employee_id)
      );
      
      // Validate all team members first
      for (const member of teamMembers) {
        if (!member.employeeId || !member.role) {
          await t.rollback();
          return res.status(400).json({
            message: 'Each team member requires an employee ID and role',
            invalidMember: member
          });
        }
        
        // Check if the employee ID format indicates a contractor (starts with 'C')
        const isContractor = member.employeeId.startsWith('C');
        
        if (isContractor) {
          // Check if the member is a contractor
          const contractor = await Contractor.findOne({
            where: {
              c_employee_id: member.employeeId,
              status: 'active'
            },
            transaction: t
          });
          
          if (!contractor) {
            await t.rollback();
            return res.status(404).json({
              message: `Contractor with ID ${member.employeeId} not found or not active`
            });
          }
          
          member.memberType = 'Contractor';
        } else {
          // Check if the member is a regular employee
          const employee = await Employee.findOne({
            where: {
              employee_id: member.employeeId,
              employmentStatus: 'Active'
            },
            transaction: t
          });
          
          if (!employee) {
            await t.rollback();
            return res.status(404).json({
              message: `Employee with ID ${member.employeeId} not found or not active`
            });
          }
          
          member.memberType = 'Employee';
        }
      }
      
      // Only add new team members that don't already exist
      const newTeamMembers = teamMembers.filter(
        member => !existingMemberIds.has(member.employeeId)
      );
      
      // Add only new team members
      if (newTeamMembers.length > 0) {
        await Promise.all(
          newTeamMembers.map(member =>
            TeamMember.create({
              project_id: projectId,
              team_id: teamId,
              employee_id: member.employeeId,
              role: member.role,
              member_type: member.memberType, // Now we have this field in the model
              allocation_percentage: member.allocation || 100,
              start_date: member.startDate || new Date(),
              end_date: member.endDate || null,
              is_active: true
            }, { transaction: t })
          )
        );
      }
      
      // Update existing team members if needed
      for (const member of teamMembers) {
        if (existingMemberIds.has(member.employeeId)) {
          await TeamMember.update(
            {
              role: member.role,
              team_id: teamId,
              member_type: member.memberType,
              allocation_percentage: member.allocation || 100,
              start_date: member.startDate,
              end_date: member.endDate
            },
            {
              where: {
                project_id: projectId,
                employee_id: member.employeeId
              },
              transaction: t
            }
          );
        }
      }
      
      // Find Product Owner to update lead_id (changed from finding Project Manager)
      const productOwner = teamMembers.find(member => 
        member.role === 'Product Owner' || member.isProductOwner === true
      );
      
      if (productOwner) {
        if (productOwner.memberType === 'Contractor') {
          await t.rollback();
          return res.status(400).json({
            message: 'Only regular employees can be assigned as product owners'
          });
        }
        
        await Project.update(
          { lead_id: productOwner.employeeId },
          {
            where: { project_id: projectId },
            transaction: t
          }
        );
      }
      
      await t.commit();
      
      const totalTeamSize = await TeamMember.count({
        where: { project_id: projectId }
      });
      
      return res.status(200).json({
        message: 'Team updated successfully',
        projectId,
        teamId,
        previousTeamSize: existingTeamMembers.length,
        newMembersAdded: newTeamMembers.length,
        totalTeamSize: totalTeamSize
      });
    } catch (error) {
      await t.rollback();
      console.error('Transaction error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ message: 'Failed to update team', error: error.message });
  }
}


export async function getTeamByProject(req, res) {
  const { projectId } = req.params;
  
  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const teamMembers = await TeamMember.findAll({
      where: { project_id: projectId },
      include: [{
        model: Employee,
        attributes: ['employee_id', 'firstName', 'lastName', 'personalPhoto', 'designation']
      }]
    });
    
    const formattedTeam = teamMembers.map(member => ({
      id: member.id,
      employeeId: member.employee_id,
      projectId: member.project_id,
      role: member.role,
      name: `${member.Employee.firstName} ${member.Employee.lastName || ''}`.trim(),
      avatar: member.Employee.personalPhoto || null,
      designation: member.Employee.designation || 'Employee',
      allocation: member.allocation_percentage || 100,
      startDate: member.start_date,
      endDate: member.end_date,
      isProjectManager : project.lead_id === member.employee_id
    }));
    
    return res.status(200).json(formattedTeam);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ message: 'Failed to fetch team members', error: error.message });
  }
}


export async function getTeamMembersByProject(req, res) {
  const { projectId } = req.params;
  
  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    // Check if project exists
    const project = await Project.findOne({
      where: {
        project_id: projectId
      }
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get all team members for this project
    const teamMembers = await TeamMember.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'firstName', 'employmentStatus']
        }
      ],
      order: [
        ['role', 'ASC'],
        [{ model: Employee, as: 'employee' }, 'firstName', 'ASC']
      ]
    });
    
    if (!teamMembers || teamMembers.length === 0) {
      return res.status(404).json({ message: 'No team members found for this project' });
    }
    
    // Format the response to include both team member details and employee info
    const formattedTeamMembers = teamMembers.map(member => {
      return {
        employee_id: member.employee_id,
        role: member.role,
        allocation_percentage: member.allocation_percentage,
        start_date: member.start_date,
        end_date: member.end_date,
        is_project_lead: project.lead_id === member.employee_id,
        employee: member.employee ? {
          name: member.employee.name,
          designation: member.employee.designation,
          status: member.employee.employmentStatus
        } : null
      };
    });
    
    return res.status(200).json(formattedTeamMembers);
    
  } catch (error) {
    console.error('Error getting team members:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve team members', 
      error: error.message 
    });
  }
}





export const getAllProjectsWithTeams = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: TeamMember,
          as: "team",
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: ["employee_id", "firstName", "lastName"]
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error("Error fetching projects with teams:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



export async function updateTeamMember(req, res) {
  const { teamMemberId } = req.params;
  const { role, allocation, startDate, endDate, isProjectManager  } = req.body;
  
  try {
    if (!teamMemberId) {
      return res.status(400).json({ message: 'Team member ID is required' });
    }
    
    const teamMember = await TeamMember.findByPk(teamMemberId);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    const t = await sequelize.transaction();
    
    try {
      const updates = {};
      if (role) updates.role = role;
      if (allocation) updates.allocation_percentage = allocation;
      if (startDate) updates.start_date = startDate;
      if (endDate !== undefined) updates.end_date = endDate; 
      
      await TeamMember.update(updates, {
        where: { id: teamMemberId },
        transaction: t
      });
      
      if (isProjectLead !== undefined) {
        if (isProjectLead) {
          await Project.update(
            { lead_id: teamMember.employee_id },
            { 
              where: { project_id: teamMember.project_id },
              transaction: t
            }
          );
        } else {
          const project = await Project.findByPk(teamMember.project_id);
          if (project && project.lead_id === teamMember.employee_id) {
            await Project.update(
              { lead_id: null },
              { 
                where: { project_id: teamMember.project_id },
                transaction: t
              }
            );
          }
        }
      }
      
      await t.commit();
      
      return res.status(200).json({ 
        message: 'Team member updated successfully',
        teamMemberId
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ message: 'Failed to update team member', error: error.message });
  }
}


export async function removeTeamMember(req, res) {
  const { teamMemberId } = req.params;
  
  try {
    if (!teamMemberId) {
      return res.status(400).json({ message: 'Team member ID is required' });
    }
    
    const teamMember = await TeamMember.findByPk(teamMemberId);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    const t = await sequelize.transaction();
    
    try {
      const project = await Project.findByPk(teamMember.project_id);
      if (project && project.lead_id === teamMember.employee_id) {
        await Project.update(
          { lead_id: null },
          { 
            where: { project_id: teamMember.project_id },
            transaction: t
          }
        );
      }
      
      await TeamMember.destroy({
        where: { team_member_id: teamMemberId },
        transaction: t
      });
      
      await t.commit();
      
      return res.status(200).json({ 
        message: 'Team member removed successfully',
        projectId: teamMember.project_id
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error removing team member:', error);
    return res.status(500).json({ message: 'Failed to remove team member', error: error.message });
  }
}





// export async function createTeam(req, res) {
//   const { projectId, teamId, teamMembers } = req.body;
//   console.log("request body", req.body);
  
//   try {
//     // Validate required fields
//     if (!projectId) {
//       return res.status(400).json({ message: "Project ID is required" });
//     }

//     if (!teamId) {
//       return res.status(400).json({ message: "Team ID is required" });
//     }

//     if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
//       return res.status(400).json({ message: "Team members array is required" });
//     }

//     // Validate the project
//     const project = await Project.findOne({
//       where: {
//         project_id: projectId,
//         status: ["Active", "On Hold"],
//       },
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Active project not found" });
//     }

//     const t = await sequelize.transaction();

//     try {
//       // Get existing team members
//       const existingMembers = await TeamMember.findAll({
//         where: {
//           project_id: projectId,
//           team_id: teamId,
//           is_active: true
//         },
//         transaction: t
//       });

//       const existingMemberMap = new Map(
//         existingMembers.map(member => [member.employee_id, member])
//       );

//       const results = {
//         added: [],
//         updated: [],
//         unchanged: []
//       };

//       // Process each team member
//       for (const member of teamMembers) {
//         const existingMember = existingMemberMap.get(member.employeeId);

//         try {
//           if (existingMember) {
//             // Check if update is needed
//             const needsUpdate = 
//               existingMember.role !== member.role ||
//               existingMember.allocation_percentage !== member.allocation ||
//               new Date(existingMember.start_date).toISOString().split('T')[0] !== member.startDate ||
//               (existingMember.end_date?.toISOString().split('T')[0] !== member.endDate);

//             if (needsUpdate) {
//               await TeamMember.update(
//                 {
//                   role: member.role,
//                   allocation_percentage: member.allocation,
//                   start_date: new Date(member.startDate),
//                   end_date: member.endDate ? new Date(member.endDate) : null,
//                   updated_at: new Date()
//                 },
//                 {
//                   where: { team_member_id: existingMember.team_member_id },
//                   transaction: t
//                 }
//               );

//               results.updated.push({
//                 employeeId: member.employeeId,
//                 role: member.role,
//                 previousRole: existingMember.role,
//                 status: 'updated'
//               });
//             } else {
//               results.unchanged.push({
//                 employeeId: member.employeeId,
//                 role: member.role,
//                 status: 'unchanged'
//               });
//             }
//           } else {
//             // Add new team member
//             const newMember = await TeamMember.create(
//               {
//                 project_id: projectId,
//                 team_id: teamId,
//                 employee_id: member.employeeId,
//                 role: member.role,
//                 allocation_percentage: member.allocation,
//                 start_date: new Date(member.startDate),
//                 end_date: member.endDate ? new Date(member.endDate) : null
//               },
//               { transaction: t }
//             );

//             results.added.push({
//               employeeId: member.employeeId,
//               role: member.role,
//               memberId: newMember.team_member_id,
//               status: 'added'
//             });
//           }
//         } catch (error) {
//           console.error(`Error processing member ${member.employeeId}:`, error);
//           throw error;
//         }
//       }

//       // Get final team composition
//       const currentTeam = await TeamMember.findAll({
//         where: {
//           project_id: projectId,
//           team_id: teamId,
//           is_active: true
//         },
//         attributes: [
//           'team_member_id',
//           'employee_id',
//           'role',
//           'allocation_percentage',
//           'start_date',
//           'end_date'
//         ],
//         transaction: t
//       });

//       await t.commit();

//       return res.status(200).json({
//         message: "Team members processed successfully",
//         projectId,
//         teamId,
//         summary: {
//           total_members: currentTeam.length,
//           added: results.added.length,
//           updated: results.updated.length,
//           unchanged: results.unchanged.length
//         },
//         results,
//         current_team: currentTeam.map(member => ({
//           memberId: member.team_member_id,
//           employeeId: member.employee_id,
//           role: member.role,
//           allocation: member.allocation_percentage,
//           startDate: member.start_date,
//           endDate: member.end_date
//         }))
//       });

//     } catch (error) {
//       await t.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error managing team:", error);
//     return res.status(500).json({
//       message: "Failed to manage team members",
//       error: error.message,
//       details: error.parent?.detail || error.original?.detail
//     });
//   }
// }

export async function fetchAllTeams(req, res) {
  try {
    // Fetch all teams from the database
    const teams = await Team.findAll({
      attributes: ['team_id', 'team_name',"members"], // Only fetch team_id and team_name
    });

    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: 'No teams found' });
    }

    return res.status(200).json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
  }
}


export async function fetchTeamMembers(req, res) {
  const { teamId } = req.params; // Extract team ID from URL parameters

  try {
    // Check if teamId is provided
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Fetch the team by team_id
    const team = await Team.findOne({
      where: { team_id: teamId }, // Filter by team_id
      attributes: ["team_id", "team_name", "members"], // Only fetch relevant fields
    });

    // If team is not found, return 404
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Return the team members directly from the "members" field
    return res.status(200).json({
      team_id: team.team_id,
      team_name: team.team_name,
      members: team.members, // JSON array of employee_id and roles
    });
  } catch (error) {
    console.error("Error fetching team members:", error); // Log the error
    return res.status(500).json({
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
}



export async function getProjectTeamMembers(req, res) {
  const { projectId } = req.params;

  // Utility function to format date to dd-mm-yyyy
  function formatDateForInput(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  try {
    // Validate project ID
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Check if project exists
    const project = await Project.findOne({
      where: { project_id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get team members for the project
    const teamMembers = await TeamMember.findAll({
      where: {
        project_id: projectId,
        is_active: true
      },
      attributes: [
        'team_member_id',
        'employee_id',
        'team_id',
        'role',
        'allocation_percentage',
        'start_date',
        'end_date'
      ],
      raw: true
    });

    // If team members exist, get the team ID
    let teamId = null;
    if (teamMembers.length > 0) {
      // Get the team ID from the first team member (assuming all belong to the same team)
      teamId = teamMembers[0].team_id;
    }

    // Format and send response
    return res.status(200).json({
      projectId,
      teamId,
      teamMembers: teamMembers.map(member => ({
        employee_id: member.employee_id,
        team_member_id:member.team_member_id,
        role: member.role,
        allocation: member.allocation_percentage,
        start_date: formatDateForInput(member.start_date),
        end_date: formatDateForInput(member.end_date)
      }))
    });
  } catch (error) {
    console.error("Error fetching project team members:", error);
    return res.status(500).json({
      message: "Failed to fetch project team members",
      error: error.message
    });
  }
};


export const getProjectsWithTeams = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: TeamMember,
          as: "teamMembers",
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: ["employee_id", "firstName", "lastName", "companyemail", "phoneNumber"]
            },
            {
              model: Contractor,
              as: "contractor",
              attributes: ["c_employee_id", "fullName", "email", "companyEmail", "phoneNumber"]
            }
          ]
        }
      ]
    });

    // Transform data structure to match frontend expectations
    const formattedProjects = projects.map(project => {
      const projectData = project.toJSON();
      return {
        ...projectData,
        team: projectData.teamMembers?.map(member => {
          // Determine if this team member is an employee or contractor
          let personData = null;
          if (member.employee) {
            personData = {
              id: member.employee.employee_id,
              name: `${member.employee.firstName} ${member.employee.lastName}`,
              email: member.employee.companyemail,
              phoneNumber: member.employee.phoneNumber,
              type: 'employee'
            };
          } else if (member.contractor) {
            personData = {
              id: member.contractor.c_employee_id,
              name: member.contractor.fullName,
              email: member.contractor.companyEmail,
              phoneNumber: member.contractor.phoneNumber,
              type: 'contractor'
            };
          }

          return {
            team_member_id: member.team_member_id,
            team_id: member.team_id,
            allocation_percentage: member.allocation_percentage,
            role: member.role,
            start_date: member.start_date,
            end_date: member.end_date,
            person: personData
          };
        }) || []
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedProjects
    });
  } catch (error) {
    console.error("Error fetching projects with teams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects with teams",
      error: error.message
    });
  }
};











// Add this function to check employee's current allocation across projects
export async function getEmployeeAllocations(employeeIds) {
  try {
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return {};
    }
    
    // Get all active allocations for the specified employees
    const activeAllocations = await TeamMember.findAll({
      where: {
        employee_id: employeeIds,
        is_active: true,
        // Make sure we're only looking at current allocations 
        // (where current date is between start and end dates, or end date is null)
        [Op.and]: [
          { start_date: { [Op.lte]: new Date() } },
          {
            [Op.or]: [
              { end_date: { [Op.gte]: new Date() } },
              { end_date: null }
            ]
          }
        ]
      },
      attributes: ['employee_id', 'project_id', 'allocation_percentage'],
      include: [
        {
          model: Project,
          attributes: ['name', 'status'],
          where: {
            status: ['Active', 'On Hold']  // Only count allocations for active projects
          }
        }
      ]
    });

    // Calculate total allocation for each employee
    const employeeAllocations = {};
    
    activeAllocations.forEach(allocation => {
      const employeeId = allocation.employee_id;
      
      if (!employeeAllocations[employeeId]) {
        employeeAllocations[employeeId] = {
          totalAllocated: 0,
          projects: []
        };
      }
      
      employeeAllocations[employeeId].totalAllocated += parseInt(allocation.allocation_percentage);
      employeeAllocations[employeeId].projects.push({
        projectId: allocation.project_id,
        projectName: allocation.Project?.name || 'Unknown',
        allocation: parseInt(allocation.allocation_percentage)
      });
    });
    
    return employeeAllocations;
  } catch (error) {
    console.error("Error getting employee allocations:", error);
    throw error;
  }
}

// Modified createTeam function with allocation validation
export async function createTeam(req, res) {
  const { projectId, teamId, teamMembers } = req.body;
  console.log("request body", req.body);
  
  try {
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({ message: "Team members array is required" });
    }

    // Validate the project
    const project = await Project.findOne({
      where: {
        project_id: projectId,
        status: ["Active", "On Hold"],
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Active project not found" });
    }

    // Get all employee IDs from request
    const employeeIds = teamMembers.map(member => member.employeeId);
    
    // Check existing allocations for all employees
    const existingAllocations = await getEmployeeAllocations(employeeIds);
    
    // Check if any allocations would exceed 100%
    const overAllocatedEmployees = [];
    
    for (const member of teamMembers) {
      const employeeId = member.employeeId;
      const requestedAllocation = parseInt(member.allocation);
      
      // Get employee's existing allocation data
      const employeeData = existingAllocations[employeeId] || { totalAllocated: 0, projects: [] };
      
      // Find if employee is already allocated to this project
      const existingAllocationForProject = employeeData.projects.find(p => p.projectId === projectId);
      
      // If updating allocation for the same project, subtract the existing allocation
      let adjustedTotalAllocation = employeeData.totalAllocated;
      if (existingAllocationForProject) {
        adjustedTotalAllocation -= existingAllocationForProject.allocation;
      }
      
      // Check if new allocation would exceed 100%
      if (adjustedTotalAllocation + requestedAllocation > 100) {
        overAllocatedEmployees.push({
          employeeId: employeeId,
          currentAllocation: adjustedTotalAllocation,
          requestedAllocation: requestedAllocation,
          availableAllocation: 100 - adjustedTotalAllocation,
          projects: employeeData.projects.filter(p => p.projectId !== projectId)
        });
      }
    }
    
    // If any employees would be over-allocated, return error
    if (overAllocatedEmployees.length > 0) {
      return res.status(400).json({
        message: "One or more employees would exceed 100% allocation across projects",
        overAllocatedEmployees: overAllocatedEmployees
      });
    }

    const t = await sequelize.transaction();

    try {
      // Get existing team members
      const existingMembers = await TeamMember.findAll({
        where: {
          project_id: projectId,
          team_id: teamId,
          is_active: true
        },
        transaction: t
      });

      const existingMemberMap = new Map(
        existingMembers.map(member => [member.employee_id, member])
      );

      const results = {
        added: [],
        updated: [],
        unchanged: []
      };

      // Process each team member
      for (const member of teamMembers) {
        const existingMember = existingMemberMap.get(member.employeeId);

        try {
          if (existingMember) {
            // Check if update is needed
            const needsUpdate = 
              existingMember.role !== member.role ||
              existingMember.allocation_percentage !== member.allocation ||
              new Date(existingMember.start_date).toISOString().split('T')[0] !== member.startDate ||
              (existingMember.end_date?.toISOString().split('T')[0] !== member.endDate);

            if (needsUpdate) {
              await TeamMember.update(
                {
                  role: member.role,
                  allocation_percentage: member.allocation,
                  start_date: new Date(member.startDate),
                  end_date: member.endDate ? new Date(member.endDate) : null,
                  updated_at: new Date()
                },
                {
                  where: { team_member_id: existingMember.team_member_id },
                  transaction: t
                }
              );

              results.updated.push({
                employeeId: member.employeeId,
                role: member.role,
                previousRole: existingMember.role,
                status: 'updated'
              });
            } else {
              results.unchanged.push({
                employeeId: member.employeeId,
                role: member.role,
                status: 'unchanged'
              });
            }
          } else {
            // Add new team member
            const newMember = await TeamMember.create(
              {
                project_id: projectId,
                team_id: teamId,
                employee_id: member.employeeId,
                role: member.role,
                allocation_percentage: member.allocation,
                start_date: new Date(member.startDate),
                end_date: member.endDate ? new Date(member.endDate) : null
              },
              { transaction: t }
            );

            results.added.push({
              employeeId: member.employeeId,
              role: member.role,
              memberId: newMember.team_member_id,
              status: 'added'
            });
          }
        } catch (error) {
          console.error(`Error processing member ${member.employeeId}:`, error);
          throw error;
        }
      }

      // Get final team composition
      const currentTeam = await TeamMember.findAll({
        where: {
          project_id: projectId,
          team_id: teamId,
          is_active: true
        },
        attributes: [
          'team_member_id',
          'employee_id',
          'role',
          'allocation_percentage',
          'start_date',
          'end_date'
        ],
        transaction: t
      });

      await t.commit();

      return res.status(200).json({
        message: "Team members processed successfully",
        projectId,
        teamId,
        summary: {
          total_members: currentTeam.length,
          added: results.added.length,
          updated: results.updated.length,
          unchanged: results.unchanged.length
        },
        results,
        current_team: currentTeam.map(member => ({
          memberId: member.team_member_id,
          employeeId: member.employee_id,
          role: member.role,
          allocation: member.allocation_percentage,
          startDate: member.start_date,
          endDate: member.end_date
        }))
      });

    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error managing team:", error);
    return res.status(500).json({
      message: "Failed to manage team members",
      error: error.message,
      details: error.parent?.detail || error.original?.detail
    });
  }
}

// New endpoint to get available allocation for employees
export async function getEmployeeAvailableAllocation(req, res) {
  try {
    const { employeeIds } = req.query;
    
    if (!employeeIds) {
      return res.status(400).json({ message: "Employee IDs are required" });
    }
    
    // Parse the employee IDs
    const parsedEmployeeIds = Array.isArray(employeeIds) 
      ? employeeIds 
      : employeeIds.split(',');
    
    // Get allocations for the employees
    const allocations = await getEmployeeAllocations(parsedEmployeeIds);
    
    // Calculate available allocation
    const availableAllocations = {};
    parsedEmployeeIds.forEach(id => {
      const employeeData = allocations[id] || { totalAllocated: 0, projects: [] };
      availableAllocations[id] = {
        employeeId: id,
        currentAllocation: employeeData.totalAllocated,
        availableAllocation: 100 - employeeData.totalAllocated,
        projects: employeeData.projects
      };
    });
    
    return res.status(200).json({
      availableAllocations
    });
  } catch (error) {
    console.error("Error getting employee available allocations:", error);
    return res.status(500).json({
      message: "Failed to get employee allocations",
      error: error.message
    });
  }
}