import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  TablePagination,
} from "@mui/material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const MonthlyTax = () => {
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);  
  const [rowsPerPage, setRowsPerPage] = useState(5); 
  const [totalCount, setTotalCount] = useState(0); 
  const pdfRef = useRef(null);
  useEffect(() => {
    fetchMonthlyTax(selectedMonth, selectedYear, page + 1, rowsPerPage);
  }, [selectedMonth, selectedYear, page, rowsPerPage]);

  const fetchMonthlyTax = async (month, year, page, limit) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payslip/employee/tax/${month}/${year}?page=${page}&limit=${limit}`
      );

      setTaxData(response.data.data || []);
      console.log(response.data);
      setTotalCount(response.data.totalEmployees);
    } catch (err) {
      setError("No tax records found for the selected month and year.");
      setTaxData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); 
  };

  const generatePDF = async () => {
 
    const prevRowsPerPage = rowsPerPage;
    const prevPage = page;
  
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payslip/employee/tax/${selectedMonth}/${selectedYear}?page=1&limit=${totalCount}`
      );
      setTaxData(response.data.data || []);
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
  
      const element = pdfRef.current;
      if (!element) return;
  
      const canvas = await html2canvas(element, { scale: 2 });
      const data = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(data, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Monthly_Tax_Report_${selectedMonth}_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error fetching all tax data:", error);
    } finally {

      setRowsPerPage(prevRowsPerPage);
      setPage(prevPage);
      fetchMonthlyTax(selectedMonth, selectedYear, prevPage + 1, prevRowsPerPage); 
    }
  };
  
  

  return (
    <Box sx={{ maxWidth: "1500px", margin: "auto", padding: "20px", mt: 3, boxShadow: 3, mx: 3 }}>
      <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <Typography variant="h5" fontWeight="bold">
          {taxData.length > 0 ? taxData[0].companyDetails.companyname : null}
        </Typography>
        <Typography variant="body1">
          {taxData.length > 0 ? taxData[0].companyDetails.address : null}
        </Typography>
        <Typography variant="body1">
          {taxData.length > 0 ? taxData[0].companyDetails.branchLocation : null}
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Typography variant="h5" fontWeight="bold">Monthly Tax Report</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} sx={{ minWidth: "140px" }}>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>

          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} sx={{ minWidth: "100px" }}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Button variant="contained" color="primary" onClick={generatePDF} sx={{ marginBottom: 2 }}>
        Generate PDF
      </Button>

      {loading ? (
        <Box textAlign="center"><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error" textAlign="center">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} id="tax-table" ref={pdfRef}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Sl.No</strong></TableCell>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>First Name</strong></TableCell>
                  <TableCell><strong>Last Name</strong></TableCell>
                  <TableCell><strong>PAN Number</strong></TableCell>
                  <TableCell><strong>TAN Number</strong></TableCell>
                  <TableCell><strong>Tax</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxData.length > 0 ? (
                  taxData.map((employee, index) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell>{employee.employee_id}</TableCell>
                      <TableCell>{employee.firstname || "N/A"}</TableCell>
                      <TableCell>{employee.lastname || "N/A"}</TableCell>
                      <TableCell>{employee.panNumber || "N/A"}</TableCell>
                      <TableCell>{employee.companyDetails.TAN || "N/A"}</TableCell>
                      <TableCell>₹{(employee.total_tax).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No tax records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

            <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
          
        </>
      )}
    </Box>
  );
};

export default MonthlyTax;