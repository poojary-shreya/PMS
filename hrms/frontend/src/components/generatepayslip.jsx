import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, MenuItem, Card, Divider, Grid, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import axios from "axios";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

const GeneratePayslip = () => {
  const location = useLocation();

  const [payrollId, setPayrollId] = useState(location.state?.employeeId || "");
  const [month, setMonth] = useState(location.state?.month || "");
  const [year, setYear] = useState(location.state?.year || ""); 
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i); 

  const handleGeneratePayslip = async () => {
    setError("");
    setPayslip(null);
    setSuccessMessage("");
    setLoading(true);

    if (!payrollId || !month || !year) {
      setError("Employee ID, Month, and Year are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/payslip/generate", {
        employee_id: payrollId,
        month,
        year, 
      });
      
      setPayslip(response.data);
      setSuccessMessage(response.data.message || "Payslip generated successfully");
      setOpen(false);
      setLoading(false);
    } catch (error) {
      console.error("Error generating payslip:", error);
      setError(error.response?.data?.message || "Failed to generate payslip. Please check Employee ID and try again.");
      setLoading(false);
    }
  };

  const calculateTotalDeductions = (payslip) => {
    return (
      (payslip.pf || 0) + 
      (payslip.professional_tax || 0) + 
      (payslip.monthly_tax || 0)
    ).toFixed(2);
  };

  return (
    <>
      {!open && (
        <Box display="flex" justifyContent="left" mt={3} ml={3}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Generate Payslip
          </Button>
        </Box>
      )}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Enter Payslip Details
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Employee ID"
            variant="outlined"
            fullWidth
            value={payrollId}
            onChange={(e) => setPayrollId(e.target.value)}
          />

          <TextField
            select
            label="Select Month"
            variant="outlined"
            fullWidth
            value={month}
            margin="normal"
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m, index) => (
              <MenuItem key={index} value={m}>{m}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            margin="normal"
            label="Select Year"
            variant="outlined"
            fullWidth
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGeneratePayslip}
              disabled={loading}
            >
              {loading ? "Processing..." : "Get Payslip"}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>

          {error && (
            <Typography color="error" textAlign="center" mt={2}>{error}</Typography>
          )}
        </DialogContent>
      </Dialog>

      {successMessage && !payslip && (
        <Typography color="success" textAlign="center" mt={2}>{successMessage}</Typography>
      )}

      {payslip && (
        <Card sx={{ width: "95%", mx: "auto", my: 4, p: 4, borderRadius: "12px", boxShadow: 5, backgroundColor: "#f9f9f9" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Payslip
            </Typography>
            <Typography variant="subtitle1" color="success.main">
              {payslip.message}
            </Typography>
          </Box>
          
          <Box sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
                  Employee Details
                </Typography>
                <Typography><strong>Employee ID:</strong> {payslip.payslip.employee_id}</Typography>
                <Typography><strong>First Name:</strong> {payslip.employeeDetails.firstName}</Typography>
                <Typography><strong>Last Name:</strong> {payslip.employeeDetails.lastName}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
                  Financial Details
                </Typography>
                <Typography><strong>Account Number:</strong> {payslip.financialDetails.accountNumber}</Typography>
                <Typography><strong>Bank Name:</strong> {payslip.financialDetails.bankName}</Typography>
                <Typography><strong>IFSC Code:</strong> {payslip.financialDetails.ifscCode}</Typography>
                {payslip.financialDetails.department && (
                  <Typography><strong>Department:</strong> {payslip.financialDetails.department}</Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
              Payslip Details - {payslip.payslip.month}, {payslip.payslip.year}
            </Typography>
            
            {payslip.tax_details && (
              <Typography color="primary">
                <strong>Tax Regime:</strong> {payslip.tax_details.regime === "old_regime" ? "Old Regime" : "New Regime"} | 
                <strong> Financial Year:</strong> {payslip.tax_details.financial_year}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6" fontWeight="bold">Salary Details</Typography>
                <Typography><strong>Base Salary:</strong> ₹{payslip.payslip.base_salary.toFixed(2)}</Typography>
                <Typography><strong>HRA:</strong> ₹{payslip.payslip.hra.toFixed(2)}</Typography>
                <Typography><strong>Medical Allowance:</strong> ₹{payslip.payslip.medical_allowance.toFixed(2)}</Typography>
                <Typography><strong>Newspaper Allowance:</strong> ₹{payslip.payslip.newspaper_allowance.toFixed(2)}</Typography>
                <Typography><strong>Dress Allowance:</strong> ₹{payslip.payslip.dress_allowance.toFixed(2)}</Typography>
                <Typography><strong>Other Allowance:</strong> ₹{payslip.payslip.other_allowance.toFixed(2)}</Typography>
                
                {payslip.payslip.variable_salary > 0 && (
                  <Typography><strong>Variable Salary:</strong> ₹{payslip.payslip.variable_salary.toFixed(2)}</Typography>
                )}
                
                {payslip.payslip.joining_bonus > 0 && (
                  <Typography sx={{ color: 'green', fontWeight: 'bold' }}>
                    <strong>Joining Bonus:</strong> ₹{payslip.payslip.joining_bonus.toFixed(2)}
                  </Typography>
                )}
                
                <Divider sx={{my:1}}/>
                <Typography><strong>Gross Salary:</strong> ₹{payslip.payslip.gross_salary.toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="h6" fontWeight="bold">Deduction Details</Typography>
                <Typography><strong>PF:</strong> ₹{payslip.payslip.pf.toFixed(2)}</Typography>
                <Typography><strong>Professional Tax:</strong> ₹{payslip.payslip.professional_tax.toFixed(2)}</Typography>
                <Typography><strong>Income Tax:</strong> ₹{payslip.payslip.monthly_tax.toFixed(2)}</Typography>
                
                <Divider sx={{my:1}}/>
                <Typography><strong>Total Deductions:</strong> ₹{calculateTotalDeductions(payslip.payslip)}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, p: 2, backgroundColor: "#e8f5e9", borderRadius: "8px", textAlign: "right" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
              Net Salary: ₹{payslip.payslip.net_salary.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontStyle: "italic", color: "#757575" }}>
              Finance Department 
            </Typography>
          </Box>
        </Card>
      )}
    </>
  );
};

export default GeneratePayslip;