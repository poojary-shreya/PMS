import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
  ListItemSecondaryAction,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Tooltip,
  Badge,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import {
  Assignment,
  RateReview,
  Feedback,
  Timeline,
  Edit,
  Delete,
  Person,
  AccessTime,
  AccountTree,
  Star,
  StarBorder,
  Visibility
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  

  const [feedback, setFeedback] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({
    feedback: false,
    employees: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [newFeedback, setNewFeedback] = useState({
    employee_id: "",
    type: "Peer",
    comment: "",
    anonymous: false,
    rating: " "
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading({ feedback: true, employees: true });
      const [empResponse, feedbackResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/feedback/employees"),
        axios.get("http://localhost:5000/api/feedback")
      ]);
      setEmployees(empResponse.data);
      setFeedback(feedbackResponse.data);
    } catch (error) {
      // openSnackbar(`Failed to load data: ${error.message}`, "error");
      // alert(error.response.data.message)
      console.log("failed to load data")
    } finally {
      setLoading({ feedback: false, employees: false });
    }
  };

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

 
  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const handleSubmitFeedback = async () => {
    try {
      if (!newFeedback.employee_id || !newFeedback.comment) {
        openSnackbar("Employee ID and comments are required", "error");
        return;
      }

      const payload = {
        ...newFeedback,
        rating: parseInt(newFeedback.rating)
      };

    
      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        payload
      );
      setFeedback([response.data, ...feedback]);
      openSnackbar("Feedback submitted successfully");
      
     
      resetFeedbackForm();
    } catch (error) {
      openSnackbar( "Submission failed", "error");
    }
  };

  const resetFeedbackForm = () => {
    setNewFeedback({
      employee_id: "",
      type: "Peer",
      comment: "",
      anonymous: false,
      rating: " "
    });
  };


  const handleViewPerformance = () => {
    navigate('/view-performance');
  };


  const getStars = (rating) => {
    const ratingNum = parseInt(rating);
    return (
      <>
        {[...Array(5)].map((_, i) => (
          i < ratingNum ? <Star key={i} color="primary" fontSize="small" /> : <StarBorder key={i} fontSize="small" />
        ))}
      </>
    );
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Performance Management System
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiTab-root': { fontWeight: 'medium', py: 2 }
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

        {location.pathname === '/feedback' && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
           
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                      <Feedback sx={{ mr: 1 }} /> Provide Feedback
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <TextField
  label="Select Employee"
  value={newFeedback.employee_id}
  onChange={(e) => setNewFeedback({ ...newFeedback, employee_id: e.target.value })}
  fullWidth
  margin="normal"
  required
/>

                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Feedback Type</InputLabel>
                      <Select
                        value={newFeedback.type}
                        onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value})}
                        label="Feedback Type"
                      >
                        <MenuItem value="Manager">Manager Feedback</MenuItem>
                        <MenuItem value="Peer">Peer Feedback</MenuItem>
                        <MenuItem value="Self">Self-Assessment</MenuItem>
                        <MenuItem value="Client">Client Feedback</MenuItem>
                        <MenuItem value="Team">Team Feedback</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Feedback Comments"
                      value={newFeedback.comment}
                      onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                      margin="normal"
                      placeholder="Provide detailed, constructive feedback..."
                      required
                    />
                    
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography component="legend">Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <IconButton 
                            key={value}
                            onClick={() => setNewFeedback({...newFeedback, rating: value})}
                            color={newFeedback.rating >= value ? "primary" : "default"}
                          >
                            <Star />
                          </IconButton>
                        ))}
                      </Box>
                    </Box>
                    
                   
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSubmitFeedback}
                        sx={{ mt: 2 }}
                      >
                        Submit Feedback
                      </Button>
                      
                    
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

             
              <Grid item xs={12} md={8}>
                <Paper elevation={3}>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Feedback sx={{ mr: 1 }} /> Recent Feedback Status ({feedback.length})
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  {loading.feedback ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="textSecondary">Loading feedback...</Typography>
                    </Box>
                  ) : (
                    <List sx={{ maxHeight: '650px', overflow: 'auto', p: 0 }}>
                      {feedback.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography color="textSecondary">No feedback available</Typography>
                        </Box>
                      ) : (
                        feedback.map((item) => (
                          <React.Fragment key={item.id}>
                            <ListItem alignItems="flex-start" sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {item.anonymous ? "Anonymous" : item.type} Feedback for {item.firstName || item.employeeName || "Employee"}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Date: {formatDate(item.date)}
                                      </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                        Rating:
                                      </Typography>
                                      {getStars(item.rating)}
                                    </Box>
                                    
                                    <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                                      {item.comment}
                                    </Typography>
                                    
                                    {item.status && (
                                      <Box sx={{ mt: 1 }}>
                                        <Chip
                                          label={`Status: ${item.status}`}
                                          color={item.status === 'Completed' ? 'success' : 
                                                 item.status === 'In Progress' ? 'warning' : 'default'}
                                          size="small"
                                        />
                                      </Box>
                                    )}
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <Chip
                                    label={item.type}
                                    color="info"
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

       
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default FeedbackPage;