import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  CheckCircleOutline as CompleteIcon,
  MoreVert as MoreVertIcon,
  Description as GoalIcon,
  DateRange as DateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Make sure this is correctly configured in your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ActiveSprints = ({ projectKey }) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch sprints when component mounts or projectKey changes
  useEffect(() => {
    if (projectKey) {
      fetchSprints();
    } else {
      setError("No project key provided");
      setLoading(false);
    }
  }, [projectKey]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching sprints for project: ${projectKey}`);
      
      // Ensure we're using the correct endpoint with proper error handling
      const response = await fetch(`${API_BASE_URL}/api/sprints/project/${projectKey}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data && data.success) {
        setSprints(data.data || []);
      } else {
        throw new Error(data?.message || 'Unknown error occurred');
      }
    } catch (apiError) {
      console.error('Error fetching sprints:', apiError);
      setError(`Failed to fetch sprints: ${apiError.message}`);
      showSnackbar(`API Error: ${apiError.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle creating a new sprint
  const handleCreateSprint = async (newSprintData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/sprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSprintData,
          projectKey
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result && result.success) {
        // Add the new sprint to the existing sprints
        setSprints(prevSprints => [...prevSprints, result.data]);
        showSnackbar('Sprint created successfully', 'success');
        return result.data;
      } else {
        throw new Error(result?.message || 'Unknown error creating sprint');
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
      showSnackbar(`Error creating sprint: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle sprint status change
  const handleChangeStatus = async (sprintId, newStatus) => {
    try {
      // API call with proper error handling
      const response = await fetch(`${API_BASE_URL}/api/sprints/${sprintId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result && result.success) {
        // Update the sprint in our local state to avoid a full refetch
        setSprints(prevSprints => 
          prevSprints.map(sprint => 
            sprint.id === sprintId ? { ...sprint, status: newStatus } : sprint
          )
        );
        showSnackbar(`Sprint status updated to ${newStatus.toLowerCase()}`, 'success');
      } else {
        throw new Error(result?.message || 'Unknown error updating sprint status');
      }
    } catch (error) {
      console.error('Error changing sprint status:', error);
      showSnackbar(`Error updating sprint status: ${error.message}`, 'error');
      // Now refetch to ensure we're in sync with backend
      fetchSprints();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'FUTURE':
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}${year !== new Date().getFullYear() ? `, ${year}` : ''}`;
  };

  // Filter sprints by status
  const activeSprints = sprints.filter(sprint => sprint.status === 'ACTIVE');
  const futureSprints = sprints.filter(sprint => sprint.status === 'FUTURE');
  const completedSprints = sprints.filter(sprint => sprint.status === 'COMPLETED');

  const renderSprintCard = (sprint) => {
    const startDateFormatted = formatDate(sprint.startDate);
    const endDateFormatted = formatDate(sprint.endDate);
    
    return (
      <Card key={sprint.id} variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">{sprint.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={sprint.status.charAt(0) + sprint.status.slice(1).toLowerCase()}
                color={getStatusColor(sprint.status)}
                size="small"
              />
              <IconButton size="small" sx={{ ml: 1 }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {sprint.goal && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <GoalIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Sprint goal</Typography>
              </Box>
              <Typography variant="body2">{sprint.goal}</Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DateIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {startDateFormatted} - {endDateFormatted} · {sprint.duration} week{sprint.duration !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          {sprint.status === 'FUTURE' && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<StartIcon />}
              onClick={() => handleChangeStatus(sprint.id, 'ACTIVE')}
            >
              Start
            </Button>
          )}
          
          {sprint.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CompleteIcon />}
              onClick={() => handleChangeStatus(sprint.id, 'COMPLETED')}
            >
              Complete
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

  const renderEmptyState = (type, action) => (
    <Paper 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 4, 
        px: 2, 
        bgcolor: 'background.paper'
      }}
    >
      <Typography color="text.secondary" align="center">No {type} sprints</Typography>
      {action && (
        <Button 
          color="primary" 
          size="small" 
          sx={{ mt: 1 }}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );

  // Create a mock new sprint for the placeholder functionality
  const createMockSprint = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks in future
    const endDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);   // 4 weeks in future
    
    return {
      name: `Sprint ${sprints.length + 1}`,
      goal: 'New sprint goal',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: 2,
      projectKey: projectKey,
      status: 'FUTURE'
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Active Sprints </Typography>
       
      </Box>

      {error && (
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={fetchSprints}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Active Sprints ({activeSprints.length})
              </Typography>
              
              {activeSprints.length > 0 ? (
                activeSprints.map(sprint => renderSprintCard(sprint))
              ) : (
                renderEmptyState('active', {
                  label: futureSprints.length > 0 ? 'Start a sprint' : 'Create a sprint',
                  onClick: () => {
                    if (futureSprints.length > 0) {
                      handleChangeStatus(futureSprints[0].id, 'ACTIVE');
                    } else {
                      setCreateDialogOpen(true);
                    }
                  }
                })
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Future Sprints ({futureSprints.length})
              </Typography>
              
              {futureSprints.length > 0 ? (
                futureSprints.map(sprint => renderSprintCard(sprint))
              ) : (
                renderEmptyState('future', {
                  label: 'Create a sprint',
                  onClick: () => setCreateDialogOpen(true)
                })
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Completed Sprints ({completedSprints.length})
              </Typography>
              
              {completedSprints.length > 0 ? (
                completedSprints.slice(0, 3).map(sprint => renderSprintCard(sprint))
              ) : (
                renderEmptyState('completed')
              )}
              
              {completedSprints.length > 3 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button color="primary" size="small">
                    View all completed sprints
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Sprint Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Sprint</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a placeholder for the CreateSprint component. In a real implementation, 
            this would be a form to enter sprint details.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={async () => {
              try {
                // Create a mock sprint for demo purposes
                const mockSprintData = createMockSprint();
                
                // In a real app, this would come from a form
                await handleCreateSprint(mockSprintData);
                
                setCreateDialogOpen(false);
              } catch (error) {
                console.error("Failed to create sprint:", error);
                // Error is already handled by handleCreateSprint
              }
            }}
          >
            Create Sprint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ActiveSprints;