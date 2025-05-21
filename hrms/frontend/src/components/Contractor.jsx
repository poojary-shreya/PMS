import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Grid,
  Container,
  Typography,
  Button,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  InputLabel,
  FormControl,
  Select,
  Box,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ContractorForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Determine if we're in edit mode
  const isEditMode = location.state?.isEdit || params.id;
  const contractorId = location.state?.employee_id || params.id;

  // Role types from the controller
  const roleTypes = [
    "CEO", 
    "CTO", 
    "Board of directors", 
    "Section manager/Department manager", 
    "Manager", 
    "HR Manager", 
    "Hiring Manager", 
    "Principal engineer/Architect", 
    "Team Lead", 
    "Senior Software Engineer", 
    "Software Engineer", 
    "Junior Software Engineer", 
    "Intern"
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    aadhaarNumber: '',
    gender: '',
    panNumber: '',
    companyName: '',
    projectBudget: '',
    contractStartDate: null,
    contractEndDate: null,
    contractDuration: '',
    employmentType: 'Contractor',
    designation: '',
    department: '',
    roleType: '',
    reportingManager: '',
    status: 'active',
  });

  // Added state for API communication
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [files, setFiles] = useState({
    aadharCard: null,
    panCard: null
  });
  const [existingFiles, setExistingFiles] = useState({
    aadharCard: '',
    panCard: ''
  });

  // Fetch contractor data when in edit mode
  useEffect(() => {
    const fetchContractorData = async () => {
      if (isEditMode && contractorId) {
        try {
          setFetchLoading(true);
          const response = await axios.get(`http://localhost:5000/api/contract/${contractorId}`);
          
          if (response.data.success && response.data.data) {
            const contractorData = response.data.data;
            
            // Format dates from string to Date objects if they exist
            const formattedStartDate = contractorData.contractStartDate 
              ? new Date(contractorData.contractStartDate) 
              : null;
            
            const formattedEndDate = contractorData.contractEndDate 
              ? new Date(contractorData.contractEndDate) 
              : null;
            
            setFormData({
              fullName: contractorData.fullName || '',
              email: contractorData.email || '',
              phoneNumber: contractorData.phoneNumber || '',
              aadhaarNumber: contractorData.aadhaarNumber || '',
              gender: contractorData.gender || '',
              panNumber: contractorData.panNumber || '',
              companyName: contractorData.companyName || '',
              projectBudget: contractorData.projectBudget || '',
              contractStartDate: formattedStartDate,
              contractEndDate: formattedEndDate,
              contractDuration: contractorData.contractDuration || '',
              employmentType: contractorData.employmentType || 'Contractor',
              designation: contractorData.designation || '',
              department: contractorData.department || '',
              roleType: contractorData.roleType || '',
              reportingManager: contractorData.reportingManager || '',
              status: contractorData.status || 'active',
            });
            
            // Track existing files
            if (contractorData.aadharCardPath) {
              setExistingFiles(prev => ({
                ...prev,
                aadharCard: contractorData.aadharCardPath
              }));
            }
            
            if (contractorData.panCardPath) {
              setExistingFiles(prev => ({
                ...prev,
                panCard: contractorData.panCardPath
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching contractor data:', error);
          setAlert({
            open: true,
            message: 'Failed to load contractor details. Please try again.',
            severity: 'error'
          });
        } finally {
          setFetchLoading(false);
        }
      }
    };
    
    fetchContractorData();
  }, [isEditMode, contractorId]);

  // Handler
  const handleChange = (e) => {
    const { name, value, type, files: filesList } = e.target;

    if (type === 'file') {
      setFiles({ ...files, [name]: filesList[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };

    if (field === 'contractStartDate' || field === 'contractEndDate') {
      const { contractStartDate, contractEndDate } = updatedData;
      if (contractStartDate && contractEndDate) {
        const durationInMs = new Date(contractEndDate) - new Date(contractStartDate);
        const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
        updatedData.contractDuration = `${durationInDays} days`;
      }
    }

    setFormData(updatedData);
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object to handle file uploads
      const submitData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'contractStartDate' || key === 'contractEndDate') {
            // Format dates for the backend
            if (formData[key]) {
              submitData.append(key, formData[key].toISOString());
            }
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      // Add files to FormData if they exist
      if (files.aadharCard) {
        submitData.append('aadharCard', files.aadharCard);
      }
      
      if (files.panCard) {
        submitData.append('panCard', files.panCard);
      }
      
      // For edit mode, include info about existing files
      if (isEditMode) {
        submitData.append('existingAadharCard', existingFiles.aadharCard || '');
        submitData.append('existingPanCard', existingFiles.panCard || '');
      }
      
      // Send request to API (POST for create, PUT for update)
      const response = isEditMode
        ? await axios.put(`http://localhost:5000/api/contract/${contractorId}`, submitData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        : await axios.post('http://localhost:5000/api/contract', submitData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
      
      // Handle success
      setAlert({
        open: true,
        message: isEditMode 
          ? 'Contractor updated successfully!' 
          : 'Contractor created successfully!',
        severity: 'success'
      });
      
      // Navigate back to list view after short delay
      setTimeout(() => {
        navigate('/contractlist');
      }, 2000);
      
    } catch (error) {
      console.error(isEditMode ? 'Error updating contractor:' : 'Error creating contractor:', error);
      
      setAlert({
        open: true,
        message: error.response?.data?.message || 
          (isEditMode ? 'Failed to update contractor.' : 'Failed to create contractor.') + 
          ' Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Display loading state while fetching data in edit mode
  if (isEditMode && fetchLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {isEditMode ? 'Edit Contractor' : 'Contractor Form'}
          </Typography>
        </Paper>
        
        <form onSubmit={handleSubmit}>
 <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project Budget"
                    name="projectBudget"
                    type="number"
                    value={formData.projectBudget}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Contract Details Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contract Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DesktopDatePicker
                    label="Contract Start Date"
                    value={formData.contractStartDate}
                    onChange={(date) => handleDateChange('contractStartDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DesktopDatePicker
                    label="Contract End Date"
                    value={formData.contractEndDate}
                    onChange={(date) => handleDateChange('contractEndDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Contract Duration" name="contractDuration" value={formData.contractDuration} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Employment Type" value="Contractor" disabled />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      label="Status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Personal Info Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      label="Gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    fullWidth
                    color={(files.aadharCard || existingFiles.aadharCard) ? "success" : "primary"}
                  >
                    {files.aadharCard 
                      ? "New Aadhar Card Selected" 
                      : existingFiles.aadharCard 
                        ? "Aadhar Card Uploaded (Change)" 
                        : "Upload Aadhar Card"}
                    <input type="file" name="aadharCard" hidden onChange={handleChange} />
                  </Button>
                  {(files.aadharCard || existingFiles.aadharCard) && (
                    <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                      File: {files.aadharCard ? files.aadharCard.name : (existingFiles.aadharCard ? "Previously uploaded file" : "")}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    fullWidth
                    color={(files.panCard || existingFiles.panCard) ? "success" : "primary"}
                  >
                    {files.panCard 
                      ? "New PAN Card Selected" 
                      : existingFiles.panCard 
                        ? "PAN Card Uploaded (Change)" 
                        : "Upload PAN Card"}
                    <input type="file" name="panCard" hidden onChange={handleChange} />
                  </Button>
                  {(files.panCard || existingFiles.panCard) && (
                    <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                      File: {files.panCard ? files.panCard.name : (existingFiles.panCard ? "Previously uploaded file" : "")}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

         

          {/* Role Info Card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role Type</InputLabel>
                    <Select
                      name="roleType"
                      label="Role Type"
                      value={formData.roleType}
                      onChange={handleChange}
                    >
                      {roleTypes.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Reporting Manager Email" 
                    name="reportingManager" 
                    value={formData.reportingManager} 
                    onChange={handleChange} 
                    required 
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={loading}
              sx={{ px: 4, py: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? "Update" : "Submit")}
            </Button>
          </Box>
        </form>

        {/* Alert for success/error messages */}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default ContractorForm;