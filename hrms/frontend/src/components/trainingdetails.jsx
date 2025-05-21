import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Card, CardContent, Typography, Button, Grid, Box, Paper, 
  Divider, Chip, LinearProgress, TextField, List, ListItem, ListItemText, 
  ListItemIcon, Alert, CircularProgress
} from '@mui/material';
import { 
  CheckCircle, Assignment, EventNote, PlayArrow, Person, Email, 
  Comment, CheckBox, Send, ArrowBack, History as HistoryIcon
} from '@mui/icons-material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HRTrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hrComment, setHrComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTrainingDetails();
  }, [id]);

  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      
    
      if (!id || id === 'undefined') {
        setError("Invalid training ID. Please select a valid training.");
        setLoading(false);
        return;
      }
      
      console.log(`HR fetching training with ID: ${id}`);
      const { data } = await axios.get(`${API_BASE_URL}/trainings/${id}`);
      
      if (!data) {
        throw new Error("No data received from server");
      }
      
      console.log("HR Training data received:", data);
      setTraining(data);
      
    
      fetchUpdateHistory(id);
    } catch (error) {
      console.error("Error fetching training details:", error);
      
      let errorMsg = "Failed to load training details";
      
      if (error.response) {
        errorMsg = error.response.data?.message || error.response.statusText;
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        errorMsg = "No response received from server. Please check your connection.";
      } else {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const fetchUpdateHistory = async (trainingId) => {
    try {
      setLoadingHistory(true);
      const { data } = await axios.get(`${API_BASE_URL}/trainings/${trainingId}/history`);
      setUpdateHistory(data);
    } catch (error) {
      console.error("Error fetching update history:", error);
      setUpdateHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleCommentSubmit = async () => {
    if (!hrComment.trim()) {
      setError("Please add a comment before submitting");
      return;
    }
    try {
      setSubmitting(true);
      const comment = {
        date: new Date().toISOString(),
        comment: hrComment,
        author: "HR Administrator", 
        role: "HR"
      };
   
      const response = await axios.put(`${API_BASE_URL}/trainings/${id}/comment`, {
        hrComments: [...(training.hrComments || []), comment]
      });
      setTraining(response.data);
      setHrComment("");
      setSuccess("Comment added successfully!");
   
      await axios.post(`${API_BASE_URL}/trainings/notify`, {
        trainingId: id,
        employeeEmail: training.email,
        employeeName: training.employee,
        updateType: 'hrComment'
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      setError(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planned': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


      const getProgressPercentage = () => {
        if (!training) return 0;
        if (training.progressPercentage !== undefined && training.progressPercentage !== null) {
          return training.progressPercentage;
        }
        
        if (training.status === 'Completed') return 100;
        if (training.status === 'Cancelled') return 0;
        if (training.status === 'Planned') return 0;
        if (training.status === 'In Progress') return 50;
        return 0;
      };
    
      const handleStatusChange = async (newStatus) => {
        try {
          setSubmitting(true);
          const updatedTraining = {
            ...training,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
          
      
          if (newStatus === 'Completed' && !training.completionDate) {
            updatedTraining.completionDate = new Date().toISOString();
          }
          
          const response = await axios.put(`${API_BASE_URL}/trainings/${id}`, updatedTraining);
          setTraining(response.data);
          setSuccess(`Training status updated to ${newStatus} successfully!`);
          
      
          await axios.post(`${API_BASE_URL}/trainings/notify`, {
            trainingId: id,
            employeeEmail: training.email,
            employeeName: training.employee,
            updateType: 'statusChange',
            newStatus: newStatus
          });
          
     
          fetchUpdateHistory(id);
        } catch (error) {
          console.error("Error updating training status:", error);
          setError(error.response?.data?.message || "Failed to update training status");
        } finally {
          setSubmitting(false);
        }
      };
      
      const renderActionButtons = () => {
        if (!training) return null;
        
        return (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {training.status !== 'Completed' && (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CheckCircle />}
                onClick={() => handleStatusChange('Completed')}
                disabled={submitting}
              >
                Mark as Completed
              </Button>
            )}
            
            {training.status !== 'In Progress' && training.status !== 'Completed' && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PlayArrow />}
                onClick={() => handleStatusChange('In Progress')}
                disabled={submitting}
              >
                Mark as In Progress
              </Button>
            )}
            
            {training.status !== 'Cancelled' && (
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => handleStatusChange('Cancelled')}
                disabled={submitting}
              >
                Cancel Training
              </Button>
            )}
            
            <Button 
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/hr/trainings')}
            >
              Back to List
            </Button>
          </Box>
        );
      };
      
      if (loading) {
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading training details...</Typography>
            </Paper>
          </Container>
        );
      }
      
      if (error && !training) {
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />}
              onClick={() => navigate('/hr/trainings')}
            >
              Back to Trainings List
            </Button>
          </Container>
        );
      }
      
      return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography component="h1" variant="h5" fontWeight="bold">
                Training Details
              </Typography>
              <Chip 
                label={training?.status || 'Unknown'} 
                color={getStatusColor(training?.status)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {training?.title || 'Untitled Training'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressPercentage()} 
                        sx={{ height: 10, borderRadius: 5 }} 
                      />
                      <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                        {getProgressPercentage()}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {training?.description || 'No description provided'}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Training Type</Typography>
                        <Typography variant="body2">{training?.type || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Category</Typography>
                        <Typography variant="body2">{training?.category || 'Not specified'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Start Date</Typography>
                        <Typography variant="body2">{formatDate(training?.startDate)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">End Date</Typography>
                        <Typography variant="body2">{formatDate(training?.endDate)}</Typography>
                      </Grid>
                      {training?.completionDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Completion Date</Typography>
                          <Typography variant="body2">{formatDate(training?.completionDate)}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Duration</Typography>
                        <Typography variant="body2">{training?.duration || 'Not specified'} {training?.durationUnit || 'hours'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Feedback & Comments
                    </Typography>
                    
                    <List>
                      {training?.hrComments && training.hrComments.length > 0 ? (
                        training.hrComments.map((comment, index) => (
                          <ListItem key={index} alignItems="flex-start" divider={index < training.hrComments.length - 1}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Comment color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2">
                                  {comment.author || 'HR'} - {formatDateTime(comment.date)}
                                </Typography>
                              }
                              secondary={comment.comment}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No HR comments yet" />
                        </ListItem>
                      )}
                    </List>
                    
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Add HR Comment"
                        multiline
                        rows={3}
                        value={hrComment}
                        onChange={(e) => setHrComment(e.target.value)}
                        disabled={submitting}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<Send />}
                        sx={{ mt: 2 }}
                        onClick={handleCommentSubmit}
                        disabled={submitting || !hrComment.trim()}
                      >
                        {submitting ? 'Submitting...' : 'Add Comment'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employee Information
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Employee" 
                          secondary={training?.employee || 'Not assigned'} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={training?.email || 'Not provided'} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <Assignment />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Department" 
                          secondary={training?.department || 'Not specified'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HistoryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Update History</Typography>
                    </Box>
                    
                    {loadingHistory ? (
                      <CircularProgress size={24} sx={{ m: 2 }} />
                    ) : updateHistory.length > 0 ? (
                      <Timeline position="right" sx={{ m: 0, p: 0 }}>
                        {updateHistory.map((update, index) => (
                          <TimelineItem key={index}>
                            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
                              {formatDate(update.date)}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                              <TimelineDot color={update.type === 'status' ? 'primary' : 'secondary'} />
                              {index < updateHistory.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography variant="body2">
                                {update.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                By {update.user || 'System'}
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No update history available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                
                {renderActionButtons()}
              </Grid>
            </Grid>
          </Paper>
        </Container>
      );
    }
    export default HRTrainingDetail;