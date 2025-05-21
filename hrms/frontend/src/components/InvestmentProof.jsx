// InvestmentProofSubmission.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Grid,
  CircularProgress, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const InvestmentProofSubmission = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [financialYear, setFinancialYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [declaration, setDeclaration] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('Pending');  // Default status is Pending
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [submittedProofs, setSubmittedProofs] = useState([]);
  const [loadingProofs, setLoadingProofs] = useState(false);

  const financialYearOptions = [
    '2023-2024',
    '2024-2025',
    '2025-2026'
  ];

  const categoryMapping = {
    'rent_paid': 'Rent Paid (HRA)',
    '80D_self_spouse_children_under60': '80D Medical Insurance (Self/Spouse/Children <60)',
    '80D_self_spouse_children_over60': '80DMedical Insurance (Self/Spouse/Children >60)',
    '80D_parents_under60': '80D Medical Insurance (Parents <60)',
    '80D_parents_over60': '80D Medical Insurance (Parents >60)',
    '80E_education_loan': '80E Education Loan Interest',
    '80U_disability_40_to_80': '80U Disability (40-80%)',
    '80U_disability_above_80': '80U Disability (>80%)',
    '80DD_disability_40_to_80': '80DD Handicapped Dependent (40-80%)',
    '80DD_disability_above_80': '80DD Handicapped Dependent (>80%)',
    '80DDB_self_dependent': '80DDB Medical Treatment',
    '80TTA_savings_interest': '80TTA Savings Account Interest',
    '80TTB_sr_citizen_interest': '80TTB Senior Citizen Interest',
    '80CCD_salary_deduction': '80CCD NPS Contribution (Deducted from salary)',
    '80CCD1B_additional_nps': '80CCD1B Additional NPS Contribution',
    '80CCD1B_atal_pension': '80CCD1B Atal Pension Yojana',
    '80CCD2_employer_contribution': '80CCD2 Employer NPS Contribution',
    '80EE_additional_housing_loan': '80EE Additional Housing Loan Interest',
    '80EEA_housing_loan_benefit': '80EEA Housing Loan Benefit',
    '80EEB_electric_vehicle_loan': '80EEB Electric Vehicle Loan Interest',
    '80CCC_pension_fund': '80CCC Pension Fund',
    '80C_provident_fund': '80C Provident Fund',
    '80C_housing_loan_principal': '80C Housing Loan Principal',
    '80C_mutual_fund': '80C Mutual Fund (ELSS)',
    '80C_ppf': '80C Public Provident Fund (PPF)',
    '80C_nsc': '80C National Savings Certificate (NSC)',
    '80C_ulip': '80C Unit Linked Insurance Plan (ULIP)',
    '80C_elss': '80C Equity Linked Savings Scheme (ELSS)',
    '80C_life_insurance': '80C Life Insurance Premium',
    '80C_tuition_fees': '80C Tuition Fees',
    '80C_bank_fd': '80C Bank Fixed Deposit (Tax Saving)',
    '80C_senior_citizens_savings': '80C Senior Citizens Savings Scheme',
    '80C_sukanya_samriddhi': '80C Sukanya Samriddhi Account'
  };

  const fetchDeclaration = async () => {
    if (!employeeId || !financialYear) {
      setFetchError('Please enter both Employee ID and Financial Year');
      return;
    }

    setLoading(true);
    setFetchError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/investment/proof/investment`, {
        params: { employee_id: employeeId, financial_year: financialYear }
      });
      console.log(response);
      
      if (response.data && response.data.data) {
        setDeclaration(response.data.data);
        
        const availableCategories = generateAllCategories(response.data.data);
        setCategories(availableCategories);
        
        // Fetch submitted proofs after successfully loading declaration
        fetchSubmittedProofs();
        
        setNotification({
          open: true,
          message: 'Declaration data loaded successfully',
          type: 'success'
        });
      } else {
        setFetchError('No declaration found for this employee and financial year');
        setDeclaration(null);
        setSubmittedProofs([]);
      }
    } catch (error) {
      console.error('Error fetching declaration:', error);
      setFetchError('Error fetching declaration data. Please try again.');
      setDeclaration(null);
      setSubmittedProofs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedProofs = async () => {
    if (!employeeId || !financialYear) return;
    
    setLoadingProofs(true);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/investmentproof/investment`, {
        params: { employee_id: employeeId, financial_year: financialYear }
      });
      console.log(response.data.data);
      
      if (response.data && response.data.data) {
        setSubmittedProofs(response.data.data);
      } else {
        setSubmittedProofs([]);
      }
    } catch (error) {
      console.error('Error fetching submitted proofs:', error);
      setNotification({
        open: true,
        message: 'Error fetching submitted proofs',
        type: 'error'
      });
      setSubmittedProofs([]);
    } finally {
      setLoadingProofs(false);
    }
  };

  const generateAllCategories = (declarationData) => {
    const categoryList = [];
    
    Object.entries(categoryMapping).forEach(([key, displayName]) => {
      const amount = declarationData[key] ? parseFloat(declarationData[key]) : 0;
      
      categoryList.push({
        key: key,
        displayName: displayName,
        amount: amount
      });
    });
    
    return categoryList;
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getCategoryDisplayName = (categoryKey) => {
    return categoryMapping[categoryKey] || categoryKey;
  };

  const handleSubmitProof = async () => {
    if (!selectedCategory || !file) {
      setNotification({
        open: true,
        message: 'Please select a category and upload a file',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('financial_year', financialYear);
      formData.append('category', selectedCategory);
      formData.append('file', file);
      formData.append('comment', comment);
      formData.append('status', status); 
      console.log(formData);

      const response = await axios.post('http://localhost:5000/api/investmentproof/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        setNotification({
          open: true,
          message: 'Proof submitted successfully',
          type: 'success'
        });
        
        // Refresh the submitted proofs list
        fetchSubmittedProofs();
        
        setSelectedCategory('');
        setFile(null);
        setComment('');
        setOpenConfirmDialog(false);
      } else {
        throw new Error(response.data.message || 'Failed to submit proof');
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message || 'Failed to submit proof'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProof = (proofId) => {
    // Implementation for viewing a proof document
    window.open(`http://localhost:5000/uploads/investment-proofs/${proofId}`, '_blank');
  };

  const handleEditProof = (proof) => {
    // Pre-fill form with proof details for editing
    setSelectedCategory(proof.category);
    setComment(proof.comment || '');
    // Note: We can't pre-fill the file due to security restrictions
  };

  const handleDeleteProof = async (proofId) => {
    if (!window.confirm('Are you sure you want to delete this proof?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`http://localhost:5000/api/investmentproof/proof/${proofId}`);
      
      if (response.data && response.data.success) {
        setNotification({
          open: true,
          message: 'Proof deleted successfully',
          type: 'success'
        });
        
        // Remove the deleted proof from the list
        setSubmittedProofs(submittedProofs.filter(proof => proof.id !== proofId));
      } else {
        throw new Error(response.data.message || 'Failed to delete proof');
      }
    } catch (error) {
      console.error('Error deleting proof:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message || 'Failed to delete proof'}`,
        type: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleConfirmSubmission = () => {
    setOpenConfirmDialog(true);
  };

  const getStatusChipColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'review':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Investment Proof Submission
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee ID"
              variant="outlined"
              fullWidth
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="financial-year-label">Financial Year</InputLabel>
              <Select
                labelId="financial-year-label"
                value={financialYear}
                label="Financial Year"
                onChange={(e) => setFinancialYear(e.target.value)}
                required
              >
                {financialYearOptions.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchDeclaration}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Fetch Declaration Data
              </Button>
            </Box>
          </Grid>
        </Grid>

        {fetchError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {fetchError}
          </Alert>
        )}
      </Paper>

      {declaration && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Submit Investment Proof
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                    <Typography variant="body1" gutterBottom>{employeeId}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Financial Year</Typography>
                    <Typography variant="body1">{financialYear}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                    <Chip 
                      label={status} 
                      color="warning" 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Investment Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={selectedCategory}
                    label="Investment Category"
                    onChange={handleCategoryChange}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.key} value={category.key}>
                        {category.displayName} - ₹{category.amount.toLocaleString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  fullWidth
                >
                  Upload Proof Document
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </Button>
                {file && (
                  <Box sx={{ mt: 1 }}>
                    <Alert severity="info" icon={<ReceiptIcon />}>
                      File selected: {file.name}
                    </Alert>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Comments (Optional)"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmSubmission}
                    disabled={!selectedCategory || !file || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
                  >
                    Submit Proof
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Submitted Proofs Table */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Submitted Proofs
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loadingProofs ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : submittedProofs.length > 0 ? (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sl.No</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Submission Date</TableCell>
                      <TableCell>Amount (₹)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submittedProofs.map((proof, index) => {
                      const category = categories.find(cat => cat.key === proof.category);
                      const amount = category ? category.amount : 0;
                      
                      return (
                        <TableRow key={proof.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{getCategoryDisplayName(proof.category)}</TableCell>
                          <TableCell>{new Date(proof.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell>{amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={proof.status || 'Pending'} 
                              color={getStatusChipColor(proof.status || 'Pending')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => handleViewProof(proof.proof_file_path)}
                                startIcon={<VisibilityIcon />}
                              >
                                View
                              </Button>
                              {/* <Button
                                size="small"
                                color="secondary"
                                variant="outlined"
                                onClick={() => handleEditProof(proof)}
                                startIcon={<EditIcon />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleDeleteProof(proof.id)}
                                startIcon={<DeleteIcon />}
                              >
                                Delete
                              </Button> */}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No proofs submitted yet for this financial year.
              </Alert>
            )}
          </Paper>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          {selectedCategory && categories && (
            <Typography>
              Are you sure you want to submit proof for{' '}
              <strong>
                {categories.find(cat => cat.key === selectedCategory)?.displayName || selectedCategory}
              </strong>?
            </Typography>
          )}
          {file && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              File: {file.name}
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Status: <Chip label={status} color="warning" size="small" />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitProof} color="primary" variant="contained">
            Confirm Submission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InvestmentProofSubmission;