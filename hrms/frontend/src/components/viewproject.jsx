import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Grid,
  Paper,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  DialogActions
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Assignment as TaskIcon,
  BarChart as ProgressIcon,
  CalendarMonth as CalendarIcon,
  SupervisorAccount as ManagerIcon,
  AccountTree as DepartmentIcon,
  AttachMoney as BudgetIcon,
  Edit as EditIcon,
  CurrencyRupee,
  Save as SaveIcon
} from "@mui/icons-material";
import axios from "axios";

// API base URL - Make sure this matches your backend server
const API_URL = "http://localhost:5000/api";

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// ProjectStatusChip component from AllProjectsDashboard
const ProjectStatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started': return 'default';
      case 'Planning': return 'info';
      case 'In Progress': return 'primary';
      case 'Active': return 'primary';
      case 'On Hold': return 'warning';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={status} 
      color={getStatusColor(status)} 
      size="small" 
      sx={{ fontWeight: 'medium' }}
    />
  );
};

const ProjectDetailsDialog = ({ open, handleClose, projectId }) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({ 
    total: 0, 
    completed: 0, 
    inProgress: 0, 
    todo: 0,
    completionPercentage: 0
  });
  
  // Status update related states
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  // Status mapping
  const backendToFrontendStatus = {
    'Active': 'In Progress',
    'Planning': 'Planning',
    'Completed': 'Completed',
    'On Hold': 'On Hold',
    'Cancelled': 'On Hold'
  };

  const frontendToBackendStatus = {
    'Not Started': 'Active',
    'Planning': 'Planning',
    'In Progress': 'Active',
    'On Hold': 'On Hold',
    'Completed': 'Completed'
  };

  // Debug mode to see what's happening with API calls
  const DEBUG = true;

  useEffect(() => {
    if (open && projectId) {
      if (DEBUG) console.log("Dialog opened with projectId:", projectId);
      loadProjectDetails();
    }
  }, [open, projectId]);

  useEffect(() => {
    // Automatically set completion to 100% when status is Completed
    if (status === 'Completed') {
      setCompletionPercentage(100);
    }
  }, [status]);

  // Fix for loadProjectDetails function to properly handle team data
  const loadProjectDetails = async () => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (DEBUG) console.log(`Fetching project data from: ${API_URL}/projects/${projectId}`);
      
      // Fetch project details
      const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`);
      
      if (DEBUG) console.log("Project API Response:", projectResponse);
      
      // Handle different API response formats
      let projectData;
      
      if (projectResponse.data.data) {
        // Format: { status: "success", data: {...} }
        projectData = projectResponse.data.data;
      } else {
        // Format: Direct object response
        projectData = projectResponse.data;
      }
      
      // Make sure we have all required fields with fallbacks
      const processedProject = {
        ...projectData,
        name: projectData.name || "Untitled Project",
        key: projectData.key || "UNKNOWN",
        projectType: projectData.projectType || projectData.type || "Not specified",
        status: projectData.status || "Active",
        description: projectData.description || "No description available",
        startDate: projectData.startDate || projectData.start_date || new Date().toISOString(),
        endDate: projectData.endDate || projectData.end_date || new Date().toISOString(),
        budget: projectData.budget || 0,
        completionPercentage: projectData.completionPercentage || 0
      };
      
      // Convert backend status to frontend status for display
      let frontendStatus;
      if (processedProject.status === 'Active') {
        frontendStatus = processedProject.completionPercentage > 0 ? 'In Progress' : 'Not Started';
      } else {
        frontendStatus = backendToFrontendStatus[processedProject.status] || processedProject.status;
      }
      
      processedProject.displayStatus = frontendStatus;
      
      if (DEBUG) console.log("Processed project data:", processedProject);
      setProject(processedProject);
      
      // Initialize status update form with current values
      setStatus(frontendStatus);
      setCompletionPercentage(processedProject.completionPercentage);
      
      // Fetch team members for this project
      try {
        if (DEBUG) console.log(`Fetching team data from: ${API_URL}/projects/${projectId}/team`);
        const teamResponse = await axios.get(`${API_URL}/projects/${projectId}/team`);
        if (DEBUG) console.log("Team API Response:", teamResponse);
        
        // Handle different team data response formats
        let teamData;
        
        if (teamResponse.data.data) {
          teamData = teamResponse.data.data;
        } else if (Array.isArray(teamResponse.data)) {
          teamData = teamResponse.data;
        } else {
          teamData = teamResponse.data.teamMembers || teamResponse.data.team || [];
        }
        
        // Ensure it's an array and process it
        const processedTeam = Array.isArray(teamData) ? teamData : [];
        
        if (DEBUG) console.log("Processed team data:", processedTeam);
        
        // Map team data to ensure consistent structure
        const normalizedTeam = processedTeam.map(member => ({
          id: member.id || member.employeeId || member.userId || '',
          employeeId: member.employeeId || member.id || member.userId || '',
          name: member.name || member.employeeName || 'Unknown',
          role: member.role || member.designation || 'Team Member',
          isProjectLead: !!member.isProjectLead,
          allocation: member.allocation || 100,
          startDate: member.startDate || processedProject.startDate,
          endDate: member.endDate || processedProject.endDate
        }));
        
        setTeam(normalizedTeam);
      } catch (teamError) {
        console.error("Error loading team data:", teamError);
        console.error("Team error details:", teamError.response?.data || teamError.message);
        setTeam([]);
      }
      
      // Fetch tasks for this project
      try {
        if (DEBUG) console.log(`Fetching tasks data from: ${API_URL}/projects/${projectId}/tasks`);
        const tasksResponse = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
        if (DEBUG) console.log("Tasks API Response:", tasksResponse);
        
        let taskData;
        if (tasksResponse.data.data) {
          taskData = tasksResponse.data.data;
        } else {
          taskData = tasksResponse.data;
        }
        
        const taskList = Array.isArray(taskData) ? taskData : [];
        setTasks(taskList);
        
        // Calculate task statistics
        if (taskList.length > 0) {
          const total = taskList.length;
          const completed = taskList.filter(task => task.status === 'Completed').length;
          const inProgress = taskList.filter(task => task.status === 'In Progress').length;
          const todo = total - completed - inProgress;
          
          setTaskStats({
            total,
            completed,
            inProgress,
            todo,
            completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
          });
        }
      } catch (tasksError) {
        console.error("Error loading tasks data:", tasksError);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading project details:", error);
      
      // Set error state with more details
      setError(
        error.response 
          ? `Error ${error.response.status}: ${error.response.data?.message || 'Failed to load project details'}`
          : "Network error or server not reachable"
      );
      
      // Set a default project object to avoid null reference errors
      setProject({
        name: "Error loading project",
        key: "ERROR",
        projectType: "Unknown",
        status: "Unknown",
        displayStatus: "Unknown",
        description: "Could not load project details. Please try again later.",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        budget: 0,
        completionPercentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Open status update dialog
  const openUpdateStatusDialog = () => {
    if (project) {
      setStatus(project.displayStatus);
      setCompletionPercentage(project.completionPercentage || 0);
      setNotes('');
      setUpdateDialogOpen(true);
    }
  };

  // Close status update dialog
  const closeUpdateStatusDialog = () => {
    setUpdateDialogOpen(false);
  };

  // Handle status update submission
  const handleStatusUpdate = async () => {
    try {
      setUpdateLoading(true);
      
      // Convert frontend status to backend status
      const backendStatus = frontendToBackendStatus[status];
      
      // Prepare update data
      const updateData = {
        status: backendStatus,
        completionPercentage: parseInt(completionPercentage),
        notes: notes
      };
      
      if (DEBUG) console.log(`Updating project ${projectId} with data:`, updateData);
      
      // Send update to API
      await axios.put(`${API_URL}/projects/${projectId}`, updateData);
      
      // Update local project state
      setProject(prev => ({
        ...prev,
        status: backendStatus,
        displayStatus: status,
        completionPercentage: parseInt(completionPercentage)
      }));
      
      // Update localStorage to ensure status persists across components
      try {
        const storedProjects = localStorage.getItem('projectsData');
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          const updatedStoredProjects = parsedProjects.map(p => {
            if (p.project_id === projectId || p.id === projectId) {
              return {
                ...p,
                status: backendStatus,
                displayStatus: status,
                completionPercentage: parseInt(completionPercentage)
              };
            }
            return p;
          });
          localStorage.setItem('projectsData', JSON.stringify(updatedStoredProjects));
        }
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
      }
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Project status updated successfully!',
        type: 'success'
      });
      
      // Close the dialog
      setUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating project status:', error);
      setNotification({
        open: true,
        message: 'Failed to update project status. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Loading Project Details...</Typography>
            <IconButton aria-label="close" onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Error</Typography>
            <IconButton aria-label="close" onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={loadProjectDetails}>
              Retry
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) {
    return null;
  }

  return (
    
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{project.name}</Typography>
              <Chip 
                label={project.key} 
                size="small" 
                sx={{ ml: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }} 
              />
              <ProjectStatusChip status={project.status} />
            </Box>
          
          </Box>
        </DialogTitle>
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="project tabs">
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<GroupIcon />} iconPosition="start" label="Team" />
            <Tab icon={<TaskIcon />} iconPosition="start" label="Tasks" />
            <Tab icon={<ProgressIcon />} iconPosition="start" label="Progress" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={value} index={0}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Project Description</Typography>
        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Project Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Start Date</Typography>
                <Typography variant="body2">
                  {formatDate(project.startDate || project.start_date)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">End Date</Typography>
                <Typography variant="body2">
                  {formatDate(project.endDate || project.end_date)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Project Type</Typography>
                <Typography variant="body2">{project.projectType || project.project_type || "Not specified"}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CurrencyRupee sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Budget</Typography>
                <Typography variant="body2">
                  {project.budget !== undefined ? 
                    `₹${typeof project.budget === 'number' ? project.budget.toLocaleString() : project.budget}` : 
                    "Not specified"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Project Progress</Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Overall Completion</Typography>
            <Typography variant="body2" fontWeight="bold">
              {project.completionPercentage || 0}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={project.completionPercentage || 0} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Box>
          <Typography variant="body2">Project Status</Typography>
          <Typography variant="body2" fontWeight="bold">
        
          <ProjectStatusChip status={project.displayStatus || project.frontendStatus || "Not specified"} />
          </Typography>
        </Box>
      </Paper>
    </Grid>
  </Grid>
</TabPanel>
        
        {/* Team Tab */}
        <TabPanel value={value} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Team Member</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Allocation</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team.length > 0 ? (
                  team.map((member) => (
                    <TableRow key={member.employeeId || member.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {member.name?.charAt(0) || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{member.name || "Unknown"}</Typography>
                            {member.isProjectLead && (
                              <Chip label="Project Lead" size="small" color="primary" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{member.role || "Not specified"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={member.allocation || 0} 
                              sx={{ height: 6, borderRadius: 3 }} 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.allocation || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(member.startDate)}</TableCell>
                      <TableCell>{formatDate(member.endDate)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No team members assigned to this project
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      
      {/* Tasks Tab */}
      <TabPanel value={value} index={2}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Project Tasks</Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => window.location.href = `/projects/${projectId}/tasks/create`}
          >
            Add Task
          </Button>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Task ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Summary</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow key={task.id} 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => window.location.href = `/tasks/${task.id}`}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {project.key}-{task.taskNumber || task.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{task.summary || task.name || "No title"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          {task.assignee?.charAt(0) || "U"}
                        </Avatar>
                        <Typography variant="body2">{task.assignee || "Unassigned"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status || "Not set"} 
                        size="small" 
                        color={
                          task.status === 'Completed' ? 'success' : 
                          task.status === 'In Progress' ? 'info' : 
                          task.status === 'Blocked' ? 'error' : 'default'
                        } 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority || "Normal"} 
                        size="small" 
                        color={
                          task.priority === 'High' ? 'error' : 
                          task.priority === 'Medium' ? 'warning' : 'default'
                        } 
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(task.dueDate)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No tasks created for this project
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      {/* Progress Tab */}
      <TabPanel value={value} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Task Progress</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overall Completion</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {taskStats.completionPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={taskStats.completionPercentage} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}
                  >
                    <Typography variant="h5">{taskStats.completed}</Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}
                  >
                    <Typography variant="h5">{taskStats.inProgress}</Typography>
                    <Typography variant="body2">In Progress</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}
                  >
                    <Typography variant="h5">{taskStats.todo}</Typography>
                    <Typography variant="body2">To Do</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Project Timeline</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Project Duration</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(project.startDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateTimelineProgress(project.startDate, project.endDate)} 
                      sx={{ height: 6, borderRadius: 3 }} 
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">End Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(project.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>Budget Overview</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <BudgetIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body1">
                    Total Budget: ₹{typeof project.budget === 'number' ? project.budget.toLocaleString() : "0"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Dialog>
  );
};

// Helper function to calculate timeline progress percentage
function calculateTimelineProgress(startDate, endDate) {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (isNaN(start) || isNaN(end)) {
      return 0;
    }
    
    if (now <= start) {
      return 0;
    }
    
    if (now >= end) {
      return 100;
    }
    
    return Math.round(((now - start) / (end - start)) * 100);
  } catch (error) {
    console.error("Error calculating timeline progress:", error);
    return 0;
  }
}

export default ProjectDetailsDialog;