import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const TeamAllocation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [teamData, setTeamData] = useState({
    selectedProject: "",
    assignedMembers: [],
  });

  const [projects, setProjects] = useState([]);
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch active projects
        const projectsResponse = await axios.get(`${API_URL}/addteam/project/active`);
        setProjects(projectsResponse.data);

        // Fetch teams
        const teamsResponse = await axios.get(`${API_URL}/addteam/members/teams`);
        setTeams(teamsResponse.data.teams);
      } catch (error) {
        showSnackbar(error.response?.data?.message || "An error occurred while loading data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.selectedProjectId) {
      setTeamData((prev) => ({
        ...prev,
        selectedProject: location.state.selectedProjectId,
      }));

      const project = projects.find((p) => p.project_id === location.state.selectedProjectId);
      if (project) {
        setSelectedProjectData(project);
        loadExistingTeamData(location.state.selectedProjectId);
      }
    }
  }, [location.state, projects]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to load existing team allocation data for a project
  const loadExistingTeamData = async (projectId) => {
    setIsLoadingExistingData(true);
    try {
      const response = await axios.get(`${API_URL}/addteam/project/${projectId}`);
      
      if (response.data && response.data.teamMembers && response.data.teamMembers.length > 0) {
        // Set the selected team if it exists
        if (response.data.teamId) {
          setSelectedTeam(response.data.teamId);
          // Load team members for this team
          await loadTeamMembers(response.data.teamId);
        }
        
        // Format and set assigned members
        const formattedMembers = response.data.teamMembers.map(member => ({
          employeeId: member.employee_id,
          teamMemberId: member.team_member_id, // Store the team member ID for deletion
          role: member.role || "Developer",
          allocation: member.allocation_percentage || 100,
          startDate: member.start_date || selectedProjectData?.start_date,
          endDate: member.end_date || selectedProjectData?.end_date,
          isExisting: true,
          isProductOwner: selectedProjectData?.lead_id === member.employee_id // Set true if this is the lead

        }));
        
        setTeamData(prev => ({
          ...prev,
          assignedMembers: formattedMembers
        }));
      }
    } catch (error) {
      console.error("Error loading existing team data:", error);
      // Only show error if it's not a "not found" error (which is expected for new allocations)
      if (error.response?.status !== 404) {
        showSnackbar("Failed to load existing team data for this project", "error");
      }
    } finally {
      setIsLoadingExistingData(false);
    }
  };

  const loadTeamMembers = async (teamId) => {
    try {
      const response = await axios.get(`${API_URL}/addteam/teams/${teamId}/members`);
      setTeamMembers(response.data.members || []);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const handleProjectChange = (e) => {
    const { value } = e.target;
    const project = projects.find((p) => p.project_id === value);

    setSelectedProjectData(project);
    
    // Reset form data before loading new project data
    setTeamData({
      selectedProject: value,
      assignedMembers: [],
    });
    setSelectedTeam("");
    setTeamMembers([]);
    
    // Load existing team data for this project
    loadExistingTeamData(value);

    if (errors.selectedProject) {
      setErrors({
        ...errors,
        selectedProject: "",
      });
    }
  };

  const handleTeamChange = async (e) => {
    const { value } = e.target;
    setSelectedTeam(value);

    try {
      const response = await axios.get(`${API_URL}/addteam/teams/${value}/members`);
      setTeamMembers(response.data.members || []);
    } catch (error) {
      showSnackbar(error.response?.data?.message || "An error occurred while loading team members", "error");
    }
  };

  const handleTeamMemberSelect = (memberId) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleAddSelectedTeamMembers = () => {
    // Filter out members that are already assigned
    const alreadyAssignedIds = teamData.assignedMembers.map(member => member.employeeId);
    
    const newMembers = teamMembers
      .filter((member) => 
        selectedTeamMembers.includes(member.employee_id) && 
        !alreadyAssignedIds.includes(member.employee_id)
      )
      .map((member) => ({
        employeeId: member.employee_id,
        role: member.role || "Developer",
        allocation: 100,
        startDate: selectedProjectData?.start_date || new Date().toISOString().split("T")[0],
        endDate: selectedProjectData?.end_date || new Date().toISOString().split("T")[0],
        isExisting: false, // Flag to indicate this is a new record
        isProductOwner:false
      }));

    setTeamData((prev) => ({
      ...prev,
      assignedMembers: [...prev.assignedMembers, ...newMembers],
    }));

    setSelectedTeamMembers([]);
  };

  // Open confirmation dialog before deleting
  const handleDeleteMemberClick = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  // Close confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  // Handle removing team member from UI only
  const handleRemoveMemberFromUI = (userId) => {
    setTeamData((prev) => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter((member) => member.employeeId !== userId),
    }));
  };

  // Handle deleting team member from database
  const handleDeleteMemberFromDB = async () => {
    if (!memberToDelete || !memberToDelete.teamMemberId) {
      handleCloseDeleteDialog();
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/addteam/team-members/${memberToDelete.teamMemberId}`);
      
      // Remove from UI after successful deletion
      handleRemoveMemberFromUI(memberToDelete.employeeId);
      
      showSnackbar("Team member removed successfully", "success");
    } catch (error) {
      console.error("Error deleting team member:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to remove team member", 
        "error"
      );
    } finally {
      setDeleting(false);
      handleCloseDeleteDialog();
    }
  };

  // Main handler for removing a member - determines if it's a DB delete or just UI remove
  const handleRemoveMember = (member) => {
    if (member.isExisting && member.teamMemberId) {
      // If it's an existing record in the database, prompt for confirmation
      handleDeleteMemberClick(member);
    } else {
      // If it's just a new record not yet saved, just remove from UI
      handleRemoveMemberFromUI(member.employeeId);
    }
  };

  const handleMemberFieldChange = (employeeId, field, value) => {
    setTeamData({
      ...teamData,
      assignedMembers: teamData.assignedMembers.map((member) => {
        if (member.employeeId === employeeId) {
          return { ...member, [field]: value };
        }
        return member;
      }),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!teamData.selectedProject) {
      newErrors.selectedProject = "Please select a project";
    }

    if (teamData.assignedMembers.length === 0) {
      newErrors.assignedMembers = "Please assign at least one team member";
    }

    // Add validation for team selection
    if (!selectedTeam) {
      newErrors.selectedTeam = "Please select a team";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTeamData = () => {
    return {
      projectId: teamData.selectedProject,
      teamId: selectedTeam,
      teamMembers: teamData.assignedMembers.map(member => ({
        ...member,
        teamId: selectedTeam, // Add teamId to each team member
        // Include the team_member_id for existing records
        team_member_id: member.teamMemberId || undefined
      })),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formattedData = formatTeamData();

    try {
      setSaving(true);
      await axios.post(`${API_URL}/addteam`, formattedData);

      navigate("/manageteam", {
        state: { message: "Team updated successfully!", severity: "success" },
      });
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "An error occurred while updating the team", 
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const dateConstraints = {
    min: selectedProjectData?.start_date || null,
    max: selectedProjectData?.end_date || null,
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, mb: 8, px: 2 }}>
      <Typography variant="h4" align="center" fontWeight="bold">
        Team Allocation
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Select Project/Product</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.selectedProject}>
                  <InputLabel id="project-select-label">Project/Product</InputLabel>
                  <Select
                    labelId="project-select-label"
                    value={teamData.selectedProject}
                    onChange={handleProjectChange}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.project_id} value={project.project_id}>
                        {project.name} ({project.key})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.selectedProject}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            
            {isLoadingExistingData && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>Loading existing team data...</Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Select Team</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.selectedTeam}>
                  <InputLabel id="team-select-label">Team</InputLabel>
                  <Select
                    labelId="team-select-label"
                    value={selectedTeam}
                    onChange={handleTeamChange}
                    disabled={teams.length === 0}
                  >
                    {teams.length > 0 ? (
                      teams.map((team) => (
                        <MenuItem key={team.team_id} value={team.team_id}>
                          {team.team_name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No teams available</MenuItem>
                    )}
                  </Select>
                  {errors.selectedTeam && (
                    <FormHelperText>{errors.selectedTeam}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            {teamMembers.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Select team members to add:</Typography>
                <List>
                  {teamMembers.map((member) => {
                    // Check if this member is already assigned
                    const isAlreadyAssigned = teamData.assignedMembers.some(
                      m => m.employeeId === member.employee_id
                    );
                    
                    return (
                      <ListItem key={member.employee_id} dense button disabled={isAlreadyAssigned}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedTeamMembers.includes(member.employee_id)}
                            tabIndex={-1}
                            disableRipple
                            onChange={() => handleTeamMemberSelect(member.employee_id)}
                            disabled={isAlreadyAssigned}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${member.employee_id} (${member.role})`} 
                          secondary={isAlreadyAssigned ? "Already assigned" : ""}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSelectedTeamMembers}
              disabled={selectedTeamMembers.length === 0}
              sx={{ mt: 2 }}
            >
              Add Selected Members
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Assigned Team Members
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {teamData.assignedMembers.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Allocation (%)</TableCell>
                      <TableCell>Product Owner</TableCell>  {/* Add this new column */}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamData.assignedMembers.map((member) => (
                      <TableRow key={member.employeeId}>
                        <TableCell>
                          {member.employeeId}
                          {member.isExisting && (
                            <Chip 
                              size="small" 
                              label="Existing" 
                              color="primary" 
                              variant="outlined" 
                              sx={{ ml: 1, fontSize: '0.625rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={member.startDate || ""}
                            onChange={(e) => handleMemberFieldChange(member.employeeId, "startDate", e.target.value)}
                            inputProps={{ min: dateConstraints.min, max: member.endDate || dateConstraints.max }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={member.endDate || ""}
                            onChange={(e) => handleMemberFieldChange(member.employeeId, "endDate", e.target.value)}
                            inputProps={{ min: member.startDate || dateConstraints.min, max: dateConstraints.max }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={member.allocation || ""}
                            onChange={(e) => handleMemberFieldChange(member.employeeId, "allocation", e.target.value)}
                            inputProps={{ min: 10, max: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={member.isProductOwner || false}
                            onChange={(e) => {
                              // If checked, uncheck all other members first
                              if (e.target.checked) {
                                teamData.assignedMembers.forEach(m => {
                                  if (m.employeeId !== member.employeeId && m.isProductOwner) {
                                    handleMemberFieldChange(m.employeeId, "isProductOwner", false);
                                  }
                                });
                              }
                              handleMemberFieldChange(member.employeeId, "isProductOwner", e.target.checked);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveMember(member)}
                            title={member.isExisting ? "Delete from database" : "Remove from list"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                {isLoadingExistingData 
                  ? "Loading team allocations..." 
                  : "No team members assigned yet. Please select members from the team above."}
              </Typography>
            )}
            {errors.assignedMembers && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errors.assignedMembers}
              </Typography>
            )}
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/manageteam")}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={saving || isLoadingExistingData}
            >
              {saving ? <CircularProgress size={24} /> : "Save Team"}
            </Button>
          </Box>
        </form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Delete Team Member
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to permanently remove this team member from the project?
            {memberToDelete?.employeeId && (
              <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
                Employee ID: {memberToDelete.employeeId}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteMemberFromDB} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamAllocation;