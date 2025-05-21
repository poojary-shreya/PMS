import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, Grid,
  TablePagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  console.log(employees);
  
  const [searchField, setSearchField] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/viewallfinancial');
      console.log(response.data);

      const transformedData = response.data.map(emp => ({
        employeeDetails: {
          department: emp.department,
          employeeId: emp.employee_id,
          resignationDate: emp.resignationDate,
          noticePeriod: emp.noticePeriod,
          advanceSalary: emp.advanceSalary,
          creditCardOffered: emp.creditCardOffered,
        },
        finance: {
          bankName: emp.bankName,
          accountNumber: emp.accountNumber,
          ifscCode: emp.ifscCode,
          currentSalary: emp.currentSalary,
          previousSalary: emp.previousSalary,
          ctc: emp.ctc,
          taxCalculation: emp.taxCalculation,
        },
        emergencyContact: {
          mobile: emp.mobile,
          landline: emp.landline,
        },
        healthInfo: {
          individualInsurance: emp.individualInsurance,
          groupInsurance: emp.groupInsurance,
        },

        updatedAt: emp.updatedAt,
        createdAt: emp.createdAt,
        id: emp.id
      }));

      const sortedData = transformedData.sort((a, b) => {
        const aUpdate = a.updatedAt ? new Date(a.updatedAt) : null;
        const bUpdate = b.updatedAt ? new Date(b.updatedAt) : null;

        const aCreate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bCreate = b.createdAt ? new Date(b.createdAt) : new Date(0);

        if (aUpdate && bUpdate) {
          return bUpdate - aUpdate;
        }

        if (aUpdate) return -1;
        if (bUpdate) return 1;

        return bCreate - aCreate;
      });
      console.log(sortedData);

      setEmployees(sortedData);
      setFilteredEmployees(sortedData);
    } catch (err) {
      setError("Failed to fetch employee data");
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 7));
    setPage(0);
  };

  const handleEdit = (employee) => {
    navigate("/addfinancial", {
      state: {
        isEdit: true,
        employee_id: employee.employeeDetails.employeeId,
        initialData: employee
      }
    });
  };


  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value);
    setSearchTerm('');
  };

  
  const getSearchPlaceholder = () => {
    switch(searchField) {
      case 'employeeId': return 'Search by Employee ID';
      case 'department': return 'Search by Department';
      case 'resignationDate': return 'Search by Resignation Date';
      case 'noticePeriod': return 'Search by Notice Period';
      case 'creditCardOffered': return 'Search by Credit Card Status';
      case 'ctc': return 'Search by CTC';
      case 'bankName': return 'Search by Bank Name';
      case 'individualInsurance': return 'Search by Individual Insurance';
      case 'groupInsurance': return 'Search by Group Insurance';
      case 'currentSalary': return 'Search by Current Salary';
      case 'previousSalary': return 'Search by Previous Salary';
      case 'taxCalculation': return 'Search by Tax Calculation';
      default: return 'Search all fields';
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    const filtered = employees.filter(employee => {
     
      if (searchField === 'all') {
        const employeeIdMatch = employee?.employeeDetails?.employeeId?.toString().toLowerCase().includes(searchTermLower);
        const departmentMatch = employee?.employeeDetails?.department?.toLowerCase().includes(searchTermLower);
        const noticePeriodMatch = employee?.employeeDetails?.noticePeriod?.toLowerCase().includes(searchTermLower);
        const resignationDateMatch = employee?.employeeDetails?.resignationDate?.toLowerCase().includes(searchTermLower);
        const creditCardMatch = employee?.employeeDetails?.creditCardOffered?.toLowerCase().includes(searchTermLower);
        const bankNameMatch = employee?.finance?.bankName?.toLowerCase().includes(searchTermLower);
        const ctcMatch = employee?.finance?.ctc?.toString().toLowerCase().includes(searchTermLower);
        const currentSalaryMatch = employee?.finance?.currentSalary?.toString().toLowerCase().includes(searchTermLower);
        const previousSalaryMatch = employee?.finance?.previousSalary?.toString().toLowerCase().includes(searchTermLower);
        const taxCalculationMatch = employee?.finance?.taxCalculation?.toString().toLowerCase().includes(searchTermLower);
        
        return employeeIdMatch || departmentMatch || noticePeriodMatch || 
               resignationDateMatch || creditCardMatch || bankNameMatch || 
               ctcMatch || currentSalaryMatch || previousSalaryMatch || taxCalculationMatch;
      }
      
     
      switch(searchField) {
        case 'employeeId':
          return employee?.employeeDetails?.employeeId?.toString().toLowerCase().includes(searchTermLower);
        case 'department':
          return employee?.employeeDetails?.department?.toLowerCase().includes(searchTermLower);
        case 'resignationDate':
          return employee?.employeeDetails?.resignationDate?.toLowerCase().includes(searchTermLower);
        case 'noticePeriod':
          return employee?.employeeDetails?.noticePeriod?.toLowerCase().includes(searchTermLower);
        case 'creditCardOffered':
          return employee?.employeeDetails?.creditCardOffered?.toLowerCase().includes(searchTermLower);
        case 'ctc':
          return employee?.finance?.ctc?.toString().toLowerCase().includes(searchTermLower);
        case 'bankName':
          return employee?.finance?.bankName?.toLowerCase().includes(searchTermLower);
        case 'currentSalary':
          return employee?.finance?.currentSalary?.toString().toLowerCase().includes(searchTermLower);
        case 'previousSalary':
          return employee?.finance?.previousSalary?.toString().toLowerCase().includes(searchTermLower);
        case 'taxCalculation':
          return employee?.finance?.taxCalculation?.toString().toLowerCase().includes(searchTermLower);
        default:
          return false;
      }
    });
    
    setFilteredEmployees(filtered);
    setPage(0);
  };

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">Employee Financial Details</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2}}>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="search-field-label">Search Field</InputLabel>
            <Select
              labelId="search-field-label"
              id="search-field"
              value={searchField}
              onChange={handleSearchFieldChange}
              label="Search Field"
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="employeeId">Employee ID</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="resignationDate">Resignation Date</MenuItem>
              <MenuItem value="noticePeriod">Notice Period</MenuItem>
              <MenuItem value="creditCardOffered">Credit Card Offered</MenuItem>
              <MenuItem value="ctc">CTC</MenuItem>
              <MenuItem value="bankName">Bank Name</MenuItem>
              <MenuItem value="currentSalary">Current Salary</MenuItem>
              <MenuItem value="previousSalary">Previous Salary</MenuItem>
              <MenuItem value="taxCalculation">Tax Calculation</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            label={getSearchPlaceholder()}
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            fullWidth
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <div style={{ position: 'relative' }}>
        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 150 }}><strong>Employee ID</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Department</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Bank Name</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Account Number</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>IFSC Code</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Current Salary</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Previous Salary</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>CTC</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Tax Calculation</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Resignation Date</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Notice Period</strong></TableCell>
                <TableCell sx={{ minWidth: 150 }}><strong>Advance Salary</strong></TableCell>
                <TableCell sx={{ minWidth: 200 }}><strong>Credit Card Offered</strong></TableCell>
                <TableCell sx={{ minWidth: 200 }}><strong>Last Updated</strong></TableCell>
                <TableCell sx={{ minWidth: 200 }}><strong>Created At</strong></TableCell>
                <TableCell sx={{ minWidth: 100 }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id} style={{ position: 'relative' }}>
                    <TableCell>{employee.employeeDetails.employeeId || "Not Available"}</TableCell>
                    <TableCell>{employee.employeeDetails.department?.trim() || "Not Provided"}</TableCell>
                    <TableCell>{employee.finance.bankName || "Not Mentioned"}</TableCell>
                    <TableCell>{employee.finance.accountNumber || "N/A"}</TableCell>
                    <TableCell>{employee.finance.ifscCode || "N/A"}</TableCell>
                    <TableCell>{employee.finance.currentSalary || "0.00"}</TableCell>
                    <TableCell>{employee.finance.previousSalary || "0.00"}</TableCell>
                    <TableCell>{employee.finance.ctc || "N/A"}</TableCell>
                    <TableCell>{employee.finance.taxCalculation || "N/A"}</TableCell>
                    <TableCell>{employee.employeeDetails.resignationDate || "Not Provided"}</TableCell>
                    <TableCell>{employee.employeeDetails.noticePeriod || "Not Provided"}</TableCell>
                    <TableCell>{employee.employeeDetails.advanceSalary || "N/A"}</TableCell>
                    <TableCell>{employee.employeeDetails.creditCardOffered || "N/A"}</TableCell>
                    <TableCell>{employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : "N/A"}</TableCell>
                    <TableCell>{employee.createdAt ? new Date(employee.createdAt).toLocaleString() : "N/A"}</TableCell>
                    <TableCell
                      style={{
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'white',
                        zIndex: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={16} align="center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[7]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={7}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </Container>
  );
};

export default ViewEmployees;