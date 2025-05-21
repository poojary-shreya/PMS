import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Grid,
  Typography,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import axios from "axios";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';

const InterviewScheduleForm = () => {
  const location = useLocation();
  const candidateData = location.state || {};

  const [hiringManagers, setHiringManagers] = useState([]);
  const [managerLoadError, setManagerLoadError] = useState(null);
  
  // Add state for interview rounds
  const [interviewRounds, setInterviewRounds] = useState([
    "Technical 1", "Technical 2", "Technical 3", "Architectural Round", "Manager Round", "HR Round"
  ]);
  
  // Add state for the Add Round dialog
  const [openAddRoundDialog, setOpenAddRoundDialog] = useState(false);
  const [newRound, setNewRound] = useState("");
  const [roundError, setRoundError] = useState("");

  // Get today's date for date constraints
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison

  const [interview, setInterview] = useState({
    name: "",
    email: "",
    skills: "",
    experience: "",
    interviewDate: null,
    interviewTime: "",
    interviewer: "",
    round: "",
    hiringManagerEmail: "",
    positionApplied: ""
  });

  // Add state to track if experience has been fetched
  const [experienceFetched, setExperienceFetched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to parse experience value from various formats
  const parseExperienceValue = (expValue) => {
    if (!expValue) return "";
    
    // If it's already a number or string number, return as is
    if (!isNaN(expValue)) return expValue.toString();
    
    // If it's a string like "5 years" extract the number
    if (typeof expValue === 'string') {
      const numericMatch = expValue.match(/(\d+(\.\d+)?)/);
      if (numericMatch && numericMatch[1]) {
        return numericMatch[1];
      }
    }
    
    return "";
  };

  // Function to fetch candidate experience from API if needed
  const fetchCandidateExperience = async (candidateEmail) => {
    if (!candidateEmail) return;
    
    try {
      setExperienceFetched(true); // Mark as fetched before the API call to prevent multiple calls
      
      // Only fetch if we have an email but no experience value
      const response = await axios.get(`http://localhost:5000/api/candidates/experience/${candidateEmail}`);
      
      if (response.data && response.data.success) {
        const fetchedExperience = response.data.experience;
        
        // Update experience only if we got a valid value
        if (fetchedExperience !== undefined && fetchedExperience !== null) {
          setInterview(prev => ({
            ...prev,
            experience: fetchedExperience.toString()
          }));
        }
      }
    } catch (err) {
      console.log("No experience data found for candidate or API error:", err);
      // We'll keep the experience field editable even if fetch fails
    }
  };

  const fetchHiringManagers = async () => {
    setManagerLoadError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/roles/employees/byrole/Hiring Manager");
      
      if (response.data.success && response.data.data) {
        const managers = response.data.data.map(manager => ({
          email: manager.email || manager.companyemail,
          name: `${manager.firstName || ''} ${manager.lastName || ''}`.trim(),
        }));
        setHiringManagers(managers);
      } else {
        throw new Error("Failed to fetch hiring managers");
      }
    } catch (err) {
      console.error("Error fetching hiring managers:", err);
      setManagerLoadError("Failed to load hiring managers");
    }
  };

  const fetchInterviewRounds = async () => {
    try {
      // Try to fetch from API
      const response = await axios.get("http://localhost:5000/api/interview-rounds");
      if (response.data && Array.isArray(response.data)) {
        setInterviewRounds(response.data);
        // Cache the rounds in localStorage
        localStorage.setItem('interviewRounds', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching interview rounds from API:", error);
      
      // Try to get from local storage if API fails
      const localRounds = localStorage.getItem('interviewRounds');
      if (localRounds) {
        try {
          const parsedRounds = JSON.parse(localRounds);
          setInterviewRounds(parsedRounds);
        } catch (parseError) {
          console.error("Error parsing local rounds:", parseError);
          // Keep the default rounds
        }
      }
    }
  };

  useEffect(() => {
    // Initialize form with candidateData if available
    if (candidateData) {
      // Parse the experience value properly from candidateData
      const parsedExperience = parseExperienceValue(candidateData.experience);
      
      setInterview(prev => ({
        ...prev,
        name: candidateData.name || "",
        email: candidateData.email || "",
        skills: candidateData.skills || "",
        experience: parsedExperience,
        positionApplied: candidateData.positionApplied || "",
        hiringManagerEmail: candidateData.hiringManagerEmail || ""
      }));
      
      // If no experience was provided or parsed, try to fetch it
      if (candidateData.email && !parsedExperience) {
        fetchCandidateExperience(candidateData.email);
      } else {
        setExperienceFetched(true);
      }
    }
    
    fetchHiringManagers();
    fetchInterviewRounds();
  }, [candidateData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate date and time
    if (!interview.interviewDate) {
      setError("Interview date is required");
      return;
    }
    
    // Validate that time is not empty
    if (!interview.interviewTime) {
      setError("Interview time is required");
      return;
    }
    
    setLoading(true);
    setError(null);

    // Format date for API
    const formattedDate = interview.interviewDate instanceof Date 
      ? interview.interviewDate.toISOString().split('T')[0] 
      : "";
      
    // Make sure we're sending a valid time string in HH:MM format
    const timeValue = interview.interviewTime || "00:00"; // Default to midnight if somehow empty
    
    const payload = {
      ...interview,
      interviewDate: formattedDate,
      interviewTime: timeValue,
      experience: parseFloat(interview.experience) || 0,
      positionApplied: interview.positionApplied 
    };
    
    console.log("Payload being sent:", payload);
  
    try {
      const response = await fetch("http://localhost:5000/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();
      if (response.ok) {
        alert("Interview scheduled! Confirmation email sent.");
        setInterview({
          name: "",
          email: "",
          skills: "",
          experience: "",
          interviewDate: null,
          positionApplied: "",
          interviewTime: "",
          interviewer: "",
          round: "",
          hiringManagerEmail: ""
        });
      } else {
        setError(data.message || "Error scheduling interview");
      }
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setError("An error occurred while scheduling the interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setInterview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add Round Dialog Handlers
  const handleOpenAddRoundDialog = (e) => {
    // Prevent the click from reaching the Select component
    e.stopPropagation();
    setOpenAddRoundDialog(true);
    setNewRound("");
    setRoundError("");
  };

  const handleCloseAddRoundDialog = () => {
    setOpenAddRoundDialog(false);
  };

  const handleNewRoundChange = (e) => {
    setNewRound(e.target.value);
    if (e.target.value.trim() === "") {
      setRoundError("Round name cannot be empty");
    } else if (interviewRounds.includes(e.target.value.trim())) {
      setRoundError("This round already exists");
    } else {
      setRoundError("");
    }
  };

  const handleAddRound = async () => {
    if (newRound.trim() === "") {
      setRoundError("Round name cannot be empty");
      return;
    }

    if (interviewRounds.includes(newRound.trim())) {
      setRoundError("This round already exists");
      return;
    }

    const updatedRounds = [...interviewRounds, newRound.trim()];

    try {
      // Try to add to API
      await axios.post("http://localhost:5000/api/interview-rounds", { round: newRound.trim() });
      
      // Update state
      setInterviewRounds(updatedRounds);
      
      // Update local storage
      localStorage.setItem('interviewRounds', JSON.stringify(updatedRounds));
      
      // Close dialog
      handleCloseAddRoundDialog();
    } catch (error) {
      console.error("Error adding round to API:", error);
      
      // Even if API fails, update local state and storage
      setInterviewRounds(updatedRounds);
      localStorage.setItem('interviewRounds', JSON.stringify(updatedRounds));
      handleCloseAddRoundDialog();
    }
  };

  // Date should be today or in the future
  const isDateDisabled = (date) => {
    // Disable dates before today
    return date < today;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{ minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
          <Card>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ padding: "15px" }}
              fontWeight="bold"
            >
              Interview Scheduling
            </Typography>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Candidate Name"
                      value={interview.name || ""}
                      onChange={(e) =>
                        setInterview({ ...interview, name: e.target.value })
                      }
                      fullWidth
                      required
                      margin="normal"
                      InputProps={{ readOnly: !!candidateData?.name }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Candidate Email"
                      type="email"
                      value={interview.email || ""}
                      onChange={(e) => {
                        const newEmail = e.target.value;
                        setInterview({ ...interview, email: newEmail });
                        
                        // If email changes and no experience set yet, try to fetch it
                        if (newEmail && !interview.experience && !experienceFetched) {
                          fetchCandidateExperience(newEmail);
                        }
                      }}
                      fullWidth
                      required
                      margin="normal"
                      InputProps={{ readOnly: !!candidateData?.email }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Skills"
                      value={interview.skills || ""}
                      onChange={(e) =>
                        setInterview({ ...interview, skills: e.target.value })
                      }
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: !!candidateData?.skills }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Experience"
                      value={interview.experience}
                      onChange={(e) => handleFieldChange('experience', e.target.value)}
                      fullWidth
                      margin="normal"
                      type="number"
                      // Always editable, regardless of source
                      InputProps={{
                        endAdornment: <InputAdornment position="end">years</InputAdornment>,
                        inputProps: { min: 0, step: 0.5 } // Allow decimal values with 0.5 step
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Job Title"
                      value={interview.positionApplied}
                      onChange={(e) => handleFieldChange('positionApplied', e.target.value)}
                      fullWidth
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required margin="normal">
                      <InputLabel>Hiring Manager Email</InputLabel>
                      <Select
                        label="Hiring Manager Email"
                        value={interview.hiringManagerEmail}
                        onChange={(e) => setInterview({ ...interview, hiringManagerEmail: e.target.value })}
                        inputProps={{ readOnly: !!candidateData?.hiringManagerEmail }}
                      >
                        {managerLoadError && (
                          <MenuItem disabled>
                            <Typography color="error">{managerLoadError}</Typography>
                          </MenuItem>
                        )}
                        
                        {hiringManagers.length === 0 && !managerLoadError && (
                          <MenuItem disabled>
                            <Typography>No hiring managers found</Typography>
                          </MenuItem>
                        )}
                        
                        {hiringManagers.map((manager) => (
                          <MenuItem key={manager.email} value={manager.email}>
                            {manager.name ? `${manager.name} (${manager.email})` : manager.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Tooltip title="Select an interview date ">
                      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <DatePicker
                          label="Interview Date"
                          value={interview.interviewDate}
                          onChange={(newDate) => setInterview({ ...interview, interviewDate: newDate })}
                          disablePast 
                          shouldDisableDate={isDateDisabled}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              margin: "normal",
                              inputProps: {
                                readOnly: true, 
                                onKeyDown: (e) => e.preventDefault() 
                              }
                            }
                          }}
                        />
                      </div>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tooltip title="Select the time for the interview">
                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                      <TextField
                        label="Interview Time"
                        type="time"
                        value={interview.interviewTime}
                        onChange={(e) =>
                          setInterview({ ...interview, interviewTime: e.target.value })
                        }
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        margin="normal"
                        inputProps={{ 
                          onKeyDown: (e) => e.preventDefault(),
                          min: "00:00",
                          max: "23:59"
                        }}
                      />
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required margin="normal">
                      <InputLabel>Round</InputLabel>
                      <Select
                        label="Round"
                        value={interview.round}
                        onChange={(e) =>
                          setInterview({ ...interview, round: e.target.value })
                        }
                        endAdornment={
                          <InputAdornment position="end" sx={{ position: 'absolute', right: 28, pointerEvents: 'none' }}>
                            <Button 
                              onClick={handleOpenAddRoundDialog}
                              sx={{ minWidth: 'auto', pointerEvents: 'auto' }}
                            >
                              <Add />
                            </Button>
                          </InputAdornment>
                        }
                      >
                        {interviewRounds.sort().map((round) => (
                          <MenuItem key={round} value={round}>{round}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Interviewer"
                      value={interview.interviewer}
                      onChange={(e) =>
                        setInterview({ ...interview, interviewer: e.target.value })
                      }
                      fullWidth
                      required
                      margin="normal"
                    />
                  </Grid>
                </Grid>

                {error && <Box sx={{ color: "red", marginTop: 2 }}>{error}</Box>}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    disabled={loading}
                  >
                    {loading ? "Scheduling..." : "Schedule Interview"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Add Round Dialog */}
        <Dialog open={openAddRoundDialog} onClose={handleCloseAddRoundDialog}>
          <DialogTitle>Add New Interview Round</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Round Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newRound}
              onChange={handleNewRoundChange}
              error={!!roundError}
              helperText={roundError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddRoundDialog}>Cancel</Button>
            <Button 
              onClick={handleAddRound} 
              variant="contained" 
              disabled={!newRound.trim() || !!roundError}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default InterviewScheduleForm;