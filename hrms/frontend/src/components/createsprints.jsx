import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateSprint = ({ projectKey, onSprintCreated, openDialog, onClose }) => {
  const [open, setOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [duration, setDuration] = useState(2);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Effect to control dialog state from parent component
  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const handleClose = () => {
    setOpen(false);
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  const resetForm = () => {
    setSprintName('');
    setSprintGoal('');
    setStartDate(null);
    setEndDate(null);
    setDuration(2);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!sprintName.trim()) {
      newErrors.sprintName = 'Sprint name is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else if (startDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Create sprint object
        const newSprint = {
          name: sprintName,
          goal: sprintGoal,
          startDate,
          endDate,
          duration,
          projectKey,
          status: 'FUTURE'
        };

        // Make API call to create sprint
        const response = await axios.post(
          'http://localhost:5000/api/sprints', 
          newSprint
        );
        
        if (response.data && response.data.status === 'success') {
          // Notify parent component with the created sprint from the server
          if (onSprintCreated) {
            onSprintCreated(response.data.data);
          }
          
          handleClose();
        } else {
          setErrors({ form: 'Failed to create sprint' });
        }
      } catch (error) {
        console.error('Error creating sprint:', error);
        setErrors({ 
          form: error.response?.data?.message || 'Failed to create sprint'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateEndDate = (start, weeks) => {
    if (!start) return;
    const end = new Date(start);
    end.setDate(end.getDate() + (weeks * 7));
    setEndDate(end);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (duration) {
      calculateEndDate(date, duration);
    }
  };

  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    if (startDate) {
      calculateEndDate(startDate, newDuration);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ borderBottom: '1px solid #dfe1e6', p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" fontWeight={500}>
            Create Sprint
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {errors.form && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="error">
              {errors.form}
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Sprint name"
              variant="outlined"
              fullWidth
              required
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              error={!!errors.sprintName}
              helperText={errors.sprintName}
              autoFocus
              placeholder="e.g. Sprint 1"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Sprint goal"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="What do you want to achieve in this sprint?"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Duration
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl variant="outlined" sx={{ minWidth: 120 }} error={!!errors.duration}>
                <Select
                  value={duration}
                  onChange={handleDurationChange}
                  displayEmpty
                  disabled={loading}
                >
                  <MenuItem value={1}>1 week</MenuItem>
                  <MenuItem value={2}>2 weeks</MenuItem>
                  <MenuItem value={3}>3 weeks</MenuItem>
                  <MenuItem value={4}>4 weeks</MenuItem>
                  <MenuItem value={6}>6 weeks</MenuItem>
                </Select>
                {errors.duration && <FormHelperText>{errors.duration}</FormHelperText>}
              </FormControl>
              <Typography variant="body2" color="textSecondary">
                Custom
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Dates
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startDate,
                        helperText: errors.startDate,
                        disabled: loading
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.endDate,
                        helperText: errors.endDate,
                        disabled: loading
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #dfe1e6' }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: '#0052CC',
            '&:hover': {
              bgcolor: '#0747A6'
            }
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSprint;