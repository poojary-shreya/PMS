import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  Paper, 
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  TextField,
  IconButton,
  Divider,
  Stack,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, differenceInMonths } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';


const HRACalculator = ({ employee_id, financial_year }) => {

  const currentYear = new Date().getFullYear();
  const financialYearOptions = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  const [entries, setEntries] = useState([
    {
      id: 1,
      employeeId: employee_id || '', 
      financialYear: financial_year || `${currentYear-1}-${currentYear}`, 
      startDate: null,
      endDate: null,
      rentPeriod: 0,
      rentAmount: '',
      hraAddress: '',
      city: '',
      landlordName: '',
      landlordPan: '',
      landlordAddress: ''
    }
  ]);
  

  useEffect(() => {
    if (employee_id || financial_year) {
      setEntries(entries.map(entry => ({
        ...entry,
        employeeId: employee_id || entry.employeeId,
        financialYear: financial_year || entry.financialYear
      })));
    }
  }, [employee_id, financial_year]);
  
  const [calculationResults, setCalculationResults] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handleInputChange = (id, field, value) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        if ((field === 'startDate' || field === 'endDate') && updatedEntry.startDate && updatedEntry.endDate) {
          const months = differenceInMonths(new Date(updatedEntry.endDate), new Date(updatedEntry.startDate)) + 1;
          updatedEntry.rentPeriod = months > 0 ? months : 0;
        }
        
        return updatedEntry;
      }
      return entry;
    });
    
    setEntries(updatedEntries);
  };

  const addEntry = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map(entry => entry.id)) + 1 : 1;
    setEntries([...entries, {
      id: newId,
      employeeId: employee_id || '', 
      financialYear: financial_year || `${currentYear-1}-${currentYear}`, 
      startDate: null,
      endDate: null,
      rentPeriod: 0,
      rentAmount: '',
      hraAddress: '',
      city: '',
      landlordName: '',
      landlordPan: '',
      landlordAddress: ''
    }]);
  };

  const deleteEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    } else {
      setSnackbar({
        open: true,
        message: 'Cannot delete the only entry',
        severity: 'error'
      });
    }
  };


  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const calculateHRA = async () => {

    const invalidEntries = entries.filter(entry => 
      !entry.employeeId || !entry.financialYear || !entry.startDate || !entry.endDate || !entry.rentAmount || 
      !entry.hraAddress || !entry.city || !entry.landlordName || 
      !entry.landlordPan || !entry.landlordAddress
    );
    
    if (invalidEntries.length > 0) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields for all entries',
        severity: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const results = [];
      
      for (const entry of entries) {
        const payload = {
          employee_id: entry.employeeId,
          financial_year: entry.financialYear,
          start_date: entry.startDate,
          end_date: entry.endDate,
          rent_amount: parseFloat(entry.rentAmount),
          hra_address: entry.hraAddress,
          city: entry.city,
          landlord_name: entry.landlordName,
          landlord_pan: entry.landlordPan,
          landlord_address: entry.landlordAddress
        };
        
        const response = await axios.post('http://localhost:5000/api/hra/calculate', payload, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (response.data.success) {
          const result = response.data.data;
          results.push({
            ...entry,
            calculationId: result.hra_calculation.hra_id,
            financialYear: result.details.financial_year,
            annualHRA: result.details.annual_hra,
            rentAnnually: result.details.rent_annually,
            effectiveRentPeriod: result.details.effective_rent_period,
            claimedHRA: result.details.claimed_hra,
            taxableHRA: result.details.taxable_hra
          });
        }
      }
      
      setCalculationResults(results);
      setOpenDialog(true);
      
      setSnackbar({
        open: true,
        message: 'HRA calculation completed successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error calculating HRA:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error calculating HRA',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
 
      <Card sx={{ m: 2, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
            HRA Calculator
          </Typography>
          
          {entries.map((entry, index) => (
            <Paper sx={{ p: 3, mb: 3, position: 'relative' }} elevation={2} key={entry.id}>
              {/* <Typography variant="h6" sx={{ mb: 2 }}>
                Entry #{index + 1}
              </Typography> */}
              
              <Grid container spacing={3}>
             
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Employee Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    variant="outlined"
                    value={entry.employeeId}
                    InputProps={{ readOnly: true }} 
                    sx={{ bgcolor: 'action.hover' }} 
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Financial Year"
                    variant="outlined"
                    value={entry.financialYear}
                    InputProps={{ readOnly: true }} 
                    sx={{ bgcolor: 'action.hover' }} 
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={entry.startDate}
                    onChange={(date) => handleInputChange(entry.id, 'startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={entry.endDate}
                    onChange={(date) => handleInputChange(entry.id, 'endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Rent Period (Months)"
                    variant="outlined"
                    type="number"
                    value={entry.rentPeriod}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rent Amount"
                    variant="outlined"
                    type="number"
                    value={entry.rentAmount}
                    onChange={(e) => handleInputChange(entry.id, 'rentAmount', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="HRA Address"
                    variant="outlined"
                    value={entry.hraAddress}
                    onChange={(e) => handleInputChange(entry.id, 'hraAddress', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    variant="outlined"
                    value={entry.city}
                    onChange={(e) => handleInputChange(entry.id, 'city', e.target.value)}
                  />
                </Grid>
                
              
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Landlord Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Landlord Name"
                    variant="outlined"
                    value={entry.landlordName}
                    onChange={(e) => handleInputChange(entry.id, 'landlordName', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN"
                    variant="outlined"
                    value={entry.landlordPan}
                    onChange={(e) => handleInputChange(entry.id, 'landlordPan', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Landlord Address"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={entry.landlordAddress}
                    onChange={(e) => handleInputChange(entry.id, 'landlordAddress', e.target.value)}
                  />
                </Grid>
              </Grid>
              
           
              <IconButton 
                color="error" 
                onClick={() => deleteEntry(entry.id)}
                sx={{ position: 'absolute', top: 10, right: 10 }}
                disabled={entries.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={addEntry}
            >
              Add Entry
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={calculateHRA}
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate HRA'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>HRA Calculation Results</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {calculationResults.map((result, index) => (
              <Paper key={result.id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Result #{index + 1} - Employee ID: {result.employeeId}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Financial Year:</strong> {result.financialYear}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Period:</strong> {formatDate(result.startDate)} - {formatDate(result.endDate)} ({result.rentPeriod} months)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Effective Rent Period:</strong> {result.effectiveRentPeriod} months
                  </Typography>
                  <Typography variant="body2">
                    <strong>Monthly Rent:</strong> ₹{parseFloat(result.rentAmount).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {result.hraAddress}, {result.city}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Landlord:</strong> {result.landlordName} (PAN: {result.landlordPan})
                  </Typography>
                  <Typography variant="body2">
                    <strong>Annual HRA:</strong> ₹{result.annualHRA.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Annual Rent:</strong> ₹{result.rentAnnually.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Claimed HRA:</strong> ₹{result.claimedHRA.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                    <strong>Taxable HRA:</strong> ₹{result.taxableHRA.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default HRACalculator;