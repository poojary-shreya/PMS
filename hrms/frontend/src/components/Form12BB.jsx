import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  TextField, 
  Button, 
  Grid,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
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

function Form12BB() {
  const [employeeId, setEmployeeId] = useState('');
  const [financialYearFrom, setFinancialYearFrom] = useState('');
  const [financialYearTo, setFinancialYearTo] = useState('');
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [hraSelected, setHraSelected] = useState(null);
  const [ltcSelected, setLtcSelected] = useState(null);
  const [homeLoanSelected, setHomeLoanSelected] = useState(null);
  const [chapterVIASelected, setChapterVIASelected] = useState(null);
  const [hraDetails, setHraDetails] = useState({
    rentPaid: '',
    landlordName: '',
    landlordAddress: '',
    landlordPan:'',
    rentReceipt: null
  });
  const [ltcDetails, setLtcDetails] = useState({
    amount: '',
    travelBill: null
  });
  const [homeLoanDetails, setHomeLoanDetails] = useState({
    interestAmount: '',
    lenderName: '',
    lenderAccountNo: '',
    certificate: null
  });
  const [chapterVIADeductions, setChapterVIADeductions] = useState([
    { section: '', amount:'', receipt: null }
  ]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingEmployeeId, setFetchingEmployeeId] = useState(true);
  
  // Add status states for each section
  const [hraStatus, setHraStatus] = useState('');
  const [ltcStatus, setLtcStatus] = useState('');
  const [homeLoanStatus, setHomeLoanStatus] = useState('');
  const [chapterVIAStatus, setChapterVIAStatus] = useState('');

  // Fetch employee ID from session on component mount
  useEffect(() => {
    // Get employee ID from session
    setFetchingEmployeeId(true);
    axios
      .get("http://localhost:5000/api/user/current", { withCredentials: true })
      .then((response) => {
        const id = response.data.employee_id;
        setEmployeeId(id);
        setFetchingEmployeeId(false);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
        setFetchingEmployeeId(false);
        showNotification('Failed to retrieve employee ID from session', 'error');
      });
  }, []);
  console.log(employeeId);

  const handleFinancialYearFromChange = (event) => {
    setFinancialYearFrom(event.target.value);
  };

  const handleFinancialYearToChange = (event) => {
    setFinancialYearTo(event.target.value);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  const verifyEmployeeId = async () => {
    if (!employeeId.trim() || !financialYearFrom.trim() || !financialYearTo.trim()) {
      showNotification('Please enter Financial Year', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/form12bb/verify', { 
        employee_id: employeeId,
        financial_year_from: financialYearFrom,
        financial_year_to: financialYearTo
      },{withCredentials:true});
      
      if (response.data.success) {
        setEmployeeVerified(true);
        setEmployeeData(response.data.employee);
        showNotification('Employee verified successfully', 'success');
        
        // Fetch existing form data if available
        try {
          const formResponse = await axios.get(`http://localhost:5000/api/form12bb/${employeeId}?financial_year_from=${financialYearFrom}&financial_year_to=${financialYearTo}`,{withCredentials:true});
          if (formResponse.data.success) {
            const formData = formResponse.data.data;
            
            // Set statuses
            setHraStatus(formData.hra_status || '');
            setLtcStatus(formData.ltc_status || '');
            setHomeLoanStatus(formData.home_loan_status || '');
            setChapterVIAStatus(formData.chapter_via_status || '');
            
            // Set HRA data if claimed
            if (formData.hra_claimed) {
              setHraSelected(true);
              setHraDetails({
                rentPaid: formData.rent_paid || '',
                landlordName: formData.landlord_name || '',
                landlordAddress: formData.landlord_address || '',
                landlordPan: formData.landlord_pan || '',
                rentReceipt: formData.rent_receipt_file ? { name: formData.rent_receipt_file.split('/').pop() } : null
              });
            }
            
            // Set LTC data if claimed
            if (formData.ltc_claimed) {
              setLtcSelected(true);
              setLtcDetails({
                amount: formData.travel_amount || '',
                travelBill: formData.travel_bill_file ? { name: formData.travel_bill_file.split('/').pop() } : null
              });
            }

            // Set Home Loan data if claimed
            if (formData.home_loan_claimed) {
              setHomeLoanSelected(true);
              setHomeLoanDetails({
                interestAmount: formData.interest_amount || '',
                lenderName: formData.lender_name || '',
                lenderAccountNo: formData.lender_account || '',
                certificate: formData.loan_certificate_file ? { name: formData.loan_certificate_file.split('/').pop() } : null
              });
            }

            // Set Chapter VI-A deductions if claimed
            if (formData.chapter_via_claimed && formData.chapter_via_details) {
              setChapterVIASelected(true);
              setChapterVIADeductions(formData.chapter_via_details.map(item => ({
                section: item.section || '',
                amount: item.amount || '',
                receipt: item.receipt_file ? { name: item.receipt_file.split('/').pop() } : null
              })));
            }
          }
        } catch (error) {
          // It's okay if no form data exists yet
          console.log('No existing form data found');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showNotification('Employee not found', 'error');
      } else {
        showNotification('Error verifying employee', 'error');
        console.error('Error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleHraChange = (event) => {
    setHraSelected(event.target.value === 'yes');
  };

  const handleLtcChange = (event) => {
    setLtcSelected(event.target.value === 'yes');
  };

  const handleHomeLoanChange = (event) => {
    setHomeLoanSelected(event.target.value === 'yes');
  };

  const handleChapterVIAChange = (event) => {
    setChapterVIASelected(event.target.value === 'yes');
  };

  const handleHraDetailsChange = (event) => {
    const { name, value } = event.target;
    setHraDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLtcDetailsChange = (event) => {
    const { name, value } = event.target;
    setLtcDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHomeLoanDetailsChange = (event) => {
    const { name, value } = event.target;
    setHomeLoanDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChapterVIADetailsChange = (index, field, value) => {
    const updatedDeductions = [...chapterVIADeductions];
    updatedDeductions[index][field] = value;
    setChapterVIADeductions(updatedDeductions);
  };

  const addChapterVIADeduction = () => {
    setChapterVIADeductions([...chapterVIADeductions, { section: '', amount:'', receipt: null }]);
  };

  const removeChapterVIADeduction = (index) => {
    const updatedDeductions = [...chapterVIADeductions];
    updatedDeductions.splice(index, 1);
    setChapterVIADeductions(updatedDeductions);
  };

  const handleFileUpload = (section, field, index = null) => (event) => {
    const file = event.target.files[0];
    
    if (section === 'hra') {
      setHraDetails(prev => ({
        ...prev,
        [field]: file
      }));
    } else if (section === 'ltc') {
      setLtcDetails(prev => ({
        ...prev,
        [field]: file
      }));
    } else if (section === 'homeLoan') {
      setHomeLoanDetails(prev => ({
        ...prev,
        [field]: file
      }));
    } else if (section === 'chapterVIA') {
      const updatedDeductions = [...chapterVIADeductions];
      updatedDeductions[index][field] = file;
      setChapterVIADeductions(updatedDeductions);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const saveHraDetails = async () => {
    if (!hraDetails.rentPaid || !hraDetails.landlordName || !hraDetails.landlordAddress || !hraDetails.landlordPan) {
      showNotification('Please fill all HRA fields', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('financial_year_from', financialYearFrom);
      formData.append('financial_year_to', financialYearTo);
      formData.append('rentPaid', hraDetails.rentPaid);
      formData.append('landlordName', hraDetails.landlordName);
      formData.append('landlordAddress', hraDetails.landlordAddress);
      formData.append('landlordPAN', hraDetails.landlordPan);

      
      if (hraDetails.rentReceipt && hraDetails.rentReceipt instanceof File) {
        formData.append('rentReceipt', hraDetails.rentReceipt);
      }

      const response = await axios.post('http://localhost:5000/api/form12bb/hra', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials:true
      });

      if (response.data.success) {
        setHraStatus('PENDING');
        showNotification('HRA details saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Error saving HRA details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLtcDetails = async () => {
    if (!ltcDetails.amount) {
      showNotification('Please enter travel amount', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('financial_year_from', financialYearFrom);
      formData.append('financial_year_to', financialYearTo);
      formData.append('amount', ltcDetails.amount);
      
      if (ltcDetails.travelBill && ltcDetails.travelBill instanceof File) {
        formData.append('travelBill', ltcDetails.travelBill);
      }

      const response = await axios.post('http://localhost:5000/api/form12bb/ltc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials:true
      });

      if (response.data.success) {
        setLtcStatus('PENDING');
        showNotification('LTC details saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Error saving LTC details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHomeLoanDetails = async () => {
    if (!homeLoanDetails.interestAmount || !homeLoanDetails.lenderName || !homeLoanDetails.lenderAccountNo) {
      showNotification('Please fill all Home Loan fields', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('financial_year_from', financialYearFrom);
      formData.append('financial_year_to', financialYearTo);
      formData.append('interestAmount', homeLoanDetails.interestAmount);
      formData.append('lenderName', homeLoanDetails.lenderName);
      formData.append('lenderAccountNo', homeLoanDetails.lenderAccountNo);
      
      if (homeLoanDetails.certificate && homeLoanDetails.certificate instanceof File) {
        formData.append('certificate', homeLoanDetails.certificate);
      }

      const response = await axios.post('http://localhost:5000/api/form12bb/homeloan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials:true
      });

      if (response.data.success) {
        setHomeLoanStatus('PENDING');
        showNotification('Home Loan details saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Error saving Home Loan details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChapterVIADetails = async () => {
    // Check if any section is empty
    const hasEmptySection = chapterVIADeductions.some(item => !item.section || !item.amount);
    if (hasEmptySection) {
      showNotification('Please fill all Section and Amount fields', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('financial_year_from', financialYearFrom);
      formData.append('financial_year_to', financialYearTo);
      formData.append('deductionsCount', chapterVIADeductions.length);
      
      chapterVIADeductions.forEach((deduction, index) => {
        formData.append(`section_${index}`, deduction.section);
        formData.append(`amount_${index}`, deduction.amount);
        if (deduction.receipt && deduction.receipt instanceof File) {
          formData.append(`receipt_${index}`, deduction.receipt);
        }
      });

      const response = await axios.post('http://localhost:5000/api/form12bb/chaptervia', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials:true
      });

      if (response.data.success) {
        setChapterVIAStatus('PENDING');
        showNotification('Chapter VI-A details saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Error saving Chapter VI-A details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    // Don't reset employeeId as it comes from session
    setFinancialYearFrom('');
    setFinancialYearTo('');
    setEmployeeVerified(false);
    setEmployeeData(null);
    setTabValue(0);
    setHraSelected(null);
    setLtcSelected(null);
    setHomeLoanSelected(null);
    setChapterVIASelected(null);
    setHraDetails({
      rentPaid: '',
      landlordName: '',
      landlordAddress: '',
      landlordPan:'',
      rentReceipt: null
    });
    setLtcDetails({
      amount: '',
      travelBill: null
    });
    setHomeLoanDetails({
      interestAmount: '',
      lenderName: '',
      lenderAccountNo: '',
      certificate: null
    });
    setChapterVIADeductions([
      { section: '', amount:'', receipt: null }
    ]);
    setHraStatus('');
    setLtcStatus('');
    setHomeLoanStatus('');
    setChapterVIAStatus('');
  };

  // Function to render status chip
  const renderStatusChip = (status) => {
    if (!status) return null;
    
    return (
      <Chip 
        label={status} 
        color={getStatusColor(status)} 
        size="small" 
        sx={{ ml: 2 }}
      />
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Form 12BB
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Declaration for Tax Deduction at Source
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {fetchingEmployeeId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !employeeVerified ? (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={4}>
                {/* Read-only Employee ID field */}
                <TextField
                  fullWidth
                  required
                  label="Employee ID"
                  value={employeeId}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ "& .MuiInputBase-input.Mui-disabled": { 
                    WebkitTextFillColor: "#000", 
                    opacity: 0.8 
                  } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Financial Year From"
                  value={financialYearFrom}
                  onChange={handleFinancialYearFromChange}
                  placeholder="YYYY"
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Financial Year To"
                  value={financialYearTo}
                  onChange={handleFinancialYearToChange}
                  placeholder="YYYY"
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={verifyEmployeeId}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Employee ID:</strong> {employeeId}
              </Typography>
              <Typography variant="body1">
                <strong>Financial Year:</strong> {financialYearFrom}-{financialYearTo}
              </Typography>
              {employeeData && employeeData.name && (
                <Typography variant="body1">
                  <strong>Employee Name:</strong> {employeeData.name}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="Form 12BB tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>HRA</span>
                  </Box>
                } />
                <Tab label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>LTC</span>
                  </Box>
                } />
                <Tab label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>Home Loan Interest</span>
                  </Box>
                } />
                <Tab label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>Chapter VI-A</span>
                  </Box>
                } />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">House Rent Allowance (HRA)</Typography>
                {hraStatus && (
                  <Chip 
                    label={hraStatus} 
                    color={getStatusColor(hraStatus)} 
                    size="medium"
                  />
                )}
              </Box>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Do you want to claim HRA?</FormLabel>
                <RadioGroup row name="hra-option" value={hraSelected === null ? '' : (hraSelected ? 'yes' : 'no')} onChange={handleHraChange}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {hraSelected && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Rent Paid to Landlord"
                        name="rentPaid"
                        type="number"
                        value={hraDetails.rentPaid}
                        onChange={handleHraDetailsChange}
                        InputProps={{ startAdornment: '₹' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Landlord Name"
                        name="landlordName"
                        value={hraDetails.landlordName}
                        onChange={handleHraDetailsChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Landlord Address"
                        name="landlordAddress"
                        multiline
                        rows={3}
                        value={hraDetails.landlordAddress}
                        onChange={handleHraDetailsChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Landlord PAN"
                        name="landlordPan"
                        value={hraDetails.landlordPan}
                        onChange={handleHraDetailsChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 1 }}
                      >
                        Upload Rent Receipt
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload('hra', 'rentReceipt')}
                          accept="image/jpeg,image/png,application/pdf"
                        />
                      </Button>
                      {hraDetails.rentReceipt && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          File selected: {hraDetails.rentReceipt.name}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }} 
                        onClick={saveHraDetails}
                        disabled={isLoading || hraStatus === 'APPROVED'}
                      >
                        {isLoading ? 'Saving...' : 'Save HRA Details'}
                      </Button>
                      {hraStatus === 'APPROVED' && (
                        <Typography variant="body2" color="success" sx={{ mt: 1 }}>
                          Your HRA claim has been approved. No changes allowed.
                        </Typography>
                      )}
                      {hraStatus === 'REJECTED' && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Your HRA claim was rejected. Please update and resubmit.
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Leave Travel Concession (LTC)</Typography>
                {ltcStatus && (
                  <Chip 
                    label={ltcStatus} 
                    color={getStatusColor(ltcStatus)} 
                    size="medium"
                  />
                )}
              </Box>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Do you want to claim LTC?</FormLabel>
                <RadioGroup row name="ltc-option" value={ltcSelected === null ? '' : (ltcSelected ? 'yes' : 'no')} onChange={handleLtcChange}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {ltcSelected && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Travel Amount"
                        name="amount"
                        type="number"
                        value={ltcDetails.amount}
                        onChange={handleLtcDetailsChange}
                        InputProps={{ startAdornment: '₹' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 1 }}
                      >
                        Upload Travel Bill
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload('ltc', 'travelBill')}
                          accept="image/jpeg,image/png,application/pdf"
                        />
                      </Button>
                      {ltcDetails.travelBill && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          File selected: {ltcDetails.travelBill.name}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }} 
                        onClick={saveLtcDetails}
                        disabled={isLoading || ltcStatus === 'APPROVED'}
                      >
                        {isLoading ? 'Saving...' : 'Save LTC Details'}
                      </Button>
                      {ltcStatus === 'APPROVED' && (
                        <Typography variant="body2" color="success" sx={{ mt: 1 }}>
                          Your LTC claim has been approved. No changes allowed.
                        </Typography>
                      )}
                      {ltcStatus === 'REJECTED' && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Your LTC claim was rejected. Please update and resubmit.
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Home Loan Interest</Typography>
                {homeLoanStatus && (
                  <Chip 
                    label={homeLoanStatus} 
                    color={getStatusColor(homeLoanStatus)} 
                    size="medium"
                  />
                )}
              </Box>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Do you want to claim Home Loan Interest?</FormLabel>
                <RadioGroup 
                  row 
                  name="home-loan-option" 
                  value={homeLoanSelected === null ? '' : (homeLoanSelected ? 'yes' : 'no')} 
                  onChange={handleHomeLoanChange}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {homeLoanSelected && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Interest Amount"
                        name="interestAmount"
                        type="number"
                        value={homeLoanDetails.interestAmount}
                        onChange={handleHomeLoanDetailsChange}
                        InputProps={{ startAdornment: '₹' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="enter the bank name" placement='top' arrow>
                      <TextField
                        fullWidth
                        label="Lender Name"
                        name="lenderName"
                        value={homeLoanDetails.lenderName}
                        onChange={handleHomeLoanDetailsChange}
                        required
                      />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                    <Tooltip title="enter the account number" placement='top' arrow>
                      <TextField
                        fullWidth
                        label="Lender Account Number"
                        name="lenderAccountNo"
                        value={homeLoanDetails.lenderAccountNo}
                        onChange={handleHomeLoanDetailsChange}
                        required
                      />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 1 }}
                      >
                        Upload Loan Certificate
                        <input
                          type="file"
                          hidden
                          onChange={handleFileUpload('homeLoan', 'certificate')}
                          accept="image/jpeg,image/png,application/pdf"
                        />
                      </Button>
                      {homeLoanDetails.certificate && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          File selected: {homeLoanDetails.certificate.name}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ mt: 2 }} 
                        onClick={saveHomeLoanDetails}
                        disabled={isLoading || homeLoanStatus === 'APPROVED'}
                      >
                        {isLoading ? 'Saving...' : 'Save Home Loan Details'}
                      </Button>
                      {homeLoanStatus === 'APPROVED' && (
                        <Typography variant="body2" color="success" sx={{ mt: 1 }}>
                          Your Home Loan claim has been approved. No changes allowed.
                        </Typography>
                      )}
                      {homeLoanStatus === 'REJECTED' && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Your Home Loan claim was rejected. Please update and resubmit.
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Chapter VI-A Deductions</Typography>
                {chapterVIAStatus && (
                  <Chip 
                    label={chapterVIAStatus} 
                    color={getStatusColor(chapterVIAStatus)} 
                    size="medium"
                  />
                )}
              </Box>
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Do you want to claim Chapter VI-A Deductions?</FormLabel>
                <RadioGroup 
                  row 
                  name="chapter-via-option" 
                  value={chapterVIASelected === null ? '' : (chapterVIASelected ? 'yes' : 'no')} 
                  onChange={handleChapterVIAChange}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {chapterVIASelected && (
                <Box sx={{ mt: 2 }}>
                  {chapterVIADeductions.map((deduction, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Section"
                            value={deduction.section}
                            onChange={(e) => handleChapterVIADetailsChange(index, 'section', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={deduction.amount}
                            onChange={(e) => handleChapterVIADetailsChange(index, 'amount', e.target.value)}
                            InputProps={{ startAdornment: '₹' }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                          >
                            Upload Proof
                            <input
                              type="file"
                              hidden
                              onChange={handleFileUpload('chapterVIA', 'receipt', index)}
                              accept="image/jpeg,image/png,application/pdf"
                            />
                          </Button>
                          {deduction.receipt && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              File selected: {deduction.receipt.name}
                            </Typography>
                          )}
                        </Grid>
                        {index > 0 && (
                          <Grid item xs={12}>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => removeChapterVIADeduction(index)}
                              disabled={chapterVIAStatus === 'APPROVED'}
                            >
                              Remove
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  ))}
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addChapterVIADeduction}
                    sx={{ mt: 1, mb: 3 }}
                    disabled={chapterVIAStatus === 'APPROVED'}
                  >
                    Add Another Deduction
                  </Button>
                  
                  <Grid container>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={saveChapterVIADetails}
                        disabled={isLoading || chapterVIAStatus === 'APPROVED'}
                      >
                        {isLoading ? 'Saving...' : 'Save Chapter VI-A Details'}
                      </Button>
                      {chapterVIAStatus === 'APPROVED' && (
                        <Typography variant="body2" color="success" sx={{ mt: 1 }}>
                          Your Chapter VI-A deductions have been approved. No changes allowed.
                        </Typography>
                      )}
                      {chapterVIAStatus === 'REJECTED' && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Your Chapter VI-A deductions were rejected. Please update and resubmit.
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={resetForm}
                disabled={isLoading}
              >
                Back
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default Form12BB;