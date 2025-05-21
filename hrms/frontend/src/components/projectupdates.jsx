import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  LinearProgress, 
  Chip, 
  Grid, 
  Alert, 
  Snackbar, 
  CircularProgress, 
  Divider, 
  IconButton
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Schedule as ScheduleIcon, 
  Close as CloseIcon
} from '@mui/icons-material';

// Project Status Chip component
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

// Progress Bar component
const ProgressBar = ({ percentage }) => {
  const getProgressColor = (percentage) => {
    if (percentage < 30) return "error";
    if (percentage < 70) return "warning";
    return "success";
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={getProgressColor(percentage)}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
};

// Project Card component
const ProjectCard = ({ project, onUpdateClick }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: project.status === 'Completed' ? 0.85 : 1,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
      variant="outlined"
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {project.name}
          </Typography>
          <ProjectStatusChip status={project.status} />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
          {project.description || 'No description provided.'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ width: '80px' }}>
              Project Lead:
            </Typography>
            <Typography variant="body2">
              {project.projectLead?.name || 'Unassigned'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ width: '80px' }}>
              Timeline:
            </Typography>
            <Typography variant="body2">
              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">Completion</Typography>
            <Typography variant="body2">{project.completionPercentage || 0}%</Typography>
          </Box>
          <ProgressBar percentage={project.completionPercentage || 0} />
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          fullWidth
          onClick={() => onUpdateClick(project)}
          color="primary"
        >
          Update Status
        </Button>
      </CardActions>
    </Card>
  );
};

// Update Status Dialog component
const UpdateStatusDialog = ({ isOpen, onClose, project, onUpdateStatus, isLoading }) => {
  const [status, setStatus] = useState(project?.status || 'Not Started');
  const [completionPercentage, setCompletionPercentage] = useState(project?.completionPercentage || 0);
  const [notes, setNotes] = useState('');

  // Map frontend status values to backend status values
  const statusMapping = {
    'Not Started': 'Active',
    'Planning': 'Planning',
    'In Progress': 'Active',
    'On Hold': 'On Hold',
    'Completed': 'Completed'
  };

  useEffect(() => {
    if (project) {
      setStatus(project.status || 'Not Started');
      setCompletionPercentage(project.completionPercentage || 0);
      setNotes('');
    }
  }, [project]);

  useEffect(() => {
    // Automatically set completion to 100% when status is Completed
    if (status === 'Completed') {
      setCompletionPercentage(100);
    }
  }, [status]);

  const handleSubmit = () => {
    // Map the frontend status to backend status before sending
    onUpdateStatus({
      status: statusMapping[status],
      completionPercentage: parseInt(completionPercentage),
      notes
    });
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Update Project Status
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>{project.name}</Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Not Started">Not Started</MenuItem>
            <MenuItem value="Planning">Planning</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <TextField
            label="Completion Percentage"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={completionPercentage}
            onChange={(e) => setCompletionPercentage(e.target.value)}
            disabled={status === 'Completed'}
          />
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <TextField
            label="Update Notes (Optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this status update..."
          />
        </FormControl>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Dashboard component
const AllProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  
  // For filtering/tabs
  const [currentTab, setCurrentTab] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // Map backend status values to frontend status values
  const backendToFrontendStatus = {
    'Active': 'In Progress', // Default mapping, will be refined when fetching
    'Planning': 'Planning',
    'Completed': 'Completed',
    'On Hold': 'On Hold',
    'Cancelled': 'On Hold' // Map Cancelled to On Hold for simplicity
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on the selected tab
    if (projects.length > 0) {
      filterProjects(currentTab);
    }
  }, [projects, currentTab]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/projects');
      
      // Process the projects to map backend status to frontend status
      const processedProjects = (response.data.data || []).map(project => {
        // Determine if it's "Not Started" or "In Progress" based on completion
        let frontendStatus = backendToFrontendStatus[project.status];
        if (project.status === 'Active') {
          frontendStatus = project.completionPercentage > 0 ? 'In Progress' : 'Not Started';
        }
        
        return {
          ...project,
          status: frontendStatus
        };
      });
      
      setProjects(processedProjects);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = (tabValue) => {
    switch (tabValue) {
      case 'active':
        setFilteredProjects(projects.filter(project => 
          project.status === 'In Progress' || project.status === 'Not Started' || project.status === 'Planning'
        ));
        break;
      case 'completed':
        setFilteredProjects(projects.filter(project => project.status === 'Completed'));
        break;
      case 'on-hold':
        setFilteredProjects(projects.filter(project => project.status === 'On Hold'));
        break;
      default:
        setFilteredProjects(projects);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenUpdateDialog = (project) => {
    setSelectedProject(project);
    setUpdateDialogOpen(true);
  };

  const handleStatusUpdate = async (updateData) => {
    if (!selectedProject) return;
    
    try {
      setUpdateLoading(true);
      
      // Send the update to the API
      await axios.put(`http://localhost:5000/api/projects/${selectedProject.project_id}`, updateData);
      
      // Map backend status to frontend status for local update
      let frontendStatus;
      if (updateData.status === 'Active') {
        frontendStatus = updateData.completionPercentage > 0 ? 'In Progress' : 'Not Started';
      } else if (updateData.status === 'Planning') {
        frontendStatus = 'Planning';
      } else {
        frontendStatus = backendToFrontendStatus[updateData.status];
      }
      
      // Update local state
      setProjects(projects.map(project => {
        if (project.project_id === selectedProject.project_id) {
          return { 
            ...project, 
            status: frontendStatus,
            completionPercentage: updateData.completionPercentage
          };
        }
        return project;
      }));
      
      // Update localStorage to ensure status persists across components
      try {
        // First, check if there are any projects in localStorage
        const storedProjects = localStorage.getItem('projectsData');
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          // Update the project with the new status
          const updatedStoredProjects = parsedProjects.map(project => {
            if (project.project_id === selectedProject.project_id) {
              return {
                ...project,
                status: updateData.status,
                completionPercentage: updateData.completionPercentage
              };
            }
            return project;
          });
          // Store the updated projects back in localStorage
          localStorage.setItem('projectsData', JSON.stringify(updatedStoredProjects));
        } else {
          // If no projects in localStorage yet, store the current projects
          localStorage.setItem('projectsData', JSON.stringify(projects.map(project => {
            if (project.project_id === selectedProject.project_id) {
              return {
                ...project,
                status: updateData.status,
                completionPercentage: updateData.completionPercentage
              };
            }
            return project;
          })));
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
    } catch (err) {
      console.error('Error updating project status:', err);
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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Projects Updates
        </Typography>
      </Box>
      
      {loading && projects.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredProjects.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No projects found matching the selected filter.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item key={project.project_id} xs={12} md={6} lg={4}>
              <ProjectCard 
                project={project} 
                onUpdateClick={handleOpenUpdateDialog}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      <UpdateStatusDialog
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        project={selectedProject}
        onUpdateStatus={handleStatusUpdate}
        isLoading={updateLoading}
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllProjectsDashboard;