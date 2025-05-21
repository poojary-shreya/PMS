import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  TablePagination,
  Chip,
  Box
} from "@mui/material";
import { 
  Edit, 
  Delete, 
  Visibility, 
  Add, 
  Search, 
  Work, 
  Business, 
  LocationOn, 
  AccessTime, 
  Person, 
  EventAvailable,
  CheckCircle,
  Cancel,
  Warning,
  Badge,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const JobView = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, jobId: null });
  const [viewDialog, setViewDialog] = useState({ open: false, job: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  
 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.hiringManagerName && job.hiringManagerName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/jobpost/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
     
      const processedJobs = response.data.jobs.map(job => {
        const closingDate = new Date(job.jobClosedDate);
        const today = new Date();
        const daysDifference = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
        
        let status;
        if (closingDate < today) {
          status = "Closed";
        } else if (daysDifference <= 7) {
          status = "Closing Soon";
        } else {
          status = "Open";
        }
        
        return { ...job, status };
      });
      
      setJobs(processedJobs);
      setFilteredJobs(processedJobs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setAlert({
        open: true,
        message: "Failed to fetch jobs. Please try again.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    navigate("/job-posting");
  };

  const handleEditJob = (job) => {
   
    navigate(`/job-posting/${job.id}`, { state: { job } });
  };

  const handleViewJob = (job) => {
    setViewDialog({ open: true, job });
  };

  const handleDeleteConfirm = (id) => {
    setDeleteDialog({ open: true, jobId: id });
  };

  const handleDeleteJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobpost/delete/${deleteDialog.jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      
      setJobs(jobs.filter(job => job.id !== deleteDialog.jobId));
      setFilteredJobs(filteredJobs.filter(job => job.id !== deleteDialog.jobId));
      
      setAlert({
        open: true,
        message: "Job deleted successfully",
        severity: "success",
      });
      
      setDeleteDialog({ open: false, jobId: null });
      setLoading(false);
    } catch (error) {
      console.error("Error deleting job:", error);
      setAlert({
        open: true,
        message: "Failed to delete job. Please try again.",
        severity: "error",
      });
      setLoading(false);
      setDeleteDialog({ open: false, jobId: null });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const renderStatusChip = (status) => {
    let icon, color, bgcolor;
    
    switch (status) {
      case "Open":
        icon = <CheckCircle fontSize="small" />;
        color = "success";
        bgcolor = "#28a745";
        break;
      case "Closed":
        icon = <Cancel fontSize="small" />;
        color = "error";
        bgcolor = "#dc3545";
        break;
      case "Closing Soon":
        icon = <Warning fontSize="small" />;
        color = "warning";
        bgcolor = "#ffc107";
        break;
      default:
        icon = <CheckCircle fontSize="small" />;
        color = "primary";
        bgcolor = "#e8f5e9";
    }
    
    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        style={{ backgroundColor: bgcolor, fontWeight: "500" }}
      />
    );
  };

  if (loading && jobs.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{  }}>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Card sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
  <CardHeader
    title={
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h4" fontWeight="bold">
          Job View
        </Typography>
      </Box>
    }
    titleTypographyProps={{ variant: "h4", }}
  />
  <CardContent>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: <Search color="action" />,
        }}
        sx={{ width: 300 }}
      />
      
     
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={handleCreateJob}
      >
        Create Job
      </Button>
    </Box>
    
   

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Badge style={{ marginRight: "6px" }} fontSize="small" />
                      Job ID
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Work style={{ marginRight: "6px" }} fontSize="small" />
                      Title
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Business style={{ marginRight: "6px" }} fontSize="small" />
                      Department
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <LocationOn style={{ marginRight: "6px" }} fontSize="small" />
                      Location
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <AccessTime style={{ marginRight: "6px" }} fontSize="small" />
                      Employment Type
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Person style={{ marginRight: "6px" }} fontSize="small" />
                      Positions
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Person style={{ marginRight: "6px" }} fontSize="small" />
                      Hiring Manager
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <EventAvailable style={{ marginRight: "6px" }} fontSize="small" />
                      Closing Date
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckCircle style={{ marginRight: "6px" }} fontSize="small" />
                      Status
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.length > 0 ? (
                  filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.jobId}</TableCell>
                        <TableCell>{job.jobTitle}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job.employmentType}</TableCell>
                        <TableCell>{job.noOfPositions}</TableCell>
                        <TableCell>{job.hiringManagerName}</TableCell>
                        <TableCell>{formatDate(job.jobClosedDate)}</TableCell>
                        <TableCell>{renderStatusChip(job.status)}</TableCell>
                        <TableCell>
                          <Tooltip title="View">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewJob(job)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditJob(job)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteConfirm(job.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {loading ? "Loading..." : "No jobs found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredJobs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

    
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, job: null })}
        maxWidth="md"
        fullWidth
      >
        {viewDialog.job && (
          <>
            <DialogTitle>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Work style={{ marginRight: "10px" }} />
                Job Details: {viewDialog.job.jobTitle}
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold", width: "30%" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Badge style={{ marginRight: "8px" }} />
                          Job ID
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.jobId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Work style={{ marginRight: "8px" }} />
                          Title
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.jobTitle}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Business style={{ marginRight: "8px" }} />
                          Department
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.department}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <LocationOn style={{ marginRight: "8px" }} />
                          Location
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <AccessTime style={{ marginRight: "8px" }} />
                          Employment Type
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.employmentType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Person style={{ marginRight: "8px" }} />
                          Number of Positions
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.noOfPositions}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <CheckCircle style={{ marginRight: "8px" }} />
                          Status
                        </div>
                      </TableCell>
                      <TableCell>{viewDialog.job.status && renderStatusChip(viewDialog.job.status)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Experience Required</TableCell>
                      <TableCell>{viewDialog.job.experience}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Salary Range</TableCell>
                      <TableCell>{viewDialog.job.budget}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <EventAvailable style={{ marginRight: "8px" }} />
                          Job Closing Date
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(viewDialog.job.jobClosedDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Hiring Manager</TableCell>
                      <TableCell>{viewDialog.job.hiringManagerName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell style={{ whiteSpace: "pre-wrap" }}>{viewDialog.job.description}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setViewDialog({ open: false, job: null })} 
                color="primary"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setViewDialog({ open: false, job: null });
                  handleEditJob(viewDialog.job);
                }} 
                color="primary"
                variant="contained"
                style={{ backgroundColor: "#616161" }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

     
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, jobId: null })}
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Delete style={{ marginRight: "10px", color: "#f44336" }} />
            Confirm Delete
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job posting? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, jobId: null })} 
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteJob} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobView;