import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  Paper,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const TaxComparisonDisplay = ({employee_id,financial_year}) => {
  const [taxData, setTaxData] = useState([]);
  const [allowancesData, setAllowancesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Verified Proofs");
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(employee_id);
  const [financialYear, setFinancialYear] = useState(financial_year);
  const financialYears = ['2026-2027','2025-2026', '2024-2025', '2023-2024', '2022-2023'];


  useEffect(() => {
    if (employee_id !== undefined) {
      setEmployeeId(employee_id);
    }
    if (financial_year !== undefined) {
      setFinancialYear(financial_year);
    }
  }, [employee_id, financial_year]);

  // If props are provided, fetch data automatically when component mounts
  useEffect(() => {
    if (employeeId && financialYear) {
      fetchTaxData();
    }
  }, []);  



  const fetchTaxData = async () => {
    if (!employeeId) {
      setError('Please enter an employee ID');
      return;
    }

    try {
      setLoading(true);
      // Fetch tax data
      const response = await fetch(`http://localhost:5000/api/payrolltax/calculatedtax/${employeeId}/${financialYear}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setTaxData(result.data);
      
      // Fetch allowances data
      const allowancesResponse = await fetch(`http://localhost:5000/api/allowances?employee_id=${employeeId}&financial_year=${financialYear}`);
      
      if (allowancesResponse.ok) {
        const allowancesResult = await allowancesResponse.json();
        setAllowancesData(allowancesResult.data);
        console.log(allowancesResult.data);
      }
      
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      setLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Get the filtered data based on active tab
  const getFilteredData = () => {
    return taxData.filter(item => item.calculation_mode === activeTab);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format key for display
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* Search Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Employee ID"
              variant="outlined"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter employee ID"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Financial Year"
              variant="outlined"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              {financialYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchTaxData}
              disabled={loading || !employeeId}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Loading...' : 'Computed Sheet'}
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Paper>

      {taxData && taxData.length > 0 && (
        <Box>
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" textAlign="center">
            Computed Sheet
          </Typography>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab}
              onChange={handleTabChange}
              aria-label="tax calculation mode tabs"
            >
              <Tab label="Verified Proofs" value="Verified Proofs" />
              <Tab label="Initial Declarations" value="Initial Declarations" />
            </Tabs>
          </Box>

          {/* Tax Comparison Table */}
          <Paper elevation={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Particulars</TableCell>
                    <TableCell align="right">New Regime</TableCell>
                    <TableCell align="right">Old Regime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData().length > 0 && (
                    <>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Gross Salary</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].gross_salary_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].gross_salary_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Exemption U/S 10</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].exemption_us_10_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].exemption_us_10_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Net Salary(After Section 10 Exemption)</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].net_salary_after_section_10_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].net_salary_after_section_10_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Standard Deduction & Professional Tax</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].standard_deduction_and_professional_tax_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].standard_deduction_and_professional_tax_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Net Taxable Salary</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].net_taxable_salary_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].net_taxable_salary_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Loss From House Property</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].house_property_loss_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].house_property_loss_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Income From Other Sources</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].income_from_other_sources_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].income_from_other_sources_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Deduction Under Chapter VI-A</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].deduction_under_chapter_vi_a_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].deduction_under_chapter_vi_a_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover sx={{ bgcolor: 'grey.100' }}>
                        <TableCell component="th" scope="row">
                          <Typography fontWeight="bold">Taxable Income</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatCurrency(getFilteredData()[0].taxable_income_new_regime)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatCurrency(getFilteredData()[0].taxable_income_old_regime)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Tax Payable on Total Income</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_payable_on_total_income_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_payable_on_total_income_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Rebate U/S 87A</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].rebate_us_87a_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].rebate_us_87a_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Tax After Rebate</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_payable_after_section_87a_rebate_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_payable_after_section_87a_rebate_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Education Cess</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].cess_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].cess_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover sx={{ bgcolor: 'grey.100' }}>
                        <TableCell component="th" scope="row">
                          <Typography fontWeight="bold">Total Tax Payable</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatCurrency(getFilteredData()[0].total_tax_payable_new_regime)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatCurrency(getFilteredData()[0].total_tax_payable_old_regime)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Tax Recovered TDS</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_recovered_tds_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_recovered_tds_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Tax Recovered TCS</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_recovered_tcs_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_recovered_tds_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Balance Tax Payable</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].total_tax_payable_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].total_tax_payable_old_regime)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell component="th" scope="row">Monthly Tax</TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_per_month_new_regime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(getFilteredData()[0].tax_per_month_old_regime)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {getFilteredData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No data available for {activeTab} mode
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Tax Liability Summary */}
          <Paper elevation={3} sx={{ mt: 4, borderTop: '4px solid #1976d2' }}>
            <Box p={3}>
              <Typography variant="h5" align="center" gutterBottom fontWeight="medium">
                Tax Liability Summary
              </Typography>
              
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary" fontWeight="medium">
                      {taxData[0].better_regime} is better
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main" fontWeight="medium">
                      You save {formatCurrency(taxData[0].tax_difference_amount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Monthly Tax (New Regime)
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="medium">
                        {formatCurrency(taxData[0].tax_per_month_new_regime)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Monthly Tax (Old Regime)
                      </Typography>
                      <Typography variant="h6" color="secondary" fontWeight="medium">
                        {formatCurrency(taxData[0].tax_per_month_old_regime)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Employee Allowances Table */}
          <Paper elevation={3} sx={{ mt: 4, borderTop: '4px solid #1976d2' }}>
            <Box p={3}>
              <Typography variant="h5" align="center" gutterBottom fontWeight="medium">
                Exemptions
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">HRA</TableCell>
                      <TableCell align="right">
                        {allowancesData ? formatCurrency(allowancesData.hra) : '₹0'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Medical Allowance</TableCell>
                      <TableCell align="right">
                        {allowancesData ? formatCurrency(allowancesData.medical_allowance) : '₹0'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Newspaper Allowance</TableCell>
                      <TableCell align="right">
                        {allowancesData ? formatCurrency(allowancesData.newspaper_allowance) : '₹0'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Dress Allowance</TableCell>
                      <TableCell align="right">
                        {allowancesData ? formatCurrency(allowancesData.dress_allowance) : '₹0'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Other Allowance</TableCell>
                      <TableCell align="right">
                        {allowancesData ? formatCurrency(allowancesData.other_allowance) : '₹0'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="bold">Total Exemptions</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {allowancesData ? formatCurrency(
                            Number(allowancesData.hra) +
                            Number(allowancesData.medical_allowance) +
                            Number(allowancesData.newspaper_allowance) +
                            Number(allowancesData.dress_allowance) +
                            Number(allowancesData.other_allowance)
                          ) : '₹0'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Box>
      )}

      {!loading && taxData.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Enter an employee ID and click Computed Sheet to view tax comparison data
          </Typography>
        </Paper>
      )}
      
    </Container>
  );
};

export default TaxComparisonDisplay;