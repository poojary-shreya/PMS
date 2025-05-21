import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress
} from "@mui/material";
import {
  Assignment,
  RateReview,
  Feedback,
  Timeline,
  Add,
  Star,
  StarBorder,
  AccountTree,
} from "@mui/icons-material";

const PerformanceReviewsTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
 
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", content: "", action: null });
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [loading, setLoading] = useState({
    reviews: false,
    employees: false
  });
  const [editReviewDialog, setEditReviewDialog] = useState({ 
    open: false, 
    review: null 
  });
  const [employeeSearchDialog, setEmployeeSearchDialog] = useState({
    open: false,
    employee_id: ""
  });
  
  
  const [newReview, setNewReview] = useState({
    employee_id: "",
    reviewer: "",
    reviewDate: new Date().toISOString().split('T')[0],
    type: "Annual",
    rating: "",
    status: "Scheduled",
    progress: 0,
    comments: ""
  });

  const toggleExpandReview = (reviewId) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };
  const fetchReviews = async () => {
    try {
      setLoading(prev => ({ ...prev, reviews: true }));
      const response = await fetch("http://localhost:5000/api/reviews");
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      openSnackbar(`Error fetching reviews: ${error.message}`, 'error');

      setReviews([]);
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      const response = await fetch('http://localhost:5000/api/reviews/employees');
      const data = await response.json();
     
      setEmployees(data);
      return data;
    } catch (error) {
     
      openSnackbar(`Failed to load employees: ${error.message || 'Unknown error'}`, 'error');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };
  

  useEffect(() => {
    fetchEmployees();
    fetchReviews();
  }, []);

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
 
  const handleConfirmDialogOpen = (title, content, action) => {
    setConfirmDialog({ open: true, title, content, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const addReview = async () => {
    try {
      if (!newReview.employee_id || !newReview.reviewDate || !newReview.type) {
        openSnackbar("Please fill in all required fields", "error");
        return;
      }

      setLoading(prev => ({ ...prev, reviews: true }));
      
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchReviews();
      setNewReview({
        employee_id: "",
        reviewer: "",
        reviewDate: new Date().toISOString().split('T')[0],
        type: "Annual",
        rating: "",
        status: "Scheduled",
        progress: 0,
        comments: ""
      });
      openSnackbar("Review scheduled successfully", "success");
    } catch (error) {
      openSnackbar(`Failed to create review: ${error.message}`, "error");
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  

  const handleEditReview = (review) => {

    const formattedReview = {
      ...review,
      reviewDate: review.reviewDate ? new Date(review.reviewDate).toISOString().split('T')[0] : ""
    };
    
    setEditReviewDialog({ 
      open: true, 
      review: formattedReview
    });
  };

  const handleEditChange = (field, value) => {
    setEditReviewDialog(prev => ({
      ...prev,
      review: { ...prev.review, [field]: value }
    }));
  };

  const handleUpdateReview = async () => {
    try {
      const { review } = editReviewDialog;
      if (!review.employee_id || !review.reviewDate || !review.type) {
        openSnackbar("Please fill in all required fields", "error");
        return;
      }
      
      setLoading(prev => ({ ...prev, reviews: true }));
      
      const response = await fetch(`http://localhost:5000/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      await fetchReviews();
      setEditReviewDialog({ open: false, review: null });
      openSnackbar("Review updated successfully", "success");
    } catch (error) {
      openSnackbar(`Update failed: ${error.message}`, "error");
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const handleEmployeeSearch = () => {
    if (!employeeSearchDialog.employee_id) {
      openSnackbar("Please enter an employee ID", "error");
      return;
    }
    navigate(`/employee-reviews/${employeeSearchDialog.employee_id}`);
    setEmployeeSearchDialog({ open: false, employee_id: "" });
  };

  const getStars = (rating) => {
    const ratingNum = parseInt(rating) || 0;
    return [...Array(5)].map((_, i) => (
      i < ratingNum 
        ? <Star key={i} color="primary" fontSize="small" /> 
        : <StarBorder key={i} fontSize="small" />
    ));
  };


  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid date";
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "info";
      case "In Progress": return "warning";
      case "Completed": return "success";
      case "Overdue": return "error";
      default: return "default";
    }
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Performance Management System
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={location.pathname}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              backgroundColor: "#f5f5f5",
              "& .MuiTab-root": { fontWeight: "medium", py: 2 },
            }}
          >
            <Tab icon={<Assignment />} label="Goals & Objectives" value="/performance" />
            <Tab icon={<RateReview />} label="Performance Reviews" value="/review" />
            <Tab icon={<Feedback />} label="Feedback System" value="/feedback" />
            <Tab icon={<Timeline />} label="Improvement Plans" value="/improve" />
            <Tab icon={<AccountTree />} label="Succession Planning" value="/succession" />
          </Tabs>
        </Box>
      </Paper>

      
      {location.pathname === "/review" && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                    <RateReview sx={{ mr: 1 }} /> Schedule Performance Review
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <TextField
                    label="Employee ID"
                    value={newReview.employee_id}
                    onChange={(e) => setNewReview({ ...newReview, employee_id: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                    placeholder="Enter employee ID"
                  />

                  <TextField
                    fullWidth
                    label="Reviewer"
                    value={newReview.reviewer}
                    onChange={(e) => setNewReview({ ...newReview, reviewer: e.target.value })}
                    margin="normal"
                    placeholder="Enter reviewer's name"
                  />

               
                  <TextField
                    label="Review Date"
                    type="date"
                    value={newReview.reviewDate}
                    onChange={(e) => setNewReview({ ...newReview, reviewDate: e.target.value })}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Review Type</InputLabel>
                    <Select
                      value={newReview.type}
                      onChange={(e) => setNewReview({ ...newReview, type: e.target.value })}
                      label="Review Type"
                    >
                      <MenuItem value="Annual">Annual Review</MenuItem>
                      <MenuItem value="Quarterly">Quarterly Review</MenuItem>
                      <MenuItem value="Midyear">Mid-year Review</MenuItem>
                      <MenuItem value="Probation">Probation Completion</MenuItem>
                      <MenuItem value="Project">Project Completion</MenuItem>
                      <MenuItem value="360">360 Review</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Rating</InputLabel>
                    <Select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                      label="Rating"
                    >
                      <MenuItem value="1">1 - Needs Improvement</MenuItem>
                      <MenuItem value="2">2 - Developing</MenuItem>
                      <MenuItem value="3">3 - Meets Expectations</MenuItem>
                      <MenuItem value="4">4 - Exceeds Expectations</MenuItem>
                      <MenuItem value="5">5 - Outstanding</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={addReview}
                    disabled={loading.reviews}
                    startIcon={loading.reviews ? <CircularProgress size={20} /> : <Add />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {loading.reviews ? "Scheduling..." : "Schedule Review"}
                  </Button>

                
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper elevation={3}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <RateReview sx={{ mr: 1 }} /> Performance Reviews ({reviews.length})
                  </Typography>
                </Box>
                
                <Divider />
                
                {loading.reviews ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List sx={{ maxHeight: '650px', overflow: 'auto', p: 0 }}>
  {reviews.map((review) => (
    <React.Fragment key={review.id}>
      <ListItem 
        button 
        onClick={() => toggleExpandReview(review.id)}
        sx={{ 
          '&:hover': { bgcolor: '#f9f9f9' }, 
          p: 2,
          borderLeft: '4px solid',
          borderLeftColor: getStatusColor(review.status) === 'error'
            ? '#f44336'
            : getStatusColor(review.status) === 'warning'
              ? '#ff9800'
              : '#2196f3',
          mb: 1
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">
                {review.personal.firstName || ' Employee'} (ID: {review.employee_id})
              </Typography>
              <Chip
                label={review.status || "Scheduled"}
                color={getStatusColor(review.status || "Scheduled")}
                size="small"
              />
            </Box>
          }
          secondary={
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {review.type} Review • {formatDate(review.reviewDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reviewer: {review.reviewer || 'Not assigned'}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Progress</Typography>
                  <Typography variant="caption">{review.progress || 0}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={review.progress || 0} 
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              {review.rating && (
                <Box sx={{ mt: 1 }}>
                  {getStars(review.rating)}
                </Box>
              )}
              {review.comments && (
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    <strong>Comments:</strong> {review.comments}
                  </Typography>
                </Grid>
              )}
            </>
          }
        />
       
      </ListItem>

      {expandedReviewId === review.id && (
        <Box sx={{ px: 4, pb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
            <Grid container spacing={2}>
              
              
              {review.progressUpdates?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Progress History
                  </Typography>
                  {review.progressUpdates.map((update, idx) => (
                    <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                      </Box>
                      <Typography variant="body2">{update.note}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={update.status}
                          size="small"
                          color={getStatusColor(update.status)}
                        />
                        <Chip
                          label={`${update.progress}%`}
                          size="small"
                          color={getStatusColor(update.progress)}
                        />
                      </Box>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      )}
      <Divider />
    </React.Fragment>
  ))}
</List>
                )
              }
</Paper>
</Grid>
</Grid>
</Box>
      )}
</Container>

                         

  )
      {/* Snackbar  */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
  
  
}

export default PerformanceReviewsTab;