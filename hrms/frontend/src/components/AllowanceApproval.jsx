import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, Typography, CircularProgress, Button,
  TextField, Grid, Pagination, Box, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText
} from "@mui/material";
import Search from '@mui/icons-material/Search';

const AllowanceClaimApproval = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState({
    show: false,
    message: "",
    isError: false
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [openCalculationDialog, setOpenCalculationDialog] = useState(false);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchAllowanceClaims();
  }, []);

  const fetchAllowanceClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/allowanceclaim/all");
      console.log("Fetched Data:", response.data);
      setClaims(response.data.data);
    } catch (error) {
      console.error("Error fetching allowance claims:", error);
      setStatusUpdateMessage({
        show: true,
        message: "Failed to fetch allowance claims",
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
    window.open(`http://localhost:5000/uploads/${fileUrl}`, "_blank");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusClick = (claim, status) => {
    setCurrentClaim(claim);
    setStatusToUpdate(status);
    setReviewComment("");
    setCommentError(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClaim(null);
    setReviewComment("");
    setCommentError(false);
  };

  const calculateAllowance = async (employeeId, financialYear, purpose, claimAmount) => {
    try {
      const response = await axios.post("http://localhost:5000/api/allowancecalculation/calculateallowance", {
        employee_id: employeeId,
        financial_year: financialYear,
        purpose: purpose,
        claim_amount: claimAmount,
        comments: reviewComment
      });

      if (response.data.success) {
        setCalculationResult(response.data.data);
        return response.data.data;
      } else {
        console.error("Allowance calculation failed:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("Error calculating allowance:", error);
      return null;
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentClaim || !statusToUpdate) return;
    
    // Validate comment for Rejected status
    if (statusToUpdate === "Rejected" && (!reviewComment || reviewComment.trim() === "")) {
      setCommentError(true);
      return;
    }
    
    setStatusUpdateMessage({ show: false, message: "", isError: false });
    
    try {
      setUpdating(true);
      
      // If status is approved, calculate allowance first
      let calculationData = null;
      if (statusToUpdate === "Approved") {
        calculationData = await calculateAllowance(
          currentClaim.employee_id,
          currentClaim.financial_year,
          currentClaim.purpose,
          currentClaim.amount
        );
        
        if (!calculationData) {
          setStatusUpdateMessage({
            show: true,
            message: "Failed to calculate allowance",
            isError: true
          });
          setUpdating(false);
          return;
        }
      }
      
      // Now update the claim status - FIXED: send claim_id instead of employee_id and purpose
      const response = await axios.put(`http://localhost:5000/api/allowanceclaim/update-status`, {
        claim_id: currentClaim.id, // This is the key change - use unique ID
        status: statusToUpdate,
        reviewer_comment: reviewComment
      });
      
      if (response.data.success) {
        // Update the claims list with the updated claim
        setClaims(prevClaims => 
          prevClaims.map(claim => 
            claim.id === currentClaim.id
              ? { ...claim, status: statusToUpdate, reviewer_comment: reviewComment }
              : claim
          )
        );
        
        handleCloseDialog();
        
        // If status was approved and calculation succeeded, show the calculation dialog
        if (statusToUpdate === "Approved" && calculationData) {
          setOpenCalculationDialog(true);
        }
        
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

  const handleCloseCalculationDialog = () => {
    setOpenCalculationDialog(false);
    setCalculationResult(null);
  };

  const filteredClaims = claims.filter(claim => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (claim.employee_id && claim.employee_id.toString().includes(searchValue)) ||
      (claim.personal?.firstName && claim.personal.firstName.toLowerCase().includes(searchValue))
    );
  });

  const totalPages = Math.ceil(filteredClaims.length / rowsPerPage);
  const paginatedClaims = filteredClaims.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getPurposeDisplayName = (purpose) => {
    switch (purpose) {
      case 'medical_allowance': return 'Medical Allowance';
      case 'newspaper_allowance': return 'Newspaper Allowance';
      case 'dress_allowance': return 'Dress Allowance';
      case 'other_allowance': return 'Other Allowance';
      default: return purpose;
    }
  };

  return (
    <div style={{ maxWidth: "98%", textAlign: "center", marginTop: "40px", marginLeft: "15px" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Allowance Claims Approval
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
          label="Search by Employee ID or Name"
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
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Financial Year</strong></TableCell>
                  <TableCell><strong>Supporting Document</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Reviewer Comment</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClaims.length > 0 ? (
                  paginatedClaims.map((claim) => (
                    <TableRow key={`${claim.employee_id}-${claim.purpose}`}>
                      <TableCell>{claim.employee_id}</TableCell>
                      <TableCell>{claim.personal?.firstName || "N/A"}</TableCell>
                      <TableCell>{claim.personal?.lastName || "N/A"}</TableCell>
                      <TableCell>{getPurposeDisplayName(claim.purpose)}</TableCell>
                      <TableCell>₹{parseFloat(claim.amount).toLocaleString('en-IN')}</TableCell>
                      <TableCell>{claim.financial_year}</TableCell>
                      <TableCell>
                        {claim.proof_path && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleViewDocument(claim.proof_path)}
                          >
                            View Document
                          </Button>
                        )}
                      </TableCell>                    
                      <TableCell>
                        <Select
                          value={claim.status || "Pending"}
                          onChange={(e) => handleStatusClick(claim, e.target.value)}
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {claim.reviewer_comment || "No comments"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No allowance claims available.
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
              Comment is required when rejecting a claim
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

      {/* Allowance Calculation Dialog */}
      <Dialog open={openCalculationDialog} onClose={handleCloseCalculationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Allowance Calculation Result
        </DialogTitle>
        <DialogContent>
          {calculationResult && (
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Details</strong></TableCell>
                      <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Purpose</TableCell>
                      <TableCell align="right">{getPurposeDisplayName(calculationResult.details.purpose)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Financial Year</TableCell>
                      <TableCell align="right">{calculationResult.details.financial_year}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Annual Allowance Limit</TableCell>
                      <TableCell align="right">₹{parseFloat(calculationResult.details.annual_allowance).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Already Claimed</TableCell>
                      <TableCell align="right">₹{parseFloat(calculationResult.details.already_claimed).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Remaining Allowance (Before this claim)</TableCell>
                      <TableCell align="right">₹{parseFloat(calculationResult.details.remaining_allowance).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Current Claim Amount</TableCell>
                      <TableCell align="right">₹{parseFloat(calculationResult.details.current_claim).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#ECFDF5' }}>
                      <TableCell><strong>Claimable Amount (Tax-free)</strong></TableCell>
                      <TableCell align="right"><strong>₹{parseFloat(calculationResult.details.claimable_amount).toLocaleString('en-IN')}</strong></TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: calculationResult.details.taxable_amount > 0 ? '#FEF2F2' : 'inherit' }}>
                      <TableCell><strong>Taxable Amount</strong></TableCell>
                      <TableCell align="right"><strong>₹{parseFloat(calculationResult.details.taxable_amount).toLocaleString('en-IN')}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body1" sx={{ fontStyle: 'italic', mt: 2 }}>
                The calculation has been saved and this allowance claim has been approved.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCalculationDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AllowanceClaimApproval;