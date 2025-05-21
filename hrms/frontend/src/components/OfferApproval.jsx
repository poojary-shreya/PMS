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
  TextField,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Grid
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";

const API_BASE_URL = "http://localhost:5000/api";

const OfferApproval = () => {
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approverEmail, setApproverEmail] = useState("");
  const [comments, setComments] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(""); 
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/offers/pending-approval`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPendingOffers(data);
    } catch (error) {
      console.error("Error fetching pending offers:", error);
      setAlert({
        open: true,
        message: "Failed to fetch pending offers: " + error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };


  const fetchOfferDetails = async (offerId) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`${API_BASE_URL}/offers/view/${offerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      setOfferDetails(data);
    } catch (error) {
      console.error("Error fetching offer details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch offer details: " + error.message,
        severity: "error"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = (offer) => {
    setSelectedOffer(offer);
    setDialogAction("approve");
    setDialogOpen(true);
  };

  const handleReject = (offer) => {
    setSelectedOffer(offer);
    setDialogAction("reject");
    setDialogOpen(true);
  };

  const handleSendOffer = (offer) => {
    setSelectedOffer(offer);
    setDialogAction("send");
    setDialogOpen(true);
  };

  const handleViewDetails = async (offer) => {
    setSelectedOffer(offer);
    setDetailsDialogOpen(true);
    await fetchOfferDetails(offer.offerId);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setComments("");
    setSelectedOffer(null);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setOfferDetails(null);
    setSelectedOffer(null);
  };

  const handleDialogConfirm = async () => {
    if (!selectedOffer) return;
    
    try {
      let endpoint = "";
      let method = "";
      let body = {};
      let successMessage = "";
      
      switch (dialogAction) {
        case "approve":
          endpoint = `${API_BASE_URL}/offers/${selectedOffer.offerId}/approve`;
          method = "PUT";
          body = { approverEmail, comments };
          successMessage = "Offer approved successfully!";
          break;
          
        case "reject":
          endpoint = `${API_BASE_URL}/offers/${selectedOffer.offerId}/reject`;
          method = "PUT";
          body = { approverEmail, comments };
          successMessage = "Offer returned for revision.";
          break;
          
        case "send":
          endpoint = `${API_BASE_URL}/offers/${selectedOffer.offerId}/send`;
          method = "POST";
          successMessage = "Offer sent to candidate successfully!";
          break;
          
        default:
          throw new Error("Invalid action");
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      setAlert({
        open: true,
        message: successMessage,
        severity: "success"
      });
      
      handleDialogClose();
      fetchPendingOffers(); 
      
    } catch (error) {
      console.error(`Error ${dialogAction}ing offer:`, error);
      setAlert({
        open: true,
        message: `Failed to ${dialogAction} offer: ${error.message}`,
        severity: "error"
      });
    }
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


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Pending Offer Approvals
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : pendingOffers.length === 0 ? (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No offers pending approval
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Salary Fixed</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Joining Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingOffers.map((offer) => (
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
                  <TableCell>
                    <Chip 
                      label={offer.status} 
                      size="small"
                      color={
                        offer.status === 'Approved' ? 'success' :
                        offer.status === 'Pending Approval' ? 'warning' :
                        'default'
                      }
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
                      
                      {offer.status === 'Pending Approval' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleApprove(offer)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Return for Revision">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleReject(offer)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {offer.status === 'Approved' && (
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
      )}
      
     
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Approve Offer' : 
           dialogAction === 'reject' ? 'Return Offer for Revision' : 
           'Send Offer to Candidate'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedOffer && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  Candidate: {selectedOffer.candidateName}
                </Typography>
                <Typography variant="body2">
                  Position: {selectedOffer.jobTitle}
                </Typography>
                <Typography variant="body2">
                  Salary: {formatCurrency(selectedOffer.salaryFixed)}
                </Typography>
              </Box>
            )}
            
            {dialogAction === 'approve' && (
              "Please confirm that you want to approve this offer. Enter your email and any comments."
            )}
            {dialogAction === 'reject' && (
              "Please provide a reason for returning this offer for revision."
            )}
            {dialogAction === 'send' && (
              "Are you sure you want to send this offer to the candidate? This action cannot be undone."
            )}
          </DialogContentText>
          
          {(dialogAction === 'approve' || dialogAction === 'reject') && (
            <>
              <TextField
                autoFocus
                margin="dense"
                id="approverEmail"
                label="Your Email"
                type="email"
                fullWidth
                variant="outlined"
                value={approverEmail}
                onChange={(e) => setApproverEmail(e.target.value)}
                sx={{ mb: 2, mt: 2 }}
              />
              <TextField
                margin="dense"
                id="comments"
                label="Comments"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleDialogConfirm} 
            color={
              dialogAction === 'approve' ? 'success' : 
              dialogAction === 'reject' ? 'error' : 
              'primary'
            }
            variant="contained"
            disabled={(dialogAction === 'approve' || dialogAction === 'reject') && !approverEmail}
          >
            {dialogAction === 'approve' ? 'Approve' : 
             dialogAction === 'reject' ? 'Return for Revision' : 
             'Send to Candidate'}
          </Button>
        </DialogActions>
      </Dialog>
      
    
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleDetailsDialogClose}
        fullWidth
        maxWidth="md"
      >
        {/* <DialogTitle>
          Offer Letter
          <IconButton
            aria-label="close"
            onClick={handleDetailsDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle> */}
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Card elevation={3}>
              <CardContent sx={{ 
                bgcolor: '#fff',
                p: 4,
                maxHeight: '70vh',
                overflowY: 'auto'
              }}>
               
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    {/* <Typography variant="body1"><strong>Candidate:</strong> {offerDetails?.candidateName}</Typography> */}
                    <Typography variant="body1"><strong>Email:</strong> {offerDetails?.candidateEmail}</Typography>
                  </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                  <Typography variant="body1"><strong>Position:</strong> {offerDetails?.jobTitle}</Typography>
                  <Typography variant="body1"><strong>Joining Date:</strong> {formatDate(offerDetails?.joiningDate)}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1"><strong>Fixed Salary:</strong> {formatCurrency(offerDetails?.salaryFixed)}</Typography>
                    <Typography variant="body1"><strong>Variable Pay:</strong> {formatCurrency(offerDetails?.salaryVariable) || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1"><strong>Joining Bonus:</strong> {formatCurrency(offerDetails?.joiningBonus) || '-'}</Typography>
                    <Typography variant="body1"><strong>ESOP:</strong> {formatCurrency(offerDetails?.esop) || '-'}</Typography>
                  </Grid>
                </Grid>
                
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsDialogClose} color="primary">
            Close
          </Button>
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

export default OfferApproval;