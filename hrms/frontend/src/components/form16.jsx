import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close,
  Print,
  GetApp,
  Search
} from '@mui/icons-material';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

const Form16UI = () => {
  const [showDialog, setShowDialog] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [financialYearFrom, setFinancialYearFrom] = useState('');
  const [financialYearTo, setFinancialYearTo] = useState('');
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const formRef = useRef(null);


  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 10; year <= currentYear + 2; year++) {
    yearOptions.push(year.toString());
  }

  useEffect(() => {
 
    setShowDialog(true);
  }, []);

useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/current',{withCredentials:true});
      
      if (response.data.employee_id) {
        setEmployeeId(response.data.employee_id);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };
  
  fetchCurrentUser();
}, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Employee ID is required');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
    
      let queryParams = {
        employee_id: employeeId
      };
      
      if (financialYearFrom) {
        queryParams.financial_year_from = `${financialYearFrom}-04-01`;
      }
      
      if (financialYearTo) {
        queryParams.financial_year_to = `${financialYearTo}-03-31`;
      }
  
      const response = await axios.get('http://localhost:5000/api/form/form16', {
        params: queryParams,
        withCredentials:true
      });
      
      console.log(response);
      
      const result = response.data;
      
      if (!result.success) {
        setError(result.message);
        setFormData(null);
      } else {
        setFormData(result.data);
        setShowDialog(false);
      }
    } catch (err) {
      console.error("API fetch error:", err);
      setError(err.response?.data?.message || 'Failed to fetch Form 16 data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
    if (!formRef.current) return;
    
    const printContent = formRef.current.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=11000");
    
 
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (error) {
          return ""; 
        }
      })
      .join("\n");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Form 16</title>
          <style>${styles}</style>
        </head>
        <body>
          <div id="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };

  const handleDownload = async () => {
    if (!formRef.current) return;
    
    try {
     
      const formWidth = formRef.current.offsetWidth;
      const formHeight = formRef.current.offsetHeight;
      

      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: formWidth,
        height: formHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: formWidth,
        windowHeight: formHeight,
        logging: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
     
      const aspectRatio = formHeight / formWidth;
      const pdfWidth = 210; 
      const pdfHeight = pdfWidth * aspectRatio;
      
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape', 
        unit: 'mm',
        format: [pdfWidth, pdfHeight + 20] 
      });
      
 
      const margin = 10;
      pdf.addImage(
        imgData, 
        'JPEG', 
        margin, 
        margin, 
        pdfWidth - (2 * margin), 
        pdfHeight - (2 * margin)
      );
      

      const fileName = `Form16_${employeeId}_${financialYearFrom}_${financialYearTo}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleNewSearch = () => {
    setShowDialog(true);
    setFormData(null);
    setError('');
  };

  const calculateTotalAmountPaid = () => {
    if (!formData?.partA) return '0.00';
    return (
      parseFloat(formData.partA.q1_amount_paid || 0) +
      parseFloat(formData.partA.q2_amount_paid || 0) +
      parseFloat(formData.partA.q3_amount_paid || 0) +
      parseFloat(formData.partA.q4_amount_paid || 0)
    ).toFixed(2);
  };

  const calculateTotalTaxDeducted = () => {
    if (!formData?.partA) return '0.00';
    return (
      parseFloat(formData.partA.q1_tax_deducted || 0) +
      parseFloat(formData.partA.q2_tax_deducted || 0) +
      parseFloat(formData.partA.q3_tax_deducted || 0) +
      parseFloat(formData.partA.q4_tax_deducted || 0)
    ).toFixed(2);
  };

  const calculateTotalTaxDeposited = () => {
    if (!formData?.partA) return '0.00';
    return (
      parseFloat(formData.partA.q1_tax_deposited || 0) +
      parseFloat(formData.partA.q2_tax_deposited || 0) +
      parseFloat(formData.partA.q3_tax_deposited || 0) +
      parseFloat(formData.partA.q4_tax_deposited || 0)
    ).toFixed(2);
  };

 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
   
      let date;
      if (dateString.includes('T')) {
    
        date = new Date(dateString);
      } else {
    
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      }
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };


  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  const EmployeeHeader = () => {
    if (!formData) return null;
    
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body1">
              <strong>Name:</strong> {formData.partA.personal.firstName} {formData.partA.personal.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body1">
              <strong>Employee ID:</strong> {employeeId}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body1">
              <strong>Certificate No:</strong> {formData.partA.certifiacte_no || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body1">
              <strong>Last Updated:</strong> {formData.partA.updatedAt ? formatDate(formData.partA.updatedAt) : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const PartA = () => {
    if (!formData) return null;
    
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Part A - Certificate under section 203 of the Income-tax Act, 1961
        </Typography>
        
      
        <Grid container spacing={3} sx={{ mb: 3 }}>
        
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader title="Employer Information" sx={{ bgcolor: '#f5f5f5', py: 1 }} />
              <CardContent>
                <Typography variant="body1" fontWeight="medium">
                  {formData.partA.employer_name || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.partA.employer_address || 'Address not available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
        
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader title="Employee Information" sx={{ bgcolor: '#f5f5f5', py: 1 }} />
              <CardContent>
                <Typography variant="body1" fontWeight="medium">
                  {formData.partA.personal.firstName} {formData.partA.personal.lastName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.partA.personal.houseNumber},{formData.partA.personal.street},
                  {formData.partA.personal.area},{formData.partA.personal.city},{formData.partA.personal.pinCode}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
    
        <Grid container spacing={3} sx={{ mb: 3 }}>
       
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Employer PAN</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.partA.employer_pan || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Employer TAN</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.partA.employer_tan || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
       
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Employee PAN</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.partA.personal.panNumber || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
   
        <Grid container spacing={3} sx={{ mb: 3 }}>
   
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Commissioner of Income Tax (CIT)</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.partA.cit || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
       
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Assessment Year</Typography>
                    <Typography variant="body1" fontWeight="medium">{formData.partA.assessment_year||"N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Financial Year</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {`${formData.partA.financial_year_from} - ${formData.partA.financial_year_to}`}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
      
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Summary of Tax Deducted at Source
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Quarter</TableCell>
                  <TableCell align="right">Amount Paid</TableCell>
                  <TableCell align="right">Tax Deducted</TableCell>
                  <TableCell align="right">Tax Deposited</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Q1 (Apr-Jun)</TableCell>
                  <TableCell align="right">{formData.partA.q1_amount_paid.toFixed(2)|| '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q1_tax_deducted.toFixed(2)|| '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q1_tax_deposited|| '0.00'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Q2 (Jul-Sep)</TableCell>
                  <TableCell align="right">{formData.partA.q2_amount_paid || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q2_tax_deducted || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q2_tax_deposited || '0.00'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Q3 (Oct-Dec)</TableCell>
                  <TableCell align="right">{formData.partA.q3_amount_paid || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q3_tax_deducted || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q3_tax_deposited || '0.00'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Q4 (Jan-Mar)</TableCell>
                  <TableCell align="right">{formData.partA.q4_amount_paid || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q4_tax_deducted || '0.00'}</TableCell>
                  <TableCell align="right">{formData.partA.q4_tax_deposited || '0.00'}</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#f5f5f8' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {calculateTotalAmountPaid()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {calculateTotalTaxDeducted()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {calculateTotalTaxDeposited()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    );
  };


  const PartB = () => {
    if (!formData){
      console.log("formdata is null/undefined");
      return null;
    }
    
    if (!formData.partB) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Part B - Details of Salary Paid and Tax Deducted
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Part B data is not available for this employee.
          </Alert>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Part B - Details of Salary Paid and Tax Deducted
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardHeader title="Emolument paid" sx={{ bgcolor: '#f5f5f5', py: 1 }} />
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: '70%', fontWeight: 'medium' }}>
                    Base Salary
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.base_salary || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    HRA
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.hra || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                   Medical Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.medical_allowance || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                   Dress Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.dress_allowance || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                   Newspaper Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.newspaper_allowance || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                   Other Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.payrollDetails?.other_allowance || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Gross Salary
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formData.payrollDetails?.gross_salary || '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardHeader title="Allowances Exempt Under Section 10" sx={{ bgcolor: '#f5f5f5', py: 1 }} />
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    House Rent Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.hra_exemption || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    Medical Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.medical_exemption || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    Newspaper Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.newspaper_exemption || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    Dress Allowance
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.dress_exemption || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                   Other Allowances
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.other_exemption || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Total Exempt Allowances
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {(
                      parseFloat(formData.partB.medical_exemption || 0) +
                      parseFloat(formData.partB.hra_exemption || 0) +
                      parseFloat(formData.partB.dress_exemption || 0) +
                      parseFloat(formData.partB.newspaper_exemption || 0) +
                      parseFloat(formData.partB.other_exemption || 0)
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardHeader title="Total Income & Tax Calculation" sx={{ bgcolor: '#f5f5f5', py: 1 }} />
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: '70%', fontWeight: 'medium' }}>
                    Gross Total Income
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.gross_total_income || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    Deductions under Chapter VI-A
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.total_deductions || '0.00'}
                  </TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    d) Total Tax Payable
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.tax_payable || '0.00'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    e) Education Cess
                  </TableCell>
                  <TableCell align="right">
                    {formData.partB.education_cess || '0.00'}
                  </TableCell>
                </TableRow> */}
                <TableRow >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    Total Tax
                  </TableCell>
                  <TableCell align="right">
                    {(
                      parseFloat(formData.partB.tax_payable || 0) +
                      parseFloat(formData.partB.education_cess || 0)
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
      
        <Card variant="outlined">
          <CardContent>
            
            <Grid container spacing={4} >
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Place</Typography>
                <Typography variant="body1" fontWeight="medium">
                  Bangalore
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {getTodayDate()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.partA.personal.firstName} {formData.partA.personal.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">
                  {formData.financialDetails?.department || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <>
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
 
      <Dialog 
        open={showDialog} 
        fullWidth 
        maxWidth="sm"
        onClose={formData ? () => setShowDialog(false) : undefined}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Form 16 Search</Typography>
            {formData && (
              <IconButton onClick={() => setShowDialog(false)} size="small">
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
              <TextField
                label="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                disabled={true}
/>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="financial-year-from-label">Financial Year From</InputLabel>
                  <Select
                    labelId="financial-year-from-label"
                    value={financialYearFrom}
                    onChange={(e) => setFinancialYearFrom(e.target.value)}
                    label="Financial Year From"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {yearOptions.map(year => (
                      <MenuItem key={`from-${year}`} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="financial-year-to-label">Financial Year To</InputLabel>
                  <Select
                    labelId="financial-year-to-label"
                    value={financialYearTo}
                    onChange={(e) => setFinancialYearTo(e.target.value)}
                    label="Financial Year To"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {yearOptions.map(year => (
                      <MenuItem key={`to-${year}`} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              fullWidth
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Box>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<Search />}
        onClick={handleNewSearch}
        sx={{ mr: 1 }}
      >
        New Search
      </Button>
      </Box>
      {formData && (
        <Box ref={formRef} sx={{ mt: 3 }}>
          <EmployeeHeader />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Part A" />
              <Tab label="Part B" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && <PartA />}
          {activeTab === 1 && <PartB />}
        </Box>
      )}
      
      </Box>
      <Box display="flex" justifyContent="center" marginBottom="5px">
      {formData && (
          <>
            <Button 
              variant="outlined" 
              startIcon={<Print />} 
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<GetApp />} 
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </>
        )}
      </Box>

      </>
  )}

  export default Form16UI