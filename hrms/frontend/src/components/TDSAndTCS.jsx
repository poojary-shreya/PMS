import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5000/api';

const getFinancialYear = (transactionDate) => {
  if (!transactionDate) return '';
  
  const date = new Date(transactionDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (month >= 1 && month <= 3) {
    return `${year-1}-${year}`;
  } else {
    return `${year}-${year+1}`;
  }
};

const TdsTcsPage = ({employee_id,financial_year }) => {

  const [tdsEntries, setTdsEntries] = useState([]);
  const [tdsSection, setTdsSection] = useState('');
  const [deductorName, setDeductorName] = useState('');
  const [deductorAddress, setDeductorAddress] = useState('');
  const [deductorTan, setDeductorTan] = useState('');
  const [taxDeducted, setTaxDeducted] = useState('');
  const [incomeReceived, setIncomeReceived] = useState('');
  const [tdsTransactionDate, setTdsTransactionDate] = useState('');
  const [tdsFinancialYear, setTdsFinancialYear] = useState(financial_year || "");
  const [tdsEmployeeId, setTdsEmployeeId] = useState(employee_id || "");
  const [editingTdsId, setEditingTdsId] = useState(null);

  const [tcsEntries, setTcsEntries] = useState([]);
  const [tcsSection, setTcsSection] = useState('');
  const [collectorName, setCollectorName] = useState('');
  const [collectorAddress, setCollectorAddress] = useState('');
  const [collectorTan, setCollectorTan] = useState('');
  const [taxCollected, setTaxCollected] = useState('');
  const [tcsTransactionDate, setTcsTransactionDate] = useState('');
  const [tcsFinancialYear, setTcsFinancialYear] = useState(financial_year);
  const [tcsEmployeeId, setTcsEmployeeId] = useState(employee_id ||"");
  const [editingTcsId, setEditingTcsId] = useState(null);


  const [tdsSummary, setTdsSummary] = useState({
    totalEntries: 0,
    totalTaxDeducted: 0,
    totalIncome: 0
  });
  const [tcsSummary, setTcsSummary] = useState({
    totalEntries: 0,
    totalTaxCollected: 0
  });


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState({
    tds: false,
    tcs: false,
    summary: false
  });

  const financialYearOptions = [
    { value: '2024-25', label: '2024-25' },
    { value: '2023-24', label: '2023-24' },
    { value: '2022-23', label: '2022-23' },
    { value: '2021-22', label: '2021-22' },
    { value: '2020-21', label: '2020-21' }
  ];

 
  const tdsSectionOptions = [
    { value: 'Section 192', label: 'Section 192 - Salary' },
    { value: 'Section 194A', label: 'Section 194A - Interest other than interest on securities' },
    { value: 'Section 194C', label: 'Section 194C - Payment to contractors' },
    { value: 'Section 194I', label: 'Section 194I - Rent' },
    { value: 'Section 194J', label: 'Section 194J - Professional services' }
  ];

 
  const tcsSectionOptions = [
    { value: 'Section 206C(1)', label: 'Section 206C(1) - Sale of goods' },
    { value: 'Section 206C(1C)', label: 'Section 206C(1C) - Lease or license' },
    { value: 'Section 206C(1F)', label: 'Section 206C(1F) - Motor vehicle' },
    { value: 'Section 206C(1H)', label: 'Section 206C(1H) - Sale of goods' }
  ];


  useEffect(() => {
    if (employee_id) {
      fetchTdsEntries(employee_id);
      fetchTcsEntries(employee_id);
      fetchSummaries(employee_id);
      
      setTdsEmployeeId(employee_id);
      setTcsEmployeeId(employee_id);
    }
  }, [employee_id]);

  
  useEffect(() => {
    if (tdsTransactionDate) {
      setTdsFinancialYear(getFinancialYear(tdsTransactionDate));
    }
  }, [tdsTransactionDate]);

  useEffect(() => {
    if (tcsTransactionDate) {
      setTcsFinancialYear(getFinancialYear(tcsTransactionDate));
    }
  }, [tcsTransactionDate]);


  const fetchTdsEntries = async (empId) => {
    try {
      setLoading(prev => ({ ...prev, tds: true }));
      const response = await axios.get(`${API_BASE_URL}/employees/${empId}/tds`);
      if (response.data && response.data.data) {
        setTdsEntries(response.data.data);
      } else {
        setTdsEntries([]);
      }
    } catch (error) {
      console.error('Error fetching TDS entries:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch TDS entries';
      showSnackbar(errorMessage, 'error');
      setTdsEntries([]); 
    } finally {
      setLoading(prev => ({ ...prev, tds: false }));
    }
  };

  const fetchTcsEntries = async (empId) => {
    try {
      setLoading(prev => ({ ...prev, tcs: true }));
      const response = await axios.get(`${API_BASE_URL}/employees/${empId}/tcs`);
      if (response.data && response.data.data) {
        setTcsEntries(response.data.data);
      } else {
        setTcsEntries([]);
      }
    } catch (error) {
      console.error('Error fetching TCS entries:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch TCS entries';
      showSnackbar(errorMessage, 'error');
      setTcsEntries([]); 
    } finally {
      setLoading(prev => ({ ...prev, tcs: false }));
    }
  };

  const fetchSummaries = async (empId) => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));
      
      const fetchTdsSummary = axios.get(`${API_BASE_URL}/employees/${empId}/tds-summary`)
        .catch(error => {
          console.error('Error fetching TDS summary:', error);
          return { data: { totalEntries: 0, totalTaxDeducted: 0, totalIncome: 0 } };
        });
      
      const fetchTcsSummary = axios.get(`${API_BASE_URL}/employees/${empId}/tcs-summary`)
        .catch(error => {
          console.error('Error fetching TCS summary:', error);
          return { data: { totalEntries: 0, totalTaxCollected: 0 } };
        });
      
      const [tdsResponse, tcsResponse] = await Promise.all([fetchTdsSummary, fetchTcsSummary]);
      
      setTdsSummary(tdsResponse.data);
      setTcsSummary(tcsResponse.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      showSnackbar('Failed to fetch tax summaries', 'error');
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

 
  const tooltips = {
    employeeId: "Employee ID associated with this tax entry",
    financialYear: "Financial year of the tax entry (e.g., 2024-25)",
    tdsSection: "Select the appropriate TDS section under which tax was deducted",
    deductorName: "Enter the name of the person/entity who deducted tax",
    deductorAddress: "Enter the full address of the deductor",
    deductorTan: "Enter the 10-character Tax Deduction Account Number (TAN) of the deductor",
    taxDeducted: "Enter the amount of tax deducted in rupees",
    incomeReceived: "Enter the gross amount of income received before tax deduction",
    tdsTransactionDate: "Enter the date when the TDS was deducted",
    
    tcsSection: "Select the appropriate TCS section under which tax was collected",
    collectorName: "Enter the name of the person/entity who collected tax",
    collectorAddress: "Enter the full address of the collector",
    collectorTan: "Enter the 10-character Tax Collection Account Number (TAN) of the collector",
    taxCollected: "Enter the amount of tax collected in rupees",
    tcsTransactionDate: "Enter the date when the TCS was collected"
  };
 
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const handleAddTdsRow = async () => {
    if (!tdsSection || !deductorName || !deductorTan || !taxDeducted || !tdsEmployeeId) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, tds: true }));
      
      const tdsData = {
        employee_id: tdsEmployeeId,
        section: tdsSection,
        deductorName,
        deductorAddress,
        deductorTan,
        taxDeducted: parseFloat(taxDeducted),
        incomeReceived: incomeReceived ? parseFloat(incomeReceived) : 0,
        transactionDate: tdsTransactionDate,
        financialYear: tdsFinancialYear
      };

      if (editingTdsId) {
       
        await axios.put(`${API_BASE_URL}/employees/${tdsEmployeeId}/tds/${editingTdsId}`, tdsData);
        showSnackbar('TDS entry updated successfully');
        setEditingTdsId(null);
      } else {
   
        await axios.post(`${API_BASE_URL}/employees/${tdsEmployeeId}/tds`, tdsData);
        showSnackbar('TDS entry added successfully');
      }
      
      await fetchTdsEntries(tdsEmployeeId);
      await fetchSummaries(tdsEmployeeId);
      
    
      resetTdsForm();
    } catch (error) {
      console.error('Error saving TDS entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save TDS entry';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tds: false }));
    }
  };

  const handleDeleteTdsEntry = async (id) => {
    if (!id) {
      showSnackbar('Invalid entry ID', 'error');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, tds: true }));
      await axios.delete(`${API_BASE_URL}/employees/${tdsEmployeeId}/tds/${id}`);
     
      await fetchTdsEntries(tdsEmployeeId);
      await fetchSummaries(tdsEmployeeId);
      
      showSnackbar('TDS entry deleted successfully', 'info');
    } catch (error) {
      console.error('Error deleting TDS entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete TDS entry';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tds: false }));
    }
  };

  const handleEditTdsEntry = (entry) => {
    if (!entry) {
      showSnackbar('Invalid entry to edit', 'error');
      return;
    }
    
    setTdsEmployeeId(entry.employee_id);
    setTdsSection(entry.section || '');
    setDeductorName(entry.deductorName || '');
    setDeductorAddress(entry.deductorAddress || '');
    setDeductorTan(entry.deductorTan || '');
    setTaxDeducted(entry.taxDeducted ? entry.taxDeducted.toString() : '');
    setIncomeReceived(entry.incomeReceived ? entry.incomeReceived.toString() : '');
    setTdsTransactionDate(entry.transactionDate || '');
    setTdsFinancialYear(entry.financialYear || '');
    setEditingTdsId(entry.id);
    
    showSnackbar('Ready to edit TDS entry', 'info');
  };

  const resetTdsForm = () => {
    setTdsSection('');
    setDeductorName('');
    setDeductorAddress('');
    setDeductorTan('');
    setTaxDeducted('');
    setIncomeReceived('');
    setTdsTransactionDate('');
    setTdsFinancialYear('');
    setEditingTdsId(null);
  };


  const handleAddTcsRow = async () => {
    if (!tcsSection || !collectorName || !collectorTan || !taxCollected || !tcsEmployeeId) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, tcs: true }));
      
      const tcsData = {
        employee_id: tcsEmployeeId,
        section: tcsSection,
        collectorName,
        collectorAddress,
        collectorTan,
        taxCollected: parseFloat(taxCollected),
        transactionDate: tcsTransactionDate,
        financialYear: tcsFinancialYear
      };

      if (editingTcsId) {
     
        await axios.put(`${API_BASE_URL}/employees/${tcsEmployeeId}/tcs/${editingTcsId}`, tcsData);
        showSnackbar('TCS entry updated successfully');
        setEditingTcsId(null);
      } else {
     
        await axios.post(`${API_BASE_URL}/employees/${tcsEmployeeId}/tcs`, tcsData);
        showSnackbar('TCS entry added successfully');
      }
      
   
      await fetchTcsEntries(tcsEmployeeId);
      await fetchSummaries(tcsEmployeeId);
     
      resetTcsForm();
    } catch (error) {
      console.error('Error saving TCS entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save TCS entry';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tcs: false }));
    }
  };

  const handleDeleteTcsEntry = async (id) => {
    if (!id) {
      showSnackbar('Invalid entry ID', 'error');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, tcs: true }));
      await axios.delete(`${API_BASE_URL}/employees/${tcsEmployeeId}/tcs/${id}`);
      
   
      await fetchTcsEntries(tcsEmployeeId);
      await fetchSummaries(tcsEmployeeId);
      
      showSnackbar('TCS entry deleted successfully', 'info');
    } catch (error) {
      console.error('Error deleting TCS entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete TCS entry';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tcs: false }));
    }
  };

  const handleEditTcsEntry = (entry) => {
    if (!entry) {
      showSnackbar('Invalid entry to edit', 'error');
      return;
    }
    
    setTcsEmployeeId(entry.employee_id);
    setTcsSection(entry.section || '');
    setCollectorName(entry.collectorName || '');
    setCollectorAddress(entry.collectorAddress || '');
    setCollectorTan(entry.collectorTan || '');
    setTaxCollected(entry.taxCollected ? entry.taxCollected.toString() : '');
    setTcsTransactionDate(entry.transactionDate || '');
    setTcsFinancialYear(entry.financialYear || '');
    setEditingTcsId(entry.id);
    
    showSnackbar('Ready to edit TCS entry', 'info');
  };

  const resetTcsForm = () => {
    setTcsSection('');
    setCollectorName('');
    setCollectorAddress('');
    setCollectorTan('');
    setTaxCollected('');
    setTcsTransactionDate('');
    setTcsFinancialYear('');
    setEditingTcsId(null);
  };

  const handleRefreshData = () => {
    if (employee_id) {
      fetchTdsEntries(employee_id);
      fetchTcsEntries(employee_id);
      fetchSummaries(employee_id);
      showSnackbar('Data refreshed', 'info');
    } else {
      showSnackbar('Employee ID is required to refresh data', 'warning');
    }
  };


  const totalTdsAmount = tdsEntries.reduce((sum, entry) => sum + Number(entry.taxDeducted || 0), 0);
  const totalTcsAmount = tcsEntries.reduce((sum, entry) => sum + Number(entry.taxCollected || 0), 0);
  const totalIncome = tdsEntries.reduce((sum, entry) => sum + Number(entry.incomeReceived || 0), 0);

  return (
    <Container maxWidth="1500px" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
        }}
      >
        {/* <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom textAlign='center'
          sx={{ 
            color: 'black', 
            borderBottom: '2px solid black',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Details of TDS & TCS under Sec 192(2B)
        </Typography> */}
        
       
        <Box sx={{ mt: 4, mb: 6 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              color: 'black', 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Details of Tax Deducted at Source (TDS)
          </Typography>
          
          {/* <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden', borderRadius: 1 }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="TDS entries table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Financial Year</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Section (TDS)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Name of Deductor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Address of Deductor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>TAN of Deductor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Tax Deducted (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Income Received (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Transaction Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: ' #f5f7fa' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tdsEntries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{entry.employee_id}</TableCell>
                      <TableCell>{entry.financialYear}</TableCell>
                      <TableCell>{entry.section}</TableCell>
                      <TableCell>{entry.deductorName}</TableCell>
                      <TableCell>{entry.deductorAddress}</TableCell>
                      <TableCell>{entry.deductorTan}</TableCell>
                      <TableCell>₹{entry.taxDeducted.toLocaleString()}</TableCell>
                      <TableCell>₹{(entry.incomeReceived || 0).toLocaleString()}</TableCell>
                      <TableCell>{entry.transactionDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditTdsEntry(entry.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteTdsEntry(entry.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper> */}
          
        
          <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Add New TDS Entry</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.employeeId} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="tds-employee-id"
                    label="Employee ID"
                    value={tdsEmployeeId}
                    onChange={(e) => setTdsEmployeeId(e.target.value)}
                    InputProps={{ readOnly: true }}
                  />
                </Tooltip>
              </Grid>
              
            
              
              <Grid item xs={12} md={4}>
  <Tooltip title={tooltips.financialYear} placement="top" arrow>
    <FormControl fullWidth>
      <TextField
        id="tds-financial-year"
        label="Financial Year"
        value={tdsFinancialYear}
        onChange={(e) => setTdsFinancialYear(e.target.value)}
        variant="outlined"
        InputProps={{ readOnly: true }}
      />
    </FormControl>
  </Tooltip>
</Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.tdsSection} placement="top" arrow>
                  <FormControl fullWidth required>
                    <InputLabel id="tds-section-label">TDS Section</InputLabel>
                    <Select
                      labelId="tds-section-label"
                      id="tds-section"
                      value={tdsSection}
                      label="TDS Section"
                      onChange={(e) => setTdsSection(e.target.value)}
                    >
                      {tdsSectionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.deductorName} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="deductor-name"
                    label="Deductor Name"
                    value={deductorName}
                    onChange={(e) => setDeductorName(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.deductorTan} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="deductor-tan"
                    label="TAN of Deductor"
                    value={deductorTan}
                    onChange={(e) => setDeductorTan(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.deductorAddress} placement="top" arrow>
                  <TextField
                    fullWidth
                    id="deductor-address"
                    label="Address of Deductor"
                    multiline
                    rows={2}
                    value={deductorAddress}
                    onChange={(e) => setDeductorAddress(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.taxDeducted} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="tax-deducted"
                    label="Tax Deducted"
                    type="number"
                    value={taxDeducted}
                    onChange={(e) => setTaxDeducted(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.incomeReceived} placement="top" arrow>
                  <TextField
                    fullWidth
                    id="income-received"
                    label="Income Received"
                    type="number"
                    value={incomeReceived}
                    onChange={(e) => setIncomeReceived(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.tdsTransactionDate} placement="top" arrow>
                  <TextField
                    fullWidth
                    id="tds-transaction-date"
                    label="Transaction Date"
                    type="date"
                    value={tdsTransactionDate}
                    onChange={(e) => setTdsTransactionDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddTdsRow}
                  sx={{ mt: 1 }}
                >
                  Add TDS Entry
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
      
        <Box sx={{ mt: 4, mb: 6 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              color: 'black', 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Details of Tax Collected at Source (TCS)
          </Typography>
          
          {/* <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden', borderRadius: 1 }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="TCS entries table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Financial Year</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Section (TCS)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Name of Collector</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Address of Collector</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>TAN of Collector</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Tax Collected (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Transaction Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tcsEntries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{entry.employee_id}</TableCell>
                      <TableCell>{entry.financialYear}</TableCell>
                      <TableCell>{entry.section}</TableCell>
                      <TableCell>{entry.collectorName}</TableCell>
                      <TableCell>{entry.collectorAddress}</TableCell>
                      <TableCell>{entry.collectorTan}</TableCell>
                      <TableCell>₹{entry.taxCollected.toLocaleString()}</TableCell>
                      <TableCell>{entry.transactionDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditTcsEntry(entry.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteTcsEntry(entry.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper> */}
          
    
          <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Add New TCS Entry</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.employeeId} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="tcs-employee-id"
                    label="Employee ID"
                    value={tcsEmployeeId}
                    onChange={(e) => setTcsEmployeeId(e.target.value)}
                    InputProps={{ readOnly: true }}
                  />
                </Tooltip>
              </Grid>
              
              
              
              <Grid item xs={12} md={4}>
  <Tooltip title={tooltips.financialYear} placement="top" arrow>
    <FormControl fullWidth>
      <TextField
        id="tcs-financial-year"
        label="Financial Year"
        value={tcsFinancialYear}
        onChange={(e) => setTcsFinancialYear(e.target.value)}
        variant="outlined"
        InputProps={{ readOnly: true }}
      />
    </FormControl>
  </Tooltip>
</Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.tcsSection} placement="top" arrow>
                  <FormControl fullWidth required>
                    <InputLabel id="tcs-section-label">TCS Section</InputLabel>
                    <Select
                      labelId="tcs-section-label"
                      id="tcs-section"
                      value={tcsSection}
                      label="TCS Section"
                      onChange={(e) => setTcsSection(e.target.value)}
                    >
                      {tcsSectionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.collectorName} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="collector-name"
                    label="Collector Name"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.collectorTan} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="collector-tan"
                    label="TAN of Collector"
                    value={collectorTan}
                    onChange={(e) => setCollectorTan(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.collectorAddress} placement="top" arrow>
                  <TextField
                    fullWidth
                    id="collector-address"
                    label="Address of Collector"
                    multiline
                    rows={2}
                    value={collectorAddress}
                    onChange={(e) => setCollectorAddress(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.taxCollected} placement="top" arrow>
                  <TextField
                    required
                    fullWidth
                    id="tax-collected"
                    label="Tax Collected"
                    type="number"
                    value={taxCollected}
                    onChange={(e) => setTaxCollected(e.target.value)}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={4}>
                <Tooltip title={tooltips.tcsTransactionDate} placement="top" arrow>
                  <TextField
                    fullWidth
                    id="tcs-transaction-date"
                    label="Transaction Date"
                    type="date"
                    value={tcsTransactionDate}
                    onChange={(e) => setTcsTransactionDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddTcsRow}
                  sx={{ mt: 1 }}
                >
                  Add TCS Entry
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
       
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              color: 'black', 
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center' 
            }}
          >
            TDS & TCS Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderLeft: '4px solid #1976d2',
                  height: '100%'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    TDS Summary
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total TDS Entries:</span> 
                    <span style={{ fontWeight: 'bold' }}>{tdsEntries.length}</span>
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <span>Total TDS Amount:</span> 
                    <span style={{ fontWeight: 'bold' }}>₹{totalTdsAmount.toLocaleString()}</span>
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <span>Total Income Received:</span> 
                    <span style={{ fontWeight: 'bold' }}>₹{totalIncome.toLocaleString()}</span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderLeft: '4px solid #1976d2',
                  height: '100%'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    TCS Summary
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total TCS Entries:</span> 
                    <span style={{ fontWeight: 'bold' }}>{tcsEntries.length}</span>
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <span>Total TCS Amount:</span> 
                    <span style={{ fontWeight: 'bold' }}>₹{totalTcsAmount.toLocaleString()}</span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderLeft: '4px solid #1976d2',
                  height: '100%'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Total Tax Summary
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Tax Entries:</span> 
                    <span style={{ fontWeight: 'bold' }}>{tdsEntries.length + tcsEntries.length}</span>
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <span>Total Tax Amount:</span> 
                    <span style={{ fontWeight: 'bold' }}>₹{(totalTdsAmount + totalTcsAmount).toLocaleString()}</span>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
     
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TdsTcsPage;