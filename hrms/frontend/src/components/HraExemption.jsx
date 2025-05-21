import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';


const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(4)
}));

const ResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  marginTop: theme.spacing(3)
}));

const ResultItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[100],
  }
}));

const HraExemptionCalculator = () => {
  const [loading, setLoading] = useState(false);
//   const [employees, setEmployees] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    fiscal_year: '',
    rent_paid: '',
    months_rented: 12
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 4; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    
    setFiscalYears(years);
    setFormData(prev => ({
      ...prev,
      fiscal_year: years[0]
    }));
  }, []);

//   // Fetch employee list
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get('/api/employees');
//         setEmployees(response.data);
//       } catch (err) {
//         setError('Failed to fetch employees');
//         setSnackbar({
//           open: true,
//           message: 'Failed to fetch employees',
//           severity: 'error'
//         });
//       }
//     };

//     fetchEmployees();
//   }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/hra/calculate', formData);
      setResult(response.data);
      setSnackbar({
        open: true,
        message: 'HRA Exemption calculation successful',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error calculating HRA exemption:', err);
      setError(err.response?.data?.message || 'Failed to calculate HRA exemption');
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to calculate HRA exemption',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          HRA Exemption Calculator
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" mb={4}>
          Calculate House Rent Allowance (HRA) tax exemption based on rent paid 
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <StyledCard>
              <CardHeader 
                title="Input Details" 
                subheader="Enter employee and rent information"
              />
              <Divider />
              <CardContent>
                <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="fiscal-year-label">Financial Year</InputLabel>
                    <Select
                      labelId="fiscal-year-label"
                      id="fiscal-year-select"
                      name="fiscal_year"
                      value={formData.fiscal_year}
                      onChange={handleChange}
                      required
                      label="Fiscal Year"
                    >
                      {fiscalYears.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Monthly Rent Paid"
                    name="rent_paid"
                    type="number"
                    value={formData.rent_paid}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Months Rented"
                    name="months_rented"
                    type="number"
                    value={formData.months_rented}
                    onChange={handleChange}
                    required
                    InputProps={{ 
                      inputProps: { min: 1, max: 12 } 
                    }}
                  />

                  <Box mt={3}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Calculate HRA Exemption'}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={7}>
            {result && (
              <StyledCard>
                <CardHeader 
                  title="HRA Exemption Results" 
                  subheader={`${result.details.employee_name} | FY ${result.details.fiscal_year}`}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <ResultCard>
                        <Typography variant="h6" gutterBottom color="primary">Employee Details</Typography>
                        <ResultItem>
                          <Typography variant="body2">Name:</Typography>
                          <Typography variant="body1" fontWeight="medium">{result.details.employee_name}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">City Type:</Typography>
                          <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                            {result.details.city_type}
                          </Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">Monthly Salary:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.monthly_salary.toLocaleString()}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">Monthly HRA:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.monthly_hra.toLocaleString()}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">Monthly Rent:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.rent_paid_monthly.toLocaleString()}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">Months Rented:</Typography>
                          <Typography variant="body1" fontWeight="medium">{result.details.months_rented}</Typography>
                        </ResultItem>
                      </ResultCard>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <ResultCard>
                        <Typography variant="h6" gutterBottom color="primary">Calculation Summary</Typography>
                        <ResultItem>
                          <Typography variant="body2">HRA Received:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.calculations.actual_hra_received.toLocaleString()}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">Rent - 10% Salary:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.calculations.rent_minus_10_percent_salary.toLocaleString()}</Typography>
                        </ResultItem>
                        <ResultItem>
                          <Typography variant="body2">{result.details.city_type === 'metro' ? '50%' : '40%'} of Salary:</Typography>
                          <Typography variant="body1" fontWeight="medium">₹{result.details.calculations.percentage_of_salary.toLocaleString()}</Typography>
                        </ResultItem>
                      </ResultCard>
                    </Grid>
                  </Grid>

                  <ResultCard sx={{ marginTop: 4, backgroundColor: '#f9f9ff', border: '1px solid #e0e0ff' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom color="primary" align="center">
                          Final Result
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ backgroundColor: '#eef5ff', p: 2, borderRadius: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            HRA Exemption Amount:
                          </Typography>
                          <Typography variant="h4" color="primary" fontWeight="bold">
                            ₹{result.details.calculations.hra_exemption_amount.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ backgroundColor: '#fff5f5', p: 2, borderRadius: 2, height: '100%' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Taxable HRA:
                          </Typography>
                          <Typography variant="h4" color="error" fontWeight="bold">
                            ₹{result.details.calculations.taxable_hra.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </ResultCard>
                </CardContent>
              </StyledCard>
            )}

            {!result && !loading && (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                height="100%" 
                minHeight="300px"
                sx={{ 
                  border: '1px dashed #ccc', 
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Typography variant="h6" color="textSecondary" align="center">
                  Enter details and click "Calculate" to view the  results
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HraExemptionCalculator;