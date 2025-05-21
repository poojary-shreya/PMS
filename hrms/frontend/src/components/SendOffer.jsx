import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Divider
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const ApprovedOffers = () => {
  const [offers, setOffers] = useState({
    approved: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      // Fetch approved offers
      const approvedResponse = await fetch(`${API_BASE_URL}/offers/approved`);
      if (!approvedResponse.ok) {
        throw new Error(`HTTP error! Status: ${approvedResponse.status}`);
      }
      const approvedData = await approvedResponse.json();
      
      // Fetch rejected offers (assuming endpoint exists)
      const rejectedResponse = await fetch(`${API_BASE_URL}/offers/rejected`);
      if (!rejectedResponse.ok) {
        throw new Error(`HTTP error! Status: ${rejectedResponse.status}`);
      }
      const rejectedData = await rejectedResponse.json();
      
      setOffers({
        approved: approvedData,
        rejected: rejectedData
      });
    } catch (error) {
      console.error("Error fetching offers:", error);
      setAlert({
        open: true,
        message: "Failed to fetch offers: " + error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = (offer) => {
    setSelectedOffer(offer);
    setDialogOpen(true);
  };

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    console.log(offer);
    setDetailsDialogOpen(true);
  };
  
  const handleEditOffer = (offer) => {
    // Navigate to the offer form with the offer ID
    navigate(`/offer`, { state: { offer } });
  };

  const handleDownloadOfferLetter = async (offerLetterPath) => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/download/${offerLetterPath}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = offerLetterPath.split('/').pop() || 'offer-letter.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading offer letter:", error);
      setAlert({
        open: true,
        message: "Failed to download offer letter: " + error.message,
        severity: "error"
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedOffer(null);
  };
  
  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedOffer(null);
  };

  const handleSendConfirm = async () => {
    if (!selectedOffer) return;
    
    try {
      setSendingOffer(true);
      const response = await fetch(`${API_BASE_URL}/offers/${selectedOffer.offerId}/send`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setAlert({
        open: true,
        message: "Offer sent to candidate successfully!",
        severity: "success"
      });
      
      handleDialogClose();
      fetchOffers(); 
      
    } catch (error) {
      console.error("Error sending offer:", error);
      setAlert({
        open: true,
        message: `Failed to send offer: ${error.message}`,
        severity: "error"
      });
    } finally {
      setSendingOffer(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderOffersTable = (offerList, isRejected = false) => {
    if (offerList.length === 0) {
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No {isRejected ? "rejected" : "approved"} offers to display
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Salary Fixed</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joining Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Offer Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offerList.map((offer) => (
              <TableRow key={offer.offerId} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {offer.candidateName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {offer.candidateEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{offer.jobTitle}</TableCell>
                <TableCell>{formatCurrency(offer.salaryFixed)}</TableCell>
                <TableCell>{formatDate(offer.joiningDate)}</TableCell>
                <TableCell>{formatDate(offer.offerDate)}</TableCell>
                <TableCell>
                  <Chip 
                    label={isRejected ? "Changes Required" : (offer.emailSent ? "Sent" : "Approved")} 
                    size="small"
                    color={isRejected ? "warning" : (offer.emailSent ? "success" : "primary")}
                    icon={offer.emailSent ? <CheckCircleOutlineIcon fontSize="small" /> : null}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleViewDetails(offer)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {/* {offer.offerLetterPath && (
                      <Tooltip title="Download Offer Letter">
                        <IconButton 
                          size="small" 
                          color="secondary"
                          onClick={() => handleDownloadOfferLetter(offer.offerLetterPath)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )} */}
                    
                    {isRejected && (
                      <Tooltip title="Edit & Resubmit">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {!isRejected && offer.status === 'Approved' && !offer.emailSent && (
                      <Tooltip title="Send to Candidate">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleSendOffer(offer)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Offer Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Approved Offers" />
          <Tab label="Rejected Offers" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && renderOffersTable(offers.approved)}
          {activeTab === 1 && renderOffersTable(offers.rejected, true)}
        </>
      )}
      
      {/* Send Offer Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          Send Offer to Candidate
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedOffer && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  Candidate: {selectedOffer.candidateName}
                </Typography>
                <Typography variant="body2">
                  Email: {selectedOffer.candidateEmail}
                </Typography>
                <Typography variant="body2">
                  Position: {selectedOffer.jobTitle}
                </Typography>
                <Typography variant="body2">
                  Salary: {formatCurrency(selectedOffer.salaryFixed)}
                  {selectedOffer.salaryVariable && ` + ${formatCurrency(selectedOffer.salaryVariable)} (Variable)`}
                </Typography>
                {selectedOffer.joiningBonus && (
                  <Typography variant="body2">
                    Joining Bonus: {formatCurrency(selectedOffer.joiningBonus)}
                  </Typography>
                )}
                <Typography variant="body2">
                  Joining Date: {formatDate(selectedOffer.joiningDate)}
                </Typography>
              </Box>
            )}
            
            {/* <Typography variant="body1" color="warning.main" sx={{ mt: 2 }}>
              This action will send the offer letter to the candidate's email. 
              Are you sure you want to proceed?
            </Typography> */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSendConfirm} 
            color="primary"
            variant="contained"
            disabled={sendingOffer}
            startIcon={sendingOffer ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingOffer ? 'Sending...' : 'Send Offer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Offer Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Offer Details
        </DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Candidate Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedOffer.candidateName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedOffer.candidateEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Position:</strong> {selectedOffer.jobTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>Joining Date:</strong> {formatDate(selectedOffer.joiningDate)}
                </Typography>
              </Box>
              <Divider/>
              
              {/* <Typography variant="h6" gutterBottom>
                Compensation Details
              </Typography> */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Typography variant="body2">
                  <strong>Fixed Salary:</strong> {formatCurrency(selectedOffer.salaryFixed)}
                </Typography>
                <Typography variant="body2">
                  <strong>Variable Pay:</strong> {selectedOffer.salaryVariable ? formatCurrency(selectedOffer.salaryVariable) : "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Joining Bonus:</strong> {selectedOffer.joiningBonus ? formatCurrency(selectedOffer.joiningBonus) : "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>ESOP:</strong> {selectedOffer.esop || "-"}
                </Typography>
              </Box>
              
              {/* <Typography variant="h6" gutterBottom>
                Offer Status
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Typography variant="body2">
                  <strong>Offer Date:</strong> {formatDate(selectedOffer.offerDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedOffer.status}
                </Typography>
                {selectedOffer.approvedBy && (
                  <Typography variant="body2">
                    <strong>Approved By:</strong> {selectedOffer.approvedBy}
                  </Typography>
                )}
                {selectedOffer.approvalDate && (
                  <Typography variant="body2">
                    <strong>Approval Date:</strong> {formatDate(selectedOffer.approvalDate)}
                  </Typography>
                )}
              </Box> */}
              
              {selectedOffer.approvalComments && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Comments
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2">
                      {selectedOffer.approvalComments}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {/* {selectedOffer && selectedOffer.status === 'Draft' && (
            <Button 
              onClick={() => {
                handleDetailsDialogClose();
                handleEditOffer(selectedOffer);
              }} 
              color="warning"
              startIcon={<EditIcon />}
            >
              Edit & Resubmit
            </Button>
          )}
          {selectedOffer && selectedOffer.offerLetterPath && (
            <Button 
              onClick={() => handleDownloadOfferLetter(selectedOffer.offerLetterPath)} 
              color="secondary"
              startIcon={<DownloadIcon />}
            >
              Download Letter
            </Button>
          )} */}
          <Button onClick={handleDetailsDialogClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovedOffers;