import React, { useState, useEffect } from "react";
import axios from 'axios';
import { TextField, Snackbar, Alert } from "@mui/material";

import {
  Container, Box, Typography, List, ListItem,
  ListItemText, ListItemSecondaryAction, Chip, LinearProgress,
  Button, Paper, Divider, Grid, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import {
  AccessTime, FormatListNumbered, Search, Save
} from "@mui/icons-material";
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

const EmployeeDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [loading, setLoading] = useState(false);

 
  const [goalUpdates, setGoalUpdates] = useState({});
  const [completionDetails, setCompletionDetails] = useState({});

  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/user/current", {
          withCredentials: true
        });
        
        if (response.data && response.data.employee_id) {
          setEmployeeIdInput(response.data.employee_id);
          setSelectedEmployee(response.data.employee_id);
          fetchEmployeeGoals(response.data.employee_id);
          
     
          localStorage.setItem('currentEmployeeId', response.data.employee_id);
          localStorage.setItem('currentEmployeeName', `${response.data.firstName || 'Employee'}`);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        openSnackbar("Failed to fetch user information", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    const updates = {};
    goals.forEach(goal => {
      updates[goal.id] = {
        status: goal.status,
        progress: goal.progress
      };
    });
    setGoalUpdates(updates);

    const details = {};
    goals.forEach(goal => {
      details[goal.id] = '';
    });
    setCompletionDetails(details);
  }, [goals]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };


  const handleStatusChange = (goalId, newStatus) => {
    setGoalUpdates(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        status: newStatus,
        progress: newStatus === 'Completed' ? 100 : prev[goalId]?.progress
      }
    }));
  };


  const handleProgressChange = (goalId, newProgress) => {
    setGoalUpdates(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        progress: newProgress,
        status: newProgress === 100 ? 'Completed' : prev[goalId]?.status
      }
    }));
  };


  const handleUpdateGoalDetails = async (goalId) => {
    try {
      const updates = goalUpdates[goalId];
      const details = completionDetails[goalId]?.trim();
      
      if (!details && !updates) return;
      
      const updateData = {
        status: updates.status,
        progress: updates.progress,
        note: details || `Updated status to ${updates.status} and progress to ${updates.progress}%`
      };
      
      const response = await api.put(`/goals/${goalId}`, updateData);
      
      setGoals(goals.map(g => g.id === goalId ? response.data : g));
      
      setCompletionDetails(prev => ({ ...prev, [goalId]: '' }));
      
      openSnackbar("Update added successfully!", "success");
    } catch (error) {
      openSnackbar("Update failed: " + error.message, "error");
    }
  };

  const fetchEmployeeGoals = async (employeeId) => {
    try {
      setLoading(true);
      const response = await api.get(`/goals/employee/${employeeId}`,{withCredentials: true});
      const goalsData = response.data;
      setGoals(goalsData);
    } catch (error) {
      console.error("Error fetching goals:", error);
      openSnackbar( error.response.data.message  || "Failed to fetch goals. Please check Employee ID", "error") ;
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSearch = () => {
    if (employeeIdInput.trim()) {
      setSelectedEmployee(employeeIdInput.trim());
      fetchEmployeeGoals(employeeIdInput.trim());
    } else {
      openSnackbar("Please enter an employee ID", "warning");
    }
  };

  const handleEmployeeSelection = (event) => {
    const value = event.target.value;
    setSelectedEmployee(value);
    setEmployeeIdInput(value);
    if (value) fetchEmployeeGoals(value);
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const clearFilters = () => {
    setSelectedEmployee("");
    setEmployeeIdInput("");
    setGoals([]);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'info';
      case 'not started': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filters.status && goal.status !== filters.status) return false;
    return true;
  });

  const userRole = 'employee';


  const GoalsContent = () => (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Employee Goals Search
            </Typography>
            <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Employee ID"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  sx={{ width: "300px" }}
                />
                {/* <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleEmployeeSearch}
                  startIcon={<Search />}
                  sx={{ width: "100px" }}
                >
                  Search
                </Button> */}
              </Box>
            </Paper>
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
                    <FormatListNumbered sx={{ mr: 1 }} /> Active Goals ({filteredGoals.length})
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Filter by Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        label="Filter by Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="Not Started">Not Started</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      size="small"
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Box>

                <Divider />

                {loading ? (
                  <Box sx={{ p: 3 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <List sx={{ maxHeight: '650px', overflow: 'auto', p: 0 }}>
                    {filteredGoals.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">No goals found matching current filters</Typography>
                      </Box>
                    ) : (
                      filteredGoals.map((goal) => (
                        <React.Fragment key={goal.id}>
                          <ListItem
                            button
                            onClick={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#f9f9f9' },
                              borderLeft: `4px solid ${getPriorityColor(goal.priority)}`
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {goal.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ({goal.personal?.firstName} {goal.personal?.lastName})
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                                    <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Progress: {goal.progress}%
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={goal.progress}
                                      sx={{
                                        flexGrow: 1,
                                        height: 8,
                                        borderRadius: 5,
                                        backgroundColor: '#e0e0e0'
                                      }}
                                      color={goal.progress === 100 ? "success" : "primary"}
                                    />
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip label={goal.status} color={getStatusColor(goal.status)} />
                            </ListItemSecondaryAction>
                          </ListItem>

                          {expandedGoalId === goal.id && (
                            <Box sx={{ px: 2, pb: 2 }}>
                              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                <Typography gutterBottom><strong>Description:</strong> {goal.description}</Typography>
                                <Typography variant="body2"><strong>Metrics:</strong> {goal.metrics}</Typography>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                      <strong>Created:</strong> {new Date(goal.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">
                                      <strong>Priority:</strong> {goal.priority}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {userRole === 'employee' && (
                                  <>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>Update Status</InputLabel>
                                        <Select
                                          value={goalUpdates[goal.id]?.status || goal.status}
                                          label="Update Status"
                                          onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                                        >
                                          <MenuItem value="Not Started">Not Started</MenuItem>
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
                                        value={goalUpdates[goal.id]?.progress || goal.progress}
                                        onChange={(e) => {
                                          const value = Math.min(100, Math.max(0, parseInt(e.target.value || 0)));
                                          handleProgressChange(goal.id, value);
                                        }}
                                        inputProps={{ min: 0, max: 100, step: 5 }}
                                        sx={{ minWidth: 150 }}
                                      />
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Add Progress Update
                                      </Typography>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        placeholder="Provide details about task progress, challenges faced, results achieved, etc."
                                        value={completionDetails[goal.id] || ''}
                                        onChange={(e) => setCompletionDetails({
                                          ...completionDetails,
                                          [goal.id]: e.target.value
                                        })}
                                      />
                                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          startIcon={<Save />}
                                          onClick={() => handleUpdateGoalDetails(goal.id)}
                                          disabled={!completionDetails[goal.id]?.trim() &&
                                            goalUpdates[goal.id]?.status === goal.status &&
                                            goalUpdates[goal.id]?.progress === goal.progress}
                                        >
                                          Add Update
                                        </Button>
                                      </Box>
                                    </Box>

                                    {goal.progressUpdates && goal.progressUpdates.length > 0 && (
                                      <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Progress History
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: '200px', overflow: 'auto' }}>
                                          {goal.progressUpdates?.map((update, idx) => (
                                            <Box key={idx} sx={{ mb: 2 }}>
                                              <Typography variant="caption" color="textSecondary">
                                                {new Date(update.date).toLocaleString('en-IN', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true

                                                })}
                                              </Typography>
                                              <Typography variant="body2">{update.note}</Typography>
                                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip
                                                  label={update.status}
                                                  size="small"
                                                  color={getStatusColor(update.status)}
                                                />
                                                <Chip
                                                  label={`${update.progress}%`}
                                                  size="small"
                                                  color={update.progress === 100 ? "success" : "primary"}
                                                />
                                              </Box>
                                            </Box>
                                          ))}
                                        </Paper>
                                      </Box>
                                    )}
                                  </>
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
  );

  return (
    <>
      <SharedNavbar />
      {GoalsContent()}
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

export default EmployeeDashboard;