import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Grid, 
  Button, 
  Paper, 
  Card,
  CardContent,
  Chip,
  Autocomplete,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';

// Import necessary icons
import { User as PersonIcon } from 'lucide-react';
import { Bug as BugIcon } from 'lucide-react';
import { CheckSquare as TaskIcon } from 'lucide-react';
import { BookOpen as StoryIcon } from 'lucide-react';
import { Award as EpicIcon } from 'lucide-react';
import { Clock as AccessTimeIcon } from 'lucide-react';
import { Plus as AddIcon } from 'lucide-react';
import { AlertTriangle as AlertTriangleIcon } from 'lucide-react';

// Predefined data for frontend (can be fetched dynamically)
const issueTypes = [
  { id: 1, name: 'Bug', icon: <BugIcon size={16} color="#e53e3e" /> },
  { id: 2, name: 'Task', icon: <TaskIcon size={16} color="#3182ce" /> },
  { id: 3, name: 'Story', icon: <StoryIcon size={16} color="#38a169" /> },
  { id: 4, name: 'Epic', icon: <EpicIcon size={16} color="#805ad5" /> },
];

const priorities = [
  { id: 1, name: 'Highest' },
  { id: 2, name: 'High' },
  { id: 3, name: 'Medium' },
  { id: 4, name: 'Low' },
  { id: 5, name: 'Lowest' },
];

const severities = [
  { id: 1, name: 'Blocker' },
  { id: 2, name: 'Critical' },
  { id: 3, name: 'Major' },
  { id: 4, name: 'Minor' },
  { id: 5, name: 'Trivial'},
];

// Status options
const statuses = [
  { id: 1, name: 'Not Started' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'In Review' },
  { id: 4, name: 'Done' }
];

// Sample colors for label creation
const labelColors = [
  { value: '#0052cc', name: 'Blue' },
  { value: '#00875a', name: 'Green' },
  { value: '#8777d9', name: 'Purple' },
  { value: '#ff7452', name: 'Orange' },
  { value: '#ff5630', name: 'Red' },
  { value: '#00a3bf', name: 'Cyan' },
  { value: '#998dd9', name: 'Lavender' },
  { value: '#4c9aff', name: 'Light Blue' },
  { value: '#36b37e', name: 'Light Green' },
];

// Utility function to create API client
const createApiClient = () => {
  const baseURL = 'http://localhost:5000/api';
  
  return {
    async getProjects() {
      try {
        const response = await fetch(`${baseURL}/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    },
    
    async getProjectDetails(projectId) {
      try {
        const response = await fetch(`${baseURL}/projects/projectname/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project details');
        const data = await response.json();
        
        // Make sure we check if data exists and has the expected structure
        if (!data || !data.data) {
          console.warn('Unexpected project details response format:', data);
          return null;
        }
        
        return data.data;
      } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
      }
    },
    
    async getIssueDetails(issueId) {
      try {
        const response = await fetch(`${baseURL}/issues/${issueId}`);
        if (!response.ok) throw new Error('Failed to fetch issue details');
        const data = await response.json();
        
        if (!data || !data.data) {
          console.warn('Unexpected issue details response format:', data);
          return null;
        }
        
        return data.data;
      } catch (error) {
        console.error('Error fetching issue details:', error);
        throw error;
      }
    },
    
    async createIssue(issueData) {
      try {
        const response = await fetch(`${baseURL}/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create issue');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
      }
    },
    
    async updateIssue(issueId, issueData) {
      try {
        const response = await fetch(`${baseURL}/issues/${issueId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update issue');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating issue:', error);
        throw error;
      }
    },
    
    async createLabel(labelData) {
      try {
        const response = await fetch(`${baseURL}/labels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(labelData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create label');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating label:', error);
        throw error;
      }
    },
    
    async getLabels() {
      try {
        const response = await fetch(`${baseURL}/labels`);
        if (!response.ok) throw new Error('Failed to fetch labels');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching labels:', error);
        throw error;
      }
    },

    async getProjectTeamMembers(projectId) {
  try {
    const response = await fetch(`${baseURL}/addteam/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    const data = await response.json();
    return data.teamMembers || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}
  };
};

export default function CreateIssuePage() {
  const [teamMembers, setTeamMembers] = useState([]);
const [isTeamMembersLoading, setIsTeamMembersLoading] = useState(false);
  const apiClient = createApiClient();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're in edit mode based on navigation state
  const isEditMode = location.state?.editMode || false;
  const issueToEdit = location.state?.issueData || null;
  console.log(issueToEdit);
  
  // State for projects - initialize as empty array
  const [projects, setProjects] = useState([]);

  
  
  // State for labels
  const [labels, setLabels] = useState([
    { id: 1, name: 'frontend', color: '#0052cc' },
    { id: 2, name: 'backend', color: '#00875a' },
    { id: 3, name: 'design', color: '#8777d9' },
    { id: 4, name: 'documentation', color: '#ff7452' },
  ]);
  
  const [issueData, setIssueData] = useState({
    id: '',
    project_id: '',
    issueType: '',
    summary: '',
    description: '',
    assignee: '',
    productOwner: '',
    productOwnerName: '',
    priority: 3,
    severity: 3,
    status: 1,
    labels: [],
    startDate:'',
    dueDate: '',
    timeEstimate: ''
  });
  
  // State for new label dialog
  const [openLabelDialog, setOpenLabelDialog] = useState(false);
  const [newLabel, setNewLabel] = useState({
    name: '',
    color: '#0052cc'
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [labelError, setLabelError] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [isProductOwnerLoading, setIsProductOwnerLoading] = useState(false);
  const [isLabelLoading, setIsLabelLoading] = useState(false);

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Effect to load initial data (projects, labels)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch projects
        const fetchedProjects = await apiClient.getProjects().catch(() => []);
        
        // Format for select component
        const formattedProjects = fetchedProjects.map(project => ({
          value: project.id || project.project_id, 
          label: project.name || project.key
        }));
        
        setProjects(formattedProjects);
        
        // Fetch labels
        const fetchedLabels = await apiClient.getLabels().catch(() => []);
        if (fetchedLabels.length > 0) {
          setLabels(fetchedLabels);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load initial data. Using default values.',
          severity: 'warning'
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInitialData();
  }, []);

  // Effect to populate form when in edit mode
  useEffect(() => {
    const loadIssueForEditing = async () => {
      if (isEditMode && issueToEdit) {
        try {
          setIsLoading(true);
          
          // Format labels to match expected structure
          let issueLabels = [];
          if (issueToEdit.labels) {
            if (Array.isArray(issueToEdit.labels)) {
              issueLabels = issueToEdit.labels;
            } else if (typeof issueToEdit.labels === 'string') {
              // If labels is a comma-separated string
              issueLabels = issueToEdit.labels.split(',').map(label => label.trim());
            }
          }
          
          // Populate form with issue data
          setIssueData({
            id: issueToEdit.id || '',
            project_id: issueToEdit.projectDetails.project_id || '',
            issueType: issueToEdit.issueType || '',
            summary: issueToEdit.summary || '',
            description: issueToEdit.description || '',
            assignee: issueToEdit.assignee || '',
            productOwner: issueToEdit.productOwner || '',
            productOwnerName: issueToEdit.projectDetails.lead_name || '',
            priority: issueToEdit.priority || 3,
            severity: issueToEdit.severity || 3,
            status: issueToEdit.status || 1,
            labels: issueLabels,
            startDate: issueToEdit.startDate ? new Date(issueToEdit.startDate).toISOString().split('T')[0] : '',
            dueDate: issueToEdit.dueDate ? new Date(issueToEdit.dueDate).toISOString().split('T')[0] : '',
            timeEstimate: issueToEdit.timeEstimate || ''
          });
          
          // If project_id exists, fetch product owner details
          if (issueToEdit.project_id) {
            fetchProductOwner(issueToEdit.project_id);
            fetchTeamMembers(issueToEdit.project_id);
          }
        } catch (error) {
          console.error('Error loading issue for editing:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load issue details. Please try again.',
            severity: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadIssueForEditing();
  }, [isEditMode, issueToEdit]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle project_id selection specially to fetch productOwner
    if (name === 'project_id' && value) {
      fetchProductOwner(value);
      fetchTeamMembers(value);
    }
    
    setIssueData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const fetchTeamMembers = async (projectId) => {
  try {
    setIsTeamMembersLoading(true);
    const members = await apiClient.getProjectTeamMembers(projectId).catch(() => []);
    setTeamMembers(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    setSnackbar({
      open: true,
      message: 'Failed to fetch team members.',
      severity: 'warning'
    });
  } finally {
    setIsTeamMembersLoading(false);
  }
};

  // Function to fetch product owner
  const fetchProductOwner = async (projectId) => {
    try {
      setIsProductOwnerLoading(true);
      
      // Get project details to extract product owner (lead_id)
      const projectDetails = await apiClient.getProjectDetails(projectId).catch(() => null);
      
      if (projectDetails) {
        // Set the product owner from project details
        setIssueData(prev => ({
          ...prev,
          productOwner: projectDetails.lead_id || '',
          productOwnerName: projectDetails.lead_name || 'Not assigned'
        }));
      } else {
        // Clear product owner if not available
        setIssueData(prev => ({
          ...prev,
          productOwner: '',
          productOwnerName: 'Project not found'
        }));
      }
    } catch (error) {
      console.error('Error fetching product owner:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch product owner information.',
        severity: 'warning'
      });
      setIssueData(prev => ({
        ...prev,
        productOwner: '',
        productOwnerName: 'Error loading'
      }));
    } finally {
      setIsProductOwnerLoading(false);
    }
  };

  // Handle multi-select changes (for labels)
  const handleLabelsChange = (event, newValues) => {
    setIssueData(prev => ({
      ...prev,
      labels: newValues.map(label => label.name)
    }));
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Open new label dialog
  const handleOpenLabelDialog = () => {
    setOpenLabelDialog(true);
    setNewLabel({ name: '', color: '#0052cc' });
    setLabelError('');
  };

  // Close new label dialog
  const handleCloseLabelDialog = () => {
    setOpenLabelDialog(false);
  };

  // Handle new label input changes
  const handleNewLabelChange = (e) => {
    const { name, value } = e.target;
    setNewLabel(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'name' && value.trim()) {
      setLabelError('');
    }
  };

  // Create new label
  const handleCreateLabel = async () => {
    // Validate label name
    if (!newLabel.name.trim()) {
      setLabelError('Label name is required');
      return;
    }
    
    // Check if label already exists
    if (labels.some(label => label.name.toLowerCase() === newLabel.name.toLowerCase())) {
      setLabelError('Label with this name already exists');
      return;
    }
    
    try {
      setIsLabelLoading(true);
      
      // Call API to create new label
      const createdLabel = await apiClient.createLabel({
        name: newLabel.name.trim(),
        color: newLabel.color
      }).catch(() => ({ id: Date.now() })); // Fallback ID if API fails
      
      // Add new label to labels list
      const newLabelObj = {
        id: createdLabel.id || Date.now(),
        name: newLabel.name.trim(),
        color: newLabel.color || '#0052cc'
      };
      
      setLabels(prev => [...prev, newLabelObj]);
      
      // Add the new label to the issue's selected labels
      setIssueData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabelObj.name]
      }));
      
      // Close dialog and show success message
      handleCloseLabelDialog();
      setSnackbar({
        open: true,
        message: 'Label created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating label:', error);
      setLabelError(error.message || 'Failed to create label');
    } finally {
      setIsLabelLoading(false);
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!issueData.project_id) newErrors.project_id = "Project is required";
    if (!issueData.issueType) newErrors.issueType = "Issue type is required";
    if (!issueData.summary.trim()) newErrors.summary = "Summary is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        // Prepare issue data for submission
        const submitData = {
          ...issueData,
          assignee: issueData.assignee, 
          labels: Array.isArray(issueData.labels) ? issueData.labels : [],
          dueDate: issueData.dueDate || null,
          timeEstimate: issueData.timeEstimate ? String(issueData.timeEstimate) : null
        };

        let response;
        
        if (isEditMode) {
          // Update existing issue
          response = await apiClient.updateIssue(issueData.id, submitData);
          
          setSnackbar({
            open: true,
            message: 'Issue updated successfully!',
            severity: 'success'
          });
          
          // Navigate back to issues list after successful update
          setTimeout(() => {
            navigate('/all-tasks');
          }, 2000);
        } else {
          // Create new issue
          response = await apiClient.createIssue(submitData);
          
          setSnackbar({
            open: true,
            message: 'Issue created successfully!',
            severity: 'success'
          });
          
          // Reset form for new issue creation
          setIssueData({
            id: '',
            project_id: '',
            issueType: '',
            summary: '',
            description: '',
            assignee: '',
            productOwner: '',
            productOwnerName: '',
            priority: 3,
            severity: 3,
            status: 1,
            labels: [],
            startDate:'',
            dueDate: '',
            timeEstimate: ''
          });
        }
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} issue:`, error);
        
        setSnackbar({
          open: true,
          message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} issue`,
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get currently selected issue type data
  const selectedIssueType = issueData.issueType ? 
    issueTypes.find(type => type.id === parseInt(issueData.issueType)) : null;
  
  // Get currently selected status
  const selectedStatus = issueData.status ?
    statuses.find(status => status.id === parseInt(issueData.status)) : statuses[0];
  
  return (
    <Box className="flex-grow">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* New Label Dialog */}
      <Dialog open={openLabelDialog} onClose={handleCloseLabelDialog}>
        <DialogTitle>Create New Label</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Label Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newLabel.name}
            onChange={handleNewLabelChange}
            error={!!labelError}
            helperText={labelError}
            disabled={isLabelLoading}
            sx={{ mb: 3, mt: 1 }}
          />
          
          <FormControl fullWidth>
            <InputLabel id="label-color-label">Label Color</InputLabel>
            <Select
              labelId="label-color-label"
              id="color"
              name="color"
              value={newLabel.color || '#0052cc'}
              label="Label Color"
              onChange={handleNewLabelChange}
              disabled={isLabelLoading}
            >
              {labelColors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        backgroundColor: color.value,
                        mr: 1
                      }} 
                    />
                    <Typography>{color.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Preview */}
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Preview:</Typography>
            {newLabel.name && (
              <Chip
                label={newLabel.name}
                style={{ 
                  backgroundColor: newLabel.color || '#0052cc',
                  color: 'white'
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLabelDialog} disabled={isLabelLoading}>Cancel</Button>
          <Button 
            onClick={handleCreateLabel} 
            variant="contained" 
            disabled={isLabelLoading || !newLabel.name.trim()}
            startIcon={isLabelLoading ? null : <AddIcon />}
          >
            {isLabelLoading ? 'Creating...' : 'Create Label'}
          </Button>
        </DialogActions>
      </Dialog>

      <Container sx={{ mt: 4, mb: 8, maxWidth: 'lg' }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}> 
          <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
            {isEditMode ? 'Edit Change Requirements' : 'Create Change Requirements'}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Left Column - Main Fields */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {/* Project Select */}
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      required 
                      error={!!errors.project_id}
                      sx={{ mb: 1 }}
                    >
                      <InputLabel id="project-label">Project</InputLabel>
                      <Select
                        labelId="project-label"
                        id="project_id"
                        name="project_id"
                        value={issueData.project_id}
                        label="Project"
                        onChange={handleChange}
                        disabled={isLoading || projects.length === 0 || (isEditMode && !issueData.project_id)}
                      >
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <MenuItem key={project.value} value={project.value}>
                              {project.label}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No projects available
                          </MenuItem>
                        )}
                      </Select>
                      {errors.project_id && (
                        <Typography color="error" variant="caption">
                          {errors.project_id}
                        </Typography>
                      )}
                      {projects.length === 0 && !isLoading && (
                        <Typography color="warning.main" variant="caption">
                          No projects available. Projects need to be created first.
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Issue Type Select */}
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      required
                      error={!!errors.issueType}
                      sx={{ mb: 1 }}
                    >
                      <InputLabel id="issue-type-label">Change request</InputLabel>
                      <Select
                        labelId="issue-type-label"
                        id="issueType"
                        name="issueType"
                        value={issueData.issueType}
                        label="Issue Type"
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {issueTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {type.icon}
                              <Typography sx={{ ml: 1 }}>{type.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.issueType && (
                        <Typography color="error" variant="caption">
                          {errors.issueType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Summary */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="summary"
                      name="summary"
                      label="Summary"
                      value={issueData.summary}
                      onChange={handleChange}
                      error={!!errors.summary}
                      helperText={errors.summary}
                      disabled={isLoading}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={12}
                      value={issueData.description}
                      onChange={handleChange}
                      placeholder="Describe the issue in detail..."
                      disabled={isLoading}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Right Column - Sidebar Fields */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Status Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={issueData.status}
                        label="Status"
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status.id} value={status.id}>
                            <Typography>{status.name}</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {/* Status Display */}
                    {selectedIssueType && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {selectedIssueType.icon}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          This {selectedIssueType.name.toLowerCase()} will be {isEditMode ? 'updated' : 'created'} in status: 
                          <Chip 
                            size="small" 
                            label={selectedStatus.name} 
                            sx={{ ml: 1, bgcolor: 'grey.200' }} 
                          />
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Assignee */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
  <InputLabel id="assignee-label">Assignee</InputLabel>
  <Select
    labelId="assignee-label"
    id="assignee"
    name="assignee"
    value={issueData.assignee}
    onChange={handleChange}
    label="Assignee"
    disabled={isLoading || isTeamMembersLoading || teamMembers.length === 0}
    startAdornment={
      <InputAdornment position="start">
        <PersonIcon />
      </InputAdornment>
    }
  >
    {teamMembers.length > 0 ? (
      teamMembers.map((member) => (
        <MenuItem key={member.employee_id} value={member.employee_id}>
          {`${member.employee_id} - ${member.role}`}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled value="">
        {isTeamMembersLoading ? 'Loading team members...' : 'No team members available'}
      </MenuItem>
    )}
  </Select>
  {teamMembers.length === 0 && !isTeamMembersLoading && (
    <Typography color="warning.main" variant="caption">
      No team members available for this project.
    </Typography>
  )}
</FormControl>
                    
                    {/* Product Owner (Read-Only) */}
                    <TextField
                      id="productOwnerName"
                      label="Product Owner"
                      value={issueData.productOwnerName || 'Not assigned'}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                      helperText="Automatically assigned from project"
                      disabled={isProductOwnerLoading}
                    />
                    
                    {/* Priority */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="priority-label">Priority</InputLabel>
                      <Select
                        labelId="priority-label"
                        id="priority"
                        name="priority"
                        value={issueData.priority}
                        label="Priority"
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {priorities.map((priority) => (
                          <MenuItem key={priority.id} value={priority.id}>
                            {priority.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="severity-label">Severity</InputLabel>
                      <Select
                        labelId="severity-label"
                        id="severity"
                        name="severity"
                        value={issueData.severity}
                        label="Severity"
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {severities.map((severity) => (
                          <MenuItem key={severity.id} value={severity.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {severity.icon}
                              <Typography sx={{ ml: 1 }}>{severity.name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {/* Severity (show only for Bug type) */}
                    {/* {issueData.issueType === 1 && (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="severity-label">Severity</InputLabel>
                        <Select
                          labelId="severity-label"
                          id="severity"
                          name="severity"
                          value={issueData.severity}
                          label="Severity"
                          onChange={handleChange}
                          disabled={isLoading}
                        >
                          {severities.map((severity) => (
                            <MenuItem key={severity.id} value={severity.id}>
                              {severity.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )} */}
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          id="startDate"
                          name="startDate"
                          label="Start Date"
                          type="date"
                          value={issueData.startDate}
                          onChange={handleChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          id="endDate"
                          name="endDate"
                          label="Due Date"
                          type="date"
                          value={issueData.endDate}
                          onChange={handleChange}
                          error={!!errors.endDate}
                          helperText={errors.endDate}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={isLoading}
                        />
                      </Grid>
                    </Grid>
                    
                    {/* Time Estimate */}
                    <TextField
                      id="timeEstimate"
                      name="timeEstimate"
                      label="Time Estimate (hours)"
                      type="number"
                      value={issueData.timeEstimate}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        inputProps: { min: 0, step: 0.5 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                      disabled={isLoading}
                    />
                    
                    {/* Labels with Autocomplete */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <Autocomplete
                        multiple
                        id="labels"
                        options={labels}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        value={labels.filter(label => 
                          issueData.labels && issueData.labels.includes(label.name)
                        )}
                        onChange={handleLabelsChange}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box component="span" sx={{ 
                              width: 14, 
                              height: 14, 
                              mr: 1, 
                              borderRadius: '50%', 
                              display: 'inline-block', 
                              bgcolor: option.color 
                            }} />
                            {option.name}
                          </li>
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="filled"
                              label={option.name}
                              {...getTagProps({ index })}
                              style={{ 
                                backgroundColor: option.color,
                                color: 'white', 
                                marginRight: 5 
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Labels"
                            placeholder="Add labels"
                          />
                        )}
                        disabled={isLoading}
                      />
                    </FormControl>
                    
                    {/* Add new label button */}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenLabelDialog}
                      fullWidth
                      sx={{ mb: 4 }}
                      disabled={isLoading}
                    >
                      Create New Label
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Form Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  
                  <Tooltip title={isLoading ? 'Processing...' : ''}>
                    <span>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        startIcon={isLoading ? null : selectedIssueType?.icon || <AlertTriangleIcon />}
                      >
                        {isLoading ? 'Processing...' : isEditMode ? 'Update Issue' : 'Create Issue'}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}