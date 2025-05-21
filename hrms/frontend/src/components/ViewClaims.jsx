import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, Typography, CircularProgress, Button,
  TextField, Grid, Pagination, Box, InputAdornment,
} from "@mui/material";
import Search from '@mui/icons-material/Search';

const ViewClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/claims/all");
        console.log("Fetched Claims:", response.data);
        
      
        const transformedClaims = response.data.data.map(claim => ({
          ...claim,
          employee_name: claim.Employee ? 
            `${claim.Employee.firstName} ${claim.Employee.lastName}` : 
            "N/A",
          requested_amount: claim.amount
        }));
        
        setClaims(transformedClaims);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const handleStatusChange = async (employee_id, newStatus, claim) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/claims/status/${employee_id}`,
        {
          status: newStatus,
          purpose: claim.purpose, 
        }
      );

      if (response.status === 200) {
        setClaims((prevClaims) =>
          prevClaims.map((c) =>
            c.employee_id === employee_id && c.purpose === claim.purpose 
              ? { ...c, status: newStatus } 
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error updating claim status:", error);
    }
  };

  const handleViewClaim = (fileUrl) => {
    window.open(`http://localhost:5000/uploads/${fileUrl}`, "_blank");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const filteredClaims = claims.filter(claim => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (claim.employee_id && claim.employee_id.toString().includes(searchValue)) ||
      (claim.personal.firstName && claim.personal.firstName.toLowerCase().includes(searchValue)) 
    );
  });

  const totalPages = Math.ceil(filteredClaims.length / rowsPerPage);
  const paginatedClaims = filteredClaims.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div style={{ maxWidth: "98%", textAlign: "center", marginTop: "40px", marginLeft: "15px" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Claims Management and Approval
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          label="Search Claims by employeeId or Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: <InputAdornment position="end"><Search color="action" /></InputAdornment>,
          }}
          sx={{ width: 400 }}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>Employee Name</strong></TableCell>
                  <TableCell><strong>Amount Requested</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Submission Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClaims.length > 0 ? (
                  paginatedClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>{claim.employee_id}</TableCell>
                      <TableCell>{claim.personal.firstName}</TableCell>
                      <TableCell>₹{claim.requested_amount || claim.amount}</TableCell>
                      <TableCell>{claim.purpose || "N/A"}</TableCell>
                      <TableCell>
                        {claim.submission_date 
                          ? new Date(claim.submission_date).toLocaleDateString()
                          : new Date(claim.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={claim.status}
                          onChange={(e) => handleStatusChange(claim.employee_id, e.target.value, claim)}
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleViewClaim(claim.proof_path || claim.file_path)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No claims available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default ViewClaims;