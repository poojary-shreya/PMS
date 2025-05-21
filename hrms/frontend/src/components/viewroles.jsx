import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Tooltip,
  Grid,
  CircularProgress,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const ViewRoles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);


  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredRoles.length / rowsPerPage));

    setPage(1);
  }, [filteredRoles, rowsPerPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get('http://localhost:5000/api/roles', {
        signal: controller.signal,

        validateStatus: status => status < 500
      });

      clearTimeout(timeoutId);

      if (response.data.success) {
        setRoles(response.data.data);
        setFilteredRoles(response.data.data);
      } else {
        console.error('Error response:', response.data);
        setError('Failed to load roles data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching roles data:', error);
      setError('Failed to connect to the server. Please check if the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = roles.filter(role =>
      role.employee_id?.toLowerCase().includes(term) ||
      role.fullName?.toLowerCase().includes(term) ||
      role.roleType?.toLowerCase().includes(term) ||
      role.department?.toLowerCase().includes(term) ||
      role.reportingManager?.toLowerCase().includes(term)
    );

    setFilteredRoles(filtered);
  };

  const handleEdit = (employeeId) => {

    const roleToEdit = roles.find(role => role.employee_id === employeeId);

    navigate('/addrole', {
      state: {
        employee_id: employeeId,
        isEdit: true,
        roleData: roleToEdit
      }
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/roles/${deleteId}`);
      if (response.data.success) {
        alert('Role deleted successfully');
        fetchRoles();
      } else {
        alert('Failed to delete role: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleView = (role) => {
    setSelectedRole(role);
    setViewDialogOpen(true);
  };

  const handleAddNew = () => {
    navigate('/addroles', { state: { isEdit: false } });
  };

  const retryFetch = () => {
    fetchRoles();
  };


  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRoles.slice(startIndex, endIndex);
  };

  const getRoleChipColor = (roleType) => {
    switch (roleType) {
      case 'CEO':
        return 'error';
      case 'Manager':
        return 'warning';
      case 'Team Lead':
        return 'info';
      case 'Employee':
        return 'success';
      case 'Intern':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getAccessLevelChipColor = (level) => {
    switch (level) {
      case 'Admin':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };


  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Box sx={{ maxWidth: "1500px", margin: 'auto', padding: 3, position: 'relative' }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Roles & Responsibilities
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#fff8f8', borderLeft: '4px solid #f44336' }}>
          <Typography color="error" gutterBottom><strong>Error:</strong> {error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={retryFetch}
            startIcon={<SearchIcon />}
          >
            Retry
          </Button>
        </Paper>
      )}

      <div style={{ position: 'relative' }}>
        <TableContainer component={Paper} elevation={3} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Employee ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Reporting To</strong></TableCell>
                <TableCell><strong>Responsibilities</strong></TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, zIndex: 1 }}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No roles found</TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((role) => (
                  <TableRow key={role.employee_id} hover>
                    <TableCell>{role.employee_id}</TableCell>
                    <TableCell>{role.fullName}</TableCell>
                    <TableCell>
                      {role.roleType}
                    </TableCell>
                    <TableCell>{role.department}</TableCell>
                    <TableCell>{role.reportingManager}</TableCell>
                    <TableCell>
                      {role.selectedResponsibilities ? (
                        <Tooltip title={role.selectedResponsibilities.join(', ')}>
                          <Typography variant="body2">
                            {truncateText(role.selectedResponsibilities.join(', '))}
                          </Typography>
                        </Tooltip>
                      ) : "N/A"}
                    </TableCell>
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
                        onClick={() => handleEdit(role.employee_id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>


        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading || filteredRoles.length === 0}
          />
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRoles.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {
              Math.min(page * rowsPerPage, filteredRoles.length)
            } of {filteredRoles.length} roles
          </Typography>
        </Box>
      </div>


      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this role? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>


      {selectedRole && (
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Role Details - {selectedRole.fullName}
            <Typography variant="subtitle2" color="text.secondary">
              {selectedRole.employee_id}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Employee Information</Typography>
                  <Typography><strong>Name:</strong> {selectedRole.fullName}</Typography>
                  <Typography><strong>Email:</strong> {selectedRole.email}</Typography>
                  <Typography><strong>Department:</strong> {selectedRole.department}</Typography>
                  <Typography><strong>Designation:</strong> {selectedRole.designation}</Typography>
                  <Typography><strong>Joining Date:</strong> {selectedRole.joiningDate}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Role Information</Typography>
                  <Typography>
                    <strong>Role Type:</strong>
                    <Chip
                      label={selectedRole.roleType}
                      color={getRoleChipColor(selectedRole.roleType)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Reporting Manager:</strong> {selectedRole.reportingManager}</Typography>
                  <Typography><strong>Team Size:</strong> {selectedRole.teamSize}</Typography>
                  <Typography>
                    <strong>Access Level:</strong>
                    <Chip
                      label={selectedRole.accessLevel}
                      color={getAccessLevelChipColor(selectedRole.accessLevel)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedRole.selectedResponsibilities && selectedRole.selectedResponsibilities.map((resp, index) => (
                      <Chip key={index} label={resp} color="primary" variant="outlined" />
                    ))}
                  </Box>
                  {selectedRole.additionalResponsibilities && (
                    <>
                      <Typography variant="subtitle1"><strong>Additional Responsibilities:</strong></Typography>
                      <Typography paragraph>{selectedRole.additionalResponsibilities}</Typography>
                    </>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Typography paragraph><strong>KPIs:</strong> {selectedRole.kpis}</Typography>
                  <Typography paragraph><strong>Evaluation Criteria:</strong> {selectedRole.evaluationCriteria}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography><strong>Last Promotion:</strong> {selectedRole.lastPromotionDate}</Typography>
                    <Typography><strong>Next Review:</strong> {selectedRole.nextReviewDate}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedRole.employee_id);
              }}
              color="primary"
              variant="contained"
            >
              Edit Role
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ViewRoles;