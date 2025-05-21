import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const JobPosting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jobFromState = location.state?.job;
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [requisition, setRequisition] = useState({
    jobId: "",
    jobTitle: "",
    department: "",
    location: "",
    employmentType: "",
    noOfPositions: "",
    experience: "",
    budget: "",
    jobClosedDate: "",
    hiringManagerName: "",
    hiringManagerEmail: "", 
    description: "",
  });

  useEffect(() => {
  
    if (jobFromState) {
      setRequisition({
        ...jobFromState,
        jobClosedDate: formatDateForInput(jobFromState.jobClosedDate)
      });
      return;
    }
    
  
    if (id) {
      fetchJob(id);
    }
  }, [id, jobFromState]);

  const fetchJob = async (jobId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/jobpost/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const job = response.data.job;
      setRequisition({
        ...job,
        jobClosedDate: formatDateForInput(job.jobClosedDate)
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      setAlert({
        open: true,
        message: "Failed to fetch job details",
        severity: "error"
      });
      setLoading(false);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    
    try {
     
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "";
      
      return dateObj.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleChange = (e) => {
    setRequisition({ ...requisition, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
 
    const requiredFields = Object.entries(requisition).filter(([_, v]) => !v);
    if (requiredFields.length > 0) {
      setAlert({
        open: true,
        message: "All fields are required",
        severity: "error"
      });
      return;
    }

    
    if (!validateEmail(requisition.hiringManagerEmail)) {
      setAlert({
        open: true,
        message: "Please enter a valid email for the hiring manager",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const jobData = {
        ...requisition,
        noOfPositions: parseInt(requisition.noOfPositions, 10)
      };

    
      const jobId = jobFromState?.id || id;
      
      let data;
      if (jobId) {
     
        const { data: responseData } = await axios.put(
          `http://localhost:5000/api/jobpost/update/${jobId}`, 
          jobData, 
          config
        );
        data = responseData;
      } else {
       
        const { data: responseData } = await axios.post(
          "http://localhost:5000/api/jobpost/create", 
          jobData, 
          config
        );
        data = responseData;
      }

      setAlert({ 
        open: true, 
        message: data.message, 
        severity: "success" 
      });
      
     
      setTimeout(() => navigate("/jobview"), 1500);
    } catch (error) {
      console.error("Operation failed:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Operation failed",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
     <Card sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>

        <CardHeader
          title={
            <Typography variant="h4" sx={{ textAlign: "center" }} fontWeight="bold">
              {(jobFromState || id) ? "Edit Job Posting" : " Job Posting"}
            </Typography>
          }
        />

        <CardContent>
          {loading && !requisition.jobId ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <CircularProgress />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Form Fields */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job ID"
                    name="jobId"
                    value={requisition.jobId}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={requisition.jobTitle}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Department</InputLabel>
                    <Select
                      label="Department"
                      name="department"
                      value={requisition.department}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="">Select Department</MenuItem>
                      <MenuItem value="Engineering">Engineering</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Human Resources">Human Resources</MenuItem>
                      <MenuItem value="Operations">Operations</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={requisition.location}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employmentType"
                      label="Employment Type"
                      value={requisition.employmentType}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="Full Time">Full Time</MenuItem>
                      <MenuItem value="Part Time">Part Time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Consultant">Consultant</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Positions"
                    name="noOfPositions"
                    type="number"
                    value={requisition.noOfPositions}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Experience (in years)"
                    name="experience"
                    value={requisition.experience}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Budget"
                    name="budget"
                    value={requisition.budget}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Closed Date"
                    name="jobClosedDate"
                    type="date"
                    value={requisition.jobClosedDate}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hiring Manager"
                    name="hiringManagerName"
                    value={requisition.hiringManagerName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hiring Manager Email"
                    name="hiringManagerEmail"
                    type="email"
                    value={requisition.hiringManagerEmail}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    placeholder="example@company.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    name="description"
                    value={requisition.description}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} textAlign="center">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ mr: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : (jobFromState || id) ? "Update" : "Create"}
                  </Button>
                  <Button onClick={() => navigate("/jobview")}>Cancel</Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </div>
  );
};
  
export default JobPosting;