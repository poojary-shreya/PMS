import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { CloudUpload, Send, History } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled component for file upload button
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Status chip color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const AllowanceClaimSystem = () => {
  // State for form
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    comment: '',
    financial_year: new Date().getFullYear().toString(),
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Available purposes for claims
  const purposeOptions = [
    'Medical',
    'Home Office Setup',
    'Travel Expenses',
    'Health and Wellness',
    'Equipment Purchase',
    'Other'
  ];

  // Generate financial year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const financialYearOptions = [
    `${currentYear}-${currentYear+1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear - 3}-${currentYear - 2}`,
    `${currentYear - 4}-${currentYear - 3}`
  ];

  // Fetch existing claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setClaimsLoading(true);
    try {
      // Assuming we get the employee_id from session storage or context
      // Default for testing
      const response = await axios.get(`http://localhost:5000/api/allowanceclaim/employee-claims`,{ withCredentials: true });
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setAlert({
        open: true,
        message: 'Failed to load claim history',
        severity: 'error'
      });
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || !formData.purpose || !file) {
      setAlert({
        open: true,
        message: 'Please fill all required fields and upload proof document',
        severity: 'error'
      });
      return;
    }

    // Create form data for file upload
    const submitData = new FormData();
    submitData.append('amount', formData.amount);
    submitData.append('purpose', formData.purpose);
    submitData.append('comment', formData.comment);
    submitData.append('financial_year', formData.financial_year);
    submitData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/allowanceclaim/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }, withCredentials:true
      });

      setAlert({
        open: true,
        message: response.data.message,
        severity: 'success'
      });

      // Reset form
      setFormData({
        amount: '',
        purpose: '',
        comment: '',
        financial_year: new Date().getFullYear().toString(),
      });
      setFile(null);
      setFileName('');

      // Refresh claims
      fetchClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Error submitting claim',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Allowance Claim System
      </Typography>
      
      <Grid container spacing={4}>
        {/* Claim Form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Submit Claim
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <form onSubmit={handleSubmit}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  startAdornment: '$',
                }}
              />
              
              <FormControl fullWidth margin="normal" required>
                    <InputLabel id="purpose-label">Purpose</InputLabel>
                    <Select
                        labelId="purpose-label"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        label="Purpose"
                    >
                        <MenuItem value="medical_allowance">Medical Expenses</MenuItem>
                        <MenuItem value="newspaper_allowance">Newspaper allowance</MenuItem>
                        <MenuItem value="dress_allowance">Dress allowance</MenuItem>
                        <MenuItem value="other_allowance">other</MenuItem>
                    </Select>
                    </FormControl>

              
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="financial-year-label">Financial Year</InputLabel>
                <Select
                  labelId="financial-year-label"
                  name="financial_year"
                  value={formData.financial_year}
                  onChange={handleInputChange}
                  label="Financial Year"
                >
                  {financialYearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Provide additional details about your claim"
              />
              
              <UploadButton
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                color={file ? "success" : "primary"}
              >
                {file ? fileName : "Upload Proof Document"}
                <VisuallyHiddenInput type="file" onChange={handleFileChange} />
              </UploadButton>
              {file && (
                <FormHelperText>
                  File selected: {fileName}
                </FormHelperText>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Claims History */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <History sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Claims History
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {claimsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : claims.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No claims found. Submit your first claim to see it here.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="claims table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Financial Year</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reviewer Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id} hover>
                        <TableCell>{formatDate(claim.createdAt)}</TableCell>
                        <TableCell>{claim.purpose}</TableCell>
                        <TableCell align="right">${claim.amount}</TableCell>
                        <TableCell>{claim.financial_year}</TableCell>
                        <TableCell>
                          <Chip 
                            label={claim.status} 
                            color={getStatusColor(claim.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{claim.reviewercomment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllowanceClaimSystem;