import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Card
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`referral-tabpanel-${index}`}
      aria-labelledby={`referral-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main component
const CandidateReferralSystem = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // Snackbar state (shared between components)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, borderRadius: '8px', overflow: 'hidden' }}>
     
          <Typography variant="h4" component="h1" gutterBottom align='center' fontWeight="bold"> 
            Candidate Referral 
          </Typography>
          
      
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<PersonAddIcon />} label="Complete Referral" />
            <Tab icon={<UploadFileIcon />} label="Quick Upload" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <CompleteReferralForm setSnackbar={setSnackbar} />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <QuickResumeUpload setSnackbar={setSnackbar} />
        </TabPanel>
      </Paper>

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
</Container>
  );
};

// Complete Referral Form Component (Page 1)  
const CompleteReferralForm = ({ setSnackbar }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    positionApplied: '',
    noticePeriod: '',
    referralreason: '',
    referrerName: '',
    referrerEmail: '',
    referrerRelation: ''
  });
  
  const [errors, setErrors] = useState({
    phone: '',
    referralreason: ''
  });
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReferrerInfo, setLoadingReferrerInfo] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);

  // Fetch referrer information when component mounts
  useEffect(() => {
    const fetchReferrerInfo = async () => {
      try {
        setLoadingReferrerInfo(true);

        const sessionDebug = await axios.get('http://localhost:5000/api/refer/debug-session', {
          withCredentials: true
        });
        console.log('Session debug:', sessionDebug.data);
        const response = await axios.get('http://localhost:5000/api/refer/referrer/info', {withCredentials: true});
        
        setFormData(prevFormData => ({
          ...prevFormData,
          referrerName: response.data.referrerName || '',
          referrerEmail: response.data.referrerEmail || ''
        }));
      } catch (error) {
        console.error('Error fetching referrer info:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch your information. Please fill in your details manually.',
          severity: 'warning'
        });
      } finally {
        setLoadingReferrerInfo(false);
      }
    };

    fetchReferrerInfo();
    fetchAvailableJobs();
  }, [setSnackbar]);

  // Fetch open job positions
  const fetchAvailableJobs = async () => {
    try {
      setLoadingJobs(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/jobpost/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter to get only open jobs
      const openJobs = response.data.jobs.filter(job => {
        const closingDate = new Date(job.jobClosedDate);
        const today = new Date();
        return closingDate > today; // Only include jobs that haven't closed yet
      });
      
      setAvailableJobs(openJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch available positions. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const validatePhone = (phone) => {
    // Exactly 10 digits only
    const phoneRegex = /^\d{10}$/;
    
    if (!phone) {
      return "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      return "Please enter exactly 10 digits";
    }
    return "";
  };

  const validateReferralReason = (reason) => {
    // Only alphabets and spaces allowed
    const alphabetRegex = /^[A-Za-z\s]+$/;
    
    if (!reason) {
      return "Reason for referral is required";
    } else if (reason.trim().length < 20) {
      return "Please provide a more detailed reason (at least 20 characters)";
    } else if (!alphabetRegex.test(reason)) {
      return "Please use only alphabetic characters (A-Z, a-z)";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate on change for specific fields
    if (name === 'phone') {
      setErrors({
        ...errors,
        phone: validatePhone(value)
      });
    } else if (name === 'referralreason') {
      setErrors({
        ...errors,
        referralreason: validateReferralReason(value)
      });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    const phoneError = validatePhone(formData.phone);
    const reasonError = validateReferralReason(formData.referralreason);
    
    setErrors({
      phone: phoneError,
      referralreason: reasonError
    });
    
    return !phoneError && !reasonError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form before submitting',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          const skillsArray = formData[key].split(',').map(skill => skill.trim()).filter(skill => skill !== '');
          formDataToSend.append(key, JSON.stringify(skillsArray));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (file) {
        formDataToSend.append('resume', file);
      }

      const response = await axios.post('http://localhost:5000/api/refer/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      setSnackbar({
        open: true,
        message: 'Candidate referred successfully!',
        severity: 'success'
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        skills: '',
        experience: '',
        positionApplied: '',
        noticePeriod: '',
        referralreason: '',
        referrerName: formData.referrerName, // Keep referrer information
        referrerEmail: formData.referrerEmail, // Keep referrer information
        referrerRelation: ''
      });
      setFile(null);
      setErrors({
        phone: '',
        referralreason: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create referral',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 4, pb: 4 }}>
     
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
          Candidate Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              onBlur={() => setErrors({...errors, phone: validatePhone(formData.phone)})}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="skills"
              name="skills"
              label="Skills"
              placeholder="e.g. React, JavaScript, Node.js"
              value={formData.skills}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="experience"
              label="Years of Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="notice-period-label">Notice Period</InputLabel>
              <Select
                labelId="notice-period-label"
                id="noticePeriod"
                name="noticePeriod"
                value={formData.noticePeriod}
                label="Notice Period"
                onChange={handleChange}
              >
                <MenuItem value="Immediate">Immediate</MenuItem>
                <MenuItem value="15 days">15 days</MenuItem>
                <MenuItem value="30 days">30 days</MenuItem>
                <MenuItem value="60 days">60 days</MenuItem>
                <MenuItem value="90 days">90 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="position-applied-label">Position Applied For</InputLabel>
              <Select
                labelId="position-applied-label"
                id="positionApplied"
                name="positionApplied"
                value={formData.positionApplied}
                label="Position Applied For"
                onChange={handleChange}
                disabled={loadingJobs}
              >
                {loadingJobs ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading positions...
                  </MenuItem>
                ) : availableJobs.length > 0 ? (
                  availableJobs.map((job) => (
                    <MenuItem key={job.id} value={job.jobTitle}>
                      {job.jobTitle} - {job.jobId}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No open positions available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="referralreason"
              label="Reason for Referral"
              name="referralreason"
              multiline
              rows={3}
              value={formData.referralreason}
              onChange={handleChange}
              placeholder="Why do you think this candidate would be a good fit?"
              error={!!errors.referralreason}
              helperText={errors.referralreason}
              onBlur={() => setErrors({...errors, referralreason: validateReferralReason(formData.referralreason)})}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Resume
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
              Accepts: .pdf, .doc, .docx
            </Typography>
            {file && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2, mt: 4 }}>
          Referrer Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="referrerName"
              label="Your Name"
              name="referrerName"
              value={formData.referrerName}
              onChange={handleChange}
              disabled={loadingReferrerInfo}
              helperText={loadingReferrerInfo ? "Loading your information..." : ""}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="referrerEmail"
              label="Your Email"
              name="referrerEmail"
              type="email"
              value={formData.referrerEmail}
              onChange={handleChange}
              disabled={loadingReferrerInfo}
              helperText={loadingReferrerInfo ? "Loading your information..." : ""}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="referrerRelation"
              label="Relationship to Candidate"
              name="referrerRelation"
              value={formData.referrerRelation}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || loadingReferrerInfo || (availableJobs.length === 0 && !loadingJobs)}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Quick Resume Upload Component (Page 2)
const QuickResumeUpload = ({ setSnackbar }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Please select a resume file to upload',
        severity: 'error'
      });
      return;
    }

    if (!candidateEmail) {
      setSnackbar({
        open: true,
        message: 'Please provide candidate email',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('email', candidateEmail);
      
      // Add candidate name if provided
      formData.append('name', candidateName || 'To be updated');
      
      // Only email and resume are required for quick upload
      formData.append('phone', '0000000000');
      formData.append('skills', JSON.stringify([]));
      formData.append('experience', '0');
      formData.append('positionApplied', 'To be determined');
      formData.append('noticePeriod', 'To be determined');
      formData.append('referralreason', 'Quick resume upload for further review');
      formData.append('referrerRelation', 'Professional');

      const response = await axios.post('http://localhost:5000/api/refer/quick-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      setSnackbar({
        open: true,
        message: 'Resume uploaded successfully!',
        severity: 'success'
      });
      
      // Reset form
      setFile(null);
      setCandidateEmail('');
      setCandidateName('');
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to upload resume',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 4, pb: 4 }}>
     
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mt: 3,
          borderRadius: '8px',
          border: '1px dashed #3f51b5',
          bgcolor: '#fafafa'
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="candidateEmail"
                label="Candidate Email"
                name="candidateEmail"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="candidateName"
                label="Candidate Name (Optional)"
                name="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <Button
                  variant="text"
                  component="label"
                  startIcon={<UploadFileIcon sx={{ fontSize: 36, color: '#3f51b5' }} />}
                  sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 2 }}
                >
                  <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                    Drop resume file here or click to browse
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Accepts: .pdf, .doc, .docx
                  </Typography>
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>
              </Paper>
            </Grid>
            
            {file && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#f0f7ff' }}>
                  <UploadFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                type="submit"
                disabled={loading || !file || !candidateEmail}
                startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
              >
                {loading ? 'Uploading...' : 'Upload Resume'}
              </Button>
              
            
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 5 }}>
        
       
          
          
          
        
       
      </Box>
    </Box>
  );
};

export default CandidateReferralSystem;