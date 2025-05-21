import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cached as CachedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { 
  Bug as BugIcon,
  CheckSquare as TaskIcon,
  BookOpen as StoryIcon,
  Award as EpicIcon,
  ArrowUp as PriorityHighestIcon,
  ChevronUp as PriorityHighIcon,
  Minus as PriorityMediumIcon,
  ChevronDown as PriorityLowIcon,
  ArrowDown as PriorityLowestIcon,
  AlertTriangle as AlertTriangleIcon,
  User as PersonIcon
} from 'lucide-react';
import axios from 'axios';

// API Base URL - Update this to match your server configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Predefined data for frontend
const issueTypes = [
  { id: 1, name: 'Bug', icon: <BugIcon className="text-red-500" /> },
  { id: 2, name: 'Task', icon: <TaskIcon className="text-blue-500" /> },
  { id: 3, name: 'Story', icon: <StoryIcon className="text-green-500" /> },
  { id: 4, name: 'Epic', icon: <EpicIcon className="text-purple-500" /> },
];

const priorities = [
  { id: 1, name: 'Highest', icon: <PriorityHighestIcon className="text-red-700" /> },
  { id: 2, name: 'High', icon: <PriorityHighIcon className="text-red-500" /> },
  { id: 3, name: 'Medium', icon: <PriorityMediumIcon className="text-orange-500" /> },
  { id: 4, name: 'Low', icon: <PriorityLowIcon className="text-green-700" /> },
  { id: 5, name: 'Lowest', icon: <PriorityLowestIcon className="text-green-500" /> },
];

const severities = [
  { id: 1, name: 'Blocker' },
  { id: 2, name: 'Critical' },
  { id: 3, name: 'Major' },
  { id: 4, name: 'Minor' },
  { id: 5, name: 'Trivial' },
];

const statuses = [
  { id: 1, name: 'Not Started', color: '#F4F5F7' },
  { id: 2, name: 'In Progress', color: '#0065FF' },
  { id: 3, name: 'In Review', color: '#FFAB00' },
  { id: 4, name: 'Done', color: '#36B37E' }
];

const MyIssues = ({ currentUser }) => {
  // State variables
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateComment, setStatusUpdateComment] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
 const [currentuser, setCurrentUser] = useState(null);

  // Fetch current user and issues when component mounts
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    if (currentuser) {
      fetchMyIssues();
    }
  }, [currentuser]);

  // Fetch current user information
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/current`, {
        withCredentials: true
      });
      
      if (response.data && response.data.employee_id) {
        setCurrentUser({
          id: response.data.employee_id,
          name: response.data.firstName ? `${response.data.firstName} ${response.data.lastName || ''}` : 'User'
        });
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to load user information. Please refresh and try again.");
      setSnackbar({
        open: true,
        message: 'Error loading user information: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Create API client
  const apiClient = {
    async getMyIssues(employeeId) {
      try {
        // Use the employee ID to fetch issues assigned to the current user
        const response = await axios.get(`${API_BASE_URL}/issues/assignee/${employeeId}`);
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching my issues:', error);
        throw error;
      }
    },
    
    async updateIssueStatus(issueId, statusData) {
      try {
        const response = await axios.patch(`${API_BASE_URL}/issues/${issueId}/status`, 
          statusData, 
          { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        console.error('Error updating issue status:', error);
        throw error;
      }
    },
    
    async getIssueDetails(issueId) {
      try {
        // Make sure to pass the issueId as a number, not a string
        const response = await axios.get(`${API_BASE_URL}/issues/${issueId}`, {
          withCredentials: true
        });
        return response.data.data || null;
      } catch (error) {
        console.error('Error fetching issue details:', error);
        throw error;
      }
    }
  };

  // Fetch issues assigned to the current user
  const fetchMyIssues = async () => {
    if (!currentuser || !currentuser.id) {
      console.error('Cannot fetch issues: current user ID is not available');
      return;
    }
    
    try {
      setLoading(true);
      const fetchedIssues = await apiClient.getMyIssues(currentuser.id);
      setIssues(fetchedIssues);
      setError(null);
    } catch (err) {
      console.error('Error fetching my issues:', err);
      setError('Failed to load your assigned issues. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error loading issues: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle table pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter issues based on search query (client-side filtering)
  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    
    return issues.filter(issue => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const matchesSummary = issue.summary?.toLowerCase().includes(query);
      const matchesKey = issue.key?.toLowerCase().includes(query);
      const matchesProductOwner = issue.productOwner?.toLowerCase().includes(query);
      
      return matchesSummary || matchesKey || matchesProductOwner;
    });
  }, [issues, searchQuery]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      notStarted: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      total: filteredIssues.length
    };
    
    filteredIssues.forEach(issue => {
      if (issue.status === 1) {
        counts.notStarted++;
      } else if (issue.status === 2) {
        counts.inProgress++;
      } else if (issue.status === 3) {
        counts.inReview++;
      } else if (issue.status === 4) {
        counts.done++;
      }
    });
    
    return counts;
  }, [filteredIssues]);

  // Helper functions
  const getIssueType = (typeId) => issueTypes.find(t => t.id === parseInt(typeId)) || { name: 'Unknown', icon: null };
  const getPriority = (priorityId) => priorities.find(p => p.id === parseInt(priorityId)) || { name: 'Medium', icon: null };
  const getSeverity = (severityId) => severities.find(s => s.id === parseInt(severityId)) || { name: 'Major' };
  const getStatus = (statusId) => statuses.find(s => s.id === parseInt(statusId)) || 
    { id: parseInt(statusId) || 1, name: 'Unknown', color: '#DFE1E6' };

  // Handle view issue details
  const handleViewIssue = async (issueId) => {
    try {
      setLoading(true);
      // Fetch full issue details
      const issueDetails = await apiClient.getIssueDetails(issueId);
      
      if (issueDetails) {
        setCurrentIssue(issueDetails);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error getting issue details:', error);
      setSnackbar({
        open: true,
        message: 'Error loading issue details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open status update dialog
  const handleStatusUpdateDialogOpen = (issue) => {
    setCurrentIssue(issue);
    setNewStatus(issue.status);
    setStatusUpdateComment('');
    setStatusDialogOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!currentIssue || !newStatus) return;
    
    try {
      setStatusUpdateLoading(true);
      
      // Send status update request
      await apiClient.updateIssueStatus(currentIssue.id, {
        status: parseInt(newStatus),
        comment: statusUpdateComment,
        updatedBy: currentUser?.id || 'system'
      });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === currentIssue.id 
            ? { ...issue, status: parseInt(newStatus) } 
            : issue
        )
      );
      
      // Close dialog and show success message
      setStatusDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString || '-';
    }
  };

  // Render timestamps with relative formatting
  const renderTimeAgo = (timestamp) => {
    if (!timestamp) return '-';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // difference in seconds
      
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
      
      return formatDate(timestamp);
    } catch (e) {
      return timestamp;
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchMyIssues();
  };

  return (
    <>
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* View Issue Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {currentIssue && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getIssueType(currentIssue.issueType).icon}
                  <Typography variant="h6">
                    {currentIssue.key} - {currentIssue.summary}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setViewDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                    {currentIssue.description || 'No description provided.'}
                  </Typography>
                
                  {/* Status History Section */}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                    Status History
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    {currentIssue.statusHistory && currentIssue.statusHistory.length > 0 ? (
                      currentIssue.statusHistory.map((update, index) => (
                        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < currentIssue.statusHistory.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="medium">
                              Changed from {getStatus(update.fromStatus).name} to {getStatus(update.toStatus).name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {renderTimeAgo(update.timestamp)}
                            </Typography>
                          </Box>
                          {update.comment && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Comment: {update.comment}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Updated by: {update.updatedBy || 'Unknown'}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No status updates recorded.
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={getStatus(currentIssue.status).name} 
                        size="small"
                        sx={{ 
                          backgroundColor: getStatus(currentIssue.status).color,
                          color: currentIssue.status === 1 ? '#172B4D' : '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          mt: 0.5
                        }} 
                      />
                    </Box>
                    
                    {/* Priority */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {getPriority(currentIssue.priority).icon}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {getPriority(currentIssue.priority).name}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Severity */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Severity</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {getSeverity(currentIssue.severity).name}
                      </Typography>
                    </Box>
                    
                    {/* Product Owner */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Product Owner</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {currentIssue.productOwner || 'Not specified'}
                      </Typography>
                    </Box>
                    
                    {/* Labels */}
                    {currentIssue.labels && currentIssue.labels.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Labels</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {currentIssue.labels.map((label, index) => (
                            <Chip 
                              key={index}
                              label={label} 
                              size="small" 
                              sx={{ backgroundColor: '#DFE1E6', fontSize: '0.75rem' }} 
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Dates */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formatDate(currentIssue.created)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {formatDate(currentIssue.dueDate)}
                      </Typography>
                    </Box>
                    
                    {/* Time Estimate */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Time Estimate</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {currentIssue.timeEstimate || 'Not estimated'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  setViewDialogOpen(false);
                  handleStatusUpdateDialogOpen(currentIssue);
                }}
                color="primary"
              >
                Update Status
              </Button>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Issue Status</DialogTitle>
        <DialogContent>
          {currentIssue && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                {currentIssue.key}: {currentIssue.summary}
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            backgroundColor: status.color,
                            mr: 1
                          }} 
                        />
                        {status.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                label="Comment (optional)"
                value={statusUpdateComment}
                onChange={(e) => setStatusUpdateComment(e.target.value)}
                placeholder="Add a comment about this status change"
                multiline
                rows={3}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={statusUpdateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            color="primary" 
            disabled={statusUpdateLoading || newStatus === currentIssue?.status}
            startIcon={statusUpdateLoading ? <CircularProgress size={20} /> : null}
          >
            {statusUpdateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom align="center">
                My Change Requirements
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>

          {/* Status cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">Not Started</Typography>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#F4F5F7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#172B4D' }} />
                      </Box>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {statusCounts.notStarted}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">In Progress</Typography>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#0065FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CachedIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                      </Box>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {statusCounts.inProgress}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">In Review</Typography>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#FFAB00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertTriangleIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                      </Box>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {statusCounts.inReview}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">Done</Typography>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: '#36B37E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                      </Box>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {statusCounts.done}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Search and filter */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search by key, summary or product owner"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                />
                <IconButton sx={{ ml: 1 }}>
                  <FilterListIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          {/* Issues table */}
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : filteredIssues.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? 'No issues match your search query.' : 'No issues assigned to you.'}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Key</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Summary</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredIssues
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((issue) => (
                            <TableRow 
                              hover 
                              key={issue.id}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell>{issue.key}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getIssueType(issue.issueType).icon}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 300 }}>
                                <Typography noWrap variant="body2">
                                  {issue.summary}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getPriority(issue.priority).icon}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={getStatus(issue.status).name} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getStatus(issue.status).color,
                                    color: issue.status === 1 ? '#172B4D' : '#fff',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }} 
                                />
                              </TableCell>
                              <TableCell>{formatDate(issue.dueDate)}</TableCell>
                              <TableCell>{renderTimeAgo(issue.created)}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewIssue(issue.id)}
                                    title="View Details"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleStatusUpdateDialogOpen(issue)}
                                    title="Update Status"
                                  >
                                    <CachedIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredIssues.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default MyIssues;