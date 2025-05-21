import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Grid, Divider, Box, CircularProgress, Button, TextField, MenuItem, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/bdot-removebg-preview.png";
import { toWords } from "number-to-words";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";

const Payslip = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const payslipRef = useRef(null);
  const location = useLocation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

 
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
  
        const response = await axios.get("http://localhost:5000/api/user/current", {
          withCredentials: true
        });
        console.log(response.data);
        if (response.data && response.data.employee_id) {
          setEmployeeId(response.data.employee_id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    
    fetchCurrentUser();
    setOpen(true);
  }, [location.pathname]);

  const fetchPayslip = async () => {
    if (!month || !year) {
      setError("Month and year are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/payslip/${month}/${year}`, {
        withCredentials: true
      });
      setPayslip(response.data.data);
      console.log(response.data.data);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payslip");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!payslipRef.current) return;
    const canvas = await html2canvas(payslipRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Payslip_${payslip?.personal?.firstName}_${payslip?.month}_${payslip?.year}.pdf`);
  };
 
  const printPayslip = () => {
    if (!payslipRef.current) return;
    const printContent = payslipRef.current.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=11000");
    
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (error) {
          return ""; 
        }
      })
      .join("\n");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip</title>
          <style>${styles}</style>
        </head>
        <body>
          <div id="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  };

  // Helper function to safely format numbers with toLocaleString
  const formatCurrency = (value) => {
    return value != null ? value.toLocaleString() : '0';
  };

  return (
    <>
      {!open && (
        <Box display="flex" justifyContent="left" mt={3}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Fetch Payslip
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
            fullWidth
            label="Employee ID"
            variant="outlined"
            value={employeeId}
            disabled
            InputProps={{
              readOnly: true,
            }}
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
            {months.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
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
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>

          {error && <Typography color="error" align="center" mt={2}>{error}</Typography>}

          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={fetchPayslip}>
              Get Payslip
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mt: 2 }} />}

      {payslip && (
        <Card ref={payslipRef} sx={{ maxWidth: "95%", p: 3, mt: 4, boxShadow: 3, mx: 5 }}>
          <CardContent>
            <Box>
              <Typography textAlign="Right">Computer Generated</Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" textAlign="center" marginBottom="10px"><strong>Employee Payslip</strong></Typography>
            <Box display="flex" justifyContent="space-between" flexDirection="row" mb={2}>
              <Box marginLeft={10}>
                {payslip.company_details?.companyLogo && (
                  <img src={payslip.company_details.companyLogo} alt="bridgeme" width={80} />
                )}
              </Box>
              <Box marginTop={4} display="flex" flexDirection="column" alignItems="center" textAlign="center" marginRight={40} >
                <Typography variant="body1">
                  {payslip.company_details?.address || "N/A"}
                </Typography>
                <Typography variant="body1">
                  {payslip.company_details?.branchLocation || "N/A"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {payslip.company_details?.companyName || "N/A"}
              </Typography>
              <Typography variant="h7" color="textSecondary">
                {payslip.month} {payslip.year} | Created: {payslip.createdAt || "N/A"}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" textAlign="center">Employee Payslip for {payslip.month}-{payslip.year}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box p={2} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Employee Details</Typography>
                  <Typography><strong>Employee_ID:</strong> {payslip.employee_id || "N/A"}</Typography>
                  <Typography><strong>Name:</strong> {payslip.personal?.firstName || "N/A"} {payslip.personal?.lastName || "N/A"}</Typography>
                  <Typography><strong>Email:</strong> {payslip.personal?.email || "N/A"}</Typography>
                  <Typography><strong>Designation:</strong> {payslip.financial_details?.department || "N/A"}</Typography>
                  <Typography><strong>Phone Number:</strong> {payslip.personal?.phoneNumber || "N/A"}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Financial Details</Typography>
                  <Typography><strong>Bank Name:</strong> {payslip.financial_details?.bankName || "N/A"}</Typography>
                  <Typography><strong>IFSC NO:</strong> {payslip.financial_details?.ifscCode || "N/A"}</Typography>
                  <Typography><strong>A/C No:</strong> {payslip.financial_details?.accountNumber || "N/A"}</Typography>
                  <Typography><strong>PF No:</strong> {payslip.pfDetails?.pfno || "N/A"}</Typography>
                  <Typography><strong>UAN:</strong> {payslip.pfDetails?.UAN || "N/A"}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h6" fontWeight="bold">Salary Details</Typography>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography fontWeight="bold">Component</Typography>
                    <Typography>Base Salary</Typography>
                    <Typography>HRA</Typography>
                    <Typography>Medical Allowance</Typography>
                    <Typography>Newspaper Allowance</Typography>
                    <Typography>Dress Allowance</Typography>
                    <Typography>Other Allowance</Typography>
                    <Typography>Variable Salary</Typography>
                    <Typography>Joining Bonus</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">Gross Salary</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">Amount</Typography>
                    <Typography>₹{formatCurrency(payslip.base_salary)}</Typography>
                    <Typography>₹{formatCurrency(payslip.hra)}</Typography>
                    <Typography>₹{formatCurrency(payslip.medical_allowance)}</Typography>
                    <Typography>₹{formatCurrency(payslip.newspaper_allowance)}</Typography>
                    <Typography>₹{formatCurrency(payslip.dress_allowance)}</Typography>
                    <Typography>₹{formatCurrency(payslip.other_allowance)}</Typography>
                    <Typography>₹{formatCurrency(payslip.variable_salary)}</Typography>
                    <Typography>₹{formatCurrency(payslip.joining_bonus)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">₹{formatCurrency(payslip.gross_salary)}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">Cumulative</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.base_salary?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.hra?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.medical_allowance?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.newspaper_allowance?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.dress_allowance?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.other_allowance?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.variable_salary?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.joining_bonus?.cumulative)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">₹{formatCurrency(payslip.cumulative_salary_details?.gross_salary?.cumulative)}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" fontWeight="bold">Deducation Details</Typography>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography fontWeight="bold">Component</Typography>
                    <Typography>PF</Typography>
                    <Typography>Professtional Tax</Typography>
                    <Typography>Tax</Typography>
                    <Typography color="white">-</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">Total Deductions</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">Amount</Typography>
                    <Typography>₹{formatCurrency(payslip.pf)}</Typography>
                    <Typography>₹{formatCurrency(payslip.professional_tax)}</Typography>
                    <Typography>₹{formatCurrency(payslip.monthly_tax)}</Typography>
                    <Typography color="white">-</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">
                      ₹{formatCurrency((payslip.pf || 0) + (payslip.professional_tax || 0) + (payslip.monthly_tax || 0))}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">Cumulative</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.pf?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.professional_tax?.cumulative)}</Typography>
                    <Typography>₹{formatCurrency(payslip.cumulative_salary_details?.monthly_tax?.cumulative)}</Typography>
                    <Typography color="white">-</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontWeight="bold">
                      ₹{formatCurrency(
                        (payslip.cumulative_salary_details?.pf?.cumulative || 0) + 
                        (payslip.cumulative_salary_details?.professional_tax?.cumulative || 0) + 
                        (payslip.cumulative_salary_details?.total_tax?.cumulative || 0)
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" align="left" fontWeight="bold" color="black">
              Net Salary: ₹{formatCurrency(payslip.net_salary)}
            </Typography>
            <Divider sx={{ my: 1 }} />

            <Typography variant="h6" fontWeight="bold" color="black">
              <strong>Rupees in words: </strong>
              {payslip.net_salary != null ? `${toWords(payslip.net_salary)} Only` : 'Zero Only'}
            </Typography>
          </CardContent>
        </Card>
      )}
      {payslip && (
        <Box display="flex" justifyContent="center" mt={2} gap={2}>
          <Button variant="contained" sx={{ backgroundColor: "#616161" }} color="secondary" onClick={printPayslip}>
            Print
          </Button>
          <Button variant="contained" color="primary" sx={{ backgroundColor: "#616161" }} onClick={downloadPDF}>
            Download PDF
          </Button>
        </Box>
      )}
    </>
  );
};

export default Payslip;