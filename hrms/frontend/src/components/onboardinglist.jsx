import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const OnboardingListPage = () => {
  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedRequest, setEditedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDocumentDialogOpen, setViewDocumentDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

 
  const documentOptions = [
    { value: "aadhar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "payslip", label: "Last Payslip" },
    { value: "form16", label: "Previous Employer Form 16" },
    { value: "relieving", label: "Relieving Letter" },
    { value: "education", label: "Educational Certificates" },
    { value: "bank", label: "Bank Account Details" },
    { value: "emergency", label: "Emergency Contact Information" },
  ];

 
  const processOptions = [
    { value: "document-verification", label: "Document Verification" },
    { value: "training", label: "Mandatory Training" },
    { value: "induction", label: "Induction Meetings" },
    { value: "it-setup", label: "IT Setup" },
    { value: "complete-onboarding", label: "Complete Onboarding Process" },
  ];

  useEffect(() => {
    const fetchOnboardingRequests = async () => {
      try {
     
        if (!API_BASE_URL) {
          console.error("API base URL is undefined");
          setSnackbar({
            open: true,
            message: "API configuration error. Please check your environment settings.",
            severity: "error",
          });
          setLoading(false);
          return;
        }
        
        console.log("Fetching from:", `${API_BASE_URL}/onboarding`);
        const response = await axios.get(`${API_BASE_URL}/onboarding`);
        console.log("API Response:", response);
        
        const requests = response.data?.data || response.data || [];
        
    
        if (!Array.isArray(requests)) {
          console.error("Unexpected response format:", requests);
          setSnackbar({
            open: true,
            message: "Received invalid data format from server",
            severity: "error",
          });
          setLoading(false);
          return;
        }
        
        const formattedRequests = requests.map(request => {
      
          let parsedRequiredDocs = [];
          try {
            parsedRequiredDocs = Array.isArray(request.requiredDocuments) 
              ? request.requiredDocuments 
              : (request.requiredDocuments ? JSON.parse(request.requiredDocuments) : []);
          } catch (parseError) {
            console.warn("Failed to parse requiredDocuments:", parseError);
            parsedRequiredDocs = [];
          }
          
          return {
            ...request,
            uploadedDocuments: request.documents || [], 
            requiredDocuments: parsedRequiredDocs
          };
        });
        
        setOnboardingRequests(formattedRequests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching onboarding requests:", error);
    
        let errorMessage = "Failed to load onboarding requests";
        if (error.response) {
    
          errorMessage += `: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
          console.error("Server error details:", error.response.data);
        } else if (error.request) {
    
          errorMessage += ": No response received from server";
        } else {
        
          errorMessage += `: ${error.message}`;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
        setLoading(false);
      }
    };
    
    fetchOnboardingRequests();
   
    const interval = setInterval(fetchOnboardingRequests, 30000);
    
    return () => clearInterval(interval);
    
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenViewDialog(true);
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
  
    setEditedRequest({
      ...request,
      requiredDocuments: Array.isArray(request.requiredDocuments) 
        ? [...request.requiredDocuments] 
        : (request.requiredDocuments ? JSON.parse(request.requiredDocuments) : [])
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedRequest || !editedRequest.id) {
        throw new Error("Invalid request data");
      }
      
      const formData = new FormData();
  
    
      Object.keys(editedRequest).forEach(key => {
        if (key === 'requiredDocuments') {
          formData.append(key, JSON.stringify(editedRequest[key]));
        } else if (key !== 'uploadedDocuments' && key !== 'documents' && key !== 'uploadedFiles') {
          formData.append(key, editedRequest[key]);
        }
      });
      
      const response = await axios.put(`${API_BASE_URL}/onboarding/${editedRequest.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
   
      if (editedRequest.candidateEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedRequest.candidateEmail)) {
        try {
          await axios.post(`${API_BASE_URL}/notifications/email`, {
            to: editedRequest.candidateEmail,
            subject: "Your Onboarding Process Has Been Updated",
            content: `Dear ${editedRequest.candidateName},\n\nYour onboarding process has been updated. Please log in to the employee portal for the latest requirements by ${editedRequest.taskCompletionDate}.\n\nRegards,\nHR Team`
          });
        } catch (emailError) {
          console.error("Error sending email notification:", emailError);
       
          setSnackbar({
            open: true,
            message: "Onboarding request updated successfully, but email notification failed to send.",
            severity: "warning",
          });
        }
      }
    
      try {
        const fetchResponse = await axios.get(`${API_BASE_URL}/onboarding`);
        
   
        const requests = fetchResponse.data.data ? fetchResponse.data.data : fetchResponse.data;
        
        const formattedRequests = requests.map(request => ({
          ...request,
          uploadedDocuments: request.documents || [], 
       
          requiredDocuments: Array.isArray(request.requiredDocuments) 
            ? request.requiredDocuments 
            : (request.requiredDocuments ? JSON.parse(request.requiredDocuments) : [])
        }));
        
        setOnboardingRequests(formattedRequests);
      } catch (fetchError) {
        console.error("Error refreshing onboarding requests:", fetchError);
    
        setOnboardingRequests(prev => 
          prev.map(req => req.id === editedRequest.id ? {
            ...editedRequest,
            uploadedDocuments: editedRequest.uploadedDocuments || []
          } : req)
        );
      }
      
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: "Onboarding request updated successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating onboarding request:", error);
      setSnackbar({
        open: true,
        message: "Failed to update onboarding request: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  }

  const handleDocumentChange = (event) => {
    const {
      target: { value },
    } = event;
    setEditedRequest(prev => ({
      ...prev,
      requiredDocuments: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleDeleteRequest = async (id) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: "Invalid request ID",
        severity: "error",
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this onboarding request?")) {
      try {
        await axios.delete(`${API_BASE_URL}/onboarding/${id}`);
        
      
        setOnboardingRequests(current => current.filter(req => req.id !== id));
        
        setSnackbar({
          open: true,
          message: "Onboarding request deleted successfully.",
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting onboarding request:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete onboarding request: " + (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    }
  };

  const handleViewDocument = (documentPath) => {
 
    if (documentPath) {

      window.open(`${API_BASE_URL}/documents/${documentPath}/view`, '_blank');
    } else {
      setSnackbar({
        open: true,
        message: "Document path is not available",
        severity: "error",
      });
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
  
      const response = await axios.get(
        `${API_BASE_URL}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.pdf');
      
     
      document.body.appendChild(link);
      

      link.click();
      

      link.parentNode.removeChild(link);
      
      setSnackbar({
        open: true,
        message: "Document downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      setSnackbar({
        open: true,
        message: "Failed to download document. Please try again.",
        severity: "error",
      });
    }
  };
  

 
  const handleViewDocumentDetails = (document) => {
    setSelectedDocument(document);
    setViewDocumentDialogOpen(true);
  };

  const updateDocumentStatus = async (documentId, status) => {
    if (!documentId) {
      setSnackbar({
        open: true,
        message: "Invalid document ID",
        severity: "error",
      });
      return;
    }
    
    try {
      await axios.patch(`${API_BASE_URL}/documents/${documentId}/status`, { status });
      
 
      const requestWithDoc = onboardingRequests.find(req => 
        req.uploadedDocuments?.some(doc => doc.id === documentId)
      );
      
      if (requestWithDoc) {
        try {
          const response = await axios.get(`${API_BASE_URL}/onboarding/${requestWithDoc.id}`);
          
          let updatedRequest;
          if (response.data.data) {
            updatedRequest = {
              ...response.data.data,
              uploadedDocuments: response.data.data.documents || [],
       
              requiredDocuments: Array.isArray(response.data.data.requiredDocuments) 
                ? response.data.data.requiredDocuments 
                : (response.data.data.requiredDocuments ? JSON.parse(response.data.data.requiredDocuments) : [])
            };
          } else {
            updatedRequest = {
              ...response.data,
              uploadedDocuments: response.data.documents || [],
       
              requiredDocuments: Array.isArray(response.data.requiredDocuments) 
                ? response.data.requiredDocuments 
                : (response.data.requiredDocuments ? JSON.parse(response.data.requiredDocuments) : [])
            };
          }
          
         
          setOnboardingRequests(current => 
            current.map(req => req.id === requestWithDoc.id ? updatedRequest : req)
          );
          

          if (selectedDocument && selectedDocument.id === documentId) {
            const updatedDoc = updatedRequest.uploadedDocuments.find(doc => doc.id === documentId);
            if (updatedDoc) {
              setSelectedDocument(updatedDoc);
            }
          }
          
     
          if (requestWithDoc.candidateEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestWithDoc.candidateEmail)) {
            try {
              const documentType = selectedDocument?.documentType 
                ? getDocumentLabel(selectedDocument.documentType) 
                : (selectedDocument?.documentName || 'Document');
              
              await axios.post(`${API_BASE_URL}/notifications/email`, {
                to: requestWithDoc.candidateEmail,
                subject: `Document Status Update: ${status}`,
                content: `Your ${documentType} has been marked as ${status}. ${status === 'Rejected' ? 'Please upload a new version.' : 'No further action is required.'}`
              });
            } catch (emailError) {
              console.error("Error sending document status notification:", emailError);
       
            }
          }
          
        } catch (error) {
          console.error("Error refreshing document data:", error);
       
          setOnboardingRequests(current => 
            current.map(req => {
              if (req.id === requestWithDoc.id) {
                return {
                  ...req,
                  uploadedDocuments: req.uploadedDocuments.map(doc => 
                    doc.id === documentId ? { ...doc, status } : doc
                  )
                };
              }
              return req;
            })
          );
          
        
          if (selectedDocument && selectedDocument.id === documentId) {
            setSelectedDocument({
              ...selectedDocument,
              status
            });
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: `Document marked as ${status}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating document status:", error);
      setSnackbar({
        open: true,
        message: 'Failed to update document status: ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
    }
  }


const getStatusChipColor = (status) => {
  switch ((status || '').toLowerCase()) { 
    case "completed":
      return "success";
    case "in progress":
      return "primary";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  
  const getDocumentLabel = (value) => {
    if (!value) return "Unknown Document";
    const doc = documentOptions.find(option => option.value === value);
    return doc ? doc.label : value;
  };

 
  const getProcessLabel = (value) => {
    if (!value) return "Unknown Process";
    const process = processOptions.find(option => option.value === value);
    return process ? process.label : value;
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Onboarding Requests List
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Candidate Name</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Email</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Process Type</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Due Date</Typography></TableCell>
                {/* <TableCell><Typography variant="subtitle1" fontWeight="bold">Status</Typography></TableCell> */}
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Documents</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {onboardingRequests.length > 0 ? (
                onboardingRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.candidateName || 'N/A'}</TableCell>
                    <TableCell>{request.candidateEmail || 'N/A'}</TableCell>
                    <TableCell>{getProcessLabel(request.onboardingProcess)}</TableCell>
                    <TableCell>{formatDate(request.taskCompletionDate)}</TableCell>
                   
                    <TableCell>
                      {request.uploadedDocuments && request.uploadedDocuments.length > 0 ? (
                        <Chip 
                          label={`${request.uploadedDocuments.length} uploaded`} 
                          color="info" 
                          size="small" 
                          onClick={() => handleViewDetails(request)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <Chip 
                          label="None" 
                          color="default" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewDetails(request)} title="View">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditRequest(request)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteRequest(request.id)} 
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No onboarding requests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

     
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Onboarding Request Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">Candidate Information</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2">Name:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedRequest.candidateName || 'N/A'}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2">Email:</Typography>
                  <Typography variant="body1" gutterBottom>{selectedRequest.candidateEmail || 'N/A'}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom fontWeight="bold">Process Information</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2">Process Type:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {getProcessLabel(selectedRequest.onboardingProcess)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2" >Due Date:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedRequest.taskCompletionDate)}
                  </Typography>
                </Box>
         
              </Box>

              <Typography variant="subtitle2" >Process Details:</Typography>
              <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                {selectedRequest.processDetails || 'No details provided'}
              </Typography>

              <Typography variant="h6" gutterBottom fontWeight="bold">Required Documents</Typography>
              {selectedRequest.requiredDocuments && selectedRequest.requiredDocuments.length > 0 ? (
                <List dense sx={{ bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                  {selectedRequest.requiredDocuments.map((doc, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={getDocumentLabel(doc)} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', py: 1 }}>
                  No required documents specified.
                </Typography>
              )}

              <Typography variant="h6" gutterBottom fontWeight="bold">Uploaded Documents</Typography>
              {selectedRequest.uploadedDocuments && selectedRequest.uploadedDocuments.length > 0 ? (
                <List>
                  {selectedRequest.uploadedDocuments.map((doc) => (
                    <ListItem
                      key={doc.id || doc._id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                        
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadDocument(
                              doc.id || doc._id, 
                              `${doc.documentType || 'document'}_${selectedRequest.candidateName || 'candidate'}.pdf`
                            )}
                            disabled={!doc.documentPath}
                            sx={{ borderRadius: 1 }}
                          >
                            Download
                          </Button>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={doc.documentName || getDocumentLabel(doc.documentType) || 'Unnamed Document'}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {doc.documentType && getDocumentLabel(doc.documentType)}
                            </Typography>
                            {" — "}
                            <Chip 
                              label={doc.status || 'Pending'} 
                              color={getStatusChipColor(doc.status)} 
                              size="small" 
                            />
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', py: 1 }}>
                  No documents uploaded yet.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {selectedRequest && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setOpenViewDialog(false);
                handleEditRequest(selectedRequest);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

    
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Edit Onboarding Request
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {editedRequest && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <TextField
                  label="Candidate Name"
                  value={editedRequest.candidateName || ''}
                  onChange={(e) => setEditedRequest({ ...editedRequest, candidateName: e.target.value })}
                  fullWidth
                  sx={{ flex: 1, minWidth: "200px" }}
                />
                <TextField
                  label="Candidate Email"
                  value={editedRequest.candidateEmail || ''}
                  onChange={(e) => setEditedRequest({ ...editedRequest, candidateEmail: e.target.value })}
                  fullWidth
                  sx={{ flex: 1, minWidth: "200px" }}
                />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <FormControl fullWidth sx={{ flex: 1, minWidth: "200px" }}>
                  <InputLabel>Process Type</InputLabel>
                  <Select
                    value={editedRequest.onboardingProcess || ''}
                    onChange={(e) => setEditedRequest({ ...editedRequest, onboardingProcess: e.target.value })}
                    label="Process Type"
                  >
                    {processOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Due Date"
                  type="date"
                  value={editedRequest.taskCompletionDate ? new Date(editedRequest.taskCompletionDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedRequest({ ...editedRequest, taskCompletionDate: e.target.value })}
                  fullWidth
                  sx={{ flex: 1, minWidth: "200px" }}
                  InputLabelProps={{ shrink: true }}
                />

                   </Box>

              <TextField
                label="Process Details"
                value={editedRequest.processDetails || ''}
                onChange={(e) => setEditedRequest({ ...editedRequest, processDetails: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />

              <FormControl fullWidth>
                <InputLabel>Required Documents</InputLabel>
                <Select
                  multiple
                  value={editedRequest.requiredDocuments || []}
                  onChange={handleDocumentChange}
                  label="Required Documents"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getDocumentLabel(value)} />
                      ))}
                    </Box>
                  )}
                >
                 {documentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            
              <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
              {editedRequest.uploadedDocuments && editedRequest.uploadedDocuments.length > 0 ? (
                <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {editedRequest.uploadedDocuments.map((doc) => (
                    <ListItem
                      key={doc.id || doc._id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => updateDocumentStatus(doc.id || doc._id, 'Approved')}
                            disabled={doc.status === 'Approved'}
                            sx={{ borderRadius: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => updateDocumentStatus(doc.id || doc._id, 'Rejected')}
                            disabled={doc.status === 'Rejected'}
                            sx={{ borderRadius: 1 }}
                          >
                            Reject
                          </Button>
                          <IconButton
                            onClick={() => handleViewDocumentDetails(doc)}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={doc.documentName || getDocumentLabel(doc.documentType) || 'Unnamed Document'}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {doc.documentType && getDocumentLabel(doc.documentType)}
                            </Typography>
                            {" — "}
                            <Chip 
                              label={doc.status || 'Pending'} 
                              color={getStatusChipColor(doc.status)} 
                              size="small" 
                            />
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', py: 1 }}>
                  No documents uploaded yet.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveEdit}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

    
      <Dialog open={viewDocumentDialogOpen} onClose={() => setViewDocumentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Document Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDocument && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedDocument.documentName || getDocumentLabel(selectedDocument.documentType) || 'Unnamed Document'}
              </Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2">Document Type:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDocument.documentType ? getDocumentLabel(selectedDocument.documentType) : 'Not specified'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip 
                    label={selectedDocument.status || 'Pending'} 
                    color={getStatusChipColor(selectedDocument.status)} 
                    size="small" 
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadDocument(
                    selectedDocument.id || selectedDocument._id, 
                    selectedDocument.documentName || `${selectedDocument.documentType || 'document'}.pdf`
                  )}
                  disabled={!selectedDocument.documentPath}
                  sx={{ mx: 1 }}
                >
                  Download
                </Button>
                </Box>
               
              </Box>
            
              
              <Box sx={{ mt: 3, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Update Document Status:</Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      updateDocumentStatus(selectedDocument.id || selectedDocument._id, 'Approved');
                      setViewDocumentDialogOpen(false);
                    }}
                    disabled={selectedDocument.status === 'Approved'}
                  >
                    Approve Document
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      updateDocumentStatus(selectedDocument.id || selectedDocument._id, 'Rejected');
                      setViewDocumentDialogOpen(false);
                    }}
                    disabled={selectedDocument.status === 'Rejected'}
                  >
                    Reject Document
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDocumentDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

     
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OnboardingListPage;