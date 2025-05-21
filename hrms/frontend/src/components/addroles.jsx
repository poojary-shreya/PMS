import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  ListItemText,
  Checkbox,
  OutlinedInput
} from "@mui/material";

const AddRoles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const isEditMode = state?.isEdit;
  
  const roleTypes = ["CEO", "CTO", "Board of directors", "section manager/department manger", "Manager", "HR Manager", "Hiring Manager", "Priciple engineer/architect", "Team Lead", "Senior Software Engineer", "Software Engineer", "Junior Software Engineer", "Intern"];

  const responsibilities = {
    "CEO": [
      "Strategic planning",
      "Business development",
      "Executive leadership",
      "Stakeholder relations",
      "Company vision"
    ],
    "CTO": [
      "Technology strategy",
      "Technical leadership",
      "Innovation management",
      "IT governance",
      "Technical risk assessment"
    ],
    "Board of directors": [
      "Corporate governance",
      "Strategic oversight",
      "CEO supervision",
      "Financial accountability",
      "Shareholder representation"
    ],
    "section manager/department manger": [
      "Departmental leadership",
      "Budget management",
      "Cross-team coordination",
      "Department KPI tracking",
      "Process improvement"
    ],
    "Manager": [
      "Team management",
      "Project oversight",
      "Performance evaluation",
      "Resource allocation",
      "Department strategy"
    ],
    "HR Manager": [
      "Employee relations",
      "HR policy development",
      "Benefits administration",
      "Employee engagement",
      "Talent development"
    ],
    "Hiring Manager": [
      "Candidate screening",
      "Interview coordination",
      "Recruitment strategy",
      "Onboarding oversight",
      "Hiring decisions"
    ],
    "Priciple engineer/architect": [
      "System architecture design",
      "Technical decision-making",
      "Engineering standards",
      "Technical mentorship",
      "Technology roadmap"
    ],
    "Team Lead": [
      "Team coordination",
      "Technical guidance",
      "Sprint planning",
      "Progress reporting",
      "Code reviews"
    ],
    "Senior Software Engineer": [
      "Complex feature implementation",
      "Architecture participation",
      "Technical mentoring",
      "Advanced problem solving",
      "Code quality enforcement"
    ],
    "Software Engineer": [
      "Software development",
      "Problem solving",
      "Code testing",
      "Documentation",
      "Feature implementation"
    ],
    "Junior Software Engineer": [
      "Basic feature implementation",
      "Bug fixing",
      "Learning codebase",
      "Pair programming",
      "Testing and QA"
    ],
    "Intern": [
      "Learning",
      "Assigned tasks",
      "Progress reporting",
      "Skill development",
      "Support activities"
    ]
  };
  const [formData, setFormData] = useState({
    employeeDetails: {
      employeeId: state?.employee_id || "",
      fullName: "",
      email: "",
      designation: "",
      joiningDate: "",
      department: "",
    },
    roleInfo: {
      roleType: "",
      reportingManager: "",
      teamSize: "",
      accessLevel: "",
    },
    responsibilities: {
      selectedResponsibilities: [],
      additionalResponsibilities: "",
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (state?.employee_id) {
        try {
          setLoading(true);
          
       
          const employeeResponse = await axios.get(
            `http://localhost:5000/api/employees/${state.employee_id}`
          );
          
          if (employeeResponse.data.success && employeeResponse.data.data) {
            const employeeData = employeeResponse.data.data;
            
           
            setFormData(prev => ({
              ...prev,
              employeeDetails: {
                ...prev.employeeDetails,
                employeeId: state.employee_id,
                fullName: `${employeeData.firstName} ${employeeData.lastName}`,
                email: employeeData.companyemail, 
                department: employeeData.department || ""
              }
            }));
          }
          
      
          if (isEditMode) {
            const rolesResponse = await axios.get(
              `http://localhost:5000/api/roles/${state.employee_id}`
            );
            
            if (rolesResponse.data.success && rolesResponse.data.data) {
              const rolesData = rolesResponse.data.data;
              setFormData(prev => ({
                ...prev,
                employeeDetails: {
                  ...prev.employeeDetails,
                  designation: rolesData.designation || "",
                  joiningDate: rolesData.joiningDate || "",
                  department: rolesData.department || prev.employeeDetails.department
                },
                roleInfo: {
                  roleType: rolesData.roleType || "",
                  reportingManager: rolesData.reportingManager || "",
                  teamSize: rolesData.teamSize || "",
                  accessLevel: rolesData.accessLevel || "",
                },
                responsibilities: {
                  selectedResponsibilities: rolesData.selectedResponsibilities || [],
                  additionalResponsibilities: rolesData.additionalResponsibilities || "",
                }
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          alert("Failed to load employee and role details");
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchEmployeeData();
  }, [state?.employee_id, isEditMode]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (state?.roleData && isEditMode) {
        const roleData = state.roleData;
        
        setFormData({
          employeeDetails: {
            employeeId: roleData.employee_id || "",
            fullName: roleData.fullName || "",
            email: roleData.email || "",
            designation: roleData.designation || "",
            joiningDate: roleData.joiningDate || "",
            department: roleData.department || "",
          },
          roleInfo: {
            roleType: roleData.roleType || "",
            reportingManager: roleData.reportingManager || "",
            teamSize: roleData.teamSize || "",
            accessLevel: roleData.accessLevel || "",
          },
          responsibilities: {
            selectedResponsibilities: roleData.selectedResponsibilities || [],
            additionalResponsibilities: roleData.additionalResponsibilities || "",
          }
        });
        return; 
      }
      
    
      if (state?.employee_id) {
        try {
          setLoading(true);
          
      
        } catch (error) {
          console.error("Error fetching data:", error);
          alert("Failed to load employee and role details");
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchEmployeeData();
  }, [state?.employee_id, state?.roleData, isEditMode]);

  const handleChange = (e, section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value
      }
    }));


    if (section === "roleInfo" && field === "roleType") {
      if (responsibilities[e.target.value]) {
        setFormData(prev => ({
          ...prev,
          responsibilities: {
            ...prev.responsibilities,
            selectedResponsibilities: [] 
          }
        }));
      }
    }
  };

  const handleResponsibilitiesChange = (event) => {
    const {
      target: { value },
    } = event;
    
    setFormData(prev => ({
      ...prev,
      responsibilities: {
        ...prev.responsibilities,
        selectedResponsibilities: typeof value === 'string' ? value.split(',') : value,
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeDetails.employeeId || !formData.roleInfo.roleType) {
      alert("Employee ID and Role Type are required!");
      return;
    }
  
    try {
      const payload = {
        employee_id: formData.employeeDetails.employeeId,
        fullName: formData.employeeDetails.fullName,
        email: formData.employeeDetails.email,
        designation: formData.employeeDetails.designation,
        joiningDate: formData.employeeDetails.joiningDate,
        department: formData.employeeDetails.department,
        roleType: formData.roleInfo.roleType,
        reportingManager: formData.roleInfo.reportingManager,
        teamSize: parseInt(formData.roleInfo.teamSize) || 0,
        accessLevel: formData.roleInfo.accessLevel,
        selectedResponsibilities: formData.responsibilities.selectedResponsibilities,
        additionalResponsibilities: formData.responsibilities.additionalResponsibilities,
      };
  
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: isEditMode 
          ? `http://localhost:5000/api/roles/${formData.employeeDetails.employeeId}`
          : "http://localhost:5000/api/roles",
        data: payload,
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (response.data.success || response.status === 201) {
        alert(`Roles and responsibilities ${isEditMode ? 'updated' : 'added'} successfully!`);
        navigate("/viewrole");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to save roles and responsibilities details";
      alert(`Error: ${errorMessage}`);
      navigate('/view-role');
    }
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit Roles & Responsibilities" : "Add Roles & Responsibilities"}
      </Typography>
      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Employee Details</Typography>
        <Grid container spacing={2}>
          {Object.keys(formData.employeeDetails).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").trim()}
                fullWidth
                type={field === "joiningDate" ? "date" : "text"}
                InputLabelProps={field === "joiningDate" ? { shrink: true } : {}}
                value={formData.employeeDetails[field]}
                onChange={(e) => handleChange(e, "employeeDetails", field)}
                required={["employeeId"].includes(field)}
                disabled={["employeeId", "email"].includes(field) && (location.state?.employee_id || isEditMode)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Role Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="role-type-label">Role Type</InputLabel>
              <Select
                labelId="role-type-label"
                id="role-type-select"
                value={formData.roleInfo.roleType}
                label="Role Type"
                onChange={(e) => handleChange(e, "roleInfo", "roleType")}
                required
              >
                {roleTypes.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Reporting Manager Email"
              fullWidth
              value={formData.roleInfo.reportingManager}
              onChange={(e) => handleChange(e, "roleInfo", "reportingManager")}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Team Size"
              fullWidth
              type="number"
              value={formData.roleInfo.teamSize}
              onChange={(e) => handleChange(e, "roleInfo", "teamSize")}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              label="Access Level"
              fullWidth
              value={formData.roleInfo.accessLevel}
              onChange={(e) => handleChange(e, "roleInfo", "accessLevel")}
            />
          </Grid> */}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Responsibilities</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="responsibilities-label">Select Responsibilities</InputLabel>
              <Select
                labelId="responsibilities-label"
                id="responsibilities-select"
                multiple
                value={formData.responsibilities.selectedResponsibilities}
                onChange={handleResponsibilitiesChange}
                input={<OutlinedInput label="Select Responsibilities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {formData.roleInfo.roleType && responsibilities[formData.roleInfo.roleType] ? 
                  responsibilities[formData.roleInfo.roleType].map((resp) => (
                    <MenuItem key={resp} value={resp}>
                      <Checkbox checked={formData.responsibilities.selectedResponsibilities.indexOf(resp) > -1} />
                      <ListItemText primary={resp} />
                    </MenuItem>
                  )) : 
                  <MenuItem disabled>Select a role type first</MenuItem>
                }
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Additional Responsibilities"
              fullWidth
              multiline
              rows={4}
              value={formData.responsibilities.additionalResponsibilities}
              onChange={(e) => handleChange(e, "responsibilities", "additionalResponsibilities")}
              placeholder="Describe any additional responsibilities not covered above..."
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate("/addfinancial", { 
              state: { 
                employee_id: formData.employeeDetails.employeeId,
                isEdit: isEditMode 
              } 
            })}
          >
            Financial Details
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
              handleSubmit(event, () => navigate('/viewrole'));
            }}
            sx={{marginLeft: 60}}
          >
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoles;