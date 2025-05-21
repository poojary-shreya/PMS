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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const ViewCtc = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollDetails = async () => {
      try {
        console.log("Fetching payroll details...");
        const response = await axios.get("http://localhost:5000/api/payroll/viewctc", {
          withCredentials: true,
        });
        
        console.log("Response received:", response.data);
        
        // Check if payroll data exists in the response
        if (response.data && response.data.payroll) {
          setPayrollData(response.data.payroll);
          console.log("Payroll data set:", response.data.payroll);
          setError('');
        } else {
          setError('No payroll data found in response');
          console.error("No payroll data in response");
        }
      } catch (error) {
        console.error("Error fetching payroll:", error);
        
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          
          if (error.response.status === 403) {
            setError(error.response.data.message || 'Access forbidden');
          } else if (error.response.status === 404) {
            setError('Payroll details not found');
          } else {
            setError(`Error fetching payroll details: ${error.response.data.message || error.message}`);
          }
        } else {
          setError(`Network error: ${error.message}`);
        }
        
        setPayrollData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollDetails();
  }, []);



  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        CTC Details
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
              <Typography variant="h6" gutterBottom>Employee Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Employee ID:</strong> {payrollData.employee_id}</Typography>
                  <Typography><strong>Name:</strong> {payrollData.firstName} {payrollData.lastName}</Typography>
                  <Typography><strong>Phone:</strong> {payrollData.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Email:</strong> {payrollData.companyemail}</Typography>
                  <Typography><strong>PF.NO:</strong> {payrollData.pfno}</Typography>
                  <Typography><strong>UAN:</strong> {payrollData.uan}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              {/* CTC Summary Table Added at Top */}
              <Typography variant="h6" gutterBottom>Cost to Company (CTC)</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Total CTC</strong></TableCell>
                      <TableCell align="right"><strong>{Number(payrollData.ctc).toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                   
                    {Number(payrollData.joining_bonus) > 0 && (
                      <TableRow>
                        <TableCell>Joining Bonus</TableCell>
                        <TableCell align="right">{Number(payrollData.joining_bonus).toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Salary Details</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell align="right"><strong>Monthly (₹)</strong></TableCell>
                      <TableCell align="right"><strong>Annual (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Salary</TableCell>
                      <TableCell align="right">{(Number(payrollData.base_salary) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.base_salary).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HRA</TableCell>
                      <TableCell align="right">{(Number(payrollData.hra) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.hra).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Medical Allowance</TableCell>
                      <TableCell align="right">{(Number(payrollData.medical_allowance) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.medical_allowance).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Newspaper Allowance</TableCell>
                      <TableCell align="right">{(Number(payrollData.newspaper_allowance) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.newspaper_allowance).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Dress Allowance</TableCell>
                      <TableCell align="right">{(Number(payrollData.dress_allowance) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.dress_allowance).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Other Allowance</TableCell>
                      <TableCell align="right">{(Number(payrollData.other_allowance) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.other_allowance).toFixed(2)}</TableCell>
                    </TableRow>
                    {Number(payrollData.variable_salary) > 0 && (
                      <TableRow>
                        <TableCell>Variable Salary</TableCell>
                        <TableCell align="right">{(Number(payrollData.variable_salary) / 12).toFixed(2)}</TableCell>
                        <TableCell align="right">{Number(payrollData.variable_salary).toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Gross Salary</strong></TableCell>
                      <TableCell align='right'><strong>
                        {(
                            (Number(payrollData.base_salary)/12)+
                            (Number(payrollData.hra)/12)+
                            (Number(payrollData.medical_allowance)/12)+
                            (Number(payrollData.dress_allowance)/12)+
                            (Number(payrollData.newspaper_allowance)/12)+
                            (Number(payrollData.other_allowance)/12)
                        ).toFixed(2)}
                        </strong></TableCell>
                        <TableCell align='right'><strong>
                        {(
                            Number(payrollData.base_salary)+
                            Number(payrollData.hra)+
                            Number(payrollData.medical_allowance)+
                            Number(payrollData.dress_allowance)+
                            Number(payrollData.newspaper_allowance)+
                            Number(payrollData.other_allowance)
                        ).toFixed(2)}
                        </strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Deductions</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell align="right"><strong>Monthly (₹)</strong></TableCell>
                      <TableCell align="right"><strong>Annual (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>PF</TableCell>
                      <TableCell align="right">{(Number(payrollData.pf) / 12).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.pf).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Professional Tax</TableCell>
                      <TableCell align="right">{(Number(payrollData.professional_tax)).toFixed(2)}</TableCell>
                      <TableCell align="right">{(Number(payrollData.professional_tax)*12).toFixed(2)}</TableCell>
                    </TableRow>
                    {/* <TableRow>
                      <TableCell>Income Tax</TableCell>
                      <TableCell align="right">{Number(payrollData.monthly_tax).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(payrollData.total_tax).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Total Deductions</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {((Number(payrollData.pf) / 12) + 
                            Number(payrollData.professional_tax) + 
                            Number(payrollData.monthly_tax)).toFixed(2)}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {(Number(payrollData.pf) + 
                            (Number(payrollData.professional_tax) * 12) + 
                            Number(payrollData.total_tax)).toFixed(2)}
                        </strong>
                      </TableCell>
                    </TableRow> */}
                  </TableBody>
                </Table>
              </TableContainer>

            </CardContent>
          </Card>
        )
      )}
    </Box>
  );
};

export default ViewCtc;