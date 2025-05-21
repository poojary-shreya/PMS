import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Grid, 
  Snackbar, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const API_BASE_URL = "http://localhost:5000/api";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const OfferForm = () => {
  const [offer, setOffer] = useState({
    candidateName: "",
    candidateEmail: "",
    hiringManagerEmail: "",
    noticePeriod: "",
    offerDate: new Date().toISOString().split('T')[0],
    salaryFixed: "",
    salaryVariable: "",
    jobTitle: "",
    joiningBonus: "",
    esop: "",
    joiningDate: "",
    interviewId: ""
  });
  
  const [offerLetter, setOfferLetter] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hrCompletedCandidates, setHrCompletedCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  
  useEffect(() => {
    fetchHRCompletedCandidates();
  }, []);
  
  const fetchHRCompletedCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const response = await fetch(`${API_BASE_URL}/interviews/hr-completed`);
      
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      
      const data = await response.json();
      console.log("Fetched candidates:", data);
      
      const normalizedData = data.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.candidateEmail || candidate.email,
        jobTitle: candidate.jobTitle || candidate.positionApplied,
        hiringManagerEmail: candidate.hiringManagerEmail || ""
      }));
      
      console.log("Normalized candidates:", normalizedData);
      setHrCompletedCandidates(normalizedData);
    } catch (error) {
      console.error("Fetch error:", error);
      setAlert({
        open: true,
        message: "Failed to load candidates.",
        severity: "error"
      });
    } finally {
      setLoadingCandidates(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!offer.candidateName.trim()) newErrors.candidateName = "Name is required";
    if (!offer.candidateEmail.trim()) newErrors.candidateEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(offer.candidateEmail)) newErrors.candidateEmail = "Invalid email";
    if (!offer.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!offer.salaryFixed.trim()) newErrors.salaryFixed = "Fixed salary required";
    if (!offer.offerDate.trim()) newErrors.offerDate = "Offer date required";
    if (!offer.joiningDate.trim()) newErrors.joiningDate = "Joining date required";
    if (!offer.hiringManagerEmail.trim()) newErrors.hiringManagerEmail = "Hiring manager email required";
    else if (!/\S+@\S+\.\S+/.test(offer.hiringManagerEmail)) newErrors.hiringManagerEmail = "Invalid email";
    
    if (!offerLetter) newErrors.offerLetter = "Offer letter is required";
    
    if (offer.salaryFixed && isNaN(offer.salaryFixed)) newErrors.salaryFixed = "Must be a number";
    if (offer.salaryVariable && isNaN(offer.salaryVariable)) newErrors.salaryVariable = "Must be a number";
    if (offer.joiningBonus && isNaN(offer.joiningBonus)) newErrors.joiningBonus = "Must be a number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; 
      
      if (!allowedTypes.includes(file.type)) {
        setAlert({
          open: true,
          message: "Invalid file type. Please upload PDF or Word documents.",
          severity: "error"
        });
        return;
      }
      
      if (file.size > maxSize) {
        setAlert({
          open: true,
          message: "File size exceeds 5MB limit.",
          severity: "error"
        });
        return;
      }
      
      setOfferLetter(file);
      if (errors.offerLetter) {
        const newErrors = {...errors};
        delete newErrors.offerLetter;
        setErrors(newErrors);
      }
    }
  };
  
  const handleCandidateSelect = (e) => {
    const selectedId = e.target.value;
    const selected = hrCompletedCandidates.find(c => c.id === selectedId);
  
    if (selected) {
      console.log("Selected candidate data:", selected);
      
      setOffer({
        ...offer,
        candidateName: selected.name || "",
        candidateEmail: selected.email || "",
        jobTitle: selected.jobTitle|| "",
        hiringManagerEmail: selected.hiringManagerEmail || "",
        interviewId: selectedId,
      });
      setSelectedCandidate(selectedId);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({ 
        open: true, 
        message: "Please fix the form errors", 
        severity: "error" 
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add all offer data to formData
      Object.keys(offer).forEach(key => {
        if (offer[key] !== null && offer[key] !== undefined) {
          formData.append(key, offer[key]);
        }
      });
      
      // Add offer letter file if available
      if (offerLetter) {
        formData.append('offerLetter', offerLetter);
      }
      
      // Create offer as draft
      const offerResponse = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        body: formData,
      });
      
      const responseData = await offerResponse.json();
      
      if (!offerResponse.ok) {
        throw new Error(`Error: ${offerResponse.status} - ${responseData.message || offerResponse.statusText}`);
      }

      // After creating the offer, submit it for approval
      if (responseData.offer && responseData.offer.offerId) {
        const offerId = responseData.offer.offerId;
        
        const approvalResponse = await fetch(`${API_BASE_URL}/offers/${offerId}/submit-for-approval`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!approvalResponse.ok) {
          throw new Error("Offer created but failed to submit for approval");
        }
        
        const approvalData = await approvalResponse.json();
        console.log("Submitted for approval:", approvalData);
      }
      
      // Reset form
      setOffer({
        candidateName: "",
        candidateEmail: "",
        noticePeriod: "",
        offerDate: new Date().toISOString().split('T')[0],
        salaryFixed: "",
        salaryVariable: "",
        jobTitle: "",
        joiningBonus: "",
        esop: "",
        joiningDate: "",
        interviewId: "",
        hiringManagerEmail: ""
      });
      setOfferLetter(null);
      setSelectedCandidate("");
      
      // Show success message
      setAlert({ 
        open: true, 
        message: "Offer created and submitted for approval!", 
        severity: "success" 
      });
      
      fetchHRCompletedCandidates();
      
    } catch (err) {
      console.error("Submission error:", err);
      setAlert({ 
        open: true, 
        message: "Offer submission failed: " + err.message, 
        severity: "error" 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCloseAlert = () => setAlert(prev => ({ ...prev, open: false }));

  // Helper function to create tooltip text field
  const TooltipTextField = ({ label, name, value, onChange, error, helperText, tooltipText, required = false, ...props }) => (
    <Tooltip title={tooltipText} arrow placement="top-start">
      <TextField
        fullWidth
        label={label}
        name={name}
        value={value || ''}
        onChange={onChange}
        error={!!error}
        helperText={helperText}
        required={required}
        {...props}
      />
    </Tooltip>
  );

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Offer Management
      </Typography>
      
      {loadingCandidates ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Select Candidate 
              </Typography>
              <Tooltip title="Only candidates who completed HR round">
                <IconButton>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {hrCompletedCandidates.length > 0 ? (
              <FormControl fullWidth error={!!errors.interviewId}>
                <InputLabel>Select Candidate</InputLabel>
                <Select
                  value={selectedCandidate}
                  onChange={handleCandidateSelect}
                  label="Select Candidate"
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {hrCompletedCandidates.map(candidate => (
                    <MenuItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.email}
                    </MenuItem>
                  ))}
                </Select>
                {errors.interviewId && (
                  <Typography color="error" variant="caption">
                    {errors.interviewId}
                  </Typography>
                )}
              </FormControl>
            ) : (
              <Typography color="text.secondary" align="center">
                No candidates ready for offers
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TooltipTextField
                      label="Candidate Email"
                      name="candidateEmail"
                      value={offer.candidateEmail}
                      onChange={handleChange}
                      error={errors.candidateEmail}
                      helperText={errors.candidateEmail}
                      InputProps={{ readOnly: !!selectedCandidate }}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      required
                      
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TooltipTextField
                      label="Candidate Name"
                      name="candidateName"
                      value={offer.candidateName}
                      onChange={handleChange}
                      error={errors.candidateName}
                      helperText={errors.candidateName}
                      InputProps={{ readOnly: !!selectedCandidate }}
                      required
                    
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <TooltipTextField
                  label="Hiring Manager Email"
                  name="hiringManagerEmail"
                  value={offer.hiringManagerEmail}
                  onChange={handleChange}
                  error={errors.hiringManagerEmail}
                  helperText={errors.hiringManagerEmail}
                  required
                
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TooltipTextField
                  label="Job Title"
                  name="jobTitle"
                  value={offer.jobTitle}
                  onChange={handleChange}
                  error={errors.jobTitle}
                  helperText={errors.jobTitle}
                  required
                 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Tooltip title="Expected notice period in current company (e.g., 30 days, 2 months)" placement="top" arrow>
                <TextField
                  label="Notice Period"
                  name="noticePeriod"
                  value={offer.noticePeriod}
                  onChange={handleChange}
                  fullWidth

                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
              <Tooltip title="Date when offer is issued to candidate" placement="top" arrow>
                <TextField
                  label="Offer Date"
                  name="offerDate"
                  type="date"
                  value={offer.offerDate}
                  onChange={handleChange}
                  error={errors.offerDate}
                  helperText={errors.offerDate}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                  
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Tooltip title="Base annual compensation amount without variable components" placement="top" arrow>
                <TextField
                  label="Fixed Salary (Annual)"
                  name="salaryFixed"
                  value={offer.salaryFixed}
                  onChange={handleChange}
                  error={errors.salaryFixed}
                  helperText={errors.salaryFixed}
                  required
                  fullWidth
                  
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
              <Tooltip title="Performance-based or bonus compensation component (annual)" placement="top" arrow>

                <TextField
                  label="Variable Salary (Annual)"
                  name="salaryVariable"
                  value={offer.salaryVariable}
                  onChange={handleChange}
                  error={errors.salaryVariable}
                  helperText={errors.salaryVariable}
                  fullWidth
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Tooltip title="One-time bonus paid upon joining the company" placement="top" arrow>
                <TextField
                  label="Joining Bonus"
                  name="joiningBonus"
                  value={offer.joiningBonus}
                  onChange={handleChange}
                  error={errors.joiningBonus}
                  helperText={errors.joiningBonus}
                  fullWidth
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Tooltip title="Employee Stock Option Plan details (number of shares or value)" placement="top" arrow>
                <TextField
                  label="ESOP"
                  name="esop"
                  value={offer.esop}
                  onChange={handleChange}
                  fullWidth
                  
                  
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
              <Tooltip title="Expected first day of employment" placement="top" arrow>

                <TextField
                  label="Joining Date"
                  name="joiningDate"
                  type="date"
                  value={offer.joiningDate}
                  onChange={handleChange}
                  error={errors.joiningDate}
                  helperText={errors.joiningDate}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                  inputProps={{ 
                    min: new Date().toISOString().split('T')[0]
                  }}
                  onKeyDown={(e) => e.preventDefault()} // Prevent keyboard input
                />
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Tooltip title="Upload official offer letter document (PDF or Word, max 5MB)">
                  <Box>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      color={errors.offerLetter ? "error" : "primary"}
                      sx={{maxWidth:"300px",marginLeft:"70px",marginTop:"10px"}}
                    >
                      Upload Offer Letter
                      <VisuallyHiddenInput 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </Button>
                    {offerLetter && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {offerLetter.name}
                      </Typography>
                    )}
                    {errors.offerLetter && (
                      <Typography color="error" variant="caption">
                        {errors.offerLetter}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting}
                    sx={{ px: 4, py: 1 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : "Create & Submit For Approval"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfferForm;