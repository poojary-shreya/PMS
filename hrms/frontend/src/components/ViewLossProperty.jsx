import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
    Search ,
    Eye as Visibility,
    Trash as Delete,
    Download,
    Filter as FilterList,
    RefreshCw as Refresh,
    User as Person,
    Home,
    Calendar as CalendarMonth
  } from 'lucide-react';
  

const HRPropertyLossDashboard = () => {
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('');
  const [claimingFilter, setClaimingFilter] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    claimingCount: 0,
    notClaimingCount: 0,
    selfOccupiedTotal: 0,
    letOutTotal: 0
  });
  const [availableFiscalYears, setAvailableFiscalYears] = useState([]);


  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/property-loss/all');
      setEmployees(response.data.data);
      
   
      const years = [...new Set(response.data.data.map(item => item.fiscalYear))].sort().reverse();
      setAvailableFiscalYears(years);
      
      
      calculateStats(response.data.data);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const claiming = data.filter(emp => emp.claimingLoss === 'Yes').length;
    const notClaiming = data.filter(emp => emp.claimingLoss === 'No').length;
    
 
    let selfOccupiedTotal = 0;
    let letOutTotal = 0;
    
    data.forEach(emp => {
      selfOccupiedTotal += Number(emp.selfOccupiedAmount || 0);
      letOutTotal += Number(emp.letOutLossAmount || 0);
    });
    
    setStats({
      totalEmployees: data.length,
      claimingCount: claiming,
      notClaimingCount: notClaiming,
      selfOccupiedTotal,
      letOutTotal
    });
  };

  
  const fetchEmployeeDetails = async (employeeId, fiscalYear) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/property-loss/${employeeId}/${fiscalYear}`);
      setCurrentEmployee(response.data.data);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Failed to load employee details. Please try again later.');
    }
  };


  const deleteRecord = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/property-loss/${recordToDelete.id}`);
      setDeleteDialogOpen(false);
      fetchEmployeeData(); 
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again later.');
    }
  };

 
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.employeeId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.fiscalYear?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFiscalYear = fiscalYearFilter ? employee.fiscalYear === fiscalYearFilter : true;
    const matchesClaiming = claimingFilter ? employee.claimingLoss === claimingFilter : true;
    
    return matchesSearch && matchesFiscalYear && matchesClaiming;
  });

 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

 
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setCurrentEmployee(null);
  };
  
  const handleOpenDeleteDialog = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };


  const clearFilters = () => {
    setSearchTerm('');
    setFiscalYearFilter('');
    setClaimingFilter('');
  };


  const exportAsCSV = () => {
    const headers = [
      'Employee ID', 
      'Fiscal Year', 
      'Claiming Loss', 
      'Self-Occupied Amount', 
      'Let-Out Loss Amount', 
      'Let-Out Income Amount'
    ];
    
    const data = filteredEmployees.map(emp => [
      emp.employeeId,
      emp.fiscalYear,
      emp.claimingLoss,
      emp.selfOccupiedAmount || 0,
      emp.letOutLossAmount || 0,
      emp.letOutIncomeAmount || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property_loss_data_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

 
  useEffect(() => {
    fetchEmployeeData();
  }, []);

 
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align='center' fontWeight="bold"> 
          View Loss on house Property
        </Typography>
       
        
        
        <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Employees
                </Typography>
                <Typography variant="h4">
                  {stats.totalEmployees}
                </Typography>
                <Person size={20} color="#1976d2" style={{ marginTop: '8px' }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Claiming Loss
                </Typography>
                <Typography variant="h4">
                  {stats.claimingCount}
                </Typography>
                <Chip 
                  label={`${(stats.claimingCount / (stats.totalEmployees || 1) * 100).toFixed(1)}%`} 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Not Claiming
                </Typography>
                <Typography variant="h4">
                  {stats.notClaimingCount}
                </Typography>
                <Chip 
                  label={`${(stats.notClaimingCount / (stats.totalEmployees || 1) * 100).toFixed(1)}%`} 
                  color="warning" 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6} lg={2.4}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Self-Occupied Total
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(stats.selfOccupiedTotal)}
                </Typography>
                <Home size={20} color="#1976d2" style={{ marginTop: '8px' }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={6} lg={2.4}>
            <Card sx={{ height: '100%', bgcolor: '#e8eaf6' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.9rem' }}>
                  Let-Out Loss Total
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(stats.letOutTotal)}
                </Typography>
                <Home size={20} color="#3f51b5" style={{ marginTop: '8px' }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
       
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Employee ID or Fiscal Year"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={fetchEmployeeData} 
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        ) : (
          <>
            {filteredEmployees.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No property loss records found
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {searchTerm || fiscalYearFilter || claimingFilter ? 
                    'Try changing your search criteria or filters' : 
                    'No employees have submitted property loss details yet'}
                </Typography>
              </Paper>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>Employee ID</strong></TableCell>
                        <TableCell><strong>Fiscal Year</strong></TableCell>
                        <TableCell><strong>Claiming Loss</strong></TableCell>
                        <TableCell><strong>Self-Occupied Amount</strong></TableCell>
                        <TableCell><strong>Let-Out Loss</strong></TableCell>
                        <TableCell><strong>Let-Out Income</strong></TableCell>
                        <TableCell><strong>Last Updated</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((employee) => (
                          <TableRow key={`${employee.employeeId}-${employee.fiscalYear}`}>
                            <TableCell>{employee.employeeId}</TableCell>
                            <TableCell>{employee.fiscalYear}</TableCell>
                            <TableCell>
                              <Chip 
                                label={employee.claimingLoss} 
                                color={employee.claimingLoss === 'Yes' ? 'success' : 'default'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              {employee.claimingLoss === 'Yes' ? 
                                formatCurrency(employee.selfOccupiedAmount || 0) : '-'}
                            </TableCell>
                            <TableCell>
                              {employee.claimingLoss === 'Yes' ?
                                formatCurrency(employee.letOutLossAmount || 0) : '-'}
                            </TableCell>
                            <TableCell>
                              {employee.claimingLoss === 'Yes' ?
                                formatCurrency(employee.letOutIncomeAmount || 0) : '-'}
                            </TableCell>
                            <TableCell>
                              {new Date(employee.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    color="primary" 
                                    onClick={() => fetchEmployeeDetails(employee.employeeId, employee.fiscalYear)}
                                  >
                                    <Visibility size={20} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Record">
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleOpenDeleteDialog(employee)}
                                  >
                                    <Delete size={20} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  component="div"
                  count={filteredEmployees.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </>
        )}
      </Paper>
      
  
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Property Loss Details - Employee {currentEmployee?.employeeId}
        </DialogTitle>
        <DialogContent dividers>
          {currentEmployee && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1">{currentEmployee.employeeId}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Fiscal Year</Typography>
                      <Typography variant="body1">{currentEmployee.fiscalYear}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">Claiming Loss</Typography>
                      <Chip 
                        label={currentEmployee.claimingLoss} 
                        color={currentEmployee.claimingLoss === 'Yes' ? 'success' : 'default'} 
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {currentEmployee.claimingLoss === 'Yes' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Loss Summary
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell><strong>Property Type</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Self-Occupied Property</TableCell>
                            <TableCell align="right">
                              {formatCurrency(currentEmployee.selfOccupiedAmount || 0)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Loss from Let-Out Property</TableCell>
                            <TableCell align="right">
                              {formatCurrency(currentEmployee.letOutLossAmount || 0)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Income from Let-Out Property</TableCell>
                            <TableCell align="right">
                              {formatCurrency(currentEmployee.letOutIncomeAmount || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                 
                  {currentEmployee.selfOccupiedProperty1 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Self-Occupied Property 1
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              First Residential Property
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.isFirstResidential}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Interest Amount
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.selfOccupiedProperty1.interestAmount || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Property Address
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.address || 'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              City
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.city || 'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date of Occupation
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.occupationDate ? 
                                new Date(currentEmployee.selfOccupiedProperty1.occupationDate).toLocaleDateString() : 
                                'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Loan Sanction Date
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.loanSanctionDate ? 
                                new Date(currentEmployee.selfOccupiedProperty1.loanSanctionDate).toLocaleDateString() : 
                                'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              House Value
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.selfOccupiedProperty1.houseValue || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lender Details
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty1.lenderName || 'Not provided'} 
                              {currentEmployee.selfOccupiedProperty1.lenderPAN ? 
                                ` (PAN: ${currentEmployee.selfOccupiedProperty1.lenderPAN})` : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                  
                  {currentEmployee.selfOccupiedProperty2 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Self-Occupied Property 2
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              First Residential Property
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.isFirstResidential}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Interest Amount
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.selfOccupiedProperty2.interestAmount || 0)}
                            </Typography>
                          </Grid>
                           <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Property Address
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.address || 'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              City
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.city || 'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date of Occupation
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.occupationDate ? 
                                new Date(currentEmployee.selfOccupiedProperty2.occupationDate).toLocaleDateString() : 
                                'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Loan Sanction Date
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.loanSanctionDate ? 
                                new Date(currentEmployee.selfOccupiedProperty2.loanSanctionDate).toLocaleDateString() : 
                                'Not provided'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              House Value
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.selfOccupiedProperty2.houseValue || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lender Details
                            </Typography>
                            <Typography>
                              {currentEmployee.selfOccupiedProperty2.lenderName || 'Not provided'} 
                              {currentEmployee.selfOccupiedProperty2.lenderPAN ? 
                                ` (PAN: ${currentEmployee.selfOccupiedProperty2.lenderPAN})` : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                  
                 
                  {currentEmployee.letOutPropertyDetails && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Let-Out Property Details
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Property Address
                            </Typography>
                            <Typography>
                              {currentEmployee.letOutPropertyDetails.address || 'Not provided'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date of Occupation
                            </Typography>
                            <Typography>
                              {currentEmployee.letOutPropertyDetails.occupationDate ? 
                                new Date(currentEmployee.letOutPropertyDetails.occupationDate).toLocaleDateString() : 
                                'Not provided'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Rental Income
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.letOutPropertyDetails.rentalIncome || 0)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                              Municipal Tax
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.letOutPropertyDetails.municipalTax || 0)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Interest on Loan
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.letOutPropertyDetails.interestOnLoan || 0)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Other Expenses
                            </Typography>
                            <Typography>
                              {formatCurrency(currentEmployee.letOutPropertyDetails.otherExpenses || 0)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lender Details
                            </Typography>
                            <Typography>
                              {currentEmployee.letOutPropertyDetails.lenderName || 'Not provided'} 
                              {currentEmployee.letOutPropertyDetails.lenderPAN ? 
                                ` (PAN: ${currentEmployee.letOutPropertyDetails.lenderPAN})` : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                  
                 
                </>
              )}
              
              {currentEmployee.claimingLoss === 'No' && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: '#f9f9f9', mt: 2 }}>
                    <Typography variant="body1">
                      This employee has declared that they are not claiming any property loss for fiscal year {currentEmployee.fiscalYear}.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
    
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the property loss record for Employee ID {recordToDelete?.employeeId} 
            for Fiscal Year {recordToDelete?.fiscalYear}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteRecord} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
</Container>
  );
};

export default HRPropertyLossDashboard;