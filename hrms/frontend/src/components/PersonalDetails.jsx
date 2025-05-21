import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Container,
  Fade,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const PersonalDetails = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/basicdetails", {
          withCredentials: true,
        });
        
        if (response.data.success) {
          setEmployeeData(response.data.data);
          setError('');
        } else {
          setError(response.data.message || 'Failed to fetch employee details');
          setEmployeeData(null);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setError(error.response.data.message);
        } else if (error.response && error.response.status === 404) {
          setError('Employee not found');
        } else {
          setError('Server error. Please try again later.');
        }
        setEmployeeData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, []);

  // Define personal detail fields
  const personalDetailFields = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'fatherName', label: 'Father\'s Name' },
    { id: 'panNumber', label: 'PAN Number' },
    { id: 'adharCardNumber', label: 'Aadhar Card Number' }
  ];

  return (
    <Container maxWidth="1500px" sx={{ py: 4 }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '200px'
        }}>
          <CircularProgress size={40} thickness={4} color="primary" />
        </Box>
      ) : error ? (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1, 
              mb: 3
            }}
          >
            {error}
          </Alert>
        </Fade>
      ) : (
        employeeData && (
          <Fade in={!!employeeData}>
            <Card
              elevation={2}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Personal Details
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 0 }}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                        {personalDetailFields.map((field) => (
                          <TableCell 
                            key={field.id}
                            align="center"
                            sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '0.875rem',
                              borderBottom: '2px solid #e0e0e0'
                            }}
                          >
                            {field.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        {personalDetailFields.map((field) => (
                          <TableCell 
                            key={field.id}
                            align="center"
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {employeeData[field.id] || '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          </Fade>
        )
      )}
    </Container>
  );
};

export default PersonalDetails;