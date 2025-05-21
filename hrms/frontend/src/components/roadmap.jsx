import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert, 
  Chip, 
  Avatar,
  Tooltip,
  Divider,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Card,
  CardContent,
  CardHeader,
  Collapse,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person'
import { format, isValid, addMonths, startOfQuarter, endOfQuarter } from 'date-fns';

// API URL - update this with your actual backend endpoint
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Epic Issues List Component
const EpicIssuesList = ({ projectId, epicId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEpicIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make API request to get issues for this epic
        const response = await axios.get(`${API_URL}/project/${projectId}/issues`);
        
        if (response.data.status === "success") {
          setIssues(response.data.data || []);
        } else {
          throw new Error('Failed to fetch issues for this epic');
        }
      } catch (err) {
        console.error('Error fetching epic issues:', err);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (epicId && projectId) {
      fetchEpicIssues();
    }
  }, [epicId, projectId]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>;
  }
  
  if (issues.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        No issues linked to this epic.
      </Typography>
    );
  }
  
  return (
    <List dense sx={{ mt: 1 }}>
      {issues.map(issue => (
        <ListItem 
          key={issue.id}
          sx={{ 
            border: '1px solid #DFE1E6', 
            borderRadius: '3px', 
            mb: 1,
            '&:hover': { bgcolor: '#F4F5F7' }
          }}
        >
          <ListItemText
            primary={issue.summary}
            secondary={issue.key}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
          <Chip 
            label={issue.status === 1 ? 'To Do' : issue.status === 2 ? 'In Progress' : 'Done'} 
            size="small"
            sx={{ 
              ml: 1, 
              height: '20px',
              fontSize: '0.7rem',
              bgcolor: issue.status === 1 ? '#F4F5F7' : issue.status === 2 ? '#DEEBFF' : '#E3FCEF',
              color: issue.status === 1 ? '#172B4D' : issue.status === 2 ? '#0052CC' : '#006644'
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

const RoadmapPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [viewAnchorEl, setViewAnchorEl] = useState(null);
  const [timescaleAnchorEl, setTimescaleAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    labels: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [createEpicDialogOpen, setCreateEpicDialogOpen] = useState(false);
  const [epicFormData, setEpicFormData] = useState({
    name: '',
    description: '',
    start_date: '',  // Changed from startDate to match backend
    end_date: '',    // Changed from endDate to match backend
    status: 'To Do',
    assignee: '',
    priority: 'Medium',
    type: 'epic'     // Added to match backend expectation
  });
  const [timeScale, setTimeScale] = useState('quarters');
  const [startDate, setStartDate] = useState(new Date());
  const [assignees, setAssignees] = useState([]);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  
  // State for issues related to an epic
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [epicIssues, setEpicIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState({});

  // Define time periods for columns based on the current date and timeScale
  const timePeriods = useMemo(() => {
    const periods = [];
    let currentDate = new Date(startDate);
    
    switch(timeScale) {
      case 'months':
        for (let i = 0; i < 6; i++) {
          const date = addMonths(currentDate, i);
          periods.push({ 
            label: format(date, 'MMM yyyy'), 
            id: format(date, 'yyyy-MM'),
            startDate: new Date(date.getFullYear(), date.getMonth(), 1),
            endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
          });
        }
        break;
      case 'quarters':
        for (let i = 0; i < 4; i++) {
          const date = addMonths(currentDate, i * 3);
          const quarterStart = startOfQuarter(date);
          const quarterEnd = endOfQuarter(date);
          periods.push({ 
            label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`, 
            id: `Q${Math.floor(quarterStart.getMonth() / 3) + 1}-${quarterStart.getFullYear()}`,
            startDate: quarterStart,
            endDate: quarterEnd
          });
        }
        break;
      case 'halfyears':
        for (let i = 0; i < 2; i++) {
          const date = addMonths(currentDate, i * 6);
          const halfStart = new Date(date.getFullYear(), Math.floor(date.getMonth() / 6) * 6, 1);
          const halfEnd = new Date(date.getFullYear(), Math.floor(date.getMonth() / 6) * 6 + 6, 0);
          const half = Math.floor(halfStart.getMonth() / 6) + 1;
          periods.push({ 
            label: `H${half} ${halfStart.getFullYear()}`, 
            id: `H${half}-${halfStart.getFullYear()}`,
            startDate: halfStart,
            endDate: halfEnd
          });
        }
        break;
      default:
        for (let i = 0; i < 4; i++) {
          const date = addMonths(currentDate, i * 3);
          const quarterStart = startOfQuarter(date);
          const quarterEnd = endOfQuarter(date);
          periods.push({ 
            label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`, 
            id: `Q${Math.floor(quarterStart.getMonth() / 3) + 1}-${quarterStart.getFullYear()}`,
            startDate: quarterStart,
            endDate: quarterEnd
          });
        }
    }
    
    return periods;
  }, [startDate, timeScale]);

  // Check if an epic falls within a certain time period
  const isEpicInTimePeriod = (epic, period) => {
    if (!epic.start_date || !epic.end_date) return false;
    
    const epicStart = new Date(epic.start_date);
    const epicEnd = new Date(epic.end_date);
    
    // Check if there's any overlap between the epic's timespan and the period
    return (
      (epicStart >= period.startDate && epicStart <= period.endDate) ||
      (epicEnd >= period.startDate && epicEnd <= period.endDate) ||
      (epicStart <= period.startDate && epicEnd >= period.endDate)
    );
  };

  // Calculate the position and width of an epic within a period
  const calculateEpicPosition = (epic, period) => {
    if (!epic.start_date || !epic.end_date) return { left: 0, width: '100%' };
    
    const epicStart = new Date(epic.start_date);
    const epicEnd = new Date(epic.end_date);
    const periodStart = period.startDate;
    const periodEnd = period.endDate;
    
    const totalDays = (periodEnd - periodStart) / (1000 * 60 * 60 * 24);
    
    // Calculate left position
    let left = 0;
    if (epicStart > periodStart) {
      const daysFromStart = (epicStart - periodStart) / (1000 * 60 * 60 * 24);
      left = (daysFromStart / totalDays) * 100;
    }
    
    // Calculate width
    let right = 100;
    if (epicEnd < periodEnd) {
      const daysToEnd = (periodEnd - epicEnd) / (1000 * 60 * 60 * 24);
      right = 100 - (daysToEnd / totalDays) * 100;
    }
    
    const width = right - left;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        // First fetch project details
        const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`);
        
        if (projectResponse.data.status === "success") {
          setProject({
            ...projectResponse.data.data,
            avatar_bg: getAvatarColor(projectResponse.data.data.key)
          });
        } else {
          throw new Error('Failed to fetch project details');
        }
        
        // Then fetch roadmap data - updated to match backend route
        const roadmapResponse = await axios.get(`${API_URL}/project/${projectId}/roadmap`);
        
        if (roadmapResponse.data.status === "success") {
          setRoadmapData(roadmapResponse.data.data || []);
        } else {
          throw new Error('Failed to fetch roadmap data');
        }

        try {
          // Try to fetch project members
          const assigneesResponse = await axios.get(`${API_URL}/projects/${projectId}/members`);
          
          if (assigneesResponse.data.status === "success") {
            setAssignees(assigneesResponse.data.data || []);
          }
        } catch (memberErr) {
          console.error('Error fetching project members:', memberErr);
          setAssignees([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load roadmap data. Please try again later.');
        setLoading(false);
        
        // If in development environment, provide more helpful error messages
        if (process.env.NODE_ENV === 'development') {
          setError(`API Error: ${err.message}. Check that your backend routes are set up correctly.`);
        }
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Function to fetch issues for an epic
  const fetchEpicIssues = async (epicId) => {
    try {
      setIssuesLoading(true);
      setIssuesError(null);
      
      // Fetch issues related to this epic using the correct endpoint from your routes
      const response = await axios.get(`${API_URL}/project/${projectId}/epic/${epicId}/issues`);
      
      if (response.data.status === "success") {
        setEpicIssues(response.data.data || []);
      } else {
        throw new Error('Failed to fetch issues for this epic');
      }
      
      setIssuesLoading(false);
    } catch (err) {
      console.error('Error fetching epic issues:', err);
      setIssuesError('Failed to load issues. Please try again.');
      setIssuesLoading(false);
    }
  };

  // Handle clicking on an epic in the timeline
  const handleEpicClick = async (epic, period) => {
    // Set the selected epic
    setSelectedEpic(epic);
    
    // Fetch issues for this epic
    await fetchEpicIssues(epic.id);
    
    // Open the issue dialog to display details and related issues
    setIssueDialogOpen(true);
  };

  // Navigate to create task page
  const navigateToCreateTask = () => {
    navigate(`/createtask?project=${projectId}`);
  };

  // Handle closing the issue dialog
  const handleIssueDialogClose = () => {
    setIssueDialogOpen(false);
  };

  const handleMenuOpen = (event, itemId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleViewMenuOpen = (event) => {
    setViewAnchorEl(event.currentTarget);
  };

  const handleViewMenuClose = () => {
    setViewAnchorEl(null);
  };

  const handleTimescaleMenuOpen = (event) => {
    setTimescaleAnchorEl(event.currentTarget);
  };

  const handleTimescaleMenuClose = () => {
    setTimescaleAnchorEl(null);
  };

  const handleSettingsMenuOpen = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const toggleFilter = (type, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter(item => item !== value);
      } else {
        newFilters[type] = [...newFilters[type], value];
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      status: [],
      priority: [],
      assignee: [],
      labels: []
    });
    setDateFilter({
      startDate: '',
      endDate: ''
    });
    setFilterAnchorEl(null);
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeScaleChange = (scale) => {
    setTimeScale(scale);
    setTimescaleAnchorEl(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateEpicOpen = () => {
    setCreateEpicDialogOpen(true);
  };

  const handleCreateEpicClose = () => {
    setCreateEpicDialogOpen(false);
    // Reset form
    setEpicFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'To Do',
      assignee: '',
      priority: 'Medium',
      type: 'epic'
    });
  };

  const handleEpicFormChange = (e) => {
    const { name, value } = e.target;
    setEpicFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEpic = async () => {
    try {
      setLoading(true);
      // Validate form data
      if (!epicFormData.name || !epicFormData.start_date || !epicFormData.end_date) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Updated to match backend model fields
      const epicData = {
        ...epicFormData,
        project_id: projectId, // Make sure project_id is included
        type: 'epic',
        assignee_id: epicFormData.assignee || null // Update assignee field name to match backend
      };

      // Post to the correct endpoint matching backend route
      const response = await axios.post(`${API_URL}/project/${projectId}/roadmap`, epicData);

      if (response.data.status === "success") {
        // Add the new epic to the roadmap data
        setRoadmapData(prev => [...prev, response.data.data]);
        
        setSnackbar({
          open: true,
          message: 'Epic created successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to create epic');
      }
    } catch (err) {
      console.error('Error creating epic:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create epic. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCreateEpicClose();
    }
  };

  const handleEditEpic = async (itemId) => {
    try {
      // Find the epic to edit
      const epicToEdit = roadmapData.find(item => item.id === itemId);
      if (!epicToEdit) {
        console.error('Epic not found');
        return;
      }

      // Here you would open a dialog with prefilled data
      // and then make a PUT request to `/api/roadmap-items/${itemId}`
      console.log(`Editing epic: ${itemId}`);
      handleMenuClose();
      
      // This is just a placeholder - implement the full edit dialog as needed
      alert(`Edit functionality would open dialog for epic ID: ${itemId}`);
    } catch (err) {
      console.error('Error preparing to edit epic:', err);
    }
  };

  const handleDeleteEpic = async (itemId) => {
    try {
      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this epic?')) {
        return;
      }

      const response = await axios.delete(`${API_URL}/roadmap-items/${itemId}`);
      
      if (response.data.status === "success") {
        // Remove the epic from the roadmap data
        setRoadmapData(prev => prev.filter(item => item.id !== itemId));
        
        setSnackbar({
          open: true,
          message: 'Epic deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to delete epic');
      }
    } catch (err) {
      console.error('Error deleting epic:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete epic. Please try again.',
        severity: 'error'
      });
    } finally {
      handleMenuClose();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />;
      case 'In Progress':
        return <PlayCircleFilledIcon color="primary" sx={{ fontSize: 16 }} />;
      case 'To Do':
      case 'Planning':
        return <PauseCircleIcon color="disabled" sx={{ fontSize: 16 }} />;
      case 'Blocked':
        return <CancelIcon color="error" sx={{ fontSize: 16 }} />;
      default:
        return <PauseCircleIcon color="disabled" sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return '#00875A'; // Green
      case 'In Progress':
        return '#0052CC'; // Blue
      case 'To Do':
      case 'Planning':
        return '#6B778C'; // Gray
      case 'Blocked':
        return '#DE350B'; // Red
      default:
        return '#6B778C'; // Gray
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return null;
      return format(date, 'yyyy/MM/dd'); // e.g., "2022/06/23"
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
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

  // Filter roadmap data based on search and filters
  const filteredRoadmapData = roadmapData.filter(item => {
    // Search filter
    const matchesSearch = !searchText || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.key?.toLowerCase().includes(searchText.toLowerCase());
    
    // Status filter
    const matchesStatus = activeFilters.status.length === 0 || 
      activeFilters.status.includes(item.status);
    
    // Priority filter
    const matchesPriority = activeFilters.priority.length === 0 || 
      activeFilters.priority.includes(item.priority);
    
    // Assignee filter
    const matchesAssignee = activeFilters.assignee.length === 0 || 
      activeFilters.assignee.includes(item.assignee_id);
    
    // Labels filter
    const matchesLabels = activeFilters.labels.length === 0 || 
      (item.labels && item.labels.some(label => activeFilters.labels.includes(label)));
    
    // Date filter
    let matchesDateRange = true;
    if (dateFilter.startDate && item.start_date) {
      matchesDateRange = new Date(item.start_date) >= new Date(dateFilter.startDate);
    }
    if (dateFilter.endDate && item.end_date && matchesDateRange) {
      matchesDateRange = new Date(item.end_date) <= new Date(dateFilter.endDate);
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesLabels && matchesDateRange;
  });

  // Filter initiatives (top-level items without parents)
  const epics = filteredRoadmapData.filter(item => 
    item.type === 'epic' || item.type === 'initiative'
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading roadmap...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          startIcon={<SearchIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="warning">Project not found</Alert>
      </Box>
    );
  }

  // Calculate grid template columns based on number of time periods
  const gridTemplateColumns = `240px repeat(${timePeriods.length}, 1fr)`;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      bgcolor: '#F4F5F7' 
    }}>
      {/* Main content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1, 
        overflow: 'hidden',
        px: 3,
        py: 2,
      }}>
        {/* Roadmap Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="medium">
              Roadmap
            </Typography>
            
            <Button
              startIcon={<ViewWeekIcon />}
              endIcon={<ExpandMoreIcon />}
              variant="text"
              size="small"
              onClick={handleTimescaleMenuOpen}
              sx={{ 
                ml: 2, 
                textTransform: 'none',
                color: '#42526E'
              }}
            >
              {timeScale === 'months' ? 'Monthly' : timeScale === 'quarters' ? 'Quarterly' : 'Half-yearly'}
            </Button>
            
            <Menu
              anchorEl={timescaleAnchorEl}
              open={Boolean(timescaleAnchorEl)}
              onClose={handleTimescaleMenuClose}
            >
              <MenuItem onClick={() => handleTimeScaleChange('months')}>
                <Typography variant="body2">Monthly</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleTimeScaleChange('quarters')}>
                <Typography variant="body2">Quarterly</Typography>
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Add Epic Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={navigateToCreateTask}
            sx={{ textTransform: 'none' }}
          >
            Add Epic
          </Button>
        </Box>

        {/* Filters Row */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          alignItems: 'center',
        }}>
         {/* Search and Filter Row */}
         <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Search field */}
            <TextField
              size="small"
              placeholder="Search epics..."
              value={searchText}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ color: '#7A869A', mr: 1 }} />,
                sx: { bgcolor: 'white', borderRadius: 1 }
              }}
              sx={{ width: 220 }}
            />
            
           
            
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterMenuClose}
              PaperProps={{
                sx: { width: 300, maxHeight: 500, overflowY: 'auto' }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Status</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {['To Do', 'In Progress', 'Done', 'Blocked'].map(status => (
                    <Chip
                      key={status}
                      label={status}
                      size="small"
                      onClick={() => toggleFilter('status', status)}
                      sx={{ 
                        backgroundColor: activeFilters.status.includes(status) ? '#E9F2FF' : '#F4F5F7',
                        borderColor: activeFilters.status.includes(status) ? '#0052CC' : 'transparent',
                        border: activeFilters.status.includes(status) ? '1px solid' : 'none',
                        color: activeFilters.status.includes(status) ? '#0052CC' : '#42526E',
                        '&:hover': {
                          backgroundColor: activeFilters.status.includes(status) ? '#DEEBFF' : '#EBECF0'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>Priority</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {['High', 'Medium', 'Low'].map(priority => (
                    <Chip
                      key={priority}
                      label={priority}
                      size="small"
                      onClick={() => toggleFilter('priority', priority)}
                      sx={{ 
                        backgroundColor: activeFilters.priority.includes(priority) ? '#E9F2FF' : '#F4F5F7',
                        borderColor: activeFilters.priority.includes(priority) ? '#0052CC' : 'transparent',
                        border: activeFilters.priority.includes(priority) ? '1px solid' : 'none',
                        color: activeFilters.priority.includes(priority) ? '#0052CC' : '#42526E',
                        '&:hover': {
                          backgroundColor: activeFilters.priority.includes(priority) ? '#DEEBFF' : '#EBECF0'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>Date Range</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="date"
                    size="small"
                    name="startDate"
                    label="From"
                    value={dateFilter.startDate}
                    onChange={handleDateFilterChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    name="endDate"
                    label="To"
                    value={dateFilter.endDate}
                    onChange={handleDateFilterChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    size="small" 
                    onClick={clearFilters}
                    sx={{ mr: 1, textTransform: 'none' }}
                  >
                    Clear all
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={handleFilterMenuClose}
                    sx={{ textTransform: 'none' }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Menu>
            
            {/* Assignee filter - more complex implementation */}
            {assignees.length > 0 && (
              <Box sx={{ position: 'relative' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    border: '1px solid #DFE1E6',
                    borderRadius: 1,
                    p: '4px 8px',
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: '#F4F5F7' },
                    cursor: 'pointer'
                  }}
                >
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                    {activeFilters.assignee.length > 0 ? (
                      activeFilters.assignee.map(id => {
                        const user = assignees.find(a => a.id === id) || {};
                        return (
                          <Tooltip key={id} title={user.name || "Unknown"}>
                            <Avatar 
                              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                              alt={user.name || ""}
                              src={user.avatar || ""}
                            >
                              {user.name ? user.name.charAt(0) : "?"}
                            </Avatar>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#DFE1E6', color: '#42526E' }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                  </AvatarGroup>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {activeFilters.assignee.length > 0 
                      ? activeFilters.assignee.length > 1 
                        ? `${activeFilters.assignee.length} assignees` 
                        : "1 assignee"
                      : "Assignee"}
                  </Typography>
                  <ArrowDropDownIcon fontSize="small" sx={{ ml: 0.5, color: '#7A869A' }} />
                </Box>

                {/* We would implement the assignee selection menu here */}
              </Box>
            )}
          </Box>
          
          
        </Box>

        {/* Roadmap Timeline Grid */}
        <Paper sx={{ 
          flexGrow: 1, 
          borderRadius: 1, 
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.15)', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Timeline Headers */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns,
            borderBottom: '1px solid #DFE1E6',
            bgcolor: 'white',
            position: 'sticky', 
            top: 0,
            zIndex: 1
          }}>
            {/* Title column */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRight: '1px solid #DFE1E6'
            }}>
              <Typography variant="subtitle2" fontWeight="medium">
                Epics
              </Typography>
            </Box>
            
            {/* Time period columns */}
            {timePeriods.map((period, index) => (
              <Box 
                key={period.id} 
                sx={{ 
                  p: 2,
                  borderRight: index < timePeriods.length - 1 ? '1px solid #DFE1E6' : 'none',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" fontWeight="medium">
                  {period.label}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* Timeline Content */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            position: 'relative'
          }}>
            {epics.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 4,
                  height: '100%',
                  opacity: 0.7
                }}
              >
                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                  No epics found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                  {searchText || 
                   Object.values(activeFilters).some(arr => arr.length > 0) || 
                   dateFilter.startDate || 
                   dateFilter.endDate 
                    ? "Try adjusting your search or filters"
                    : "Create your first epic to start building your roadmap"}
                </Typography>
                {!(searchText || 
                   Object.values(activeFilters).some(arr => arr.length > 0) || 
                   dateFilter.startDate || 
                   dateFilter.endDate) && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateEpicOpen}
                    sx={{ textTransform: 'none' }}
                  >
                    Create Epic
                  </Button>
                )}
              </Box>
            ) : (
              epics.map((epic, epicIndex) => (
                <Box 
                  key={epic.id} 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns,
                    borderBottom: '1px solid #DFE1E6',
                    minHeight: 56,
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  {/* Epic title column with expand/collapse */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRight: '1px solid #DFE1E6',
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setExpandedEpics(prev => ({
                            ...prev,
                            [epic.id]: !prev[epic.id]
                          }));
                        }}
                        sx={{ mr: 1 }}
                      >
                        {expandedEpics[epic.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flexGrow: 1 }}>
                        {getStatusIcon(epic.status)}
                        <Tooltip title={epic.name}>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium" 
                            sx={{ 
                              ml: 1, 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {epic.name}
                          </Typography>
                        </Tooltip>
                      </Box>
                      
                    </Box>
                  </Box>
                  
                  {/* Time periods - placeholder for the epic bars */}
                  {timePeriods.map((period, index) => (
                    <Box 
                      key={`${epic.id}-${period.id}`} 
                      sx={{ 
                        borderRight: index < timePeriods.length - 1 ? '1px solid #DFE1E6' : 'none',
                        position: 'relative',
                        height: '100%'
                      }}
                    >
                      {isEpicInTimePeriod(epic, period) && (
                        <Box
                          onClick={() => handleEpicClick(epic, period)}
                          sx={{ 
                            position: 'absolute',
                            ...calculateEpicPosition(epic, period),
                            top: '12px',
                            height: '32px',
                            bgcolor: getStatusColor(epic.status),
                            opacity: 0.8,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              opacity: 1,
                              boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          <Tooltip 
                            title={
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                  {epic.name}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {formatDateDisplay(epic.start_date)} - {formatDateDisplay(epic.end_date)}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  Status: {epic.status}
                                </Typography>
                              </Box>
                            }
                          >
                            <Box sx={{ 
                              width: '100%', 
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              px: 1,
                              color: 'white',
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {epic.key}
                            </Box>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  ))}
                  
                  {/* Expanded issues section */}
                  {expandedEpics[epic.id] && (
                    <Box sx={{ 
                      gridColumn: `1 / span ${timePeriods.length + 1}`,
                      bgcolor: '#FAFBFC',
                      px: 2,
                      py: 1,
                      borderTop: '1px solid #DFE1E6'
                    }}>
                      <EpicIssuesList projectId={projectId} epicId={epic.id} />
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* Epic creation dialog */}
      <Dialog 
        open={createEpicDialogOpen} 
        onClose={handleCreateEpicClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Epic</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Epic Name"
            name="name"
            value={epicFormData.name}
            onChange={handleEpicFormChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={epicFormData.description}
            onChange={handleEpicFormChange}
            margin="normal"
            multiline
            rows={3}
          />
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={epicFormData.start_date}
                onChange={handleEpicFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={epicFormData.end_date}
                onChange={handleEpicFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={epicFormData.status}
                  onChange={handleEpicFormChange}
                  label="Status"
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                  <MenuItem value="Blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={epicFormData.priority}
                  onChange={handleEpicFormChange}
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {assignees.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    name="assignee"
                    value={epicFormData.assignee}
                    onChange={handleEpicFormChange}
                    label="Assignee"
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {assignees.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ width: 24, height: 24, mr: 1 }}
                            alt={user.name}
                            src={user.avatar}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          {user.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateEpicClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreateEpic} 
            variant="contained" 
            color="primary"
            disabled={!epicFormData.name || !epicFormData.start_date || !epicFormData.end_date}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Epic details dialog */}
      <Dialog
        open={issueDialogOpen}
        onClose={handleIssueDialogClose}
        fullWidth
        maxWidth="md"
      >
        {selectedEpic && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {selectedEpic.key}: {selectedEpic.name}
                </Typography>
                <IconButton onClick={handleIssueDialogClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Epic details column */}
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedEpic.description || "No description provided."}
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 3 }}>
                    Linked Issues
                  </Typography>
                  <EpicIssuesList projectId={projectId} epicId={selectedEpic.id} />
                </Grid>
                
                {/* Epic sidebar */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip 
                        label={selectedEpic.status} 
                        size="small"
                        sx={{ 
                          bgcolor: 
                            selectedEpic.status === 'Done' ? '#E3FCEF' : 
                            selectedEpic.status === 'In Progress' ? '#DEEBFF' : 
                            selectedEpic.status === 'Blocked' ? '#FFEBE6' : '#F4F5F7',
                          color: 
                            selectedEpic.status === 'Done' ? '#006644' : 
                            selectedEpic.status === 'In Progress' ? '#0052CC' : 
                            selectedEpic.status === 'Blocked' ? '#DE350B' : '#42526E',
                        }}
                      />
                      
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                        Timeline
                      </Typography>
                      <Typography variant="body2">
                        {formatDateDisplay(selectedEpic.start_date)} - {formatDateDisplay(selectedEpic.end_date)}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                        Priority
                      </Typography>
                      <Chip 
                        label={selectedEpic.priority} 
                        size="small"
                        sx={{ 
                          bgcolor: 
                            selectedEpic.priority === 'High' ? '#FFEBE6' : 
                            selectedEpic.priority === 'Medium' ? '#DEEBFF' : '#F4F5F7',
                          color: 
                            selectedEpic.priority === 'High' ? '#DE350B' : 
                            selectedEpic.priority === 'Medium' ? '#0052CC' : '#42526E',
                        }}
                      />
                      
                      {selectedEpic.assignee_id && (
                        <>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                            Assignee
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ width: 24, height: 24, mr: 1 }}
                              alt="Assignee"
                            >
                              {(assignees.find(a => a.id === selectedEpic.assignee_id)?.name || "?").charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {assignees.find(a => a.id === selectedEpic.assignee_id)?.name || "Unknown"}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                 
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default RoadmapPage;