import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography, TextField, Button, Grid, Box,
  FormControl, InputLabel, MenuItem, Select, Alert,Tooltip
} from "@mui/material";

function TrainingManagement() {
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [employees, setEmployees] = useState([]); 
  
  const navigate = useNavigate();
  const [newTraining, setNewTraining] = useState({
    title: "", 
    trainer: "", 
    employee: "", 
    employee_id: "",
    email: "", 
    startDate: "", 
    endDate: "", 
    skillCategory: "", 
    skillContent: ""
  });

  const skillOptions = [
    "Process Management", "People Management", "Interpersonal Skills",
    "Communication Skills", "Managing Skills", "Technical Skills",
    "Cultural Skills", "Business Skills", "Accounting Skills", "Industrial Certificates",
  ];

  const skillContents = {
    "Process Management": ["Workflow Optimization", "Lean Six Sigma", "Agile Methodology"],
    "People Management": ["Team Leadership", "Conflict Resolution", "Performance Evaluation"],
    "Interpersonal Skills": ["Empathy Building", "Active Listening", "Networking Strategies"],
    "Communication Skills": ["Business Writing", "Presentation Skills", "Negotiation Techniques"],
    "Managing Skills": ["Time Management", "Risk Management", "Decision Making"],
    "Technical Skills": ["Python Programming", "Cloud Computing", "Data Analysis", "Machine Learning"],
    "Cultural Skills": ["Diversity Training", "Cross-Cultural Communication", "Inclusive Leadership"],
    "Business Skills": ["Market Analysis", "Strategic Planning", "Entrepreneurship"],
    "Accounting Skills": ["Financial Reporting", "Tax Planning", "Budgeting"],
    "Industrial Certificates": ["AWS Certified", "PMP Certification", "ISO Compliance"]
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/trainings");
        setTrainings(response.data);
      } catch (error) {
        console.error("Error fetching trainings:", error);
        setError(error.response?.data?.message || "Failed to fetch trainings");
      }
    };
    
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError(error.response?.data?.message );
      }
    };
    
    fetchTrainings();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTraining(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'skillCategory' && { skillContent: '' })
    }));
  };

  const addTraining = async () => {
    if (Object.values(newTraining).some(value => value === "")) {
      setError("Please fill all fields.");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/trainings/add", newTraining);
      setTrainings([...trainings, response.data]);
      setNewTraining({ 
        title: "", 
        trainer: "", 
        employee: "", 
        employee_id: "", 
        email: "", 
        startDate: "", 
        endDate: "", 
        skillCategory: "", 
        skillContent: "" 
      });
      setSuccess("Training added successfully!");
      
      setTimeout(() => navigate('/trainings'), 2000);
    } catch (error) {
      console.error("Error adding training:", error);
      setError(error.response?.data?.message || "Failed to add training");
    }
  };

  return (
    <Container maxWidth="1500" sx={{ 
      display: "flex", 
      flexDirection: "column", 
      paddingTop: "25px"
    }}>
      {success && (
        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Card sx={{ boxShadow: 3, p: 2, width: "100%" }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" fontWeight={"bold"}>Knowledge Management</Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Training Title" name="title" value={newTraining.title} onChange={handleChange} margin="normal" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Trainer Name" name="trainer" value={newTraining.trainer} onChange={handleChange} margin="normal" />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  label="Employee Name" 
                  name="employee" 
                  value={newTraining.employee} 
                  onChange={handleChange} 
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  label="Employee Email" 
                  name="email" 
                  type="email" 
                  value={newTraining.email} 
                  onChange={handleChange} 
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Employee ID" 
                  name="employee_id" 
                  value={newTraining.employee_id} 
                  onChange={handleChange} 
                  margin="normal" 
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
              <Tooltip title="Select the main category of skills this training covers" arrow placement="top">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Skill Category</InputLabel>
                  <Select
                    name="skillCategory"
                    value={newTraining.skillCategory}
                    label="Skill Category"
                    onChange={handleChange}
                  >
                    {skillOptions.map((skill, index) => (
                      <MenuItem key={index} value={skill}>
                        {skill}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Tooltip>
              </Grid>

              <Grid item xs={6}>
              <Tooltip title="Select the specific content area within the chosen skill category" arrow placement="top">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Skill Content</InputLabel>
                  <Select
                    name="skillContent"
                    label="Skill Content"
                    value={newTraining.skillContent}
                    onChange={handleChange}
                    disabled={!newTraining.skillCategory}
                  >
                    {skillContents[newTraining.skillCategory]?.map((content, index) => (
                      <MenuItem key={index} value={content}>
                        {content}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth type="date" name="startDate" label="Start Date" value={newTraining.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} margin="normal" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth type="date" name="endDate" label="End Date" value={newTraining.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} margin="normal" />
              </Grid>
            </Grid>
            
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" color="primary" onClick={addTraining} sx={{ mt: 2, width: "200px" }}>
                Add Training
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default TrainingManagement;