import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Avatar, 
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
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cached as CachedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
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

// API Base URL - Update this to match your server configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Predefined data for frontend (same as in CreateIssuePage)
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

const AllIssues = ({ 
  users = [], 
  projects = [], 
  currentUser 
}) => {
  const navigate = useNavigate();
  
  // State variables
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
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

  // Fetch all issues when component mounts or filters change
  useEffect(() => {
    fetchIssues();
  }, [filters]);

  // Create API client
  const apiClient = {
    async getIssues(queryParams) {
      try {
        const response = await fetch(`${API_BASE_URL}/issues?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch issues');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching issues:', error);
        throw error;
      }
    },
    
    async updateIssueStatus(issueId, statusData) {
      try {
        const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(statusData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update status');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating issue status:', error);
        throw error;
      }
    },
    
    async getIssueDetails(issueId) {
      try {
        const response = await fetch(`${API_BASE_URL}/issues/${issueId}`);
        console.log(response.data);
        if (!response.ok) throw new Error('Failed to fetch issue details');
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error('Error fetching issue details:', error);
        throw error;
      }
    }
  };

  // Fetch issues from the backend
  const fetchIssues = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters.project) queryParams.append('project', filters.project);
      if (filters.assignee) queryParams.append('assignee', filters.assignee);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.issueType) queryParams.append('issueType', filters.issueType);
      
      // Make API request
      const fetchedIssues = await apiClient.getIssues(queryParams.toString());
      setIssues(fetchedIssues);
      setError(null);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error loading issues: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({...prev, ...newFilters}));
    setPage(0); // Reset to first page when filters change
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
      const matchesAssignee = issue.assignee?.toLowerCase().includes(query);
      const matchesProductOwner = issue.productOwner?.toLowerCase().includes(query);
      
      return matchesSummary || matchesKey || matchesAssignee || matchesProductOwner;
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

  // Handle issue editing - redirects to create task page with pre-populated data
  const handleEditIssue = async (issueId) => {
    try {
      setLoading(true);
      // Fetch full issue details 
      const issueDetails = await apiClient.getIssueDetails(issueId);
      if (issueDetails) {
        // Navigate to create task page with state
        navigate('/createtask', { 
          state: { 
            editMode: true,
            issueData: issueDetails
          }
        });
      }
    } catch (error) {
      console.error('Error getting issue details for edit:', error);
      setSnackbar({
        open: true,
        message: 'Error loading issue details for editing',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
                    
                    {/* Assignee */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {currentIssue.assignee || 'Unassigned'}
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
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
     
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          All Change Requirements
        </Typography>
      
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between' }}>
        <TextField
          size="small"
          placeholder="Search issues by key, summary, assignee..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: '#5E6C84' }} />,
          }}
          sx={{ width: 300 }}
        />
      </Box>
     
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderTop: '3px solid #4C9AFF', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Issues
                  </Typography>
                  <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
                    {statusCounts.total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          
          
          <Grid item xs={12} md={3}>
            <Card sx={{ borderTop: '3px solid #36B37E', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CachedIcon sx={{ mr: 1, color: '#36B37E' }} />
                    <Typography variant="subtitle1" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
                    {statusCounts.inProgress}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ borderTop: '3px solid #FFAB00', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AlertTriangleIcon className="text-yellow-500" />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>
                      In Review
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
                    {statusCounts.inReview}
                  </Typography>
                </Box>
                </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
  <Card sx={{ borderTop: '3px solid #00B8D9', height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon sx={{ mr: 1, color: '#00B8D9' }} />
          <Typography variant="subtitle1" color="text.secondary">
            Done
          </Typography>
        </Box>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
          {statusCounts.done}
        </Typography>
      </Box>
    </CardContent>
  </Card>
</Grid>
</Grid>
</Box>

{/* Main issues table */}
{loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
    <CircularProgress />
  </Box>
) : error ? (
  <Alert severity="error" sx={{ mb: 3 }}>
    {error}
  </Alert>
) : (
  <>
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F4F5F7' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
           
            <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
            {/* <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredIssues
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((issue) => (
              <TableRow 
                key={issue.id}
                hover
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {issue.key}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getIssueType(issue.issueType).icon}
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                      {getIssueType(issue.issueType).name}
                    </Typography>
                  </Box>
                </TableCell>
              
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPriority(issue.priority).icon}
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                      {getPriority(issue.priority).name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getSeverity(issue.severity).icon}
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1 }}>
                      {getSeverity(issue.severity).name}
                    </Typography>
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
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   
                      {(issue.assignee && issue.assignee[0]) || <PersonIcon size={16} />}
                  
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      {issue.assignee || 'Unassigned'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(issue.created)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(issue.dueDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewIssue(issue.id)}
                      title="View issue details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditIssue(issue.id)}
                      title="Edit issue"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                   
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
          {filteredIssues.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  <FilterListIcon sx={{ fontSize: 48, color: '#DFE1E6', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No issues found matching your criteria
                  </Typography>
                  {searchQuery && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setSearchQuery('')}
                      sx={{ mt: 2 }}
                    >
                      Clear Search
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )}
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


</>
);
};

export default AllIssues;