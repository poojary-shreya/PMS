import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarToday,
  AttachMoney,
  Person,
  Group,
  Close,
  Badge,
  Workspaces,
  Timeline,
  Edit
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Main component
const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/addteam/team/projects-with-teams');
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (project) => {
    handleCloseTeamDialog();
    navigate('/assignteam', { state: {selectedProjectId: project.project_id } });
  };

  const handleOpenTeamDialog = (project) => {
    setSelectedProject(project);
    setTeamDialogOpen(true);
  };

  const handleCloseTeamDialog = () => {
    setTeamDialogOpen(false);
  };

  const findProjectLead = (team) => {
    if (!team || team.length === 0) return null;
    return team.find(member => member.role === 'Project Manager');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={fetchProjects}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Manage and track all your organization's projects along with team members
        </Typography>
       
      </Box>

      <Grid container spacing={3}>
        {projects.length > 0 ? (
          projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.project_id}>
              <ProjectCard 
                project={project} 
                onViewTeam={handleOpenTeamDialog}
                findProjectLead={findProjectLead}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">No projects found</Typography>
              <Typography variant="body2" color="text.secondary">
                There are no projects in the system yet.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {selectedProject && (
        <TeamDialog 
          open={teamDialogOpen} 
          onClose={handleCloseTeamDialog} 
          project={selectedProject}
          findProjectLead={findProjectLead}
          formatDate={formatDate}
          onEditTeam={handleEditTeam}
        />
      )}
    </Container>
  );
};

// Project Card Component
const ProjectCard = ({ project, onViewTeam, findProjectLead, getStatusColor, formatDate }) => {
  const projectLead = findProjectLead(project.team);
  const teamCount = project.team ? project.team.length : 0;
  
  // Get project lead name based on the updated structure
  const getProjectLeadName = () => {
    if (!projectLead || !projectLead.person) return 'No manager assigned';
    return projectLead.person.name;
  };
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 8,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip 
            label={project.key} 
            size="small" 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          />
          <Chip 
            label={project.status} 
            size="small" 
            color={getStatusColor(project.status)}
          />
        </Box>
        
        <Typography variant="h5" component="div" gutterBottom fontWeight="medium">
          {project.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description || 'No description provided'}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {formatDate(project.start_date)} - {formatDate(project.end_date)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Budget: {parseFloat(project.budget).toLocaleString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Project Manager: {getProjectLeadName()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Group fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Team: {teamCount} {teamCount === 1 ? 'member' : 'members'}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button 
          size="small" 
          variant="outlined" 
          color="primary"
          startIcon={<Group />}
          onClick={() => onViewTeam(project)}
          disabled={teamCount === 0}
        >
          View Team
        </Button>
      </CardActions>
    </Card>
  );
};

// Team Dialog Component
const TeamDialog = ({ open, onClose, project, findProjectLead, formatDate, onEditTeam}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const projectLead = findProjectLead(project.team);
  
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 
      ? parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      : parts[0].charAt(0).toUpperCase();
  };
  
  const getAvatarColor = (role) => {
    switch (role) {
      case 'Project Manager':
        return theme.palette.error.main;
      case 'Developer':
        return theme.palette.primary.main;
      case 'QA Tester':
        return theme.palette.success.main;
      case 'Designer':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getMemberTypeChip = (person) => {
    if (!person) return null;
    
    return (
      <Chip 
        label={person.type === 'contractor' ? 'Contractor' : 'Employee'} 
        size="small" 
        color={person.type === 'contractor' ? 'warning' : 'info'} 
        sx={{ ml: 1, fontSize: '0.625rem', height: 20 }}
      />
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {project.name} - Team Members
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Project Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Key:</strong> {project.key}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Workspaces fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Type:</strong> {project.projectType}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Duration:</strong> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  <strong>Status:</strong> {project.status}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Team Members ({project.team?.length || 0})
        </Typography>
        
        {project.team && project.team.length > 0 ? (
          <List>
            {project.team.map((member) => (
              <ListItem key={member.team_member_id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getAvatarColor(member.role) }}>
                    {getInitials(member.person?.name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {member.person?.name}
                      {getMemberTypeChip(member.person)}
                      {member.role === 'Project Manager' && (
                        <Chip 
                          label="Manager" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, fontSize: '0.625rem', height: 20 }}
                        />
                      )}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.primary">
                        {member.role}
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        Email: {member.person?.email}
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        Allocation: {member.allocation_percentage}% • 
                        {formatDate(member.start_date)} - {formatDate(member.end_date)}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No team members assigned to this project.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button 
          onClick={() => onEditTeam(project)} 
          color="primary" 
          variant="contained"
          startIcon={<Edit />}
        >
          Edit Team
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDashboard;