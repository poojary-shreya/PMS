import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { Search } from "@mui/icons-material";
import SharedNavbar from "./performancenavbar.jsx";

const API_URL = "http://localhost:5000/api/succession-plans";

const EmployeeSuccessionPlan = () => {
  const [successionPlans, setSuccessionPlans] = useState([]);
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const fetchEmployeePlans = async (employeeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employee/${employeeId}`, { withCredentials: true });

      if (response.data && response.data.length > 0) {
        setSuccessionPlans(response.data);
      } else {
        setSuccessionPlans([]);
        showSnackbar("No succession plans found for this employee", "info");
      }
    } catch (error) {
      showSnackbar("Error fetching plans", "error");
      alert(error.response.data.message)
      setSuccessionPlans([]);
    } finally {
      setLoading(false);
    }
  };
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
          fetchEmployeePlans(response.data.employee_id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        showSnackbar("Failed to fetch user information", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  const handleSearch = () => {
    if (employeeIdInput.trim()) {
      fetchEmployeePlans(employeeIdInput.trim());
    } else {
      showSnackbar("Please enter an employee ID", "warning");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <SharedNavbar />

      <Box sx={{ mt: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Succession Plan
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label=" Employee ID"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  sx={{ width: 300 }}
                />
                {/* <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  sx={{ width: 100 }}
                >
                  Search
                </Button> */}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Readiness Level</TableCell>
                    <TableCell>Development Needs</TableCell>
                    <TableCell>Timeline</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <LinearProgress />
                      </TableCell>
                    </TableRow>
                  ) : successionPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {employeeIdInput ?
                          `No succession plans found for employee ${employeeIdInput}` :
                          "Enter an employee ID to search"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    successionPlans.map((plan) => (
                      <TableRow key={plan._id}>
                        <TableCell>{plan.employee_id}</TableCell>
                        <TableCell>{plan.position}</TableCell>
                        <TableCell>
                          <span style={{
                            color: plan.readinessLevel === 'High' ? '#2e7d32' :
                              plan.readinessLevel === 'Medium' ? '#ed6c02' : '#d32f2f',
                            fontWeight: 'bold'
                          }}>
                            {plan.readinessLevel}
                          </span>
                        </TableCell>
                        <TableCell>{plan.developmentNeeds}</TableCell>
                        <TableCell>{formatDate(plan.timeline)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EmployeeSuccessionPlan;