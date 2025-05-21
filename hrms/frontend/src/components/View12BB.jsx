import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Modal, Box, Typography, 
  Tabs, Tab, FormControl, Select, MenuItem, InputLabel, Grid
} from '@mui/material';
import { format } from 'date-fns';
import { Visibility } from '@mui/icons-material';

// Tab panel component for the modal view
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Form12BBAdmin = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // States for status updates
  const [hraStatus, setHraStatus] = useState('');
  const [ltcStatus, setLtcStatus] = useState('');
  const [homeLoanStatus, setHomeLoanStatus] = useState('');
  const [chapterViaStatus, setChapterViaStatus] = useState('');

  const handleOpen = (form) => {
    setCurrentForm(form);
    // Initialize status values from the form
    setHraStatus(form.hra_status || 'PENDING');
    setLtcStatus(form.ltc_status || 'PENDING');
    setHomeLoanStatus(form.home_loan_status || 'PENDING');
    setChapterViaStatus(form.chapter_via_status || 'PENDING');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentForm(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load all forms on component mount
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/form12bb/form/all');
      setForms(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      setLoading(false);
    }
  };

  // Handle status updates
  const updateHraStatus = async () => {
    try {
      await axios.post('http://localhost:5000/api/form12bb/update-hra-status', {
        employee_id: currentForm.employee_id,
        financial_year_from: currentForm.financial_year_from,
        financial_year_to: currentForm.financial_year_to,
        status: hraStatus
      });
      
      // Update local state
      setForms(forms.map(form => {
        if (form.employee_id === currentForm.employee_id && 
            form.financial_year_from === currentForm.financial_year_from &&
            form.financial_year_to === currentForm.financial_year_to) {
          return { ...form, hra_status: hraStatus };
        }
        return form;
      }));
      
      // Update current form
      setCurrentForm({ ...currentForm, hra_status: hraStatus });
      
    } catch (err) {
      console.error("Error updating HRA status:", err);
      alert("Failed to update HRA status");
    }
  };

  const updateLtcStatus = async () => {
    try {
      await axios.post('http://localhost:5000/api/form12bb/update-ltc-status', {
        employee_id: currentForm.employee_id,
        financial_year_from: currentForm.financial_year_from,
        financial_year_to: currentForm.financial_year_to,
        status: ltcStatus
      });
      
      // Update local state
      setForms(forms.map(form => {
        if (form.employee_id === currentForm.employee_id && 
            form.financial_year_from === currentForm.financial_year_from &&
            form.financial_year_to === currentForm.financial_year_to) {
          return { ...form, ltc_status: ltcStatus };
        }
        return form;
      }));
      
      // Update current form
      setCurrentForm({ ...currentForm, ltc_status: ltcStatus });
      
    } catch (err) {
      console.error("Error updating LTC status:", err);
      alert("Failed to update LTC status");
    }
  };

  const updateHomeLoanStatus = async () => {
    try {
      await axios.post('http://localhost:5000/api/form12bb/update-home-loan-status', {
        employee_id: currentForm.employee_id,
        financial_year_from: currentForm.financial_year_from,
        financial_year_to: currentForm.financial_year_to,
        status: homeLoanStatus
      });
      
      // Update local state
      setForms(forms.map(form => {
        if (form.employee_id === currentForm.employee_id && 
            form.financial_year_from === currentForm.financial_year_from &&
            form.financial_year_to === currentForm.financial_year_to) {
          return { ...form, home_loan_status: homeLoanStatus };
        }
        return form;
      }));
      
      // Update current form
      setCurrentForm({ ...currentForm, home_loan_status: homeLoanStatus });
      
    } catch (err) {
      console.error("Error updating Home Loan status:", err);
      alert("Failed to update Home Loan status");
    }
  };

  const updateChapterViaStatus = async () => {
    try {
      await axios.post('http://localhost:5000/api/form12bb/update-chaptervia-status', {
        employee_id: currentForm.employee_id,
        financial_year_from: currentForm.financial_year_from,
        financial_year_to: currentForm.financial_year_to,
        status: chapterViaStatus
      });
      
      // Update local state
      setForms(forms.map(form => {
        if (form.employee_id === currentForm.employee_id && 
            form.financial_year_from === currentForm.financial_year_from &&
            form.financial_year_to === currentForm.financial_year_to) {
          return { ...form, chapter_via_status: chapterViaStatus };
        }
        return form;
      }));
      
      // Update current form
      setCurrentForm({ ...currentForm, chapter_via_status: chapterViaStatus });
      
    } catch (err) {
      console.error("Error updating Chapter VI-A status:", err);
      alert("Failed to update Chapter VI-A status");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // View document in a new tab
  const viewDocument = (documentPath) => {
    if (documentPath) {
      window.open(`http://localhost:5000/uploads/${documentPath}`, '_blank');
    } else {
      alert('No document available');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Form 12BB Submissions
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Financial Year</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No submissions found</TableCell>
              </TableRow>
            ) : (
              forms.map((form) => (
                <TableRow key={`${form.employee_id}-${form.financial_year_from}`}>
                  <TableCell>{form.employee_id}</TableCell>
                  <TableCell>
                    {form.employee ? `${form.employee.firstName} ${form.employee.lastName}` : 'N/A'}
                  </TableCell>
                  <TableCell>{`${form.financial_year_from}-${form.financial_year_to}`}</TableCell>
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                 
                  <TableCell>
                    <Button
                      variant="contained"
                      startIcon={<Visibility />}
                      onClick={() => handleOpen(form)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for detailed view */}
      {currentForm && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="form-details-modal"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 900,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Form 12BB Details - {currentForm.employee ? `${currentForm.employee.firstName} ${currentForm.employee.lastName}` : currentForm.employee_id}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Financial Year: {currentForm.financial_year_from}-{currentForm.financial_year_to}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="form sections">
                <Tab label="HRA Details" />
                <Tab label="LTC Details" />
                <Tab label="Home Loan Details" />
                <Tab label="Chapter VI-A Details" />
              </Tabs>
            </Box>

            {/* HRA Tab */}
            <TabPanel value={tabValue} index={0}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    House Rent Allowance (HRA)
                  </Typography>
                  
                  {currentForm.hra_claimed ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                          <strong>Rent Paid:</strong> ₹{currentForm.rent_paid || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Landlord Name:</strong> {currentForm.landlord_name || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Landlord Address:</strong> {currentForm.landlord_address || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Landlord PAN:</strong> {currentForm.landlord_pan || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Supporting Document:</strong>
                          {currentForm.rent_receipt_file ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => viewDocument(currentForm.rent_receipt_file)}
                              sx={{ ml: 2 }}
                            >
                              View Document
                            </Button>
                          ) : 'No document uploaded'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={hraStatus}
                              label="Status"
                              onChange={(e) => setHraStatus(e.target.value)}
                            >
                              <MenuItem value="PENDING">Pending</MenuItem>
                              <MenuItem value="APPROVED">Approved</MenuItem>
                              <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                          <Button 
                            variant="contained" 
                            onClick={updateHraStatus}
                            sx={{ mt: 2 }}
                          >
                            Update Status
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography>No HRA details submitted</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* LTC Tab */}
            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Leave Travel Concession (LTC)
                  </Typography>
                  
                  {currentForm.ltc_claimed ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                          <strong>Travel Amount:</strong> ₹{currentForm.travel_amount || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Supporting Document:</strong>
                          {currentForm.travel_bill_file ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => viewDocument(currentForm.travel_bill_file)}
                              sx={{ ml: 2 }}
                            >
                              View Document
                            </Button>
                          ) : 'No document uploaded'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={ltcStatus}
                              label="Status"
                              onChange={(e) => setLtcStatus(e.target.value)}
                            >
                              <MenuItem value="PENDING">Pending</MenuItem>
                              <MenuItem value="APPROVED">Approved</MenuItem>
                              <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                          <Button 
                            variant="contained" 
                            onClick={updateLtcStatus}
                            sx={{ mt: 2 }}
                          >
                            Update Status
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography>No LTC details submitted</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Home Loan Tab */}
            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Home Loan Interest
                  </Typography>
                  
                  {currentForm.home_loan_claimed ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                          <strong>Interest Amount:</strong> ₹{currentForm.interest_amount || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Lender Name:</strong> {currentForm.lender_name || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Lender Account:</strong> {currentForm.lender_account || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Supporting Document:</strong>
                          {currentForm.loan_certificate_file ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => viewDocument(currentForm.loan_certificate_file)}
                              sx={{ ml: 2 }}
                            >
                              View Document
                            </Button>
                          ) : 'No document uploaded'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={homeLoanStatus}
                              label="Status"
                              onChange={(e) => setHomeLoanStatus(e.target.value)}
                            >
                              <MenuItem value="PENDING">Pending</MenuItem>
                              <MenuItem value="APPROVED">Approved</MenuItem>
                              <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                          <Button 
                            variant="contained" 
                            onClick={updateHomeLoanStatus}
                            sx={{ mt: 2 }}
                          >
                            Update Status
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography>No Home Loan details submitted</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Chapter VI-A Tab */}
            <TabPanel value={tabValue} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chapter VI-A Deductions
                  </Typography>
                  
                  {currentForm.chapter_via_claimed && currentForm.chapter_via_details?.length > 0 ? (
                    <>
                      <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Section</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Document</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {currentForm.chapter_via_details.map((deduction, index) => (
                              <TableRow key={index}>
                                <TableCell>{deduction.section}</TableCell>
                                <TableCell>₹{deduction.amount}</TableCell>
                                <TableCell>
                                  {deduction.receipt_file ? (
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      onClick={() => viewDocument(deduction.receipt_file)}
                                    >
                                      View
                                    </Button>
                                  ) : 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={chapterViaStatus}
                            label="Status"
                            onChange={(e) => setChapterViaStatus(e.target.value)}
                          >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="APPROVED">Approved</MenuItem>
                            <MenuItem value="REJECTED">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                        <Button 
                          variant="contained" 
                          onClick={updateChapterViaStatus}
                          sx={{ mt: 2 }}
                        >
                          Update Status
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Typography>No Chapter VI-A details submitted</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleClose} variant="contained">
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Add some basic styling for status badges */}
      <style jsx>{`
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .approved {
          background-color: #d4edda;
          color: #155724;
        }
        .rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
        .draft {
          background-color: #e2e3e5;
          color: #383d41;
        }
      `}</style>
    </div>
  );
};

export default Form12BBAdmin;