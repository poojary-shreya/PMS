import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';

const ProjectedTax = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payroll/projectedtax", {
          withCredentials: true,
        });
        setPayrollData(response.data);
        setError('');
      } catch (error) {
        if (error.response && error.response.status === 403) {
            setError(error.response.data.message);
         } else{
                setError('Employee not found or server error');
                setPayrollData(null);
            }
        
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Projected Tax Details
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        payrollData && (
          <Card sx={{ mt: 4, mx: 'auto', maxWidth: 900, boxShadow: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <Typography><strong>Employee ID:</strong> {payrollData.employee.employee_id}</Typography>
                <Typography><strong>Name:</strong>{payrollData.employee.firstName} {payrollData.employee.lastName}
                </Typography>
                  <Typography><strong>CompanyEmail:</strong> {payrollData.employee.companyemail}</Typography>
                  <Typography><strong>Phone:</strong> {payrollData.employee.phoneNumber}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Salary Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography>Base Salary: ₹{payrollData.base_salary}</Typography></Grid>
                <Grid item xs={6}><Typography>HRA: ₹{payrollData.hra}</Typography></Grid>
                <Grid item xs={6}><Typography>Medical: ₹{payrollData.medical_allowance}</Typography></Grid>
                <Grid item xs={6}><Typography>Newspaper: ₹{payrollData.newspaper_allowance}</Typography></Grid>
                <Grid item xs={6}><Typography>Dress: ₹{payrollData.dress_allowance}</Typography></Grid>
                <Grid item xs={6}><Typography>Other: ₹{payrollData.other_allowance}</Typography></Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Tax Details</Typography>
              <Typography>ProjectedTax: ₹{payrollData.total_tax.toFixed(2)}</Typography>
              <Typography>Projected Monthly Tax: ₹{payrollData.monthly_tax.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        )
      )}
    </Box>
  );
};

export default ProjectedTax;