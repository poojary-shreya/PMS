import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Calculate, TrendingUp, TrendingDown } from '@mui/icons-material';

// Styled components
const SummaryCard = styled(Card)(({ theme, regime }) => ({
  backgroundColor: regime === 'new' ? theme.palette.success.light : theme.palette.secondary.light,
  marginBottom: theme.spacing(3)
}));

const TaxLiabilityCalculator = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [financialYears] = useState(['2025-2026', '2024-2025', '2023-2024', '2022-2023']);
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [useInitialDeclarations, setUseInitialDeclarations] = useState(true);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmployeeIdChange = (event) => {
    setEmployeeId(event.target.value);
    setTaxData(null); // Reset tax data when employee ID changes
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setTaxData(null); // Reset tax data when year changes
  };

  const handleDeclarationToggle = () => {
    setUseInitialDeclarations(!useInitialDeclarations);
    setTaxData(null); // Reset tax data when declaration type changes
  };

  const calculateTaxLiability = async () => {
    if (!employeeId || !selectedYear) {
      setError('Please enter both an employee ID and select a financial year.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Corrected API URL to match the endpoint that works in Postman
      const apiUrl = `http://localhost:5000/api/payrolltax/calculate/${employeeId}/${selectedYear}?useInitialDeclarations=${useInitialDeclarations}`;
      
      try {
        // Changed from POST to GET since the URL in Postman is using query parameters
        const response = await fetch(apiUrl, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          }
          // Removed body since we're using query parameters now
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setTaxData(data.data);
      } catch (apiError) {
        console.warn('Backend API not available:', apiError);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error calculating tax liability:', err);
      setError(`Failed to calculate tax liability: ${err.message}`);
      setLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderTaxComparisonTable = () => {
    if (!taxData) return null;
    
    const sheet = taxData.tax_computation_sheet.particulars;
    
    return (
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table aria-label="tax comparison table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><Typography variant="subtitle2">Particulars</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">New Regime</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Old Regime</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(sheet).map(([key, values]) => {
              // Skip the prepaid_tax object as we'll handle it separately
              if (key === 'prepaid_tax') return null;
              
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <TableRow key={key} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                  <TableCell component="th" scope="row">
                    {formattedKey}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(values.new_regime)}</TableCell>
                  <TableCell align="right">{formatCurrency(values.old_regime)}</TableCell>
                </TableRow>
              );
            })}
            
            {/* Add TDS and TCS rows separately */}
            {sheet.prepaid_tax && (
              <>
                <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                  <TableCell component="th" scope="row">Tax Recovered (TDS)</TableCell>
                  <TableCell align="right">{formatCurrency(sheet.prepaid_tax.tds_amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(sheet.prepaid_tax.tds_amount)}</TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                  <TableCell component="th" scope="row">Tax Recovered (TCS)</TableCell>
                  <TableCell align="right">{formatCurrency(sheet.prepaid_tax.tcs_amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(sheet.prepaid_tax.tcs_amount)}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // const renderTaxSummary = () => {
  //   if (!taxData) return null;
    
  //   const { tax_difference, particulars } = taxData.tax_computation_sheet;
  //   const isBetter = tax_difference.better_regime === "New Regime";
    
  //   return (
  //     <SummaryCard regime={isBetter ? 'new' : 'old'} elevation={3}>
  //       <CardContent>
  //         <Typography variant="h5" align="center" gutterBottom>
  //           Tax Liability Summary
  //         </Typography>
          
  //         <Grid container spacing={2} sx={{ mt: 1 }}>
  //           <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //               <Typography variant="h6" color="primary">
  //                 {tax_difference.better_regime} is better
  //               </Typography>
  //             </Box>
  //           </Grid>
            
  //           <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //               {tax_difference.will_increase ? (
  //                 <TrendingDown color="success" fontSize="large" />
  //               ) : (
  //                 <TrendingUp color="error" fontSize="large" />
  //               )}
  //               <Typography variant="h6">
  //                 You {tax_difference.will_increase ? 'save' : 'pay extra'} {formatCurrency(tax_difference.amount)}
  //               </Typography>
  //             </Box>
  //           </Grid>
  //         </Grid>
          
  //         <Grid container spacing={2} sx={{ mt: 1 }}>
  //           <Grid item xs={12} md={6}>
  //             <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
  //               <Typography variant="subtitle2" gutterBottom>
  //                 Monthly Tax (New Regime)
  //               </Typography>
  //               <Typography variant="h6" color="primary">
  //                 {formatCurrency(particulars.tax_per_month.new_regime)}
  //               </Typography>
  //             </Paper>
  //           </Grid>
            
  //           <Grid item xs={12} md={6}>
  //             <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
  //               <Typography variant="subtitle2" gutterBottom>
  //                 Monthly Tax (Old Regime)
  //               </Typography>
  //               <Typography variant="h6" color="secondary">
  //                 {formatCurrency(particulars.tax_per_month.old_regime)}
  //               </Typography>
  //             </Paper>
  //           </Grid>
  //         </Grid>
  //       </CardContent>
  //     </SummaryCard>
  //   );
  // };
  
  // const renderTdsAndTcsDetails = () => {
  //   if (!taxData || !taxData.tax_computation_sheet.tds_tcs_details) return null;
    
  //   const { tds_entries, tcs_entries } = taxData.tax_computation_sheet.tds_tcs_details;
    
  //   return (
  //     <Paper elevation={2} sx={{ mb: 4, p: 3 }}>
  //       <Typography variant="h6" gutterBottom>TDS & TCS Details</Typography>
        
  //       {/* TDS Section */}
  //       {tds_entries && tds_entries.length > 0 && (
  //         <>
  //           <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>TDS Entries</Typography>
  //           <TableContainer>
  //             <Table size="small" aria-label="tds entries table">
  //               <TableHead>
  //                 <TableRow>
  //                   <TableCell>Source</TableCell>
  //                   <TableCell align="right">Amount</TableCell>
  //                   <TableCell align="right">Income Received</TableCell>
  //                 </TableRow>
  //               </TableHead>
  //               <TableBody>
  //                 {tds_entries.map((entry, index) => (
  //                   <TableRow key={index}>
  //                     <TableCell>{entry.source || 'N/A'}</TableCell>
  //                     <TableCell align="right">{formatCurrency(entry.amount || 0)}</TableCell>
  //                     <TableCell align="right">{formatCurrency(entry.income_received || 0)}</TableCell>
  //                   </TableRow>
  //                 ))}
  //                 <TableRow sx={{ backgroundColor: 'grey.100' }}>
  //                   <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
  //                   <TableCell align="right" sx={{ fontWeight: 'bold' }}>
  //                     {formatCurrency(taxData.tax_computation_sheet.tds_tcs_details.total_tds_amount || 0)}
  //                   </TableCell>
  //                   <TableCell align="right" sx={{ fontWeight: 'bold' }}>
  //                     {formatCurrency(taxData.tax_computation_sheet.tds_tcs_details.total_tds_income_received || 0)}
  //                   </TableCell>
  //                 </TableRow>
  //               </TableBody>
  //             </Table>
  //           </TableContainer>
  //         </>
  //       )}
        
  //       {/* TCS Section */}
  //       {tcs_entries && tcs_entries.length > 0 && (
  //         <>
  //           <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>TCS Entries</Typography>
  //           <TableContainer>
  //             <Table size="small" aria-label="tcs entries table">
  //               <TableHead>
  //                 <TableRow>
  //                   <TableCell>Source</TableCell>
  //                   <TableCell align="right">Amount</TableCell>
  //                 </TableRow>
  //               </TableHead>
  //               <TableBody>
  //                 {tcs_entries.map((entry, index) => (
  //                   <TableRow key={index}>
  //                     <TableCell>{entry.source || 'N/A'}</TableCell>
  //                     <TableCell align="right">{formatCurrency(entry.amount || 0)}</TableCell>
  //                   </TableRow>
  //                 ))}
  //                 <TableRow sx={{ backgroundColor: 'grey.100' }}>
  //                   <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
  //                   <TableCell align="right" sx={{ fontWeight: 'bold' }}>
  //                     {formatCurrency(taxData.tax_computation_sheet.tds_tcs_details.total_tcs_amount || 0)}
  //                   </TableCell>
  //                 </TableRow>
  //               </TableBody>
  //             </Table>
  //           </TableContainer>
  //         </>
  //       )}
        
  //       {/* Summary Section */}
  //       <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
  //         <Typography variant="subtitle2" gutterBottom>Total Pre-paid Tax</Typography>
  //         <Typography variant="h6" color="primary">
  //           {formatCurrency((taxData.tax_computation_sheet.tds_tcs_details.total_tds_amount || 0) + 
  //                         (taxData.tax_computation_sheet.tds_tcs_details.total_tcs_amount || 0))}
  //         </Typography>
  //       </Box>
  //     </Paper>
  //   );
  // };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tax Liability Calculator
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              id="employee-id"
              label="Employee ID"
              variant="outlined"
              fullWidth
              value={employeeId}
              onChange={handleEmployeeIdChange}
              placeholder="Enter employee ID"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              id="financial-year"
              select
              label="Financial Year"
              value={selectedYear}
              onChange={handleYearChange}
              fullWidth
              variant="outlined"
            >
              {financialYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={useInitialDeclarations}
                  onChange={handleDeclarationToggle}
                  color="primary"
                />
              }
              label="Use Initial Declarations"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={calculateTaxLiability}
              disabled={loading || !employeeId || !selectedYear}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Calculate />}
              size="large"
            >
              {loading ? 'Calculating...' : 'Calculate Tax Liability'}
            </Button>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {taxData && (
        <Box>
          {/* {renderTaxSummary()}
          
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Detailed Tax Computation
          </Typography> */}
         
          {renderTaxComparisonTable()}
          
          {/* <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            TDS & TCS Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderTdsAndTcsDetails()} */}
        </Box>
      )}
    </Box>
  );
};

export default TaxLiabilityCalculator;