import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

const MonthlyTaxSpecific = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [taxData, setTaxData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleEdit = () => {
    navigate("/payroll-calculation", {
      state: {
        EmployeeId: employeeDetails?.Employeeid,
        month,
        year,
      },
    });
  };

  const fetchMonthlyTax = async () => {
    if (!employeeId || !year || !month) {
      setError("Please enter Employee ID, Year, and Month.");
      return;
    }

    setLoading(true);
    setError("");
    setTaxData(null);
    setEmployeeDetails(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/payslip/employee/tax/monthly/${employeeId}/${month}/${year}`
      );
      console.log("API Response:", response.data);
      
      // Check if the response has data
      if (response.data && response.data.success) {
        // Set tax data - make sure it exists and is a number
        const taxAmount = parseFloat(response.data.totalTaxPaid) || 0;
        setTaxData(taxAmount);
        
        // Set employee details
        setEmployeeDetails({
          Employeeid: response.data.employee_id || "",
          firstname: response.data.firstname || "",
          lastname: response.data.lastname || "",
          panNumber: response.data.panNumber || "",
          pfDetails: response.data.pfDetails || {},
          companydetails: response.data.companyDetails || {
            companyname: "",
            address: "",
            branchLocation: "",
            TAN: "",
          },
        });
        
        setOpen(false);
      } else {
        setError("No data found or invalid response format");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError(error.response?.data?.message || "Error fetching tax data.");
    } finally {
      setLoading(false);
      setShouldFetch(false);
    }
  };

  useEffect(() => {
    if (shouldFetch && employeeId && month && year) {
      fetchMonthlyTax();
    }
  }, [shouldFetch, employeeId, month, year]);

  const handleGetMonthlyTax = () => {
    setShouldFetch(true);
  };

  return (
    <>
      {!open && (
        <Box display="flex" justifyContent="left" mt={3} marginRight={3}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Monthly Tax
          </Button>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">
          Monthly Tax
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Employee ID"
            variant="outlined"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Select Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            margin="normal"
          >
            {months.map((m, idx) => (
              <MenuItem key={idx} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Select Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            margin="normal"
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>

          {error && <Typography color="error" align="center" mt={2}>{error}</Typography>}

          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={handleGetMonthlyTax}>
              Get Monthly Tax
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Container maxWidth sx={{ textAlign: "center" }}>
        {taxData !== null && employeeDetails && (
          <>
            <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", marginBottom: "20px", marginTop: "20px" }}>
              <Typography variant="h5" fontWeight="bold">
                {employeeDetails.companydetails?.companyname || "N/A"}
              </Typography>
              <Typography variant="body1">
                {employeeDetails.companydetails?.address || "N/A"}
              </Typography>
              <Typography variant="body1">
                {employeeDetails.companydetails?.branchLocation || "N/A"}
              </Typography>
            </Paper>

            <Typography variant="h5" gutterBottom fontWeight="bold">
              Monthly Tax Calculation - {month}, {year}
            </Typography>

            <Table sx={{ marginTop: "20px", border: "1px solid #ddd" }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>Firstname</strong></TableCell>
                  <TableCell><strong>Lastname</strong></TableCell>
                  <TableCell><strong>PAN Number</strong></TableCell>
                  <TableCell><strong>TAN Number</strong></TableCell>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell><strong>Year</strong></TableCell>
                  <TableCell><strong>Total Tax</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{employeeDetails.Employeeid || "N/A"}</TableCell>
                  <TableCell>{employeeDetails.firstname || "N/A"}</TableCell>
                  <TableCell>{employeeDetails.lastname || "N/A"}</TableCell>
                  <TableCell>{employeeDetails.panNumber || "N/A"}</TableCell>
                  <TableCell>{employeeDetails.companydetails?.TAN || "N/A"}</TableCell>
                  <TableCell>{month}</TableCell>
                  <TableCell>{year}</TableCell>
                  <TableCell>₹{typeof taxData === 'number' ? taxData.toFixed(2) : "0.00"}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={handleEdit}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}
        {loading && <CircularProgress sx={{ marginTop: "20px" }} />}
      </Container>
    </>
  );
};

export default MonthlyTaxSpecific;