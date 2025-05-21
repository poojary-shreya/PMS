import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  AvatarGroup,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  TodayOutlined as TodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Real API URL - update this with your actual backend endpoint
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EnhancedActiveProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [projectMenuId, setProjectMenuId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects`);
      
      if (response.data.status === "success") {
        // Transform the backend data into the format expected by our component
        const transformedProjects = response.data.data.map(project => ({
          id: project.project_id, // Use project_id as the project id
          name: project.name || 'Unnamed Project',
          key: project.key || 'KEY',
          type: project.projectType || 'General',
          lead: project.projectLead ? project.projectLead.name : 'Not Assigned',
          leadAvatar: project.projectLead?.avatar || null,
          starred: false, // This could be stored in user preferences
          status: project.status || 'Planning',
          lastUpdated: formatLastUpdated(project.updatedAt),
          progress: calculateProgress(project), // Calculate based on tasks
          dueDate: project.end_date,
          tasks: {
            total: project.tasks?.length || 0,
            completed: project.tasks?.filter(task => task.status === 'Completed').length || 0
          },
          team: project.team?.members?.map(member => ({
            id: member.employee_id,
            name: member.name,
            avatar: member.avatar || null
          })) || [],
          priority: determinePriority(project), // Determine priority based on project data
          avatar_bg: getAvatarColor(project.key) // Get consistent color based on project key
        }));
        
        setProjects(transformedProjects);
      } else {
        setError('Failed to fetch projects');
        throw new Error('API returned unsuccessful status');
      }
    } catch (err) {
      setError(`Error fetching projects: ${err.message}`);
      console.error('Error fetching projects:', err);
      setSnackbar({
        open: true,
        message: `Failed to load projects. Please try again later.`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format the last updated date
  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const updatedDate = new Date(dateString);
    const diffTime = Math.abs(now - updatedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 7) {
      return updatedDate.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Helper function to calculate progress
  const calculateProgress = (project) => {
    // If project has tasks, calculate progress based on completed tasks
    if (project.tasks && project.tasks.length > 0) {
      const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
      return Math.floor((completedTasks / project.tasks.length) * 100);
    }
    
    // Fallback to a value based on project id
    return Math.floor((parseInt(project.project_id || '0', 10) % 100) + 1);
  };
  
  // Helper function to determine priority
  const determinePriority = (project) => {
    // Check if project already has a priority field
    if (project.priority) return project.priority;
    
    // Assign priorities based on project attributes
    if (project.tasks?.some(task => task.label === 'Critical')) return 'High';
    if (project.end_date && new Date(project.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return 'High';
    
    // For now, assign in a round-robin fashion
    const priorities = ['High', 'Medium', 'Low'];
    const hash = project.project_id ? parseInt(project.project_id, 10) : 0;
    return priorities[hash % 3];
  };
  
  // Helper function to get consistent avatar color based on project key
  const getAvatarColor = (key) => {
    const colors = [
      '#2196F3', // Blue
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#00BCD4', // Cyan
      '#F44336', // Red
      '#3F51B5'  // Indigo
    ];
    
    let hash = 0;
    if (!key) return colors[0];
    
    // Simple hash function to get consistent color
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleMenuOpen = (event, projectId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setProjectMenuId(projectId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setProjectMenuId(null);
  };
  
  const toggleStar = async (id) => {
    try {
      const project = Array.isArray(projects) ? projects.find(p => p.id === id) : null;
      if (!project) return;
      
      const updatedStarStatus = !project.starred;
      
      // Optimistic update
      setProjects(projects.map(project => 
        project.id === id ? {...project, starred: updatedStarStatus} : project
      ));
      
      // Send update to server
      const response = await axios.put(`${API_URL}/projects/${id}/star`, {
        starred: updatedStarStatus
      });
      
      if (!response.data.status === "success") {
        throw new Error('Failed to update star status');
      }
    } catch (err) {
      console.error('Error updating star status:', err);
      // Revert the optimistic update
      if (Array.isArray(projects)) {
        setProjects(projects.map(project => 
          project.id === id ? {...project, starred: !project.starred} : project
        ));
      }
      setSnackbar({
        open: true,
        message: 'Failed to update star status. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter projects based on search text
  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      project.key?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  }) : [];

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    
    // Here we would typically update a context or Redux store
    // to show this project in the sidebar
    localStorage.setItem('selectedProject', projectId);
    
    // Navigate to the project detail page 
    navigate(`/project/${projectId}/roadmap`);
    
    // Show confirmation
    setSnackbar({
      open: true,
      message: `Project selected. Check sidebar for options.`,
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading projects...
        </Typography>
      </Box>
    );
  }

  if (error && (!Array.isArray(projects) || projects.length === 0)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchProjects}
          startIcon={<SearchIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Active Projects</Typography>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Search projects"
            variant="outlined"
            size="small"
            value={searchText}
            onChange={handleSearch}
            sx={{ width: '400px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
       
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="gray" sx={{ mr: 1 }}>
            Showing {filteredProjects.length} of {Array.isArray(projects) ? projects.length : 0} projects
          </Typography>
        </Box>
      </Paper>
     
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => handleProjectSelect(project.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: project.avatar_bg || '#2196F3',
                        width: 36, 
                        height: 36,
                        mr: 1.5,
                        fontSize: '0.875rem'
                      }}
                    >
                      {project.key}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="gray">
                        {project.type}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(project.id);
                      }}
                      sx={{ mr: 0.5 }}
                    >
                      {project.starred ? 
                        <StarIcon fontSize="small" sx={{ color: "#FFC107" }} /> : 
                        <StarBorderIcon fontSize="small" />
                      }
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, project.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
               
                <Divider sx={{ my: 2 }} />
               
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Chip 
                      label={project.status} 
                      size="small"
                      color="primary"
                      sx={{ height: 24 }}
                    />
                    {project.priority && (
                      <Chip 
                        label={project.priority} 
                        size="small"
                        color={
                          project.priority === 'High' ? 'error' : 
                          project.priority === 'Medium' ? 'warning' : 'success'
                        }
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    )}
                  </Box>
                 
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: '#f0f0f0', 
                    borderRadius: 4,
                    mb: 2
                  }}>
                    <Box 
                      sx={{ 
                        width: `${project.progress}%`, 
                        height: '100%', 
                        bgcolor: 
                          project.progress < 30 ? '#ff9800' : 
                          project.progress < 70 ? '#2196f3' : 
                          '#4caf50', 
                        borderRadius: 4 
                      }} 
                    />
                  </Box>
                 
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TodayIcon fontSize="small" sx={{ mr: 0.5, color: 'gray' }} />
                      <Typography variant="body2" color="gray">
                        {project.dueDate ? `Due ${new Date(project.dueDate).toLocaleDateString()}` : 'No due date'}
                      </Typography>
                    </Box>
                    
                  </Box>
                </Box>
               
               
              </CardContent>
             
            
            </Card>
          </Grid>
        ))}
      </Grid>
     
      {filteredProjects.length === 0 && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="gray">
            No projects found matching your criteria
          </Typography>
          <Typography variant="body2" color="gray">
            Try changing your search settings or check back later
          </Typography>
        </Paper>
      )}
     
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleProjectSelect(projectMenuId);
          handleMenuClose();
        }}>
          View details
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/create-project?edit=true&id=${projectMenuId}`);
          handleMenuClose();
        }}>
          Edit project
        </MenuItem>
      </Menu>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedActiveProjects;