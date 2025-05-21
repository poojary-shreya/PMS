import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  Snackbar
} from "@mui/material";

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [profileData, setProfileData] = useState({
    personalDetails: {
      firstName: "",
      lastName: "",
      personalemail: "",
      dateOfBirth: "",
      anniversary: "",
      gender: "",
      panNumber: "",
      adharCardNumber: "",
    },
    contactInfo: {
      phoneNumber: "",
      houseNumber: "",
      street: "",
      crossStreet: "",
      area: "",
      city: "",
      pinCode: "",
    },
    emergencyContact: {
      mobile: "",
      landline: "",
    },
    employmentDetails: {
      employeeId: "",
      companyemail: "",
      department: "",
      designation: "",
      joiningDate: "",
      employmentStatus: "",
    },
    financialDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      currentSalary: "",
    },
    roleInfo: {
      roleType: "",
      reportingManager: "",
      responsibilities: []
    },
    qualifications: [],
    certificates: []
  });


  const editableFields = {
    contactInfo: ["phoneNumber", "houseNumber", "street", "crossStreet", "area", "city", "pinCode"],
    emergencyContact: ["mobile", "landline"],
    personalDetails: ["personalemail", "anniversary","panNumber", "adharCardNumber"]
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
    
        const api = axios.create({
          baseURL: 'http://localhost:5000/api',
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        });
        
      
        const [personalResponse, financialResponse, roleResponse] = await Promise.all([
          api.get('/profile'), 
          api.get('/financial'), 
          api.get('/role') 
        ]);
        
        if (personalResponse.data.success) {
          const employeeData = personalResponse.data.data;
          setProfileData(prev => ({
            ...prev,
            personalDetails: {
              firstName: employeeData.firstName || "",
              lastName: employeeData.lastName || "",
              personalEmail: employeeData.personalemail || "",
              dateOfBirth: employeeData.dateOfBirth?.split('T')[0] || '',
              anniversary: employeeData.anniversary?.split('T')[0] || '',
              gender: employeeData.gender || "",
              panNumber: employeeData.panNumber || "",
              aadharCardNumber: employeeData.adharCardNumber || ""
            },
            contactInfo: {
              phoneNumber: employeeData.phoneNumber || "",
              houseNumber: employeeData.houseNumber || "",
              street: employeeData.street || "",
              sideStreet: employeeData.crossStreet || "",
              area: employeeData.area || "",
              city: employeeData.city || "",
              pinCode: employeeData.pinCode || ""
            },
            emergencyContact: {
              mobile: employeeData.mobile || "",
              landline: employeeData.landline || "",
            },
            employmentDetails: {
              employeeId: employeeData.employee_id || "",
              companyemail: employeeData.companyemail || "",
              department: employeeData.department || "",
              employmentStatus: employeeData.employmentStatus || ""
            },
            qualifications: employeeData.qualifications || [],
            certificates: employeeData.certificates || []
          }));
        }
        
        if (financialResponse.data.success) {
          const financialData = financialResponse.data.data;
          setProfileData(prev => ({
            ...prev,
            financialDetails: {
              bankName: financialData.bankName || "",
              accountNumber: financialData.accountNumber || "",
              ifscCode: financialData.ifscCode || "",
              currentSalary: financialData.currentSalary || ""
            }
          }));
        }
        
        if (roleResponse.data.success) {
          const roleData = roleResponse.data.data;
          setProfileData(prev => ({
            ...prev,
            employmentDetails: {
              ...prev.employmentDetails,
              designation: roleData.designation || "",
              joiningDate: roleData.joiningDate?.split('T')[0] || ""
            },
            roleInfo: {
              roleType: roleData.roleType || "",
              reportingManager: roleData.reportingManager || "",
              responsibilities: [
                ...(roleData.selectedResponsibilities || []),
                ...(roleData.additionalResponsibilities ? [roleData.additionalResponsibilities] : [])
              ]
            }
          }));
        }
        
        if (!personalResponse.data.success && !financialResponse.data.success && !roleResponse.data.success) {
          showAlert("Could not find your employee data. Please contact HR.", "error");
        }

      } catch (error) {
        console.error("Error fetching employee data:", error);
        showAlert("Failed to load your profile information. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, []);

  const handleChange = (e, section, field) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value
      }
    }));
  };

  const isEditable = (section, field) => {
    return editableFields[section] && editableFields[section].includes(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
    
      const payload = {
        personalemail: profileData.personalDetails.personalemail,
        anniversary: profileData.personalDetails.anniversary,
        phoneNumber: profileData.contactInfo.phoneNumber,
        houseNumber: profileData.contactInfo.houseNumber,
        street: profileData.contactInfo.street,
        crossStreet: profileData.contactInfo.crossStreet,
        panNumber: profileData.personalDetails.panNumber,     
        adharCardNumber: profileData.personalDetails.adharCardNumber,
        area: profileData.contactInfo.area,
        city: profileData.contactInfo.city,
        pinCode: profileData.contactInfo.pinCode,
        mobile: profileData.emergencyContact.mobile,
        landline: profileData.emergencyContact.landline,
      };
      
    
      const employeeId = profileData.employmentDetails.employeeId;
      
      if (!employeeId) {
        showAlert("Employee ID not found", "error");
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/updateEmployeeProfile/${employeeId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        showAlert("Profile updated successfully!");
      } else {
        showAlert("Failed to update profile.", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      showAlert(`Error updating profile: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1500, margin: 'auto', padding: 3 }}>
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Employee Profile
      </Typography>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Employment Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Employee ID"
              fullWidth
              value={profileData.employmentDetails.employeeId}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Company Email"
              fullWidth
              value={profileData.employmentDetails.companyemail}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Designation"
              fullWidth
              value={profileData.employmentDetails.designation}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Joining Date"
              fullWidth
              value={profileData.employmentDetails.joiningDate}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Employment Status"
              fullWidth
              value={profileData.employmentDetails.employmentStatus}
              disabled={true}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Personal Details</Typography>
        <Grid container spacing={2}>
          {Object.keys(profileData.personalDetails).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + field.replace(/([A-Z])/g, " $1").slice(1).trim()}
                fullWidth
                type={field === "dateOfBirth" || field === "anniversary" ? "date" : "text"}
                InputLabelProps={field === "dateOfBirth" || field === "anniversary" ? { shrink: true } : {}}
                value={profileData.personalDetails[field]}
                onChange={(e) => handleChange(e, "personalDetails", field)}
                // disabled={!isEditable("personalDetails", field)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Grid container spacing={2}>
          {Object.keys(profileData.contactInfo).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + field.replace(/([A-Z])/g, " $1").slice(1).trim()}
                fullWidth
                value={profileData.contactInfo[field]}
                onChange={(e) => handleChange(e, "contactInfo", field)}
                // disabled={!isEditable("contactInfo", field)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
        <Grid container spacing={2}>
          {Object.keys(profileData.emergencyContact).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                fullWidth
                value={profileData.emergencyContact[field]}
                onChange={(e) => handleChange(e, "emergencyContact", field)}
                disabled={!isEditable("emergencyContact", field)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Financial Details</Typography>
        <Grid container spacing={2}>
          {Object.keys(profileData.financialDetails).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + field.replace(/([A-Z])/g, " $1").slice(1).trim()}
                fullWidth
                value={field === "currentSalary" ? `₹${profileData.financialDetails[field]}` : profileData.financialDetails[field]}
                disabled={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Role & Responsibilities</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Role Type"
              fullWidth
              value={profileData.roleInfo.roleType}
              disabled={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Reporting Manager"
              fullWidth
              value={profileData.roleInfo.reportingManager}
              disabled={true}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Responsibilities:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {profileData.roleInfo.responsibilities.map((resp, index) => (
                <Chip key={index} label={resp} color="primary" variant="outlined" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Qualifications</Typography>
        {profileData.qualifications.length > 0 ? (
          profileData.qualifications.map((qualification, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Degree:</Typography>
                  <Typography>{qualification.degree}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Institution:</Typography>
                  <Typography>{qualification.institution}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Year:</Typography>
                  <Typography>{qualification.year}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 1, mb: 1 }} />
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No qualifications recorded.</Typography>
        )}
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Certifications</Typography>
        {profileData.certificates.length > 0 ? (
          profileData.certificates.map((cert, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Certificate Name:</Typography>
                  <Typography>{cert.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Issued By:</Typography>
                  <Typography>{cert.issuedBy}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">Date:</Typography>
                  <Typography>{cert.date}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 1, mb: 1 }} />
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No certifications recorded.</Typography>
        )}
      </Paper> */}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          size="large"
        >
          Update Profile
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeProfile;