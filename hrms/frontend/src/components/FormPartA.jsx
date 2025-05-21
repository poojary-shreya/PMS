import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box,
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import { useNavigate } from 'react-router-dom';
import { TourOutlined } from '@mui/icons-material';

const SimpleTaxFormCreation = () => {

    const navigate =useNavigate();
  // State for form inputs
  const [employeeId, setEmployeeId] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [financialYearFrom, setFinancialYearFrom] = useState(null);
  const [financialYearTo, setFinancialYearTo] = useState(null);
  const [assessmentYear, setAssessmentYear] = useState('');
  const [employerPan, setEmployerPan] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [employerAddress, setEmployerAddress] = useState('');
  const [cit, setcit] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true); // Set to true initially
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // Use effect to open dialog when component mounts
  useEffect(() => {
    setDialogOpen(true);
  }, []);

  // Open the employee search dialog
  const openEmployeeDialog = () => {
    setDialogOpen(true);
  };

  // Close the employee search dialog
  const closeEmployeeDialog = () => {
    setDialogOpen(false);
  };

  // Fetch employee details when search button is clicked in dialog
  const fetchEmployeeDetails = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/form16A/employee/${employeeId}`);
      console.log(response);
      setEmployeeData(response.data.data);
    //   setEmployerPan(response.data.data.company.tan || '');
      closeEmployeeDialog();
      setNotification({
        open: true,
        message: 'Employee details loaded successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch employee details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tax form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeData || !financialYearFrom || !financialYearTo) {
      setNotification({
        open: true,
        message: 'Please fill all required fields',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const formattedFromDate = new Date(
        financialYearFrom.getFullYear(),
        financialYearFrom.getMonth(),
        1  // First day of the month
      );
      
      // End date should be the last day of the month
      const lastDay = new Date(
        financialYearTo.getFullYear(),
        financialYearTo.getMonth() + 1,
        0  // Setting day 0 of next month gives the last day of current month
      ).getDate();
      
      const formattedToDate = new Date(
        financialYearTo.getFullYear(),
        financialYearTo.getMonth(),
        lastDay  // Last day of the month
      );




      const payload = {
        employee_id: employeeId,
        employer_name:employerName,
        employer_address:employerAddress,
        employer_pan:employerPan,
        cit:cit,
        assessment_year: assessmentYear,
        financial_year_from: formattedFromDate.toISOString(),
        financial_year_to: formattedToDate.toISOString(),
      };

      const response = await axios.post('http://localhost:5000/api/form16A/create', payload);
      console.log(response);
      console.log(response.data.certifiacte_no);
      setNotification({
        open: true,
        message: 'Tax form submitted successfully',
        type: 'success'
      });
      const certificateNo = response.data?.data?.certifiacte_no || 
      response.data?.data?.certificate_no ||
      response.data?.certifiacte_no || 
      response.data?.certificate_no ||
      '';

console.log('Certificate number extracted:', certificateNo); 
      
      navigate('/form16-partB', { 
        state: { 
          employeeId: employeeId, 
          certificateNo: certificateNo,
        } 
      });
      // Reset form after successful submission
      setEmployeeData(null);
      setEmployeeId('');
      setFinancialYearFrom(null);
      setFinancialYearTo(null);
      setAssessmentYear('');
      setEmployerPan('');
      setEmployerName('');
      setEmployerAddress('');
      setcit('');
      
    } catch (error) {
      console.error('Error creating tax form:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to create tax form',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Update assessment year when financial year changes
  const updateAssessmentYear = (date) => {
    if (date) {
      const toYear = date.getFullYear();
      setFinancialYearTo(date);
      setAssessmentYear(`${toYear}-${toYear + 1}`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container fullWidth sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Tax Form Creation
        </Typography>

        {/* Button to reopen dialog when needed */}
        {!dialogOpen && (
          <Box display="flex" justifyContent="left" mt={3}>
            <Button variant="contained" color="primary" onClick={openEmployeeDialog}>
              Select Employee
            </Button>
          </Box>
        )}

        {/* Employee Search Dialog */}
        <Dialog open={dialogOpen} onClose={closeEmployeeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Enter Employee ID
            <IconButton 
              onClick={closeEmployeeDialog} 
              sx={{ position: "absolute", right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Employee ID"
              fullWidth
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <Box display="flex" justifyContent="center" mt={3} gap={2}>
              <Button 
                onClick={fetchEmployeeDetails} 
                disabled={!employeeId || loading}
                variant="contained"
                color="primary"
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
              <Button variant="outlined" color="secondary" onClick={closeEmployeeDialog}>
                Cancel
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Main Form */}
        {employeeData && (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Employee & Company Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Employee Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={employeeId}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    value={employeeData.employee.name || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee PAN"
                    value={employeeData.employee.panNumber || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Address"
                    value={employeeData.employee.address || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Employeer Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={employeeData.company.name || 'N/A'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Company TAN"
                    value={employeeData.company.tan||"N/A"}
                    InputProps={{ readOnly: true }}
                    onChange={(e) => setEmployerPan(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employer Name"
                    value={employerName}
                    onChange={(e)=>setEmployerName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employer Address"
                    value={employerAddress}
                    onChange={(e)=>setEmployerAddress(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employer Pan"
                    value={employerPan}
                    onChange={(e)=>setEmployerPan(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Tooltip title="Tax office where your employer files TDS" placement='top'arrow>
                  <TextField
                    fullWidth
                    label="CIT(Commissioner of Income Tax)"
                    value={cit}
                    onChange={(e)=>setcit(e.target.value)}
                    required
                  />
                  </Tooltip>
                </Grid>
                
                

                {/* Financial Year Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Financial Year Details
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                <Tooltip title="Financial year begins in April. Select April and the starting year" placement='top' arrow>
                <Box>
                  
                  <DatePicker
                    label="Financial Year From"
                    value={financialYearFrom}
                    onChange={(newValue) => setFinancialYearFrom(newValue)}
                    renderInput={(params) => (

                      <TextField {...params} fullWidth required />
                    )}
                    views={['year', 'month']}
                  />
                  </Box>
                  </Tooltip>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                <Tooltip title="Financial year end in March. Select March and the ending year" placement='top' arrow>
                  <Box>
                <DatePicker
                    label="Financial Year To"
                    value={financialYearTo}
                    onChange={updateAssessmentYear}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required />
                    )}
                    views={['year', 'month']}
                  />             
                       </Box>

                  </Tooltip>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Tooltip title="enter the Assessment year" placement='top' arrow>
                  <TextField
                    fullWidth
                    required
                    label="Assessment Year"
                    value={assessmentYear}
                    onChange={(e) => setAssessmentYear(e.target.value)}
                  />
                  </Tooltip>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Tax Form'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {/* Notification */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={5000} 
          onClose={handleCloseNotification}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.type} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default SimpleTaxFormCreation;