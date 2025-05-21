import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  TablePagination
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TotalTax = () => {
  const [year, setYear] = useState("2024");
  const [totalTax, setTotalTax] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pdfRef = useRef();

 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  const fetchTotalTax = async () => {
    if (!year) {
      setError("Please enter a year.");
      return;
    }

    try {
      setError("");
      const response = await axios.get(
        `http://localhost:5000/api/payslip/employee/tax/total/company/financial/${year}`
      );
      setTotalTax(response.data.totalCompanyTax);
      console.log(response.data.totalCompanyTax);
      setEmployees(response.data.employees);
      setOpen(false);
    } catch (err) {
      setError("Error fetching tax data.");
      setTotalTax(null);
      setEmployees([]);
    }
  };

  const generatePDF = async () => {
    const prevRowsPerPage = rowsPerPage;
    setRowsPerPage(employees.length);
    setPage(0);
  
    setTimeout(async () => {
      const element = pdfRef.current;
      if (!element) return;
  
      const canvas = await html2canvas(element, { scale: 2 });
      const data = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
  
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(data, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Total_Tax_Report_${year}.pdf`);
  
      setRowsPerPage(prevRowsPerPage);
    }, 500); 
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" ml={2} mr={2}>
        {!open && (
          <Box display="flex" justifyContent="left" mt={3}>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              Enter Year
            </Button>
          </Box>
        )}
        {employees.length > 0 && (
          <Box display="flex" justifyContent="right" mt={3}>
            <Button variant="contained" color="primary" onClick={generatePDF}>
              Generate PDF
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">
          Total Tax
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Year"
            type="number"
            fullWidth
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={fetchTotalTax}>
              Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Card sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }} ref={pdfRef}>
        <CardContent>
          {totalTax !== null && (
            <Typography variant="h5" component="div" textAlign="center" gutterBottom fontWeight="bold">
              Total Tax for a Year
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {totalTax !== null && (
            <Typography variant="h6" textAlign="center" sx={{ mt: 2, mb: 2, color: "brown", fontWeight: "bold" }}>
              Total Tax of April {year} - March {parseInt(year) + 1}: ₹{totalTax.toFixed(2)} Paid
            </Typography>
          )}

          {employees.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Sl.No</strong></TableCell>
                    <TableCell><strong>EmployeeID</strong></TableCell>
                    <TableCell><strong>First Name</strong></TableCell>
                    <TableCell><strong>Last Name</strong></TableCell>
                    <TableCell><strong>PAN</strong></TableCell>
                    <TableCell><strong>TAN</strong></TableCell>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell><strong>Year</strong></TableCell>
                    <TableCell><strong>Tax</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee, index) => (
                      <TableRow key={index}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{employee.personal.employee_id}</TableCell>
                        <TableCell>{employee.personal.firstName}</TableCell>
                        <TableCell>{employee.personal.lastName}</TableCell>
                        <TableCell>{employee.personal.panNumber || "N/A"}</TableCell>
                        <TableCell>{employee.personal.company.tan || "N/A"}</TableCell>
                        <TableCell>{employee.month}</TableCell>
                        <TableCell>{employee.year}</TableCell>
                        <TableCell>₹{employee.monthly_tax.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {employees.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 15]}
              component="div"
              count={employees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}

        </CardContent>
      </Card>
    </>
  );
};

export default TotalTax;