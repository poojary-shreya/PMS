// PersonalDetailsForm.jsx
import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper
} from '@mui/material';

const PersonalDetailsForm = ({ formData, setFormData }) => {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Please provide your personal identification details
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            required
            fullWidth
            label="PAN Card Number"
            name="pan_card"
            value={formData.pan_card}
            onChange={handleInputChange}
            inputProps={{ 
              maxLength: 10,
              style: { textTransform: 'uppercase' }
            }}
            helperText="10 characters alphanumeric"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            required
            fullWidth
            label="Aadhar Card Number"
            name="aadhar_card"
            value={formData.aadhar_card}
            onChange={handleInputChange}
            inputProps={{ maxLength: 12 }}
            helperText="12 digits number"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalDetailsForm;