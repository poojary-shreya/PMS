import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";


const API_BASE_URL = "http://localhost:5000/api";

const EmployeeDocumentUpload = () => {
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState("");
  const [employeeIdField, setEmployeeIdField] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [onboardingTasks, setOnboardingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [noTasksFound, setNoTasksFound] = useState(false);

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
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/user/current`, {
          withCredentials: true
        });
        
        if (response.data && response.data.employee_id) {
          setCurrentUserEmployeeId(response.data.employee_id);
          setEmployeeIdField(response.data.employee_id);
          
      
          await fetchEmployeeDetails(response.data.employee_id);
          await loadTasks(response.data.employee_id);
        } else {
          setSnackbar({
            open: true,
            message: "Employee ID not found. Please enter your Employee ID.",
            severity: "warning"
          });
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        // showSnackbar("Failed to fetch user information", "error");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCurrentUser();
  }, []);


  const fetchEmployeeDetails = async (employeeId) => {
    if (!employeeId) return;
    
    setLoadingEmployeeDetails(true);
    try {
      console.log(`Fetching employee details for employee ID: ${employeeId}`);
      const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}`, {
        withCredentials: true
      });
      
      if (response.data?.data) {
        const employeeData = response.data.data;
        console.log("Employee data fetched:", employeeData);
        setEmployeeDetails(employeeData);
      } else {
        console.log("Employee details not found for this ID");
        setSnackbar({
          open: true,
          message: "Employee details not found. Please check your Employee ID.",
          severity: "warning"
        });
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch employee details",
        severity: "warning"
      });
    } finally {
      setLoadingEmployeeDetails(false);
    }
  };

 
  const handleEmployeeIdChange = (e) => {
    setEmployeeIdField(e.target.value);
  };


  const updateEmployeeId = async () => {
    if (!employeeIdField || employeeIdField === currentUserEmployeeId) return;
    
    try {
      setLoading(true);
      
    
      await axios.put(
        `${API_BASE_URL}/user/update-employee-id`, 
        { employee_id: employeeIdField },
        { withCredentials: true }
      );
      
      setCurrentUserEmployeeId(employeeIdField);
      setSnackbar({
        open: true,
        message: "Employee ID updated successfully",
        severity: "success"
      });
      
    
      await fetchEmployeeDetails(employeeIdField);
      await loadTasks(employeeIdField);
      
    } catch (error) {
      console.error("Error updating employee ID:", error);
      setSnackbar({
        open: true,
        message: "Failed to update employee ID: " + (error.response?.data?.message || error.message),
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (employeeId) => {
    if (!employeeId) {
      console.log("No employee ID available, skipping data load");
      return;
    }
    
    try {
      setLoadingData(true);
      
      console.log(`Loading tasks for employee ID: ${employeeId}`);
      
    
      const apiUrl = `${API_BASE_URL}/onboarding/employee/${employeeId}`;
      
      console.log(`Making API request to: ${apiUrl}`);
      
     
      const onboardingResponse = await axios.get(
        apiUrl,
        { 
          withCredentials: true,
       
          timeout: 10000 
        }
      );
      
      console.log("API response:", onboardingResponse.data);
      
      if (!onboardingResponse.data?.data || onboardingResponse.data.data.length === 0) {
        console.log("No tasks found for this user");
        setNoTasksFound(true);
        setOnboardingTasks([]);
        setSelectedTask(null);
        return;
      }
    
      const onboardingWithDocs = await Promise.all(
        onboardingResponse.data.data.map(async (task) => {
          try {
            console.log(`Fetching documents for task ID: ${task.id}`);
          
            const docsResponse = await axios.get(
              `${API_BASE_URL}/documents/onboarding/${task.id}`,
              { withCredentials: true }
            );
            
            console.log(`Documents for task ${task.id}:`, docsResponse.data);
            
      
            let parsedRequiredDocs = [];
            if (task.requiredDocuments) {
              if (Array.isArray(task.requiredDocuments)) {
                parsedRequiredDocs = task.requiredDocuments;
              } else {
                try {
                  parsedRequiredDocs = JSON.parse(task.requiredDocuments);
                } catch (e) {
                  console.error("Error parsing requiredDocuments:", e);
                  parsedRequiredDocs = [];
                }
              }
            }
            
            return {
              ...task,
              uploadedDocuments: docsResponse.data?.data || [],
              requiredDocuments: parsedRequiredDocs
            };
          } catch (error) {
            console.error("Error fetching documents for task ID:", task.id, error);
            
       
            let parsedRequiredDocs = [];
            if (task.requiredDocuments) {
              if (Array.isArray(task.requiredDocuments)) {
                parsedRequiredDocs = task.requiredDocuments;
              } else {
                try {
                  parsedRequiredDocs = JSON.parse(task.requiredDocuments);
                } catch (e) {
                  console.error("Error parsing requiredDocuments:", e);
                  parsedRequiredDocs = [];
                }
              }
            }
            
            return {
              ...task,
              uploadedDocuments: [],
              requiredDocuments: parsedRequiredDocs
            };
          }
        })
      );
      
      console.log("Processed tasks with documents:", onboardingWithDocs);
      setOnboardingTasks(onboardingWithDocs);
      
      if (onboardingWithDocs.length > 0) {
        setSelectedTask(onboardingWithDocs[0]);
        setNoTasksFound(false);
      } else {
        setNoTasksFound(true);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      
   
      if (error.response) {
       
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        setSnackbar({
          open: true,
          message: `Failed to load tasks: ${error.response.data?.message || error.response.statusText}`,
          severity: "error"
        });
      } else if (error.request) {
 
        console.error("No response received:", error.request);
        
        setSnackbar({
          open: true,
          message: "Failed to load tasks: No response from server",
          severity: "error"
        });
      } else {
      
        console.error("Error message:", error.message);
        
        setSnackbar({
          open: true,
          message: `Failed to load tasks: ${error.message}`,
          severity: "error"
        });
      }
      
      setNoTasksFound(true);
      setOnboardingTasks([]);
      setSelectedTask(null);
    } finally {
      setLoadingData(false);
    }
  };

  const getDocumentLabel = (value) => 
    documentOptions.find(option => option.value === value)?.label || value;

  const getProcessLabel = (value) => 
    processOptions.find(option => option.value === value)?.label || value;

  const isDocumentUploaded = (docType) => 
    selectedTask?.uploadedDocuments?.some(doc => doc.documentType === docType) || false;

  const handleUploadDocument = (docType) => {
    setSelectedDocument(docType);
    setDocumentType(docType);
    setFile(null);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e?.preventDefault();
    
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a file to upload",
        severity: "error"
      });
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('onboardingId', selectedTask.id);
    formData.append('employee_id', currentUserEmployeeId);
    
    try {
      console.log(`Uploading document for Employee ID: ${currentUserEmployeeId}`);
      
   
      await axios.post(
        `${API_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true 
        }
      );
      

      const docsResponse = await axios.get(
        `${API_BASE_URL}/documents/onboarding/${selectedTask.id}`,
        { withCredentials: true }
      );
      
      const updatedTask = {
        ...selectedTask,
        uploadedDocuments: docsResponse.data?.data || []
      };
      
      setSelectedTask(updatedTask);
      
     
      setOnboardingTasks(prev => 
        prev.map(task => task.id === selectedTask.id ? updatedTask : task)
      );
      
      setUploadDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Document uploaded successfully!",
        severity: "success"
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to upload document. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDocument = async (docId) => {
    if (window.confirm("Are you sure you want to remove this document?")) {
      try {
        await axios.delete(`${API_BASE_URL}/documents/${docId}`, 
          { withCredentials: true } 
        );
        
        
        const docsResponse = await axios.get(
          `${API_BASE_URL}/documents/onboarding/${selectedTask.id}`,
          { withCredentials: true }
        );
        
        const updatedTask = {
          ...selectedTask,
          uploadedDocuments: docsResponse.data?.data || []
        };
        
        setSelectedTask(updatedTask);
        
   
        setOnboardingTasks(prev => 
          prev.map(task => task.id === selectedTask.id ? updatedTask : task)
        );
        
        setSnackbar({ 
          open: true, 
          message: "Document removed successfully.", 
          severity: "info" 
        });
      } catch (error) {
        console.error("Error removing document:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to remove document. Please try again.",
          severity: "error"
        });
      }
    }
  };

  const calculateUploadCompletion = () => {
    if (!selectedTask) return 0;
    
    const requiredDocsCount = (selectedTask.requiredDocuments || []).length;
    if (requiredDocsCount === 0) return 100;
    
    const uploadedCount = selectedTask.requiredDocuments
      .filter(docType => isDocumentUploaded(docType))
      .length;
      
    return Math.round((uploadedCount / requiredDocsCount) * 100);
  };

  return (
    <Container maxWidth="1000px" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Employee Document Upload
        </Typography>
      </Box>

   
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Employee ID:
          </Typography>
          
          <TextField
            variant="outlined"
            placeholder="Enter Employee ID"
            size="small"
            value={employeeIdField}
            onChange={handleEmployeeIdChange}
            sx={{ minWidth: 200 }}
            disabled
          />
        </Box>
      </Paper>

      {loadingData ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 4 }}>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading your onboarding tasks...
          </Typography>
        </Box>
      ) : noTasksFound ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No onboarding tasks found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have any active onboarding tasks requiring document uploads at this time.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {selectedTask && (
            <Paper sx={{ p: 4, mb: 4 }}>
             <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Documents Upload Progress
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box sx={{ width: "100%", mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateUploadCompletion()}
                      sx={{ height: 12, borderRadius: 6 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 50 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {`${calculateUploadCompletion()}%`}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Required Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {selectedTask.requiredDocuments && selectedTask.requiredDocuments.length > 0 ? (
                <Grid container spacing={3}>
                  {selectedTask.requiredDocuments.map((docType) => {
                    const isUploaded = isDocumentUploaded(docType);
                    const uploadedDoc = selectedTask.uploadedDocuments?.find(
                      (doc) => doc.documentType === docType
                    );

                    return (
                      <Grid item xs={12} sm={6} key={docType}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderWidth: 2,
                            borderColor: isUploaded ? "success.main" : "grey.300",
                            boxShadow: isUploaded ? 0 : 3,
                            height: 250, 
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 2
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {isUploaded ? (
                                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ mr: 1, fontSize: 28 }} />
                                )}
                                <Typography variant="h6">
                                  {getDocumentLabel(docType)}
                                </Typography>
                              </Box>
                              <Chip
                                label={isUploaded ? "Uploaded" : "Required"}
                                size="medium"
                                color={isUploaded ? "success" : "default"}
                                sx={{ fontWeight: "bold" }}
                              />
                            </Box>

                            {isUploaded && uploadedDoc ? (
                              <Box sx={{ mt: 2, flexGrow: 1 }}>
                                <Typography variant="body1" noWrap>
                                  File: {uploadedDoc.fileName || uploadedDoc.filename}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Uploaded: {new Date(uploadedDoc.uploadedAt).toLocaleString()}
                                </Typography>
                                <Box sx={{ mt: 'auto', display: "flex", justifyContent: "space-between" }}>
                                  <Button
                                    startIcon={<DeleteIcon />}
                                    color="error"
                                    variant="outlined"
                                    onClick={() => handleRemoveDocument(uploadedDoc.id)}
                                    sx={{ mt: 2 }}
                                  >
                                    Remove
                                  </Button>
                                  {uploadedDoc.fileUrl && (
                                    <Button
                                      variant="contained"
                                      component="a"
                                      href={uploadedDoc.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ mt: 2 }}
                                    >
                                      View Document
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                                  Upload your {getDocumentLabel(docType)} document
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="large"
                                  startIcon={<UploadFileIcon />}
                                  onClick={() => handleUploadDocument(docType)}
                                  sx={{ 
                                    py: 2, 
                                    px: 4, 
                                    fontSize: "1.1rem", 
                                    minWidth: "200px" 
                                  }}
                                >
                                  Upload Document
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No documents are required for this task.
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}

    
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1.5rem", pb: 1 }}>
          Upload {getDocumentLabel(selectedDocument)}
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <form onSubmit={handleUploadSubmit}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" paragraph>
                Please upload your {getDocumentLabel(selectedDocument)}. 
                Supported file types: PDF, JPG, PNG. Maximum file size: 5MB.
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 5, 
                  textAlign: 'center',
                  mb: 3,
                  backgroundColor: file ? 'rgba(0, 200, 83, 0.04)' : 'transparent',
                  borderColor: file ? 'success.main' : '#ccc',
                  transition: 'all 0.3s'
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  size="large"
                  sx={{ 
                    mb: 2, 
                    py: 1.5, 
                    px: 4, 
                    fontSize: "1.1rem" 
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </Button>
                
                <Typography variant="body1" color="text.secondary">
                  {file ? `Selected: ${file.name}` : 'Drag and drop file here or click to browse'}
                </Typography>
                
                {file && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                    File size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                )}
              </Box>
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={!file || loading}
            size="large"
            sx={{ px: 4 }}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogActions>
      </Dialog>
  <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeDocumentUpload;