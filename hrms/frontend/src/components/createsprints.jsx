import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl,
  Grid,
  Typography,
  Box,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CreateSprint = ({ projectKey, openDialog, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: null,
    endDate: null,
    duration: 2, // Default 2 weeks
    status: 'FUTURE',
    projectKey: projectKey || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate, durationWeeks) => {
    if (!startDate) return null;
    
    const date = new Date(startDate);
    date.setDate(date.getDate() + (durationWeeks * 7));
    return date;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If changing duration, recalculate end date
    if (name === 'duration' && formData.startDate) {
      setFormData(prev => ({
        ...prev,
        endDate: calculateEndDate(prev.startDate, value)
      }));
    }
  };

  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date
    });
    
    // If changing start date, recalculate end date
    if (field === 'startDate') {
      setFormData(prev => ({
        ...prev,
        endDate: calculateEndDate(date, prev.duration)
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        projectKey: projectKey
      };
      
      const response = await axios.post('http://localhost:5000/api/sprints', payload);
      
      if (response.data && response.data.success) {
        setNotification({
          open: true,
          message: 'Sprint created successfully',
          severity: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          goal: '',
          startDate: null,
          endDate: null,
          duration: 2,
          status: 'FUTURE',
          projectKey: projectKey || ''
        });
        
        // Close dialog after successful creation
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Error creating sprint',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Dialog 
        open={openDialog} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Sprint</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Sprint Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder={`${projectKey} Sprint 1`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="goal"
                  label="Sprint Goal"
                  value={formData.goal}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="What do you want to achieve in this sprint?"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="duration-label">Duration (weeks)</InputLabel>
                  <Select
                    labelId="duration-label"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    label="Duration (weeks)"
                  >
                    {[1, 2, 3, 4, 6, 8].map(weeks => (
                      <MenuItem key={weeks} value={weeks}>
                        {weeks} {weeks === 1 ? 'week' : 'weeks'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                      />
                    )}
                    readOnly
                  />
                </LocalizationProvider>
                <FormHelperText>End date is calculated based on start date and duration</FormHelperText>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="FUTURE">Future</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Sprint'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateSprint;