import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, Typography, CircularProgress, Button,
  TextField, Grid, Pagination, Box, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText
} from "@mui/material";
import Search from '@mui/icons-material/Search';

const ProofApproval = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState({
    show: false,
    message: "",
    isError: false
  });
  const rowsPerPage = 5;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/approval/all");
      console.log("Fetched Data:", response.data);
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setStatusUpdateMessage({
        show: true,
        message: "Failed to fetch documents",
        isError: true
      });
      
      
      setTimeout(() => {
        setStatusUpdateMessage({ show: false, message: "", isError: false });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (fileUrl) => {
    window.open(`http://localhost:5000/uploads/investment-proofs/${fileUrl}`, "_blank");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusClick = (doc, status) => {
    setCurrentDoc(doc);
    setStatusToUpdate(status);
    setReviewComment("");
    setCommentError(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDoc(null);
    setReviewComment("");
    setCommentError(false);
  };

  const handleUpdateStatus = async () => {
    if (!currentDoc || !statusToUpdate) return;
    
    // Validate comment for Rejected status
    if (statusToUpdate === "Rejected" && (!reviewComment || reviewComment.trim() === "")) {
      setCommentError(true);
      return;
    }
    
    setStatusUpdateMessage({ show: false, message: "", isError: false });
    
    try {
      setUpdating(true);
      const response = await axios.put(`http://localhost:5000/api/approval/update-status`, {
        employee_id: currentDoc.employee_id,
        category: currentDoc.category,
        status: statusToUpdate,
        reviewer_comment: reviewComment
      });
      
      if (response.data.success) {
        
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.employee_id === currentDoc.employee_id && doc.category === currentDoc.category
              ? { ...doc, status: statusToUpdate, reviewer_comment: reviewComment }
              : doc
          )
        );
        
        handleCloseDialog();
        
        setStatusUpdateMessage({
          show: true,
          message: `Status successfully updated to ${statusToUpdate}`,
          isError: false
        });
        
        
        setTimeout(() => {
          setStatusUpdateMessage({ show: false, message: "", isError: false });
        }, 5000);
      } else {
        setStatusUpdateMessage({
          show: true,
          message: response.data.message || "Update failed",
          isError: true
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setStatusUpdateMessage({
        show: true,
        message: "Failed to update status",
        isError: true
      });
    } finally {
      setUpdating(false);
    }
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

      {statusUpdateMessage.show && (
        <Box 
          sx={{ 
            py: 1, 
            px: 2, 
            mb: 2, 
            borderRadius: 1,
            backgroundColor: statusUpdateMessage.isError ? '#FEE2E2' : '#ECFDF5',
            color: statusUpdateMessage.isError ? '#991B1B' : '#065F46',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography>{statusUpdateMessage.message}</Typography>
        </Box>
      )}

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
                  <TableCell><strong>FirstName</strong></TableCell>
                  <TableCell><strong>LastName</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Supporting Document</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Reviewer Comment</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((doc) => (
                    <TableRow key={`${doc.employee_id}-${doc.category}`}>
                      <TableCell>{doc.employee_id}</TableCell>
                      <TableCell>{doc.personal?.firstName || "N/A"}</TableCell>
                      <TableCell>{doc.personal?.lastName || "N/A"}</TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleViewDocument(doc.proof_file_path)}
                        >
                          View Document
                        </Button>
                      </TableCell>                    
                      <TableCell>
                        <Select
                          value={doc.status || "Pending"}
                          onChange={(e) => handleStatusClick(doc, e.target.value)}
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {doc.reviewer_comment || "No comments"}
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

      {/* Comment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Status to {statusToUpdate}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={statusToUpdate === "Rejected" ? "Reason for Rejection (Required)" : "Reviewer Comment"}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reviewComment}
            onChange={(e) => {
              setReviewComment(e.target.value);
              if(statusToUpdate === "Rejected") {
                setCommentError(e.target.value.trim() === "");
              }
            }}
            placeholder={statusToUpdate === "Rejected" 
              ? "Please provide a reason for rejection (required)" 
              : "Please provide your comments for this decision (optional)"}
            error={commentError}
            required={statusToUpdate === "Rejected"}
          />
          {commentError && (
            <FormHelperText error>
              Comment is required when rejecting a document
            </FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            color="primary" 
            variant="contained" 
            disabled={updating || (statusToUpdate === "Rejected" && (!reviewComment || reviewComment.trim() === ""))}
          >
            {updating ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProofApproval;