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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,Tooltip
} from "@mui/material";
import {
  Assignment,
  RateReview,
  Feedback,
  Timeline,
  Edit,
  Delete,
  Add,
  AccountTree
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';


const BASE_URL = "http://localhost:5000"; 
const API_URL = `${BASE_URL}/api/succession-plans`;


const ManagerSuccessionPlan = () => {
  const [successionPlans, setSuccessionPlans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({
    succession: false,
    employees: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", content: "", action: null });
  const [editMode, setEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [newSuccessionPlan, setNewSuccessionPlan] = useState({
    employee_id: "",
    position: "",
    potentialSuccessors: "", 
    readinessLevel: "",
    developmentNeeds: "",
    timeline: null
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

 const fetchInitialData = async () => {
  try {
    setLoading(prev => ({ ...prev, employees: true, succession: true }));
    
 
    try {
      const employeesResponse = await axios.get(`${BASE_URL}/api/employees`);
      setEmployees(employeesResponse.data);
    } catch (employeeError) {
      console.error('Error fetching employees:', employeeError);
    
      setEmployees([
        { employee_id: '1', firstName: 'John', lastName: 'Doe' },
        { employee_id: '2', firstName: 'Jane', lastName: 'Smith' },
   
      ]);
    }
    
 
    try {
      const plansResponse = await axios.get(API_URL);
      setSuccessionPlans(plansResponse.data);
    } catch (plansError) {
      console.error('Error fetching succession plans:', plansError);
 
      setSuccessionPlans([]);
    }
  } catch (error) {
    console.error('Error in fetchInitialData:', error);
  } finally {
    setLoading(prev => ({ ...prev, employees: false, succession: false }));
  }
};
  

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return; 
    }
    setOpen(false); 
};


  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConfirmDialogOpen = (title, content, action) => {
    setConfirmDialog({ open: true, title, content, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const resetForm = () => {
    setNewSuccessionPlan({
      employee_id: "",
      position: "",
      potentialSuccessors: "",
      readinessLevel: "",
      developmentNeeds: "",
      timeline: ""
    });
    setEditMode(false);
    setCurrentPlanId(null);
  };

  const validateForm = () => {
    const { employee_id, position, readinessLevel, developmentNeeds } = newSuccessionPlan;
    return employee_id && position && readinessLevel && developmentNeeds;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      handleSnackbarOpen("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, succession: true }));
      
   
      const payload = {
        ...newSuccessionPlan,
        potentialSuccessors: String(newSuccessionPlan.potentialSuccessors || '')
      };

      if (editMode) {
        try {
          const response = await axios.put(`${API_URL}/${currentPlanId}`, payload, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          setSuccessionPlans(successionPlans.map(plan => 
            plan.id === currentPlanId ? response.data : plan
          ));
          handleSnackbarOpen("Plan updated successfully", "success");
        } catch (error) {
          console.error("Error updating plan:", error);
          
       
          const mockUpdatedPlan = {
            ...successionPlans.find(p => p.id === currentPlanId),
            ...payload,
            id: currentPlanId
          };
          
          setSuccessionPlans(successionPlans.map(plan => 
            plan.id === currentPlanId ? mockUpdatedPlan : plan
          ));
          
          handleSnackbarOpen("Plan updated in UI only - API error occurred", "warning");
        }
      } else {
        try {
          const response = await axios.post(API_URL, payload, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          setSuccessionPlans([...successionPlans, response.data]);
          handleSnackbarOpen("Plan created successfully", "success");
        } catch (error) {
          console.error("Error creating plan:", error);
          
   
          const mockPlan = {
            ...payload,
            id: `temp-${Date.now()}`
          };
          
          setSuccessionPlans([...successionPlans, mockPlan]);
          handleSnackbarOpen("Plan added to UI only - API error occurred", "warning");
        }
      }
      
      resetForm();
    } catch (error) {
      console.error("Error submitting plan:", error);
      handleSnackbarOpen(
        `Error: ${error.response?.data?.error || "Failed to save plan"}`,
        "error"
      );
    } finally {
      setLoading(prev => ({ ...prev, succession: false }));
    }
  };

  const handleDeleteSuccessionPlan = (id) => {
    handleConfirmDialogOpen(
      "Delete Succession Plan",
      "Are you sure you want to delete this succession plan? This action cannot be undone.",
      async () => {
        try {
          await axios.delete(`${API_URL}/${id}`);
          setSuccessionPlans(successionPlans.filter(plan => plan.id !== id));
          handleSnackbarOpen("Plan deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting plan:", error);
          
      
          setSuccessionPlans(successionPlans.filter(plan => plan.id !== id));
          handleSnackbarOpen("Plan removed from UI only - API error occurred", "warning");
        }
        handleConfirmDialogClose();
      }
    );
  };

  const handleEditSuccessionPlan = (plan) => {
 
    setNewSuccessionPlan({
      employee_id: plan.employee_id,
      position: plan.position,
      potentialSuccessors: typeof plan.potentialSuccessors === 'string' ? plan.potentialSuccessors : '',
      readinessLevel: plan.readinessLevel,
      developmentNeeds: plan.developmentNeeds,
      timeline: plan.timeline
    });
    setEditMode(true);
    setCurrentPlanId(plan.id);
  };


  const getEmployeeName = (id) => {
    const employee = employees.find(emp => emp.employee_id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee";
  };


  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return String(dateString);
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

        <Box sx={{ mt: 3 }}>
          {loading.succession && <LinearProgress sx={{ mb: 2 }} />}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                    <AccountTree sx={{ mr: 1 }} /> {editMode ? "Edit Succession Plan" : "Create Succession Plan"}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth margin="normal" required>
                  <Tooltip title="Select the employee who currently holds this position" placement="top" arrow>
  <TextField
    label="Current Employee"
    value={newSuccessionPlan.employee_id}
    onChange={(e) =>
      setNewSuccessionPlan({
        ...newSuccessionPlan,
        employee_id: e.target.value
      })
    }
    disabled={loading.employees}
  />
  </Tooltip>
</FormControl>

                  
            <Tooltip title="Enter the title of the position for this succession plan" placement="top" arrow>
                  <TextField
                    fullWidth
                    label="Position"
                    value={newSuccessionPlan.position}
                    onChange={(e) => setNewSuccessionPlan({...newSuccessionPlan, position: e.target.value})}
                    margin="normal"
                    required
                  /></Tooltip>
                  <Tooltip title="List potential candidates who could fill this position in the future (separate multiple names with commas)" placement="top" arrow>
                  <TextField
                    fullWidth
                    label="Potential Successors"
                    value={newSuccessionPlan.potentialSuccessors}
                    onChange={(e) => setNewSuccessionPlan({...newSuccessionPlan, potentialSuccessors: e.target.value})}
                    margin="normal"
                    placeholder="Comma-separated list of candidates"
                  />
                  </Tooltip>
                  <Tooltip title="Estimate how soon the successor(s) will be ready to assume the position" placement="top" arrow>
                  <FormControl fullWidth margin="normal" required>
                 
                    <InputLabel>Readiness Level</InputLabel>
                    <Select
                      value={newSuccessionPlan.readinessLevel}
                      onChange={(e) => setNewSuccessionPlan({...newSuccessionPlan, readinessLevel: e.target.value})}
                      label="Readiness Level"
                    >
                      <MenuItem value=""><em>Select Readiness</em></MenuItem>
                      <MenuItem value="Ready Now">Ready Now</MenuItem>
                      <MenuItem value="0-6 months">0-6 months</MenuItem>
                      <MenuItem value="6-12 months">6-12 months</MenuItem>
                      <MenuItem value="1-2 years">1-2 years</MenuItem>
                      <MenuItem value="2+ years">2+ years</MenuItem>
                    </Select>

                  </FormControl>
                  </Tooltip>
            <Tooltip title="Describe specific skills, training, or experiences that potential successors need to develop" placement="top" arrow>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Development Needs"
                    value={newSuccessionPlan.developmentNeeds}
                    onChange={(e) => setNewSuccessionPlan({...newSuccessionPlan, developmentNeeds: e.target.value})}
                    margin="normal"
                    placeholder="Skills and experiences needed for potential successors..."
                    required
                  />
                  </Tooltip>
                  <DatePicker
                    label="Target Timeline"
                    value={newSuccessionPlan.timeline ? new Date(newSuccessionPlan.timeline) : null}
                    onChange={(date) => setNewSuccessionPlan({...newSuccessionPlan, timeline: date ? date.toISOString().split('T')[0] : null})}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      startIcon={editMode ? <Edit /> : <Add />}
                      onClick={handleSubmit}
                      sx={{ bgcolor: '#1976d2', color: 'white' }}
                      disabled={loading.succession}
                    >
                      {editMode ? "Update Plan" : "Create Plan"}
                    </Button>
                    
                    {editMode && (
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        sx={{ ml: 1 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper elevation={3}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountTree sx={{ mr: 1 }} /> Active Succession Plans ({successionPlans.length})
                  </Typography>
                </Box>
                
                <Divider />
                
                <List sx={{ maxHeight: '650px', overflow: 'auto', p: 0 }}>
                  {successionPlans.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="textSecondary">No succession plans available</Typography>
                    </Box>
                  ) : (
                    successionPlans.map((plan) => (
                      <React.Fragment key={plan.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            borderLeft: '4px solid #1976d2',
                            '&:hover': { bgcolor: '#f5f5f5' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight="medium">
                                
                              {plan.personal ? `${plan.personal.firstName} ${plan.personal.lastName}` : 'Unknown Employee'} - {plan.position}
                            </Typography>
                            }
                            secondary={
                              <React.Fragment>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" component="span" color="textPrimary">
                                      <strong>Readiness:</strong> {plan.readinessLevel}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" component="span" color="textPrimary">
                                      <strong>Timeline:</strong> {formatDate(plan.timeline)}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="textPrimary">
                                      <strong>Potential Successors:</strong> {plan.potentialSuccessors || "None specified"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="textPrimary">
                                      <strong>Development Needs:</strong> {plan.developmentNeeds}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </React.Fragment>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => handleEditSuccessionPlan(plan)}
                              sx={{ color: '#1976d2' }}
                            >
                              <Edit />
                            </IconButton>
                           
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>

      
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

     
        <Dialog
          open={confirmDialog.open}
          onClose={handleConfirmDialogClose}
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.content}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDialog.action} color="error" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default ManagerSuccessionPlan;