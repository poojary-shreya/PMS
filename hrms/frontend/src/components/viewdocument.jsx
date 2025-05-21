import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, Typography, CircularProgress, Button,
  TextField, Grid, Pagination, Box, InputAdornment,
} from "@mui/material";
import Search from '@mui/icons-material/Search';

const DocumentStatus = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/documents");
        console.log("Fetched Data:", response.data);
        setDocuments(response.data.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleStatusChange = async (employee_id, category, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/documents/${employee_id}/status`,
        {
          status: newStatus,
          category: category,
        }
      );

      if (response.status === 200) {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.employee_id === employee_id && doc.category === category
              ? { ...doc, status: newStatus }
              : doc
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleViewDocument = (fileUrl) => {
    window.open(`http://localhost:5000/uploads/${fileUrl}`, "_blank");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };


  const filteredDocuments = documents.filter(doc => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (doc.employee_id && doc.employee_id.toString().includes(searchValue)) ||
      (doc.personal?.firstName && doc.personal.firstName.toLowerCase().includes(searchValue))
    );
  });


  const totalPages = Math.ceil(filteredDocuments.length / rowsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div style={{ maxWidth: "98%", textAlign: "center", marginTop: "40px", marginLeft: "15px" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        View Document and Approval
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: <Search color="action" />,
          }}
          sx={{ width: 300 }}
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
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Document Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Amount Claimed</strong></TableCell>
                  <TableCell><strong>Adjusted Amount</strong></TableCell>
                  <TableCell><strong>Remaining_TaxIncome</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>View</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.employee_id}</TableCell>
                      <TableCell>{doc.personal?.firstName || "N/A"}</TableCell>
                      <TableCell>{doc.document_name}</TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{doc.amount}</TableCell>
                      <TableCell>{doc.claimed_amount}</TableCell>
                      <TableCell>{doc.rem_taxable_income}</TableCell>
                      <TableCell>
                        <Select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.employee_id, doc.category, e.target.value)}
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
                          onClick={() => handleViewDocument(doc.file_path)}
                        >
                          View Document
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No documents available.
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

export default DocumentStatus;


