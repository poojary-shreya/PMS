import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
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
  LinearProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Tooltip
} from "@mui/material";
import {
  Assignment,
  RateReview,
  Feedback,
  Timeline,
  Delete,
  Add,
  AccountTree,
  Refresh,
  PersonOutline,
  Edit,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import format from 'date-fns/format';

const ImprovementManagement = () => {
  const [pip, setPip] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", content: "", action: null });
  const [employees, setEmployees] = useState([]);
  const [expandedPipId, setExpandedPipId] = useState(null);
  const [loading, setLoading] = useState({
    pip: false,
    employees: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [newPIP, setNewPIP] = useState({
    employee_id: "",
    reason: "",
    objectives: "",
    startDate: null,
    endDate: null,
    milestones: "",
    meetingFrequency: "Weekly",
    status: "Active",
    progress: 0
  });


  useEffect(() => {
    fetchInitialData();
  }, []);
  const toggleExpandPIP = (pipId) => {
    setExpandedPipId(prev => prev === pipId ? null : pipId);
  };

  const fetchInitialData = async () => {
    try {
      setLoading({ ...loading, pip: true, employees: true });


      const pipResponse = await axios.get('http://localhost:5000/api/improvement-plans');
      console.log("Fetched PIP data:", pipResponse.data);
      setPip(pipResponse.data);


      try {
        const empResponse = await axios.get('http://localhost:5000/api/improvement-plans/employees');
        setEmployees(empResponse.data);
      } catch (empError) {
        console.error("Could not fetch employees:", empError);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      openSnackbar(`Failed to load data: ${error.message}`, 'error');
    } finally {
      setLoading({ ...loading, pip: false, employees: false });
    }
  };

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmDialogOpen = (title, content, action) => {
    setConfirmDialog({ open: true, title, content, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const executeConfirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    handleConfirmDialogClose();
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const addPIP = async () => {

    if (!newPIP.employee_id || !newPIP.reason || !newPIP.objectives || !newPIP.startDate || !newPIP.endDate) {
      openSnackbar("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading({ ...loading, pip: true });

      const payload = {
        ...newPIP,
        startDate: formatDateForAPI(newPIP.startDate),
        endDate: formatDateForAPI(newPIP.endDate)
      };

      console.log("Sending PIP payload:", payload);

      const response = await axios.post("http://localhost:5000/api/improvement-plans", payload);
      console.log("PIP created successfully:", response.data);

      setPip([response.data, ...pip]);


      setNewPIP({
        employee_id: "",
        reason: "",
        objectives: "",
        startDate: null,
        endDate: null,
        milestones: "",
        meetingFrequency: "Weekly",
        status: "Active",
        progress: 0
      });

      openSnackbar("Improvement Plan created successfully");
    } catch (error) {
      console.error("Error creating PIP:", error.response?.data || error.message);
      openSnackbar(`Failed to create plan: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setLoading({ ...loading, pip: false });
    }
  };

  const updatePIPStatus = async (id, newStatus) => {
    try {
      setLoading({ ...loading, pip: true });

      const response = await axios.put(`http://localhost:5000/api/improvement-plans/${id}`, { status: newStatus });
      console.log("PIP updated successfully:", response.data);


      setPip(pip.map(plan => plan.id === id ? response.data : plan));

      openSnackbar("PIP status updated successfully");
    } catch (error) {
      console.error("Error updating PIP:", error);
      openSnackbar(`Failed to update status: ${error.message}`, "error");
    } finally {
      setLoading({ ...loading, pip: false });
    }
  };

  const updatePIPProgress = async (id, newProgress) => {
    try {
      setLoading({ ...loading, pip: true });

      const response = await axios.put(`http://localhost:5000/api/improvement-plans/${id}`, { progress: newProgress });
      console.log("Progress updated successfully:", response.data);


      setPip(pip.map(plan => plan.id === id ? response.data : plan));

      openSnackbar("Progress updated successfully");
    } catch (error) {
      console.error("Error updating progress:", error);
      openSnackbar(`Failed to update progress: ${error.message}`, "error");
    } finally {
      setLoading({ ...loading, pip: false });
    }
  };

  const handleDeletePIP = (id) => {
    handleConfirmDialogOpen(
      "Delete Improvement Plan",
      "Are you sure you want to delete this plan? This action cannot be undone.",
      async () => {
        try {
          setLoading({ ...loading, pip: true });

          await axios.delete(`http://localhost:5000/api/improvement-plans/${id}`);


          setPip(pip.filter(plan => plan.id !== id));

          openSnackbar("Improvement plan deleted successfully");
        } catch (error) {
          console.error("Error deleting PIP:", error);
          // openSnackbar(`Failed to delete plan: ${error.message}`, "error");
        } finally {
          setLoading({ ...loading, pip: false });
        }
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "info";
      case "In Progress": return "warning";
      case "Completed": return "success";
      case "Extended": return "error";
      default: return "default";
    }
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

        {location.pathname === '/improve' && (
          <Box sx={{ mt: 3 }}>
            {loading.pip && (
              <LinearProgress color="primary" sx={{ mb: 2 }} />
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                      <Timeline sx={{ mr: 1 }} /> Create Improvement Plan
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>

                      <FormControl fullWidth variant="outlined">
                        <TextField
                          label="Employee ID"
                          variant="outlined"
                          fullWidth
                          value={newPIP.employee_id}
                          onChange={(e) => setNewPIP({ ...newPIP, employee_id: e.target.value })}
                          required
                          placeholder="Employee ID"

                          sx={{ mb: 2 }}
                        />
                      </FormControl>

                    </Box>
                    <Tooltip title="Specify the primary reason this improvement plan is being created" placement="top" arrow>
                    <TextField
                      fullWidth
                      label="Reason for Plan"
                      value={newPIP.reason}
                      onChange={(e) => setNewPIP({ ...newPIP, reason: e.target.value })}
                      margin="normal"
                      required
                      variant="outlined"
                      placeholder="E.g., Performance improvement, Skill development"
                      sx={{ mb: 2 }}
                    />
</Tooltip>
<Tooltip title="List specific, measurable objectives the employee needs to achieve" placement="top" arrow>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Objectives"
                      value={newPIP.objectives}
                      onChange={(e) => setNewPIP({ ...newPIP, objectives: e.target.value })}
                      margin="normal"
                      placeholder="Clear objectives that need to be achieved..."
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
</Tooltip>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <DatePicker
                          label="Start Date"
                          value={newPIP.startDate}
                          onChange={(date) => setNewPIP({ ...newPIP, startDate: date })}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth required variant="outlined" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DatePicker
                          label="End Date"
                          value={newPIP.endDate}
                          onChange={(date) => setNewPIP({ ...newPIP, endDate: date })}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth required variant="outlined" />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Tooltip title="Define specific checkpoints to measure progress during the plan period" placement="top" arrow>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Key Milestones"
                      value={newPIP.milestones}
                      onChange={(e) => setNewPIP({ ...newPIP, milestones: e.target.value })}
                      margin="normal"
                      placeholder="Specific milestones to track progress..."
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
</Tooltip>
<Tooltip title="Determine how often progress meetings should be scheduled" placement="top" arrow>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Meeting Frequency</InputLabel>
                      <Select
                        value={newPIP.meetingFrequency}
                        onChange={(e) => setNewPIP({ ...newPIP, meetingFrequency: e.target.value })}
                        label="Meeting Frequency"
                      >
                        <MenuItem value="Daily">Daily</MenuItem>
                        <MenuItem value="Weekly">Weekly</MenuItem>
                        <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                        <MenuItem value="Monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                    </Tooltip>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={addPIP}
                      startIcon={<Add />}
                      disabled={loading.pip}
                      sx={{ mt: 2 }}
                    >
                      Create Improvement Plan
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', }}>
                        <Assignment sx={{ mr: 1 }} /> Active Improvement Plans
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {pip.length > 0 ? (
                      <List>
                        {pip.map((plan) => (
                          <React.Fragment key={plan.id}>
                            <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
                              <ListItem button onClick={() => toggleExpandPIP(plan.id)}>
                                <ListItemText

                                  primary={
                                    <Typography variant="subtitle1">
                                      {plan.personal.firstName || ' Employee'} (ID: {plan.employee_id})
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="caption" color="textSecondary">
                                        {format(new Date(plan.startDate), 'MMM dd, yyyy')} -
                                        {format(new Date(plan.endDate), 'MMM dd, yyyy')}
                                      </Typography>
                                      <Chip
                                        label={plan.status}
                                        size="small"
                                        color={getStatusColor(plan.status)}
                                        sx={{ ml: 100 }}
                                      />

                                      <Typography variant="body2" color="textSecondary">
                                        <strong>Reason:</strong> {plan.reason}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        <strong>Meeting Frequency:</strong> {plan.meetingFrequency}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        <strong>Objectives:</strong> {plan.objectives}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        <strong>Key Milestones:</strong> {plan.milestones}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>

                              {expandedPipId === plan.id && (
                                <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                  <Grid container spacing={2}>




                                    <Grid item xs={12}>
                                      <Divider sx={{ my: 2 }} />
                                      <Typography variant="subtitle1" gutterBottom>
                                        Progress History
                                      </Typography>
                                      {plan.progressUpdates?.length > 0 ? (
                                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                          {plan.progressUpdates.map((update, index) => (
                                            <Paper
                                              key={index}
                                              sx={{
                                                p: 2,
                                                mb: 2,
                                                borderLeft: 4,
                                                borderColor: getStatusColor(update.status) === 'error'
                                                  ? '#f44336'
                                                  : getStatusColor(update.status) === 'warning'
                                                    ? '#ff9800'
                                                    : '#2196f3'
                                              }}
                                            >
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" fontWeight="bold">
                                                  {format(new Date(update.date), 'MMM dd, yyyy - hh:mm a')}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                  <Chip
                                                    label={update.status}
                                                    size="small"
                                                    color={getStatusColor(update.status)}
                                                  />
                                                  <Chip
                                                    label={`${update.progress}%`}
                                                    size="small"
                                                    color={
                                                      update.progress === 100 ? "success" :
                                                        update.progress >= 50 ? "primary" : "warning"
                                                    }
                                                  />
                                                </Box>
                                              </Box>
                                              {update.taskCompletion && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                  <strong>Tasks Completed:</strong> {update.taskCompletion}
                                                </Typography>
                                              )}
                                              {update.note && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                  {update.note}
                                                </Typography>
                                              )}
                                            </Paper>
                                          ))}
                                        </Box>
                                      ) : (
                                        <Typography color="textSecondary">
                                          No progress updates recorded
                                        </Typography>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Box>
                              )}
                            </Paper>
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography sx={{ textAlign: 'center', py: 4 }}>
                        No active improvement plans found
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}


        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>


        <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose}>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{confirmDialog.content}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose}>Cancel</Button>
            <Button onClick={executeConfirmAction} color="error" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default ImprovementManagement;