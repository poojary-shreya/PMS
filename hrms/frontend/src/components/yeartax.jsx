import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Paper, TextField, Button, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, MenuItem, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";



const YearlyTax = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [year, setYear] = useState("");
  const [taxData, setTaxData] = useState([]);
  const [yearlyTaxSummary, setYearlyTaxSummary] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState("");

  const location = useLocation();
  useEffect(() => {
    setOpen(true)
  }, [location.pathname])

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const fetchYearlyTax = async () => {
    if (!employeeId || !year) {
      setError("Please enter both Employee ID and Year.");
      return;
    }

    setLoading(true);
    setError("");
    setTaxData([]);
    setYearlyTaxSummary(null);
    setEmployeeDetails(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/payslip/employee/tax/yearly/${employeeId}/${year}`);
      console.log(response.data);

      setTaxData(response.data.monthlyTaxDetails || []);
      setYearlyTaxSummary(response.data.totalYearlyTax || 0);

      setEmployeeDetails({
        Employeeid: response.data.employee_id,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        panNumber: response.data.panNumber,
        pfDetails: response.data.pfDetails,
        companydetails: response.data.companyDetails,
      });
      console.log(employeeDetails);
      setOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching tax data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (<Box display="flex" justifyContent="left" mt={3} marginRight={3}>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Yearly Tax
        </Button>
      </Box>)}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">
          Yearly Tax
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
            label="Select Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            margin="normal"
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>

          {error && <Typography color="error" align="center" mt={2}>{error}</Typography>}

          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={fetchYearlyTax}>
              Get Yearly Tax
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Container maxWidth sx={{ textAlign: "center", }}>
        {yearlyTaxSummary !== null && (
          <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", marginBottom: "20px", marginTop: "20px" }}>
            <Typography variant="h5" fontWeight="bold">
              {employeeDetails.companydetails.companyname}
            </Typography>
            <Typography variant="body1">
              {employeeDetails.companydetails.address}
            </Typography>
            <Typography variant="body1">{employeeDetails.companydetails.branchLocation}</Typography>
          </Paper>
        )}

        {yearlyTaxSummary !== null && (
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Yearly Tax Calculation
          </Typography>
        )}

        {loading && <CircularProgress sx={{ marginTop: "20px" }} />}

        {yearlyTaxSummary !== null && (
          <Card sx={{ marginTop: "12px", padding: "10px" }}>
            <CardContent>
              <Typography variant="h6">Tax Summary</Typography>
              <Typography><strong>Total Yearly Tax ({year}):</strong> ₹{yearlyTaxSummary}</Typography>
            </CardContent>
          </Card>
        )}

        {Array.isArray(taxData) && taxData.length > 0 && employeeDetails && (
          <Table sx={{ marginTop: "20px", border: "1px solid #ddd" }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Sl.No</strong></TableCell>
                <TableCell><strong>EmployeeId</strong></TableCell>
                <TableCell><strong>Firstname</strong></TableCell>
                <TableCell><strong>Lastname</strong></TableCell>
                <TableCell><strong>PAN Number</strong></TableCell>
                <TableCell><strong>TAN Number</strong></TableCell>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell><strong>Year</strong></TableCell>
                <TableCell><strong>Total Tax</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{employeeDetails.Employeeid}</TableCell>
                  <TableCell>{employeeDetails.firstname}</TableCell>
                  <TableCell>{employeeDetails.lastname}</TableCell>
                  <TableCell>{employeeDetails.panNumber || "N/A"}</TableCell>
                  <TableCell>{employeeDetails.companydetails.TAN || "N/A"}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{year}</TableCell>
                  <TableCell>₹{(row.totalTax).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </Container>
    </>
  );
};

export default YearlyTax;