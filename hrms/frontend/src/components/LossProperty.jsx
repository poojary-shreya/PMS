import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Button,
  Paper,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PropertyLossForm = ({employee_id,financial_year}) => {
  const [employeeId, setEmployeeId] = useState(employee_id || '');
  const [fiscalYear, setFiscalYear] = useState(financial_year || '');
  const [claimingLoss, setClaimingLoss] = useState('Yes');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  

  const [selfOccupiedAmount, setSelfOccupiedAmount] = useState(0);
  

  const [letOutLossAmount, setLetOutLossAmount] = useState(0);
  const [letOutIncomeAmount, setLetOutIncomeAmount] = useState(0);
  

  const [isFirstResidential1, setIsFirstResidential1] = useState('Yes');
  const [interestAmount1, setInterestAmount1] = useState('');
  const [address1, setAddress1] = useState('');
  const [occupationDate1, setOccupationDate1] = useState(null);
  const [city1, setCity1] = useState('');
  const [loanSanctionDate1, setLoanSanctionDate1] = useState(null);
  const [houseValue1, setHouseValue1] = useState('');
  const [lenderName1, setLenderName1] = useState('');
  const [lenderAddress1, setLenderAddress1] = useState('');
  const [lenderPAN1, setLenderPAN1] = useState('');
  

  const [isFirstResidential2, setIsFirstResidential2] = useState('No');
  const [interestAmount2, setInterestAmount2] = useState('');
  const [address2, setAddress2] = useState('');
  const [occupationDate2, setOccupationDate2] = useState(null);
  const [city2, setCity2] = useState('');
  const [loanSanctionDate2, setLoanSanctionDate2] = useState(null);
  const [houseValue2, setHouseValue2] = useState('');
  const [lenderName2, setLenderName2] = useState('');
  const [lenderAddress2, setLenderAddress2] = useState('');
  const [lenderPAN2, setLenderPAN2] = useState('');
  

  const [letOutAddress, setLetOutAddress] = useState('');
  const [letOutOccupationDate, setLetOutOccupationDate] = useState(null);
  const [rentalIncome, setRentalIncome] = useState('');
  const [municipalTax, setMunicipalTax] = useState('0');
  const [netAnnualValue, setNetAnnualValue] = useState(0);
  const [repairsValue, setRepairsValue] = useState(0);
  const [netRentalIncome, setNetRentalIncome] = useState(0);
  const [interestOnLoan, setInterestOnLoan] = useState('');
  const [totalInterestPaid, setTotalInterestPaid] = useState('');
  const [letOutLenderName, setLetOutLenderName] = useState('');
  const [carryForwardLoss, setCarryForwardLoss] = useState('0');
  const [intraHeadSetOff, setIntraHeadSetOff] = useState('');
  const [letOutLenderAddress, setLetOutLenderAddress] = useState('');
  const [letOutLenderPAN, setLetOutLenderPAN] = useState('');

  const cities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

 
  useEffect(() => {
    if (rentalIncome && municipalTax) {
      const netValue = Number(rentalIncome) - Number(municipalTax);
      setNetAnnualValue(netValue);
      
      const repairs = netValue * 0.3;
      setRepairsValue(repairs);
      
      const netRental = netValue - repairs;
      setNetRentalIncome(netRental);
    }
  }, [rentalIncome, municipalTax]);


  useEffect(() => {
    // Log the props to confirm they're being received
    console.log("Props received:", { employee_id, financial_year });
    
    if (employee_id && financial_year) {
      setEmployeeId(employee_id);
      setFiscalYear(financial_year);
      fetchPropertyData();
    }
  }, [employee_id, financial_year]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/property-loss/${employeeId}/${fiscalYear}`);
      if (response.data) {
        
        const data = response.data;
        setClaimingLoss(data.claimingLoss || 'Yes');
        setSelfOccupiedAmount(data.selfOccupiedAmount || 0);
        setLetOutLossAmount(data.letOutLossAmount || 0);
        setLetOutIncomeAmount(data.letOutIncomeAmount || 0);
        
      
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setNotification({
        open: true,
        message: 'Failed to load property data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
  
    const formData = {
      employeeId,
      fiscalYear,
      claimingLoss,
      selfOccupiedProperty: {
        amount: selfOccupiedAmount,
      },
      letOutProperty: {
        lossAmount: letOutLossAmount,
        incomeAmount: letOutIncomeAmount,
      },
      selfOccupiedProperty1: {
        isFirstResidential: isFirstResidential1,
        interestAmount: interestAmount1,
        address: address1,
        occupationDate: occupationDate1,
        city: city1,
        loanSanctionDate: loanSanctionDate1,
        houseValue: houseValue1,
        lenderName: lenderName1,
        lenderAddress: lenderAddress1,
        lenderPAN: lenderPAN1,
      },
      selfOccupiedProperty2: {
        isFirstResidential: isFirstResidential2,
        interestAmount: interestAmount2,
        address: address2,
        occupationDate: occupationDate2,
        city: city2,
        loanSanctionDate: loanSanctionDate2,
        houseValue: houseValue2,
        lenderName: lenderName2,
        lenderAddress: lenderAddress2,
        lenderPAN: lenderPAN2,
      },
      letOutPropertyDetails: {
        address: letOutAddress,
        occupationDate: letOutOccupationDate,
        rentalIncome,
        municipalTax,
        netAnnualValue,
        repairsValue,
        netRentalIncome,
        interestOnLoan,
        totalInterestPaid,
        lenderName: letOutLenderName,
        carryForwardLoss,
        intraHeadSetOff,
        lenderAddress: letOutLenderAddress,
        lenderPAN: letOutLenderPAN,
      }
    };
    
    try {
     
      await axios.post('http://localhost:5000/api/property-loss', formData);
      
      setNotification({
        open: true,
        message: 'Property loss data saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving property data:', error);
      setNotification({
        open: true,
        message: 'Failed to save property data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Loss on House Property
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={3}>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="employeeId"
                label="Employee ID"
                value={employeeId}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="fiscalYear"
                label="Financial Year"
                value={fiscalYear}
                InputProps={{ readOnly: true }}
              />
            </Grid>
              
          
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">LOSS ON HOUSE PROPERTY:</FormLabel>
                  <RadioGroup
                    row
                    value={claimingLoss}
                    onChange={(e) => setClaimingLoss(e.target.value)}
                  >
                    <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              {claimingLoss === 'Yes' && (
                <>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Particulars
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                      
                        <Grid item xs={8}>
                          <Typography variant="subtitle1">Self-Occupied Property</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                             
                            }}
                            value={selfOccupiedAmount}
                            onChange={(e) => setSelfOccupiedAmount(e.target.value)}
                            helperText="Limit: ₹2,00,000"
                          />
                        </Grid>
                        
                        <Grid item xs={8}>
                          <Typography variant="subtitle1">Loss from Let Out Property</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={letOutLossAmount}
                            onChange={(e) => setLetOutLossAmount(e.target.value)}
                            helperText="Limit: ₹2,00,000"
                          />
                        </Grid>
                        
                        <Grid item xs={8}>
                          <Typography variant="subtitle1">Income from Let Out Property</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={letOutIncomeAmount}
                            onChange={(e) => setLetOutIncomeAmount(e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
              
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Self-Occupied Property 1
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">First Residential Property:</FormLabel>
                            <RadioGroup
                              row
                              value={isFirstResidential1}
                              onChange={(e) => setIsFirstResidential1(e.target.value)}
                            >
                              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                              <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Interest Amount"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={interestAmount1}
                            onChange={(e) => setInterestAmount1(e.target.value)}
                            helperText="Limit: ₹2,00,000"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Actual Value of the House Property"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={houseValue1}
                            onChange={(e) => setHouseValue1(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address of Property"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <DatePicker
                            label="Date of Occupation"
                            value={occupationDate1}
                            onChange={(date) => setOccupationDate1(date)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <DatePicker
                            label="Loan Sanction Date"
                            value={loanSanctionDate1}
                            onChange={(date) => setLoanSanctionDate1(date)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel id="city-label">City</InputLabel>
                            <Select
                              labelId="city-label"
                              value={city1}
                              onChange={(e) => setCity1(e.target.value)}
                            >
                              {cities.map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                       
                        
                        
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name of the Lender"
                            value={lenderName1}
                            onChange={(e) => setLenderName1(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="PAN of the Lender"
                            value={lenderPAN1}
                            onChange={(e) => setLenderPAN1(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Address of the Lender"
                            value={lenderAddress1}
                            onChange={(e) => setLenderAddress1(e.target.value)}
                          />
                        </Grid>
                        
                        
                      </Grid>
                    </Paper>
                  </Grid>
                  
             
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Self-Occupied Property 2
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">First Residential Property:</FormLabel>
                            <RadioGroup
                              row
                              value={isFirstResidential2}
                              onChange={(e) => setIsFirstResidential2(e.target.value)}
                            >
                              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                              <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Interest Amount"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={interestAmount2}
                            onChange={(e) => setInterestAmount2(e.target.value)}
                            helperText="Limit: ₹2,00,000"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Actual Value of the House Property"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={houseValue2}
                            onChange={(e) => setHouseValue2(e.target.value)}
                          />
                        </Grid>
                        
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address of Property"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <DatePicker
                            label="Date of Occupation"
                            value={occupationDate2}
                            onChange={(date) => setOccupationDate2(date)}
                            renderInput={(params) => (
                                <TextField
                                {...params}
                                
                                />
                            )}
                            />
                        </FormControl>

                        </Grid>
                        
                        
                        
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <DatePicker
                            label="Loan Sanction Date"
                            value={loanSanctionDate2}
                            onChange={(date) => setLoanSanctionDate2(date)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                          />
                          </FormControl>
                        </Grid>

                        
                        
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="city2-label">City</InputLabel> 
                            <Select
                            labelId="city2-label"
                            value={city2}
                            label="City"   
                            onChange={(e) => setCity2(e.target.value)}
                            >
                            {cities.map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name of the Lender"
                            value={lenderName2}
                            onChange={(e) => setLenderName2(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="PAN of the Lender"
                            value={lenderPAN2}
                            onChange={(e) => setLenderPAN2(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Address of the Lender"
                            value={lenderAddress2}
                            onChange={(e) => setLenderAddress2(e.target.value)}
                          />
                        </Grid>
                        
                        
                      </Grid>
                    </Paper>
                  </Grid>
                  
                 
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Let-Out Property Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address of Property"
                            value={letOutAddress}
                            onChange={(e) => setLetOutAddress(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <DatePicker
                          fullWidth
                            label="Date of Occupation (DD/MM/YYYY)"
                            value={letOutOccupationDate}
                            onChange={(date) => setLetOutOccupationDate(date)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            placeholder="01/04/2025"
                          />
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Rental Income Received/Receivable for the Financial Year"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={rentalIncome}
                            onChange={(e) => setRentalIncome(e.target.value)}
                            
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Less: Municipal Tax Paid"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={municipalTax}
                            onChange={(e) => setMunicipalTax(e.target.value)}
                            
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Net Annual Value"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              readOnly: true,
                            }}
                            value={netAnnualValue}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Less: Repairs (30% of Net Annual Value)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              readOnly: true,
                            }}
                            value={repairsValue}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Net Rental Income"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              readOnly: true,
                            }}
                            value={netRentalIncome}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Less: Interest (Paid or Payable) on Borrowed Capital"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={interestOnLoan}
                            onChange={(e) => setInterestOnLoan(e.target.value)}
                            
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Total Interest Paid by Me (post-construction/possession)"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={totalInterestPaid}
                            onChange={(e) => setTotalInterestPaid(e.target.value)}
                            
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name of the Lender"
                            value={letOutLenderName}
                            onChange={(e) => setLetOutLenderName(e.target.value)}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Carry Forward Loss Amount from Previous Financial Years"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            value={carryForwardLoss}
                            onChange={(e) => setCarryForwardLoss(e.target.value)}
                            
                          />
                        </Grid>
                        
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Address of the Lender"
                            value={letOutLenderAddress}
                            onChange={(e) => setLetOutLenderAddress(e.target.value)}
                            placeholder="SBI Sanjaynagar, Bangalore"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="PAN of the Lender"
                            value={letOutLenderPAN}
                            onChange={(e) => setLetOutLenderPAN(e.target.value)}
                            helperText="Mandatory if interest > ₹50,000"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}
              
           
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Property Details'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
     
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default PropertyLossForm;