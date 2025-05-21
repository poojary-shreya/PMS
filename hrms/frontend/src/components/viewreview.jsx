import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Box, Typography, List, ListItem,
  ListItemText, ListItemSecondaryAction, Chip, LinearProgress,
  Button, Paper, Divider, Grid, FormControl, InputLabel, Select, MenuItem,
  TextField, Snackbar, Alert
} from '@mui/material';
import { 
  AccessTime, FormatListNumbered, Search, Save,
  Star, StarBorder 
} from '@mui/icons-material';
import SharedNavbar from "./performancenavbar.jsx";

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const EmployeeReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completionDetails, setCompletionDetails] = useState({});
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [localProgress, setLocalProgress] = useState({});
  const [localStatus, setLocalStatus] = useState({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isCompanyEmail: false,
    email: '',
    message: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user/current", {
          withCredentials: true
        });
        
        if (response.data) {
          setAuthStatus({
            isAuthenticated: true,
            isCompanyEmail: response.data.isCompanyEmail || false,
            email: response.data.email || '',
            message: ''
          });
          
          if (response.data.employee_id) {
            setEmployeeIdInput(response.data.employee_id);
            setSelectedEmployee(response.data.employee_id);
            fetchEmployeeReviews(response.data.employee_id);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        openSnackbar("Failed to fetch user information", "error");
        setAuthStatus({
          isAuthenticated: false,
          isCompanyEmail: false,
          email: '',
          message: 'Authentication error'
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (expandedReviewId) {
      const review = reviews.find(r => r.id === expandedReviewId);
      if (review) {
        setCompletionDetails(prev => ({
          ...prev,
          [expandedReviewId]: review.completionDetails || ''
        }));
        setLocalProgress(prev => ({
          ...prev,
          [expandedReviewId]: review.progress
        }));
        setLocalStatus(prev => ({
          ...prev,
          [expandedReviewId]: review.status
        }));
      }
    }
  }, [expandedReviewId, reviews]);

  const handleUpdateReviewStatus = async (reviewId, newStatus) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, { 
        status: newStatus,
        note: `Status changed to ${newStatus}`
      });
      setReviews(reviews.map(r => r.id === reviewId ? response.data : r));
      openSnackbar("Status updated successfully!", "success");
    } catch (error) {
      openSnackbar("Update failed: " + error.message, "error");
    }
  };

  const handleUpdateReviewProgress = async (reviewId, newProgress) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        progress: newProgress,
        note: `Progress updated to ${newProgress}%`
      });
      setReviews(reviews.map(r => r.id === reviewId ? response.data : r));
      openSnackbar("Progress updated!", "success");
    } catch (error) {
      openSnackbar("Update failed: " + error.message, "error");
    }
  };

  const handleUpdateReviewDetails = async (reviewId) => {
    try {
      const details = completionDetails[reviewId]?.trim();
      const progress = localProgress[reviewId] || 0;
      const status = localStatus[reviewId] || 'Scheduled';

      if (!details) return;

      const response = await api.put(`/reviews/${reviewId}`, { 
        note: details,
        completionDetails: details,
        status: status,
        progress: progress
      });
      
      setReviews(reviews.map(r => r.id === reviewId ? response.data : r));
      setCompletionDetails(prev => ({ ...prev, [reviewId]: '' }));
      openSnackbar("Update added!", "success");
    } catch (error) {
      openSnackbar("Update failed", "error");
    }
  };

  const fetchEmployeeReviews = async (employeeId) => {
    try {
      setLoading(true);
      
      if (!employeeId) {
        openSnackbar("Please provide an employee ID", "warning");
        return;
      }
      
   
      const response = await api.get(`/reviews/employee/${employeeId}`, {
        withCredentials: true
      });
      
      setReviews(response.data);
      
   
      setAuthStatus(prev => ({
        ...prev,
        message: ''
      }));
      
      if (response.data.length === 0) {
        openSnackbar("No reviews found for this employee", "info");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      
      if (error.response?.status === 403) {

        const errorMessage = error.response.data.error || "Access denied: Please log in with your company email";
        setAuthStatus(prev => ({
          ...prev,
          isCompanyEmail: false,
          message: errorMessage
        }));
        openSnackbar(errorMessage, "error");
        setReviews([]);
      } else {
        openSnackbar(error.response?.data?.message || "Failed to load reviews", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleEmployeeSearch = () => {
    if (employeeIdInput.trim()) {
      setSelectedEmployee(employeeIdInput.trim());
      fetchEmployeeReviews(employeeIdInput.trim());
    } else {
      openSnackbar("Please enter an employee ID", "warning");
    }
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    if (typeof status !== 'string') return 'default';  
    switch (status.toLowerCase()) {
        case 'completed': return 'success';
        case 'pending': return 'warning'; 
        case 'scheduled': return 'info';
        case 'in progress': return 'info';
        case 'not started': return 'warning';
        case 'overdue': return 'error';
        default: return 'default';
    }
  };

  const getStars = (rating) => {
    const ratingNum = parseInt(rating) || 0;
    return [...Array(5)].map((_, i) => (
      i < ratingNum 
        ? <Star key={i} color="primary" fontSize="small" /> 
        : <StarBorder key={i} fontSize="small" />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    if (filters.status && review.status !== filters.status) return false;
    return true;
  });


  const hasAccessError = authStatus.message.includes("Access denied");

  return (
    <>
      <SharedNavbar />
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Employee Reviews Search
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Employee ID"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  sx={{ width: "300px" }}
                />
              
              </Box>
              
            
              {hasAccessError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {authStatus.message}
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Container maxWidth="1500px">
              <Grid item xs={12}>
                <Paper elevation={3}>
                  <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    bgcolor: '#f5f5f5' 
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormatListNumbered sx={{ mr: 1 }} /> Active Reviews ({filteredReviews.length})
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Filter by Status</InputLabel>
                        <Select
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                          label="Filter by Status"
                        >
                          <MenuItem value="">All Statuses</MenuItem>
                          <MenuItem value="Scheduled">Scheduled</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Overdue">Overdue</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Divider />

                  {loading ? (
                    <Box sx={{ p: 3 }}>
                      <LinearProgress />
                    </Box>
                  ) : hasAccessError ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="error" gutterBottom>
                        Access Denied
                      </Typography>
                      <Typography color="textSecondary">
                        {authStatus.message || "Reviews can only be accessed when logged in with your company email."}
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ maxHeight: '650px', overflow: 'auto', p: 0 }}>
                      {filteredReviews.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography color="textSecondary">No reviews found</Typography>
                        </Box>
                      ) : (
                        filteredReviews.map((review) => (
                          <React.Fragment key={review.id}>
                            <ListItem
                              button
                              onClick={() => setExpandedReviewId(expandedReviewId === review.id ? null : review.id)}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f9f9f9' },
                                borderLeft: `4px solid ${getStatusColor(review.status)}`
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {review.type} Review
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({review.personal?.firstName} {review.personal?.lastName})
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="textSecondary">
                                        Due: {new Date(review.reviewDate).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" color="textSecondary">
                                        Progress: {review.progress}%
                                      </Typography>
                                      <LinearProgress
                                        variant="determinate"
                                        value={review.progress}
                                        sx={{
                                          flexGrow: 1,
                                          height: 8,
                                          borderRadius: 5,
                                          backgroundColor: '#e0f5f5'
                                        }}
                                        color={review.progress === 100 ? "success" : "primary"}
                                      />
                                    </Box>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Chip label={review.status} color={getStatusColor(review.status)} />
                              </ListItemSecondaryAction>
                            </ListItem>

                            {expandedReviewId === review.id && (
                              <Box sx={{ px: 2, pb: 2 }}>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                  <Typography gutterBottom><strong>Reviewer:</strong> {review.reviewer}</Typography>
                                  {review.rating && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Typography variant="body2"><strong>Rating:</strong></Typography>
                                      {getStars(review.rating)}
                                    </Box>
                                  )}

                                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                      <InputLabel>Update Status</InputLabel>
                                      <Select
                                        value={localStatus[review.id] || review.status}
                                        label="Update Status"
                                        onChange={(e) => setLocalStatus(prev => ({
                                          ...prev,
                                          [review.id]: e.target.value
                                        }))}
                                      >
                                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                                        <MenuItem value="In Progress">In Progress</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Overdue">Overdue</MenuItem>
                                      </Select>
                                    </FormControl>

                                    <TextField
                                      label="Progress"
                                      variant="outlined"
                                      size="small"
                                      type="number"
                                      value={localProgress[review.id] ?? review.progress}
                                      onChange={(e) => {
                                        const value = Math.min(100, Math.max(0, parseInt(e.target.value || 0)));
                                        setLocalProgress(prev => ({
                                          ...prev,
                                          [review.id]: value
                                        }))
                                      }}
                                      inputProps={{ min: 0, max: 100, step: 5 }}
                                      sx={{ minWidth: 150 }}
                                    />
                                  </Box>

                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Add Review Update
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={4}
                                      variant="outlined"
                                      placeholder="Provide details about review preparation, challenges, and outcomes"
                                      value={completionDetails[review.id] || ''}
                                      onChange={(e) => setCompletionDetails({ 
                                        ...completionDetails, 
                                        [review.id]: e.target.value 
                                      })}
                                    />
                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                        onClick={() => handleUpdateReviewDetails(review.id)}
                                        disabled={!completionDetails[review.id]?.trim()}
                                      >
                                        Add Update
                                      </Button>
                                    </Box>
                                  </Box>

                                  {review.progressUpdates && review.progressUpdates.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Progress History
                                      </Typography>
                                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: '200px', overflow: 'auto' }}>
                                        {review.progressUpdates.map((update, idx) => (
                                          <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < review.progressUpdates.length - 1 ? '1px solid #eee' : 'none' }}>
                                            <Typography variant="caption" color="textSecondary">
                                              {new Date(update.date).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                              })}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>{update.note}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                              <Chip
                                                label={update.status}
                                                size="small"
                                                color={getStatusColor(update.status)}
                                              />
                                              <Chip
                                                label={`${update.progress}%`}
                                                size="small" 
                                                color="primary"
                                              />
                                            </Box>
                                          </Box>
                                        ))}
                                      </Paper>
                                    </Box>
                                  )}
                                </Paper>
                              </Box>
                            )}
                            <Divider />
                          </React.Fragment>
                        ))
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Container>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmployeeReviewsPage;