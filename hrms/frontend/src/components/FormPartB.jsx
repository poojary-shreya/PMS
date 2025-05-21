import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box,
  Typography, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useNavigate } from 'react-router-dom';

const Form16BComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [employeeId, setEmployeeId] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [form16BData, setForm16BData] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  useEffect(() => {
    console.log("Location state received:", location.state);
  
    if (location.state && location.state.employeeId) {
      setEmployeeId(location.state.employeeId);
      
      if (location.state.certificateNo) {
        setCertificateNo(location.state.certificateNo);
      }
    }
  }, [location.state]);

  const generateForm16B = async () => {
    if (!employeeId) {
      setNotification({
        open: true,
        message: 'Employee ID is required',
        type: 'error'
      });
      return;
    }
    
    if (!certificateNo) {
      setNotification({
        open: true,
        message: 'Certificate Number is required',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/form16B/generate', {
        employee_id: employeeId,
        certificate_no: certificateNo  
      });
      
      setForm16BData(response.data.data);  
      setDialogOpen(false);
      
      setNotification({
        open: true,
        message: 'Form 16B generated successfully',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error generating Form 16B:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to generate Form 16B',
        type: 'error'
      });
    
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value || 0);
  };

  const navigateToForm16A = () => {
    navigate('/form16A');
  };


  const get80CInvestments = (data) => {
    if (!data || !data.form16_partB) return [];
    
    return Object.entries(data.form16_partB)
      .filter(([key]) => key.startsWith('80C_'))
      .map(([key, value]) => ({
        name: key.replace('80C_', '').split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: parseFloat(value) || 0
      }))
      .filter(item => item.value > 0);
  };

  const get80DInvestments = (data) => {
    if (!data || !data.form16_partB) return [];
    
    return Object.entries(data.form16_partB)
      .filter(([key]) => key.startsWith('80D_'))
      .map(([key, value]) => ({
        name: key.replace('80D_', '').split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: parseFloat(value) || 0
      }))
      .filter(item => item.value > 0);
  };


  const getOtherSectionInvestments = (data) => {
    if (!data || !data.form16_partB) return [];
    
    const skipPrefixes = ['80C_', '80D_'];
    
    return Object.entries(data.form16_partB)
      .filter(([key]) => 
        key.startsWith('80') && 
        !skipPrefixes.some(prefix => key.startsWith(prefix)))
      .map(([key, value]) => ({
        name: key.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: parseFloat(value) || 0
      }))
      .filter(item => item.value > 0);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Form 16 Part B
      </Typography>

      <Dialog open={dialogOpen && !form16BData} maxWidth="sm" fullWidth>
        <DialogTitle>
          Generate Form 16B
          <IconButton 
            onClick={() => navigate('/form16A')} 
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Typography variant="body1" gutterBottom>
              Enter details to generate Form 16B:
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Certificate No"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={navigateToForm16A} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={generateForm16B} 
            variant="contained" 
            color="primary"
            disabled={loading || !employeeId || !certificateNo}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Form 16B'}
          </Button>
        </DialogActions>
      </Dialog>

      {form16BData && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Button variant="contained" color="primary" onClick={navigateToForm16A}>
              Back to Form 16A
            </Button>
            <Chip 
              label={`Tax Regime: ${form16BData.form16_partB.better_regime || 'Not Specified'}`} 
              color="primary" 
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Income & Gross Total</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {/* <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Salary Income</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.salary_income)}</Typography>
                    </Grid> */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Standard Deduction</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.standard_deduction)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Professional Tax</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.professional_tax)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Gross Total Income</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.gross_total_income)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Exemption Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">HRA Exemption</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.hra_exemption)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Medical Exemption</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.medical_exemption)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Newspaper Exemption</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.newspaper_exemption)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Dress Exemption</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.dress_exemption)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Other Exemption</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.other_exemption)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Section 80C Investments</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {get80CInvestments(form16BData).map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="body1">{formatCurrency(item.value)}</Typography>
                      </Grid>
                    ))}
                    {get80CInvestments(form16BData).length === 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">No Section 80C investments found</Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Section 80D Health Insurance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {get80DInvestments(form16BData).map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="body1">{formatCurrency(item.value)}</Typography>
                      </Grid>
                    ))}
                    {get80DInvestments(form16BData).length === 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">No Section 80D investments found</Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Other Tax Deductions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {getOtherSectionInvestments(form16BData).map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="body1">{formatCurrency(item.value)}</Typography>
                      </Grid>
                    ))}
                    {getOtherSectionInvestments(form16BData).length === 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">No other deductions found</Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Tax Calculation Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Total Deductions</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.total_deductions)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Taxable Income</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.taxable_income)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Tax Payable</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.tax_payable)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Education Cess</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16_partB.education_cess)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Total Tax</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(form16BData.form16_partB.total_tax)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Form16BComponent;