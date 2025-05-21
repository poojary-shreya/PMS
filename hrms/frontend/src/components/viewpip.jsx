import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
  Paper,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card
} from "@mui/material";
import {
  Timeline,
  CalendarToday,
  Search,
  Save
} from "@mui/icons-material";
import SharedNavbar from "./performancenavbar.jsx";

const API_BASE_URL = "http://localhost:5000/api";

const ViewImprovementPlans = () => {
  const [improvementPlans, setImprovementPlans] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedPipId, setExpandedPipId] = useState(null);
  const [newProgressTaskCompletions, setNewProgressTaskCompletions] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [updatedPlans, setUpdatedPlans] = useState({});

  const handleEmployeeIdChange = (e) => setEmployeeId(e.target.value);

  const fetchImprovementPlans = async (id = null) => {
    const searchId = id || employeeId;

    if (!searchId.trim()) {
      openSnackbar("Please enter an Employee ID", "warning");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/improvement-plans?employee_id=${searchId}`, { withCredentials: true });
      setImprovementPlans(response.data);
      setUpdatedPlans({});
      setNewProgressTaskCompletions({});


      if (response.data.length > 0) {
        setExpandedPipId(response.data[0].id);
      }

      openSnackbar(response.data.length ?
        `Found ${response.data.length} improvement plans` :
        "No improvement plans found",
        response.data.length ? "success" : "info"
      );
    } catch (error) {
      console.error("Error fetching plans:", error);
      openSnackbar(error.response.data.message || "Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/user/current", {
          withCredentials: true
        });

        if (response.data && response.data.employee_id) {
          setEmployeeId(response.data.employee_id);
          setSelectedEmployee(response.data.employee_id);
          fetchImprovementPlans(response.data.employee_id);
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

  const handleSaveChanges = async (planId) => {
    try {
      setLoading(true);

      const currentPlan = improvementPlans.find(p => p.id === planId);
      if (!currentPlan) {
        openSnackbar("Plan not found", "error");
        return;
      }

      const planUpdates = updatedPlans[planId] || {};

      const statusMapping = {
        "not started": "Not Started",
        "in progress": "In Progress",
        "completed": "Completed",
        "extended": "Extended",
        "terminated": "Terminated",
        "active": "Active"
      };

      const currentStatus = currentPlan.status || "In Progress";
      const newStatusRaw = planUpdates.status || currentStatus;

      const newStatus = statusMapping[newStatusRaw.toLowerCase()] || "In Progress";

      const progressUpdate = {
        date: new Date().toISOString(),
        status: newStatus,
        progress: planUpdates.progress !== undefined ? planUpdates.progress : currentPlan.progress || 0,
        note: newProgressTaskCompletions[planId] || 'No details provided',
        timestamp: new Date().toISOString()
      };

      const updatedPlanData = {
        ...currentPlan,
        status: newStatus,
        progress: planUpdates.progress !== undefined ? planUpdates.progress : currentPlan.progress || 0,
        progressUpdates: [
          ...(currentPlan.progressUpdates || []),
          progressUpdate
        ]
      };

      const response = await axios.put(
        `${API_BASE_URL}/improvement-plans/${planId}`,
        updatedPlanData
      );

      setImprovementPlans(prevPlans =>
        prevPlans.map(plan => plan.id === planId ? response.data : plan)
      );

      setNewProgressTaskCompletions(prev => {
        const newState = { ...prev };
        delete newState[planId];
        return newState;
      });

      setUpdatedPlans(prev => {
        const newState = { ...prev };
        delete newState[planId];
        return newState;
      });

      openSnackbar("Changes saved successfully", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      openSnackbar("Failed to save changes: " + (error.response?.data?.error || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  const getStatusColor = (status) => {
    const statusColors = {
      "Completed": "success",
      "Active": "info",
      "In Progress": "info",
      "Not Started": "default",
      "Extended": "warning",
      "Terminated": "error"
    };
    return statusColors[status] || "default";
  };

  return (
    <>
      <SharedNavbar />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Improvement Plans
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Employee ID"
              value={employeeId}
              onChange={handleEmployeeIdChange}
              sx={{ maxWidth: 300 }}
            />
            {/* <Button
              variant="contained"
              onClick={() => fetchImprovementPlans()}
              disabled={!employeeId.trim()}
              startIcon={<Search />}
            >
              Search
            </Button> */}
          </Box>
        </Paper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {!loading && improvementPlans.length === 0 && (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Improvement Plans Found
            </Typography>
            <Typography color="text.secondary">
              Enter an Employee ID to search for improvement plans
            </Typography>
          </Paper>
        )}

        {improvementPlans.length > 0 && (
          <Paper elevation={3}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6">
                <Timeline sx={{ mr: 1 }} /> Improvement Plans ({improvementPlans.length})
              </Typography>
            </Box>
            <Divider />

            <List sx={{ maxHeight: 650, overflow: 'auto' }}>
              {improvementPlans.map(plan => (
                <React.Fragment key={plan.id}>
                  <ListItem
                    button
                    onClick={() => setExpandedPipId(prev => prev === plan.id ? null : plan.id)}
                    sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          Improvement Plan - {plan.firstName || plan.employee_id}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Box display="flex" alignItems="center" gap={1} my={1}>
                            <CalendarToday fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              Progress: {plan.progress}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={plan.progress}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 5 }}
                              color={plan.progress === 100 ? "success" : "primary"}
                            />
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={plan.status}
                        color={getStatusColor(plan.status)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  {expandedPipId === plan.id && (
                    <Box sx={{ px: 2, pb: 2, bgcolor: '#f9f9f9' }}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography><strong>Objectives:</strong> {plan.objectives}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography>
                              <strong>Milestones:</strong> {plan.milestones || "None specified"}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" gutterBottom>
                              Update Progress
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Status</InputLabel>
                                  <Select
                                    value={(updatedPlans[plan.id]?.status !== undefined)
                                      ? updatedPlans[plan.id].status
                                      : plan.status}
                                    onChange={(e) => setUpdatedPlans(prev => ({
                                      ...prev,
                                      [plan.id]: {
                                        ...(prev[plan.id] || {}),
                                        status: e.target.value
                                      }
                                    }))}
                                  >
                                    {["Not Started", "In Progress", "Completed", "Extended", "Terminated"]
                                      .map(option => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                      ))}
                                  </Select>
                                </FormControl>
                              </Grid>

                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Progress (%)"
                                  type="number"
                                  value={(updatedPlans[plan.id]?.progress !== undefined)
                                    ? updatedPlans[plan.id].progress
                                    : plan.progress}
                                  onChange={(e) => {
                                    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    setUpdatedPlans(prev => ({
                                      ...prev,
                                      [plan.id]: {
                                        ...(prev[plan.id] || {}),
                                        progress: value
                                      }
                                    }));
                                  }}
                                  inputProps={{ min: 0, max: 100 }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <TextField
                                  label="Task Completion Details"
                                  multiline
                                  rows={4}
                                  value={newProgressTaskCompletions[plan.id] || ''}
                                  onChange={(e) => setNewProgressTaskCompletions(prev => ({
                                    ...prev,
                                    [plan.id]: e.target.value
                                  }))}
                                  placeholder="Enter details about tasks completed or in progress..."
                                  fullWidth
                                />
                              </Grid>

                              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleSaveChanges(plan.id)}
                                  startIcon={<Save />}
                                  disabled={loading ||
                                    (!updatedPlans[plan.id] && !newProgressTaskCompletions[plan.id])}
                                >
                                  Save Changes
                                </Button>
                              </Grid>

                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                  Progress History
                                </Typography>
                                {plan.progressUpdates && plan.progressUpdates.length > 0 ? (
                                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: '200px', overflow: 'auto' }}>
                                    {plan.progressUpdates.map((update, idx) => (
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
                                ) : (
                                  <Typography color="textSecondary">
                                    No progress updates recorded
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Card>
                    </Box>
                  )}
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={handleSnackbarClose}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ViewImprovementPlans;