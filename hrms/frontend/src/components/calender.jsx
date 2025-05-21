import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Popover,
  Card,
  CardContent,
  Stack,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';

// API service for backend calls
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API service for backend calls
const apiService = {
  // Projects API
  getAllProjects: async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  getProjectById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  
  getIssues: async (projectId = null) => {
    try {
      const url = projectId 
        ? `${API_URL}/issues?projectId=${projectId}` 
        : `${API_URL}/issues`;
      const response = await axios.get(url);
      return response.data; // Modified: Removed .data property access
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },
  
  createIssue: async (issueData) => {
    try {
      const response = await axios.post(`${API_URL}/issues`, issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },
  
  updateIssueStatus: async (issueId, status) => {
    try {
      const response = await axios.patch(`${API_URL}/issues/${issueId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  },
  
  // Teams API
  getTeams: async () => {
    try {
      const response = await axios.get(`${API_URL}/teams/teams`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }
};

const ProjectCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [taskType, setTaskType] = useState('task');
  const [tasks, setTasks] = useState([]); // Store tasks
  const [newTaskText, setNewTaskText] = useState('');
  const [projects, setProjects] = useState([]); // Initialize as an empty array
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Month names for header
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Day names for header
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Fetch projects and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const projectsData = await apiService.getAllProjects();
        // Check if projectsData is an array, if not, handle accordingly
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        
        const response = await apiService.getIssues();
        // Make sure we're handling the response correctly
        const issuesData = Array.isArray(response) ? response : 
                          response && Array.isArray(response.data) ? response.data : [];
        
        // Convert issues to calendar tasks format
        const formattedTasks = issuesData.map(issue => {
          // Assume the due_date is in ISO format and we need to extract day, month, year
          const dueDate = issue.due_date ? new Date(issue.due_date) : new Date();
          
          return {
            id: issue._id || issue.id,
            text: issue.title || issue.name,
            type: issue.type || 'task',
            day: dueDate.getDate(),
            month: dueDate.getMonth(),
            year: dueDate.getFullYear(),
            project_id: issue.project_id,
            status: issue.status
          };
        });
        
        setTasks(formattedTasks);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter tasks based on selected project
  const filteredTasks = tasks.filter(task => {
    if (selectedProject === 'all') return true;
    return task.project_id === selectedProject;
  });
  
  // Navigation handlers
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the day of the week for the first day (0-6)
    // Adjust to make Monday the first day (0)
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Sunday becomes last day
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the grid (max 6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false
      });
    }
    
    return days;
  };
  
  // Check if a date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };
  
  // Handle cell click for creating a task
  const handleCellClick = (event, day, month, year) => {
    setActiveCell({ day, month, year });
    setAnchorEl(event.currentTarget);
  };
  
  // Create a task
  const handleCreateTask = async () => {
    if (newTaskText.trim() === '') return;
    
    try {
      setLoading(true);
      
      // Create a date object for the backend
      const taskDate = new Date(activeCell.year, activeCell.month, activeCell.day);
      
      // Prepare issue data for the backend
      const issueData = {
        title: newTaskText,
        description: newTaskText,
        type: taskType,
        status: 'open',
        priority: 'medium',
        project_id: selectedProject === 'all' ? null : selectedProject,
        due_date: taskDate.toISOString(),
        labels: [taskType]
      };
      
      // Send to backend
      const response = await apiService.createIssue(issueData);
      
      // Format for frontend and add to tasks list
      const newTask = {
        id: response._id || response.id,
        text: newTaskText,
        type: taskType,
        day: activeCell.day,
        month: activeCell.month,
        year: activeCell.year,
        project_id: selectedProject === 'all' ? null : selectedProject,
        status: 'open'
      };
      
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setAnchorEl(null);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Task created successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create task. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Close popup
  const handleClosePopup = () => {
    setAnchorEl(null);
    setNewTaskText('');
  };

  // Handle task type change
  const handleTaskTypeChange = (e) => {
    setTaskType(e.target.value);
  };
  
  // Handle project selection change
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get tasks for a specific date
  const getTasksForDate = (day, month, year) => {
    return filteredTasks.filter(task => 
      task.day === day && 
      task.month === month && 
      task.year === year
    );
  };
  
  // Determine task color based on type
  const getTaskColor = (type) => {
    switch (type) {
      case 'epic':
        return { bgcolor: '#FFF3E0', borderColor: '#FF9800', color: '#E65100' };
      case 'bug':
        return { bgcolor: '#FFEBEE', borderColor: '#F44336', color: '#C62828' };
      default: // task
        return { bgcolor: '#E3F2FD', borderColor: '#2196F3', color: '#0D47A1' };
    }
  };
  
  // Generate grid for the calendar
  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    
    // Chunk the days into weeks (7 days per week)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return (
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {/* Day headers */}
        <Grid container sx={{ bgcolor: 'grey.100', borderBottom: 1, borderColor: 'grey.300' }}>
          {dayNames.map(day => (
            <Grid item xs key={day} sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">{day}</Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar grid */}
        <Box>
          {weeks.map((week, weekIndex) => (
            <Grid
              container
              key={weekIndex}
              sx={{ borderBottom: weekIndex < weeks.length - 1 ? 1 : 0, borderColor: 'grey.300' }}
            >
              {week.map((day, dayIndex) => {
                const isCurrentDay = isToday(day.day, day.month, day.year);
                const dayTasks = getTasksForDate(day.day, day.month, day.year);
                
                return (
                  <Grid 
                    item 
                    xs
                    key={dayIndex}
                    onClick={(e) => handleCellClick(e, day.day, day.month, day.year)}
                    sx={{
                      height: 120,
                      p: 1,
                      position: 'relative',
                      borderRight: dayIndex < 6 ? 1 : 0,
                      borderColor: 'grey.300',
                      bgcolor: !day.isCurrentMonth 
                        ? 'grey.100' 
                        : (isCurrentDay ? 'primary.50' : 'background.paper'),
                      '&:hover': {
                        cursor: 'pointer',
                        bgcolor: !day.isCurrentMonth 
                          ? 'grey.200' 
                          : (isCurrentDay ? 'primary.100' : 'grey.50')
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography
                        variant="body2"
                        sx={{
                          color: !day.isCurrentMonth ? 'text.disabled' : 'text.primary',
                          ...(isCurrentDay && {
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          })
                        }}
                      >
                        {day.day}
                      </Typography>
                      <IconButton 
                        size="small"
                        sx={{ 
                          opacity: 0,
                          '&:hover': { opacity: 1 },
                          '.MuiGrid-item:hover &': { opacity: 0.6 }
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Task items */}
                   
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>
      </Paper>
    );
  };
  
  // Create popup
  const renderCreatePopup = () => {
    const open = Boolean(anchorEl);
    
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Card sx={{ width: 300 }}>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              size="small"
              sx={{ mb: 2 }}
            />
            <Box display="flex" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={taskType}
                  onChange={handleTaskTypeChange}
                >
                  <MenuItem value="task">Task</MenuItem>
                  <MenuItem value="epic">Epic</MenuItem>
                  <MenuItem value="bug">Bug</MenuItem>
                </Select>
              </FormControl>
              
             
              
              <Box ml="auto" display="flex" gap={1}>
                <Button variant="outlined" size="small" onClick={handleClosePopup}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleCreateTask}
                  disabled={loading || newTaskText.trim() === ''}
                >
                  {loading ? <CircularProgress size={16} /> : 'Create'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Popover>
    );
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="h6" component="h2" sx={{ mx: 1 }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleToday}
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Box>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProject}
              onChange={handleProjectChange}
              label="Project"
            >
              <MenuItem value="all">All Projects</MenuItem>
              {/* Add Array.isArray check before mapping */}
              {Array.isArray(projects) && projects.map(project => (
                <MenuItem key={project._id || project.id} value={project._id || project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Calendar View */}
      <Box position="relative">
        {renderCalendarGrid()}
        {renderCreatePopup()}
      </Box>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProjectCalendar;