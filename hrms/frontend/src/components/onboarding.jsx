import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const OnboardingForm = () => {
  const [onboarding, setOnboarding] = useState({
    employee_id: "",
    candidateName: "",
    candidateEmail: "",
    onboardingProcess: "",
    processDetails: "",
    requiredDocuments: [],
    taskCompletionDate: "",
    uploadedFiles: [],
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const documentOptions = [
    { value: "aadhar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "payslip", label: "Last Payslip" },
    { value: "form16", label: "Previous Employee Form 16" },
    { value: "relieving", label: "Relieving Letter" },
    { value: "education", label: "Educational Certificates" },
    { value: "bank", label: "Bank Account Details" },
    { value: "emergency", label: "Emergency Contact Information" },
  ];

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setOnboarding((prevState) => ({
      ...prevState,
      uploadedFiles: [...prevState.uploadedFiles, ...newFiles],
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setOnboarding((prevState) => ({
      ...prevState,
      uploadedFiles: prevState.uploadedFiles.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleDocumentChange = (event) => {
    const {
      target: { value },
    } = event;
    setOnboarding((prev) => ({
      ...prev,
      requiredDocuments: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!onboarding.employee_id) {
      setSnackbar({
        open: true,
        message: "Please enter an employee ID",
        severity: "error",
      });
      return;
    }

    if (!onboarding.candidateName || !onboarding.candidateEmail) {
      setSnackbar({
        open: true,
        message: "Please enter candidate name and email",
        severity: "error",
      });
      return;
    }
    
    setLoading(true);
  
    try {
    
      const formData = new FormData();
      
   
      formData.append("employee_id", onboarding.employee_id);
      formData.append("candidateName", onboarding.candidateName);
      formData.append("candidateEmail", onboarding.candidateEmail);
      formData.append("onboardingProcess", onboarding.onboardingProcess);
      formData.append("processDetails", onboarding.processDetails);
      formData.append("requiredDocuments", JSON.stringify(onboarding.requiredDocuments));
      formData.append("taskCompletionDate", onboarding.taskCompletionDate);
      formData.append("status", "Pending");
    
    
      if (onboarding.uploadedFiles.length > 0) {
        onboarding.uploadedFiles.forEach((file) => {
          formData.append("uploadedFiles", file);
        });
      }
    
 
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }
      
    
      const response = await axios.post(`${API_BASE_URL}/onboarding`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("API Response:", response.data);
      
      setSnackbar({
        open: true,
        message: `Onboarding process assigned successfully! Email sent to ${onboarding.candidateEmail}`,
        severity: "success",
      });
      
    
      setOnboarding({
        employee_id: "",
        candidateName: "",
        candidateEmail: "",
        onboardingProcess: "",
        processDetails: "",
        requiredDocuments: [],
        taskCompletionDate: "",
        uploadedFiles: [],
      });
      
    } catch (err) {
      console.error("Submission Error:", err);
      
  
      let errorMessage = "Something went wrong";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.response?.data) {
        console.error("Error response data:", err.response.data);
      }
      
      setSnackbar({
        open: true,
        message: `Error: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
        <Card>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold" sx={{ pt: 2 }}>
            Onboarding Process
          </Typography>
          <CardContent>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
            
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <Tooltip title="Enter the unique ID assigned to the hiring manager or HR personnel creating this onboarding process" arrow placement="top">
                  <TextField
                    label="Employee ID"
                    value={onboarding.employee_id}
                    onChange={(e) =>
                      setOnboarding((prev) => ({ ...prev, employee_id: e.target.value }))
                    }
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{
                    
                    }}
                  />
                  </Tooltip>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Candidate Name"
                    value={onboarding.candidateName}
                    onChange={(e) =>
                      setOnboarding((prev) => ({ ...prev, candidateName: e.target.value }))
                    }
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Candidate Email"
                    type="email"
                    value={onboarding.candidateEmail}
                    onChange={(e) =>
                      setOnboarding((prev) => ({ ...prev, candidateEmail: e.target.value }))
                    }
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Completion Date"
                    type="date"
                    value={onboarding.taskCompletionDate}
                    onChange={(e) =>
                      setOnboarding((prev) => ({ ...prev, taskCompletionDate: e.target.value }))
                    }
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                    InputProps={{
                    
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                <Tooltip title="Select the specific onboarding stage to assign to this candidate " arrow placement="top">
                  <FormControl fullWidth required margin="normal">
                    <InputLabel>Onboarding Process</InputLabel>
                    <Select
                      value={onboarding.onboardingProcess}
                      label="Onboarding Process"
                      onChange={(e) =>
                        setOnboarding((prev) => ({ ...prev, onboardingProcess: e.target.value }))
                      }
                   
                    >
                      <MenuItem value="document-verification">Document Verification</MenuItem>
                      <MenuItem value="training">Mandatory Training</MenuItem>
                      <MenuItem value="induction">Induction Meetings</MenuItem>
                      <MenuItem value="complete-onboarding">Complete Onboarding Process</MenuItem>
                    </Select>
                  </FormControl>
                  </Tooltip>
                </Grid>
              </Grid>
              <Tooltip title="Add specific instructions, meeting links, or detailed requirements for the candidate to complete this stage" arrow placement="top">
              <TextField
                label="Process Details"
                value={onboarding.processDetails}
                onChange={(e) =>
                  setOnboarding((prev) => ({ ...prev, processDetails: e.target.value }))
                }
                fullWidth
                required
                margin="normal"
                multiline
                rows={3}
                placeholder="Provide details about what the candidate needs to do"
                InputProps={{
                 
                }}
              />
</Tooltip>
              <Grid item xs={12}>
              <Tooltip title="Select all documents that the candidate must submit. They will receive an email with this checklist." arrow placement="top">
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Required Documents</InputLabel>
                  <Select
                    multiple
                    value={onboarding.requiredDocuments}
                    label="Required Documents"
                    onChange={handleDocumentChange}
                    renderValue={(selected) => selected.map(value => 
                      documentOptions.find(option => option.value === value)?.label
                    ).join(', ')}
                  
                  >
                    {documentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
</Tooltip>
                <Box sx={{ mt: 2 }}>
                  <Tooltip title="Upload any reference materials or templates that the candidate will need to complete this process" arrow placement="top">
                    <Button variant="outlined" component="label">
                      Upload Additional Files
                      <input type="file" hidden onChange={handleFileChange} multiple />
                    </Button>
                  </Tooltip>

                  {onboarding.uploadedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">Uploaded Files:</Typography>
                      <List dense>
                        {onboarding.uploadedFiles.map((file, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemText primary={file.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  sx={{ marginTop: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Assign Onboarding Process"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OnboardingForm;