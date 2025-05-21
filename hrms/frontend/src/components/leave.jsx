import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  BeachAccessOutlined,
  LocalHospitalOutlined,
  EventAvailableOutlined,
} from '@mui/icons-material';
import axios from 'axios';

const LeaveManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [employee_id, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [lastDayType, setLastDayType] = useState('full');
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 20,
    sick: 10,
    casual: 14,
  });
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [managerData, setManagerData] = useState(null);

 
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
      
        const response = await axios.get("http://localhost:5000/api/user/current", 
          { withCredentials: true });
        console.log("Current user data:", response.data);
        
        if (response.data && response.data.employee_id) {
          setEmployeeId(response.data.employee_id);
          
         
          if (response.data.email) {
            setEmail(response.data.email);
          }
          
          if (response.data.companyemail) {
            setEmail(response.data.companyemail);
          }
          
          setEmployeeData(response.data);
          
         
          await fetchManagerInfo(response.data.employee_id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const fetchManagerInfo = async (employeeId) => {
    if (!employeeId) return;
    
    try {
      
      const roleResponse = await axios.get(
        `http://localhost:5000/api/roles/${employeeId}`,
        { withCredentials: true }
      );
      
      console.log("Employee role data:", roleResponse.data);
      
  
      if (roleResponse.data && roleResponse.data.data) {
        const roleData = roleResponse.data.data;
        
        if (roleData.reportingManager) {
       
          setManagerEmail(roleData.reportingManager);
          setManagerData(roleData);
          return;
        }
      }
      
    
      const managerResponse = await axios.get(
        `http://localhost:5000/api/leaves/manager/${employeeId}`,
        { withCredentials: true }
      );
      
      if (managerResponse.data && managerResponse.data.manager_email) {
        setManagerEmail(managerResponse.data.manager_email);
        setManagerData(managerResponse.data);
      }
    } catch (roleErr) {
      console.error("Error fetching employee's manager:", roleErr);
      
    
      try {
        const managerResponse = await axios.get(
          `http://localhost:5000/api/leaves/manager/${employeeId}`,
          { withCredentials: true }
        );
        
        if (managerResponse.data && managerResponse.data.manager_email) {
          setManagerEmail(managerResponse.data.manager_email);
          setManagerData(managerResponse.data);
        }
      } catch (managerErr) {
        console.error("Error fetching from manager endpoint:", managerErr);
      }
    }
  };

  useEffect(() => {
    if (employee_id && employee_id.trim()) {
      console.log("Fetching leave data for employee:", employee_id);
      fetchLeaveData();
    }
  }, [employee_id]);

  const fetchLeaveData = async () => {
    console.log("Starting fetchLeaveData with employee_id:", employee_id);
    
    setLoading(true);
    try {
      console.log("Fetching balance and history data...");
      
      const balanceRes = await axios.get("http://localhost:5000/api/leaves/balance", 
        { withCredentials: true });
      
      console.log("Balance response status:", balanceRes.status);
      
      const historyRes = await axios.get("http://localhost:5000/api/leaves/history", 
        { withCredentials: true });
      
      console.log("History response status:", historyRes.status);

    
      const balanceData = balanceRes.data;
      const displayBalance = {
        annual: balanceData.annual || 0,
        sick: balanceData.sick || 0,
        casual: balanceData.casual || 0
      };
      
      console.log("Filtered balance data:", displayBalance);
      console.log("History data:", historyRes.data);

      setLeaveBalance(displayBalance);
      setLeaves(historyRes.data);
    } catch (error) {
      console.error('Fetch Error:', error);
  
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch leave data';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Please select valid dates');
      return false;
    }
    
    if (start > end) {
      alert('End date cannot be before start date');
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      alert('Start date cannot be in the past');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !leaveType || !reason || !email || !managerEmail) {
      alert('Please fill all required fields');
      return;
    }
    
    if (!validateDates()) {
      return;
    }
  
    try {
      const payload = {
        email,
        managerEmail,
        leaveType,
        startDate,
        endDate,
        reason,
        lastDayType
      };
  
      setLoading(true);
      console.log('Submitting leave application with payload:', payload);
      
      const response = await axios.post('http://localhost:5000/api/leaves/apply', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
  
      console.log('Leave application response:', response.data);
      
      await fetchLeaveData();
      setOpenDialog(false);
      alert('Leave submitted successfully! Email notifications have been sent.');
  

      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setLastDayType('full');
    } catch (error) {
      console.error('Submission Error:', error);
      
      let errorMessage = 'Failed to submit leave application';
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        errorMessage = error.response.data.error || 
                     error.response.data.details ||
                     'Server returned an error';
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response received from server. Please check your network connection.';
      } else {
        errorMessage = error.message || 'An unknown error occurred';
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="1500px" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align='center' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Leave Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Employee ID"
            value={employee_id}
            InputProps={{
              readOnly: true,
            }}
            sx={{ width: 300 }}
          />
          
          <Button
            variant="contained"
            onClick={fetchLeaveData}
            disabled={!employee_id || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Load Data'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Leave Balance</Typography>
            {Object.entries(leaveBalance).map(([type, balance]) => (
              <Paper key={type} sx={{ p: 2, my: 1, display: 'flex', alignItems: 'center' }}>
                {type === 'annual' && <BeachAccessOutlined color="primary" sx={{ mr: 2 }} />}
                {type === 'sick' && <LocalHospitalOutlined color="primary" sx={{ mr: 2 }} />}
                {type === 'casual' && <EventAvailableOutlined color="primary" sx={{ mr: 2 }} />}
                <Typography variant="subtitle1" textTransform="capitalize">
                  {type} Leave: {balance} days
                </Typography>
              </Paper>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Leave History</Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                disabled={!employee_id}
                aria-label="Apply leave"
              >
                Apply Leave
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : leaves.length === 0 ? (
              <Typography variant="body1">No leave history found</Typography>
            ) : (
              leaves.map(leave => (
                <Paper key={leave.id} sx={{
                  p: 2, my: 1, borderLeft: '4px solid', borderColor:
                    leave.status === 'Approved' ? 'success.main' :
                      leave.status === 'Rejected' ? 'error.main' : 
                      leave.status === 'Cancelled' ? 'grey.500' : 'warning.main'
                }}>
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">Leave Type:</Typography>
                      <Typography variant="body1" fontWeight="medium" textTransform="capitalize">{leave.leaveType}</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="subtitle2" color="text.secondary">Duration:</Typography>
                      <Typography variant="body1">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {leave.endDate !== leave.startDate &&
                          ` to ${new Date(leave.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        }
                        {leave.lastDay && ' (last day half)'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                      <Chip
                        label={leave.status}
                        color={
                          leave.status === 'Approved' ? 'success' :
                            leave.status === 'Rejected' ? 'error' : 
                            leave.status === 'Cancelled' ? 'default' : 'warning'
                        }
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Reason:</Typography>
                      <Typography variant="body2">{leave.reason}</Typography>
                    </Grid>
                    {leave.manager_comment && (
                      <Grid item xs={12} sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Manager Comment:</Typography>
                        <Typography variant="body2" fontStyle="italic">{leave.manager_comment}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="leave-dialog-title"
        aria-describedby="leave-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="leave-dialog-title">
          Apply for Leave
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Employee ID"
                value={employee_id}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Manager Email"
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                fullWidth
                required
               
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={leaveType}
                  label="Leave Type"
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <MenuItem value="annual">Annual</MenuItem>
                  <MenuItem value="sick">Sick</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                required
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                required
                inputProps={{
                  min: startDate || new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Last Day Type</InputLabel>
                <Select
                  label="Last Day Type"
                  value={lastDayType}
                  onChange={(e) => setLastDayType(e.target.value)}
                >
                  <MenuItem value="full">Full Day</MenuItem>
                  <MenuItem value="half">Half Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason"
                multiline
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !leaveType || !startDate || !endDate || !reason || !email || !managerEmail}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveManagement;