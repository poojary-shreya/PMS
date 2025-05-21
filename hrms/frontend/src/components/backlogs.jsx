import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search as SearchIcon,
  Flag as FlagIcon, 
  Bookmark as BookmarkIcon, 
  Assignment as AssignmentIcon,
  BugReport as BugReportIcon,
  Task as TaskIcon,
  Add as AddIcon,
  KeyboardArrowDown,
  FilterList,
  Clear as ClearIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  InputAdornment, 
  Paper, 
  Divider, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Collapse,
} from '@mui/material';
import axios from 'axios';
import CreateSprint from './createsprints.jsx';
const Backlogpage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get projectId from URL params
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  // Issue types
  const issueTypes = [
    { id: 1, name: 'Epic', icon: <BookmarkIcon fontSize="small" sx={{ color: '#0052CC' }} /> },
    { id: 2, name: 'Story', icon: <AssignmentIcon fontSize="small" sx={{ color: '#36B37E' }} /> },
    { id: 3, name: 'Task', icon: <TaskIcon fontSize="small" sx={{ color: '#0052CC' }} /> },
    { id: 4, name: 'Bug', icon: <BugReportIcon fontSize="small" sx={{ color: '#FF5630' }} /> }
  ];

  // Priorities
  const priorities = [
    { id: 1, name: 'Highest', icon: <FlagIcon fontSize="small" sx={{ color: '#FF5630' }} /> },
    { id: 2, name: 'High', icon: <FlagIcon fontSize="small" sx={{ color: '#FF8B00' }} /> },
    { id: 3, name: 'Medium', icon: <FlagIcon fontSize="small" sx={{ color: '#FFAB00' }} /> },
    { id: 4, name: 'Low', icon: <FlagIcon fontSize="small" sx={{ color: '#36B37E' }} /> },
    { id: 5, name: 'Lowest', icon: <FlagIcon fontSize="small" sx={{ color: '#57D9A3' }} /> }
  ];

  // Statuses
  const statuses = [
    { id: 1, name: 'To Do', color: '#EBEDF0', textColor: '#172B4D' },
    { id: 2, name: 'In Progress', color: '#0052CC', textColor: '#FFFFFF' },
    { id: 3, name: 'Review', color: '#FFAB00', textColor: '#FFFFFF' },
    { id: 4, name: 'Done', color: '#36B37E', textColor: '#FFFFFF' }
  ];

  const [issues, setIssues] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const [draggingIssue, setDraggingIssue] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [backlogExpanded, setBacklogExpanded] = useState(true);
  const open = Boolean(anchorEl);
  
  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
        if (response.data && response.data.status === "success") {
          setProjectDetails(response.data.data);
          
          // Store project data in localStorage for future reference
          try {
            const projectData = JSON.parse(localStorage.getItem("projectData") || "{}");
            projectData[projectId] = {
              id: projectId,
              name: response.data.data.name,
              // Add other relevant project details as needed
            };
            localStorage.setItem("projectData", JSON.stringify(projectData));
          } catch (err) {
            console.error("Error updating project data in localStorage:", err);
          }
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError("Failed to load project details");
      }
    };
    
    fetchProjectDetails();
  }, [projectId]);

  // Fetch issues from API for the selected project
  useEffect(() => {
    const fetchIssues = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        // Use project as the query parameter name since that's what the backend expects
        const response = await axios.get(`http://localhost:5000/api/issues?project=${projectId}`);
        if (response.data && response.data.data) {
          setIssues(response.data.data);
          setFilteredIssues(response.data.data); // Initialize filtered issues with all project issues
        } else {
          setIssues([]);
          setFilteredIssues([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError(err.message || 'Failed to fetch issues');
        setLoading(false);
      }
    };

    fetchIssues();
  }, [projectId]);

  // Fetch sprints for the project
  useEffect(() => {
    const fetchSprints = async () => {
      if (!projectDetails?.key) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/sprints/project/${projectDetails.key}`);
        if (response.data && response.data.data) {
          // Add expanded property to each sprint
          const sprintsWithExpanded = response.data.data.map(sprint => ({
            ...sprint,
            expanded: true,
            issues: [] // Initialize with empty issues array
          }));
          setSprints(sprintsWithExpanded);
          
          // For each sprint, fetch its issues
          sprintsWithExpanded.forEach(async (sprint) => {
            try {
              const issuesResponse = await axios.get(`http://localhost:5000/api/sprints/${sprint.id}/issues`);
              if (issuesResponse.data && issuesResponse.data.data) {
                setSprints(prevSprints => 
                  prevSprints.map(s => 
                    s.id === sprint.id ? { ...s, issues: issuesResponse.data.data } : s
                  )
                );
              }
            } catch (err) {
              console.error(`Error fetching issues for sprint ${sprint.id}:`, err);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching sprints:', err);
      }
    };
    
    fetchSprints();
  }, [projectDetails]);
  
  // Helper components
  const IssueTypeIcon = ({ type }) => {
    const issueType = issueTypes.find(t => t.id === type);
    return issueType ? issueType.icon : <AssignmentIcon fontSize="small" />;
  };

  const PriorityIcon = ({ priority }) => {
    const pri = priorities.find(p => p.id === priority);
    return pri ? pri.icon : <FlagIcon fontSize="small" />;
  };

  // Status Badge component
  const StatusBadge = ({ status }) => {
    const statusObj = statuses.find(s => s.id === status);
    return statusObj ? (
      <Chip
        size="small"
        label={statusObj.name}
        sx={{
          backgroundColor: statusObj.color,
          color: statusObj.textColor,
          fontWeight: 500,
          fontSize: '0.75rem'
        }}
      />
    ) : null;
  };

  // Handle opening the sprint creation dialog
  const handleOpenSprintDialog = () => {
    setSprintDialogOpen(true);
  };

  // Handle closing the sprint creation dialog
  const handleCloseSprintDialog = () => {
    setSprintDialogOpen(false);
  };

  // Handle sprint creation
  const handleSprintCreated = (newSprint) => {
    // Add the new sprint to the sprints array
    const sprintWithIssues = {
      ...newSprint,
      issues: [],
      expanded: true,
      id: newSprint.id || (sprints.length > 0 ? Math.max(...sprints.map(s => s.id)) + 1 : 1)
    };
    
    setSprints([...sprints, sprintWithIssues]);
    
    setToast({
      open: true,
      message: `${newSprint.name} created`,
      type: 'success'
    });
  };
  
  // Filter issues based on search query and active filter
  useEffect(() => {
    if (!issues.length) return;
    
    let filtered = [...issues]; // Start with all issues for this project
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(issue => 
        issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.assignee && issue.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (activeFilter === 'myIssues') {
      // Assuming current user is stored somewhere or passed as props
      // For now we'll use a mock username
      const currentUser = 'John Doe';
      filtered = filtered.filter(issue => issue.assignee === currentUser);
    } else if (activeFilter === 'highPriority') {
      filtered = filtered.filter(issue => issue.priority <= 2);
    }
    
    setFilteredIssues(filtered);
  }, [searchQuery, issues, activeFilter]);

  // Navigate to create issue page with the project context
  const goToCreateIssuePage = () => {
    navigate(`/createtask?project=${projectId}`);
  };

  // Update issue status
  const updateIssueStatus = async (issueId, newStatusId) => {
    try {
      const issue = issues.find(issue => issue.id === issueId);
      if (!issue) return;
      
      const response = await axios.put(`http://localhost:5000/api/issues/${issueId}`, { status: newStatusId });
      
      if (response.data && response.data.data) {
        // Update the issue in state
        const updatedIssues = issues.map(issue => 
          issue.id === issueId ? response.data.data : issue
        );
        setIssues(updatedIssues);
        
        // Also update filtered issues
        const updatedFilteredIssues = filteredIssues.map(issue => 
          issue.id === issueId ? response.data.data : issue
        );
        setFilteredIssues(updatedFilteredIssues);
        
        setToast({
          open: true,
          message: `Issue moved to ${statuses.find(s => s.id === newStatusId).name}`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error updating issue status:', err);
      setToast({
        open: true,
        message: 'Failed to update issue status',
        type: 'error'
      });
    }
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    handleFilterClose();
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  // Handle drag and drop functionality
  const handleDragStart = (issueId) => {
    setDraggingIssue(issueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnBacklog = (e) => {
    e.preventDefault();
    // Logic to move issue to backlog
    if (draggingIssue) {
      // Find issue in any sprint
      let issueFound = false;
      let sprintId = null;
      
      // Find which sprint the issue is in
      sprints.forEach(sprint => {
        const issueIndex = sprint.issues.findIndex(issue => issue.id === draggingIssue);
        if (issueIndex !== -1) {
          issueFound = true;
          sprintId = sprint.id;
        }
      });
      
      if (issueFound && sprintId) {
        // Remove issue from sprint
        removeIssueFromSprint(draggingIssue, sprintId);
      }
      
      setToast({
        open: true,
        message: 'Issue moved to Backlog',
        type: 'success'
      });
      setDraggingIssue(null);
    }
  };

  // Remove issue from sprint (API call)
  const removeIssueFromSprint = async (issueId, sprintId) => {
    try {
      const issue = issues.find(issue => issue.id === issueId);
      if (!issue) return;
      
      // Call API to remove issue from sprint
      await axios.delete(`http://localhost:5000/api/sprints/remove-issue/${issue.key}`);
      
      // Update local state
      setSprints(prevSprints => 
        prevSprints.map(sprint => {
          if (sprint.id === sprintId) {
            return {
              ...sprint,
              issues: sprint.issues.filter(issue => issue.id !== issueId)
            };
          }
          return sprint;
        })
      );
    } catch (err) {
      console.error('Error removing issue from sprint:', err);
      setToast({
        open: true,
        message: 'Failed to remove issue from sprint',
        type: 'error'
      });
    }
  };

  // Handle drop on sprint 
  const handleDropOnSprint = async (e, sprintId) => {
    e.preventDefault();
    if (draggingIssue) {
      // Find the issue being dragged
      const draggedIssue = issues.find(issue => issue.id === draggingIssue);
      if (!draggedIssue) return;

      try {
        // Call API to add issue to sprint
        await axios.post('http://localhost:5000/api/sprints/add-issue', {
          issueKey: draggedIssue.key,
          sprintId: sprintId
        });
        
        // If issue was in another sprint, remove it first
        sprints.forEach(sprint => {
          if (sprint.id !== sprintId) {
            const issueInOtherSprint = sprint.issues.find(issue => issue.id === draggingIssue);
            if (issueInOtherSprint) {
              removeIssueFromSprint(draggingIssue, sprint.id);
            }
          }
        });
        
        // Add issue to sprint in local state
        setSprints(prevSprints => 
          prevSprints.map(sprint => {
            if (sprint.id === sprintId) {
              const alreadyInSprint = sprint.issues.some(issue => issue.id === draggingIssue);
              if (!alreadyInSprint) {
                return {
                  ...sprint,
                  issues: [...sprint.issues, draggedIssue]
                };
              }
            }
            return sprint;
          })
        );
        
        setToast({
          open: true,
          message: `Issue moved to ${sprints.find(s => s.id === sprintId)?.name || 'Sprint'}`,
          type: 'success'
        });
      } catch (err) {
        console.error('Error adding issue to sprint:', err);
        setToast({
          open: true,
          message: 'Failed to add issue to sprint',
          type: 'error'
        });
      }
      
      setDraggingIssue(null);
    }
  };

  // Create new sprint
  const createSprint = () => {
    handleOpenSprintDialog();
  };

  // Start sprint
  const startSprint = async (sprintId) => {
    try {
      // Call API to change sprint status
      await axios.patch(`http://localhost:5000/api/sprints/${sprintId}/status`, {
        status: 'ACTIVE'
      });
      
      // Update local state
      const updatedSprints = sprints.map(sprint => {
        if (sprint.id === sprintId) {
          return {
            ...sprint,
            status: 'ACTIVE'
          };
        }
        return sprint;
      });
      
      setSprints(updatedSprints);
      
      setToast({
        open: true,
        message: `${sprints.find(s => s.id === sprintId)?.name || 'Sprint'} started`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error starting sprint:', err);
      setToast({
        open: true,
        message: 'Failed to start sprint',
        type: 'error'
      });
    }
  };

  // Toggle sprint expanded state
  const toggleSprintExpanded = (sprintId) => {
    setSprints(sprints.map(sprint => 
      sprint.id === sprintId ? { ...sprint, expanded: !sprint.expanded } : sprint
    ));
  };

  // Toggle backlog expanded state
  const toggleBacklogExpanded = () => {
    setBacklogExpanded(!backlogExpanded);
  };

  // Get the name initials for avatars
  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return 'UA';
    return name.split(' ').map(n => n[0]).join('');
  };

  if (loading && issues.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && issues.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading issues: {error}. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
  
  <CreateSprint 
        projectKey={projectDetails?.key}
        onSprintCreated={handleSprintCreated}
        openDialog={sprintDialogOpen}
        onClose={handleCloseSprintDialog}
      />
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toast.type} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {projectDetails?.name || "Project"} Backlog
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search issues"
            size="small"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchQuery('')}
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ width: '300px' }}
          />
          
       
         
          
          <Box sx={{ ml: 'auto' }}>
            <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={goToCreateIssuePage}
            >
              Create Issue
            </Button>
            </Box>
            <Box sx={{mt:"15px"}}>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={createSprint}
              >
                Create Sprint
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
         
          
          {/* Sprints section */}
          {sprints.map((sprint) => (
            <Paper 
              key={sprint.id}
              variant="outlined" 
              sx={{ overflow: 'hidden', mb: 2 }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnSprint(e, sprint.id)}
            >
              <Box 
                sx={{ 
                  borderBottom: sprint.expanded ? 1 : 0, 
                  borderColor: 'divider', 
                  bgcolor: '#f9f9f9', 
                  px: 2, 
                  py: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
                onClick={() => toggleSprintExpanded(sprint.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      size="small" 
                      sx={{ p: 0.5, mr: 1 }}
                    >
                      <ExpandMoreIcon 
                        fontSize="small" 
                        sx={{ 
                          transform: sprint.expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="500" color="text.primary">
                      {sprint.name}
                    </Typography>
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <CalendarIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      ({sprint.issues.length} issues)
                    </Typography>
                    {sprint.status === 'FUTURE' && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startSprint(sprint.id);
                        }}
                      >
                        Start sprint
                      </Button>
                    )}
                    {sprint.status === 'ACTIVE' && (
                      <Chip
                        size="small"
                        label="Active"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {sprint.status === 'COMPLETED' && (
                      <Chip
                        size="small"
                        label="Completed"
                        color="success"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              
              <Collapse in={sprint.expanded}>
                {sprint.issues.length === 0 ? (
                  <Box sx={{ 
                    py: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center',
                    px: 2
                  }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Plan your sprint
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mb: 2 }}>
                      Drag issues from the Backlog section to plan the work for this sprint. Select Start sprint when you're ready.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Grid container sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', px: 2, py: 1 }}>
                      <Grid item xs={6} sm={3} md={4}>SUMMARY</Grid>
                      <Grid item xs={6} sm={3} md={2} sx={{ textAlign: 'center' }}>KEY</Grid>
                      <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>ASSIGNEE</Grid>
                      <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>STATUS</Grid>
                      <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>PRIORITY</Grid>
                    </Grid>
                    
                    {sprint.issues.map((issue) => (
                      <Box 
                        key={issue.id}
                        onClick={() => navigate(`/project/${projectId}/backlog/issue/${issue.id}`)}
                      >
                        <Grid 
                          container 
                          alignItems="center"
                          sx={{ 
                            py: 1.5, 
                            px: 2, 
                            borderBottom: '1px solid #f0f0f0',
                            '&:hover': { bgcolor: '#f9f9f9' },
                            cursor: 'pointer' 
                          }}
                        >
                          <Grid item xs={6} sm={3} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DragIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />
                              <IssueTypeIcon type={issue.issueType} />
                            </Box>
                            <Typography variant="body2" fontWeight="500" color="text.primary">
                              {issue.summary}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3} md={2} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                              {issue.key}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar 
                              sx={{ 
                                height: 24, 
                                width: 24, 
                                bgcolor: 'primary.main',
                                fontSize: '0.75rem' 
                              }}
                            >
                              {getInitials(issue.assignee)}
                            </Avatar>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 1, 
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '80px',
                                display: 'inline-block'
                              }}
                            >
                              {issue.assignee || 'Unassigned'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = (issue.status % 4) + 1;
                            updateIssueStatus(issue.id, nextStatus);
                          }}>
                            <StatusBadge status={issue.status} />
                          </Grid>
                          <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <PriorityIcon priority={issue.priority} />
                            <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ ml: 1 }}>
                              {priorities.find(p => p.id === issue.priority)?.name || 'Medium'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                )}
              </Collapse>
            </Paper>
          ))}

          {/* Backlog section */}
<Paper 
  variant="outlined" 
  sx={{ overflow: 'hidden', mb: 2 }}
  onDragOver={handleDragOver}
  onDrop={handleDropOnBacklog}
>
  <Box 
    sx={{ 
      borderBottom: backlogExpanded ? 1 : 0, 
      borderColor: 'divider', 
      bgcolor: '#f9f9f9', 
      px: 2, 
      py: 1.5,
      cursor: 'pointer',
      '&:hover': { bgcolor: '#f0f0f0' }
    }}
    onClick={toggleBacklogExpanded}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          size="small" 
          sx={{ p: 0.5, mr: 1 }}
        >
          <ExpandMoreIcon 
            fontSize="small" 
            sx={{ 
              transform: backlogExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </IconButton>
        <Typography variant="subtitle1" fontWeight="500" color="text.primary">
          Backlog
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          ({filteredIssues.length} issues)
        </Typography>
      </Box>
    </Box>
  </Box>
  
  <Collapse in={backlogExpanded}>
    {filteredIssues.length === 0 ? (
      <Box sx={{ 
        py: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center',
        px: 2
      }}>
        <Typography variant="subtitle1" gutterBottom>
          No issues found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mb: 2 }}>
          {searchQuery ? 'No issues match your search criteria.' : 'Create your first issue to get started.'}
        </Typography>
        {!searchQuery && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={goToCreateIssuePage}
          >
            Create Issue
          </Button>
        )}
      </Box>
    ) : (
      <Box sx={{ p: 2 }}>
        <Grid container sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', px: 2, py: 1 }}>
          <Grid item xs={6} sm={3} md={4}>SUMMARY</Grid>
          <Grid item xs={6} sm={3} md={2} sx={{ textAlign: 'center' }}>KEY</Grid>
          <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>ASSIGNEE</Grid>
          <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>STATUS</Grid>
          <Grid item xs={4} sm={2} md={2} sx={{ textAlign: 'center' }}>PRIORITY</Grid>
        </Grid>
        
        {filteredIssues.map((issue) => (
          <Box 
            key={issue.id}
            draggable
            onDragStart={() => handleDragStart(issue.id)}
            onClick={() => navigate(`/project/${projectId}/backlog/issue/${issue.id}`)}
          >
            <Grid 
              container 
              alignItems="center"
              sx={{ 
                py: 1.5, 
                px: 2, 
                borderBottom: '1px solid #f0f0f0',
                '&:hover': { bgcolor: '#f9f9f9' },
                cursor: 'pointer' 
              }}
            >
              <Grid item xs={6} sm={3} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DragIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />
                  <IssueTypeIcon type={issue.issueType} />
                </Box>
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {issue.summary}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3} md={2} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="500">
                  {issue.key}
                </Typography>
              </Grid>
              <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar 
                  sx={{ 
                    height: 24, 
                    width: 24, 
                    bgcolor: 'primary.main',
                    fontSize: '0.75rem' 
                  }}
                >
                  {getInitials(issue.assignee)}
                </Avatar>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 1, 
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '80px',
                    display: 'inline-block'
                  }}
                >
                  {issue.assignee || 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => {
                e.stopPropagation();
                const nextStatus = (issue.status % 4) + 1;
                updateIssueStatus(issue.id, nextStatus);
              }}>
                <StatusBadge status={issue.status} />
              </Grid>
              <Grid item xs={4} sm={2} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <PriorityIcon priority={issue.priority} />
                <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ ml: 1 }}>
                  {priorities.find(p => p.id === issue.priority)?.name || 'Medium'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    )}
  </Collapse>
</Paper>
        </Grid>
        
        {/* Right sidebar */}
        <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Backlog Summary</Typography>
            
            <Box sx={{ fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total issues:</Typography>
                <Chip 
                  label={filteredIssues.length} 
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: '22px',
                    backgroundColor: 'grey.100',
                    fontWeight: 500
                  }} 
                />
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ '& > div': { mb: 0.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">To Do:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => i.status === 1).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">In Progress:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => i.status === 2).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Review:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => i.status === 3).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Done:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => i.status === 4).length}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ '& > div': { mb: 0.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">High Priority:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => i.priority <= 2).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Unassigned:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {filteredIssues.filter(i => !i.assignee).length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Project summary */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Project Info</Typography>
            
            {projectDetails ? (
              <Box sx={{ fontSize: '0.875rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Project Name:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {projectDetails.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Project Key:</Typography>
                  <Typography variant="caption" fontWeight="500">
                    {projectDetails.key}
                  </Typography>
                </Box>
                
                {projectDetails.startDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Start Date:</Typography>
                    <Typography variant="caption" fontWeight="500">
                      {new Date(projectDetails.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                {projectDetails.endDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">End Date:</Typography>
                    <Typography variant="caption" fontWeight="500">
                      {new Date(projectDetails.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Paper>
          </Grid>
      </Grid>
    </Box>
  );
};

export default Backlogpage;