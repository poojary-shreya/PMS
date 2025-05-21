import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  Assignment,
  RateReview,
  Feedback,
  Timeline,
  Edit,
  Delete,
  AccountTree,
  Star,
  StarBorder,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Search
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import SharedNavbar from "./performancenavbar.jsx";

const ViewFeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const [feedback, setFeedback] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [editFeedback, setEditFeedback] = useState(null);
  const [loading, setLoading] = useState({
    feedback: false,
    employees: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    content: "",
    action: null
  });
  const [updateData, setUpdateData] = useState({
    status: "",
    progress_notes: ""
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState({
    open: false,
    feedback: null
  });


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/user/current", {
          withCredentials: true
        });

        if (response.data && response.data.employee_id) {
          setEmployeeIdInput(response.data.employee_id);
          setSelectedEmployee(response.data.employee_id);
          fetchData(response.data.employee_id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        openSnackbar("Failed to fetch user information", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (employeeId = null) => {
    try {
      setLoading({ feedback: true, employees: true });


      const currentUserResponse = await axios.get("http://localhost:5000/api/user/current", {
        withCredentials: true
      });

      if (!currentUserResponse.data || !currentUserResponse.data.employee_id) {
        openSnackbar("You need to be logged in with a company email to view feedback", "error");

        return;
      }


      const targetEmployeeId = employeeId || currentUserResponse.data.employee_id;
      setSelectedEmployee(targetEmployeeId);
      setEmployeeIdInput(targetEmployeeId);


      const [empResponse, feedbackResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/feedback/employees", {
          withCredentials: true
        }),
        axios.get("http://localhost:5000/api/feedback/empfeedback", {
          withCredentials: true
        })
      ]);

      setEmployees(empResponse.data);
      setFeedback(feedbackResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error.response?.data?.error || `Failed to load data: ${error.message}`;
      openSnackbar(errorMessage, "error");


      if (error.response?.status === 401 || error.response?.status === 403) {
        openSnackbar("Please log in with your company email to view feedback", "error");

      }
    } finally {
      setLoading({ feedback: false, employees: false });
    }
  };

  const filteredFeedback = selectedEmployee
    ? feedback.filter(item => item.employee_id === selectedEmployee)
    : [];


  const handleEmployeeSearch = () => {
    if (employeeIdInput.trim()) {
      setSelectedEmployee(employeeIdInput.trim());
    } else {
      openSnackbar("Please enter an employee ID", "warning");
    }
  };


  const handleEmployeeSelection = (event) => {
    const value = event.target.value;
    setSelectedEmployee(value);
    if (value) {
      setEmployeeIdInput(value);
    } else {
      setEmployeeIdInput("");
    }
  };


  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const handleConfirmDialogOpen = (title, content, action) => {
    setConfirmDialog({ open: true, title, content, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const executeConfirmedAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    handleConfirmDialogClose();
  };


  const handleOpenUpdateDialog = (feedbackItem) => {
    setEditFeedback(feedbackItem);
    setUpdateData({
      status: feedbackItem.status || "Pending",
      progress_notes: feedbackItem.progress_notes || ""
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditFeedback(null);
  };


  const handleOpenDetailsDialog = (feedbackItem) => {
    setViewDetailsDialog({
      open: true,
      feedback: feedbackItem
    });
  };

  const handleCloseDetailsDialog = () => {
    setViewDetailsDialog({
      open: false,
      feedback: null
    });
  };


  const handleUpdateStatus = async () => {
    try {
      if (!editFeedback) return;

      const response = await axios.put(
        `http://localhost:5000/api/feedback/${editFeedback.id}`,
        updateData
      );


      setFeedback(feedback.map(item =>
        item.id === editFeedback.id ? { ...item, ...updateData } : item
      ));

      openSnackbar("Status updated successfully");
      handleCloseDialog();
    } catch (error) {
      openSnackbar(error.response?.data?.error || "Update failed", "error");
    }
  };


  const handleDeleteFeedback = (id) => {
    handleConfirmDialogOpen(
      "Delete Feedback",
      "Are you sure you want to delete this feedback? This action cannot be undone.",
      async () => {
        try {
          await axios.delete(`http://localhost:5000/api/feedback/${id}`);
          setFeedback(feedback.filter(item => item.id !== id));
          openSnackbar("Feedback deleted successfully");
        } catch (error) {
          openSnackbar("Failed to delete feedback", "error");
        }
      }
    );
  };

  const clearFilters = () => {
    setSelectedEmployee("");
    setEmployeeIdInput("");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle color="success" />;
      case 'In Progress':
        return <HourglassEmpty color="warning" />;
      case 'Rejected':
        return <Cancel color="error" />;
      default:
        return null;
    }
  };

  const getStars = (rating) => {
    const ratingNum = parseInt(rating);
    return (
      <>
        {[...Array(5)].map((_, i) => (
          i < ratingNum ? <Star key={i} color="primary" fontSize="small" /> : <StarBorder key={i} fontSize="small" />
        ))}
      </>
    );
  };


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <SharedNavbar />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Employee Feedbacks
              </Typography>
              <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    label=" Employee ID"
                    variant="outlined"
                    value={employeeIdInput}
                    onChange={(e) => setEmployeeIdInput(e.target.value)}
                    sx={{ minWidth: 300 }}
                  />
                  {/* <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleEmployeeSearch}
                      startIcon={<Search />}
                    >
                      Search
                    </Button> */}
                </Box>
              </Paper>
            </Paper>
          </Grid>







          <Grid item xs={12}>
            <TableContainer component={Paper} elevation={3}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Feedback Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Comments</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.feedback ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Loading data...</TableCell>
                    </TableRow>
                  ) : selectedEmployee === "" ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Please enter or select an employee ID to view feedback</TableCell>
                    </TableRow>
                  ) : filteredFeedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No feedback data available for employee ID: {selectedEmployee}</TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedback.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>

                          <Typography variant="caption" display="block" color="textSecondary">
                            {item.employee_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.firstName || item.employeeName || "Employee"}

                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.type}
                            color="info"
                            size="small"
                          />
                          {item.anonymous && (
                            <Chip
                              label="Anonymous"
                              color="default"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{getStars(item.rating)}</TableCell>
                        <TableCell
                          sx={{ maxWidth: '200px', cursor: 'pointer' }}
                          onClick={() => handleOpenDetailsDialog(item)}
                        >
                          <Typography noWrap title={item.comment}>
                            {item.comment}
                          </Typography>
                        </TableCell>


                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>


      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Performance Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={updateData.status || ""}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Progress Notes"
              value={updateData.progress_notes || ""}
              onChange={(e) => setUpdateData({ ...updateData, progress_notes: e.target.value })}
              margin="normal"
              placeholder="Add notes about employee progress..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus} color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={executeConfirmedAction} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>


      {viewDetailsDialog.open && (
        <FeedbackDetailsDialog
          open={viewDetailsDialog.open}
          feedback={viewDetailsDialog.feedback}
          onClose={handleCloseDetailsDialog}
        />
      )}


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};


const FeedbackDetailsDialog = ({ open, feedback, onClose }) => {
  if (!feedback) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Feedback Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Cancel />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">Employee</Typography>
            <Typography gutterBottom>{feedback.firstName} {feedback.lastName}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Employee ID</Typography>
            <Typography gutterBottom>{feedback.employee_id}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Date Submitted</Typography>
            <Typography gutterBottom>{new Date(feedback.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Feedback Type</Typography>
            <Chip
              label={feedback.type}
              color="info"
              sx={{ mt: 1 }}
            />
            {feedback.anonymous && (
              <Chip
                label="Anonymous"
                color="default"
                sx={{ ml: 1, mt: 1 }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">Rating</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              {[...Array(5)].map((_, i) => (
                i < parseInt(feedback.rating)
                  ? <Star key={i} color="primary" />
                  : <StarBorder key={i} />
              ))}
              <Typography sx={{ ml: 1 }}>({feedback.rating}/5)</Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Current Status</Typography>
            <Chip
              icon={
                feedback.status === 'Completed' ? <CheckCircle /> :
                  feedback.status === 'In Progress' ? <HourglassEmpty /> :
                    feedback.status === 'Rejected' ? <Cancel /> : null
              }
              label={feedback.status || "Pending"}
              color={
                feedback.status === 'Completed' ? 'success' :
                  feedback.status === 'In Progress' ? 'warning' :
                    feedback.status === 'Rejected' ? 'error' : 'default'
              }
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold">Feedback Comments</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: '#f9f9f9' }}>
              <Typography>{feedback.comment || "No comments provided."}</Typography>
            </Paper>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3 }}>Progress Notes</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: '#f9f9f9' }}>
              <Typography>
                {feedback.progress_notes || "No progress notes added yet."}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewFeedbackPage;