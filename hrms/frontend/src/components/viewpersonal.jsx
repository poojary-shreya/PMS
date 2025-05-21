import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    fetchEmployees();
  }, [retryCount]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/viewpersonal');

      if (data.success && Array.isArray(data.data)) {
        const sortedEmployees = [...data.data].sort((a, b) => {
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

        setEmployees(sortedEmployees);
      } else {
        setEmployees([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (employee) => {
    navigate('/addpersonal', {
      state: {
        isEdit: true,
        employeeData: employee,
        employee_id: employee.employee_id
      }
    });
  };

  const handleSearch = () => {
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value);
    setSearchQuery('');
    setPage(0);
  };

  const getSearchPlaceholder = () => {
    switch (searchField) {
      case 'employee_id': return 'Search by Employee ID';
      case 'firstName': return 'Search by First Name';
      case 'lastName': return 'Search by Last Name';
      case 'dateOfBirth': return 'Search by Date of Birth';
      case 'anniversary': return 'Search by Anniversary Date';
      default: return 'Search all fields';
    }
  };

  const filteredEmployees = Array.isArray(employees)
    ? employees.filter(employee => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();

      if (searchField === 'all') {
        return (
          (employee.employee_id || '').toString().toLowerCase().includes(query) ||
          (employee.firstName || '').toLowerCase().includes(query) ||
          (employee.lastName || '').toLowerCase().includes(query) ||
          (employee.personalemail || '').toLowerCase().includes(query) ||
          (employee.dateOfBirth || '').toLowerCase().includes(query) ||
          (employee.anniversary || '').toLowerCase().includes(query) ||
          (employee.phoneNumber || '').toLowerCase().includes(query) ||
          (employee.gender || '').toLowerCase().includes(query) ||
          (employee.panNumber || '').toLowerCase().includes(query) ||
          (employee.adharCardNumber || '').toLowerCase().includes(query) ||
          (employee.city || '').toLowerCase().includes(query) ||
          (employee.nomineeName || '').toLowerCase().includes(query) ||
          (employee.degree || '').toLowerCase().includes(query) ||
          (employee.certificationName || '').toLowerCase().includes(query)

        );
      } else {
        const fieldValue = employee[searchField];
        return fieldValue && fieldValue.toString().toLowerCase().includes(query);
      }
    })
    : [];

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && !employees.length) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }


  return (
    <Container maxWidth="xl" >

      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">Employee List</Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRetry}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Search Field</InputLabel>
                <Select
                  value={searchField}
                  label="Search Field"
                  onChange={handleSearchFieldChange}
                >
                  <MenuItem value="all">All Fields</MenuItem>
                  <MenuItem value="employee_id">Employee ID</MenuItem>
                  <MenuItem value="firstName">First Name</MenuItem>
                  <MenuItem value="lastName">Last Name</MenuItem>
                  <MenuItem value="dateOfBirth">Date of Birth</MenuItem>
                  <MenuItem value="anniversary">Anniversary Date</MenuItem>

                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={8}>
              <TextField
                label={getSearchPlaceholder()}
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClearSearch}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSearch}
                startIcon={<SearchIcon />}

              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>First Name</strong></TableCell>
              <TableCell sx={{ minWidth: 120 }}><strong>Last Name</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Email</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Date of Birth</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }} ><strong>Anniversary</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Phone Number</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Gender</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Pan Card</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Aadhar Card</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>City</strong></TableCell>
              <TableCell sx={{ minWidth: 150 }}><strong>Pin Code</strong></TableCell>

              <TableCell><strong>Last Updated</strong></TableCell>
              <TableCell sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', zIndex: 1 }}><strong>
                Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employee_id || "Not Available"}</TableCell>
                  <TableCell>{employee.firstName || "Not Available"}</TableCell>
                  <TableCell>{employee.lastName || "Not Available"}</TableCell>
                  <TableCell>{employee.personalemail || "Not Available"}</TableCell>
                  <TableCell>{employee.dateOfBirth || "Not Available"}</TableCell>
                  <TableCell>{employee.anniversary || "single"}</TableCell>
                  <TableCell>{employee.phoneNumber || "Not Available"}</TableCell>
                  <TableCell>{employee.gender || "Not Specified"}</TableCell>
                  <TableCell>{employee.panNumber || "Not Available"}</TableCell>
                  <TableCell>{employee.adharCardNumber || "Not Available"}</TableCell>
                  <TableCell>{employee.city || "Not Available"}</TableCell>
                  <TableCell>{employee.pinCode || "Not Available"}</TableCell>

                  <TableCell>{employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : "N/A"}</TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 0,

                      zIndex: 1
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(employee)}
                      disabled={loading}

                    >
                      {loading ? <CircularProgress size={24} /> : 'Edit'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

    </Container>
  );
};

export default ViewEmployees;