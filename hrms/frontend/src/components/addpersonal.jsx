import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Box,
  Paper,
  FormHelperText,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const Addpersonal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const isEditMode = !!id || location.state?.isEdit;
  

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    employmentStatus: "Active",
    company_registration_no: "12345",
    personalPhoto: null,

    personalDetails: {
      firstName: "",
      lastName: "",
      fatherName: "",
      personalemail: "",
      dateOfBirth: "",
      anniversary: "",
      gender: "",
      panNumber: "",
      panCardFile: null,
      adharCardNumber: "",
      adharCardFile: null,
    },
    contactInfo: {
      phoneNumber: "",
      houseNumber: "",
      street: "",
      streetName: "",
      area: "",
      city: "",
      pinCode: "",
    },
    emergencyContact: {
      mobile: "",
      landline: "",
    },
    insurance: {
      individualInsurance: "",
      groupInsurance: "",
    },
    nominations: [{ name: "", relationship: "", age: "" }],
    qualifications: [{ degree: "", institution: "", year: "", file: null }],
    certificates: [{ name: "", issuedBy: "", date: "", file: null }],
  });

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePinCode = (pincode) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateEmail = (email) => {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: "Invalid email format"
      };
    }
    
  
    const commonDomains = {
      "gmail.co": "gmail.com",
      "yahoo.co": "yahoo.com",
      "hotmail.co": "hotmail.com",
      "outlook.co": "outlook.com"
    };
    
    const domain = email.split("@")[1];
    
    if (commonDomains[domain]) {
      return {
        isValid: false,
        message: `Did you mean ${email.split("@")[0]}@${commonDomains[domain]}?`,
        suggestedEmail: `${email.split("@")[0]}@${commonDomains[domain]}`
      };
    }
    
    return {
      isValid: true,
      message: "Valid email"
    };
  };

  const validateForm = () => {
    const newErrors = {};


    if (!formData.personalPhoto && !previewUrl) {
      newErrors.personalPhoto = "Personal photo is required";
    }

    if (!formData.personalDetails.firstName) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.personalDetails.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.personalDetails.fatherName) {
      newErrors.fatherName = "Father's name is required";
    }

    if (!formData.personalDetails.personalemail) {
      newErrors.personalemail = "Email is required";
    } else if (!validateEmail(formData.personalDetails.personalemail)) {
      newErrors.personalemail = "Invalid email format";
    }

    if (!formData.personalDetails.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.personalDetails.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    }
 
    if (!formData.personalDetails.panNumber) {
      newErrors.panNumber = "PAN Number is required";
    } else if (!validatePAN(formData.personalDetails.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (!formData.personalDetails.panCardFile && !isEditMode) {
      newErrors.panCardFile = "PAN Card document is required";
    }

    if (!formData.personalDetails.adharCardNumber) {
      newErrors.adharCardNumber = "Aadhar Number is required";
    } else if (!validateAadhar(formData.personalDetails.adharCardNumber)) {
      newErrors.adharCardNumber = "Invalid Aadhar format (12 digits)";
    }

    if (!formData.personalDetails.adharCardFile && !isEditMode) {
      newErrors.adharCardFile = "Aadhar Card document is required";
    }

   
    if (!formData.contactInfo.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.contactInfo.phoneNumber)) {
      newErrors.phoneNumber = "Valid 10-digit phone number is required";
    }

    if (!formData.contactInfo.houseNumber) {
      newErrors.houseNumber = "House number is required";
    }

    if (!formData.contactInfo.street) {
      newErrors.street = "Street is required";
    }

    if (!formData.contactInfo.streetName) {
      newErrors.streetName = "Street name is required";
    }

    if (!formData.contactInfo.area) {
      newErrors.area = "Area is required";
    }

    if (!formData.contactInfo.city) {
      newErrors.city = "City is required";
    }

    if (!formData.contactInfo.pinCode) {
      newErrors.pinCode = "Pin code is required";
    } else if (!validatePinCode(formData.contactInfo.pinCode)) {
      newErrors.pinCode = "Valid 6-digit pin code is required";
    }

 
    if (!formData.emergencyContact.mobile) {
      newErrors.emergencyMobile = "Emergency mobile number is required";
    } else if (!validatePhone(formData.emergencyContact.mobile)) {
      newErrors.emergencyMobile = "Valid 10-digit mobile number is required";
    }

    if (!formData.insurance.individualInsurance) {
      newErrors.individualInsurance = "Individual insurance is required";
    }

    if (!formData.insurance.groupInsurance) {
      newErrors.groupInsurance = "Group insurance is required";
    }


    const hasValidNomination = formData.nominations.some(
      (nom) => nom.name && nom.relationship && nom.age
    );
    
    if (!hasValidNomination) {
      newErrors.nominations = "At least one complete nomination is required";
    }

 
    const hasValidQualification = formData.qualifications.some(
      (qual) => qual.degree && qual.institution && qual.year
    );
    
    if (!hasValidQualification) {
      newErrors.qualifications = "At least one complete qualification is required";
    }

 
    const hasValidCertificate = formData.certificates.some(
      (cert) => cert.name && cert.issuedBy && cert.date
    );
    
    if (!hasValidCertificate) {
      newErrors.certificates = "At least one complete certificate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDirectChange = (e, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleChange = (e, section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: e.target.value,
      },
    }));
  };

  const handleArrayChange = (section, index, field) => (event) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index][field] = event.target.value;
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleFileUpload = (e, section, key) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: file,
        },
      }));
    }
  };

  const handlePersonalPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
     
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      setFormData((prev) => ({
        ...prev,
        personalPhoto: file,
      }));
    }
  };

  const handleArrayFileUpload = (section, index, field) => (event) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        file: event.target.files[0]
      };
      return { ...prev, [section]: updatedSection };
    });
  };

  const addEntry = (section, newEntry) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newEntry],
    }));
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const editId = id || location.state?.employee_id;
      
      if (editId) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/employees/${editId}`);
          
          if (data.success) {
            const employeeData = data.data;
            setFormData({
              employee_id: editId,
              employmentStatus: employeeData.employmentStatus,
              company_registration_no: employeeData.company_registration_no,
              personalPhoto: null,
              personalDetails: {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                fatherName: employeeData.fatherName,
                personalemail: employeeData.personalemail,
                dateOfBirth: employeeData.dateOfBirth?.split('T')[0] || '',
                anniversary: employeeData.anniversary?.split('T')[0] || '',
                gender: employeeData.gender,
                panNumber: employeeData.panNumber,
                adharCardNumber: employeeData.adharCardNumber
              },
              contactInfo: {
                phoneNumber: employeeData.phoneNumber,
                houseNumber: employeeData.houseNumber,
                street: employeeData.street,
                streetName: employeeData.streetName || '',
                area: employeeData.area,
                city: employeeData.city,
                pinCode: employeeData.pinCode
              },
              emergencyContact: {
                mobile: employeeData.mobile,
                landline: employeeData.landline,
              },
              insurance: {
                individualInsurance: employeeData.individualInsurance,
                groupInsurance: employeeData.groupInsurance,
              },
              nominations: employeeData.nominations || [{ name: "", relationship: "", age: "" }],
              qualifications: employeeData.qualifications || [{ degree: "", institution: "", year: "", file: null }],
              certificates: employeeData.certificates || [{ name: "", issuedBy: "", date: "", file: null }]
            });
            
           
            if (employeeData.personalPhotoUrl) {
              setPreviewUrl(employeeData.personalPhotoUrl);
            }
          }
        } catch (error) {
          console.error("Fetch error:", error);
          alert("Error loading employee data");
        }
      }
    };
  
    if (isEditMode) fetchEmployeeData();
  }, [id, location.state, isEditMode]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0); 
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      const editId = id || location.state?.employee_id;
  
      formDataToSend.append("employmentStatus", formData.employmentStatus);
      formDataToSend.append("company_registration_no", formData.company_registration_no);

    
      if (formData.personalPhoto) {
        formDataToSend.append("personalPhoto", formData.personalPhoto);
      }
      
      formDataToSend.append("personalDetails", JSON.stringify(formData.personalDetails));
      formDataToSend.append("contactInfo", JSON.stringify(formData.contactInfo));
      formDataToSend.append("nominations", JSON.stringify(formData.nominations));
      formDataToSend.append("qualifications", JSON.stringify(formData.qualifications));
      formDataToSend.append("certificates", JSON.stringify(formData.certificates));
      formDataToSend.append("insurance", JSON.stringify(formData.insurance));
      formDataToSend.append("emergencyContact", JSON.stringify(formData.emergencyContact));
  
      if (formData.personalDetails.panCardFile) {
        formDataToSend.append("panCardFile", formData.personalDetails.panCardFile);
      }
      if (formData.personalDetails.adharCardFile) {
        formDataToSend.append("adharCardFile", formData.personalDetails.adharCardFile);
      }
      
      formData.qualifications.forEach((qual, index) => {
        if (qual.file) {
          formDataToSend.append(`qualificationFile`, qual.file);
        }
      });
      
      formData.certificates.forEach((cert, index) => {  
        if (cert.file) {
          formDataToSend.append(`certificationFile`, cert.file);
        }
      });
  
      const apiUrl = isEditMode
        ? `http://localhost:5000/api/updateEmployee/${editId}`
        : "http://localhost:5000/api/addEmployee";
  
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: apiUrl,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.success) {
        const {employee_id, companyemail} = response.data.data;
        alert(isEditMode ? "Updated successfully!" : `Employee added successfully!\nEmployeeId: ${employee_id}\nCompanyEmail: ${companyemail}`);
        navigate("/addfinancial", { 
          state: { 
            employee_id: employee_id,
            isEdit: isEditMode
          } 
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const FieldTooltip = ({ title }) => (
    <Tooltip title={title} arrow placement="top">
      <IconButton size="small" sx={{ color: 'gray', ml: 1 }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ maxWidth: 1500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit Personal Details" : "Add Personal Details"}
      </Typography>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Grid container spacing={2}>
          {isEditMode && (
            <Grid item xs={6}>
              <TextField 
                label="Employee ID" 
                fullWidth 
                value={formData.employee_id || ''}
                disabled={true}
              />
            </Grid>
          )}
          <Grid item xs={isEditMode ? 6 : 12}>
            <FormControl fullWidth>
              <InputLabel>Employment Status</InputLabel>
              <Select
                label="Employment Status"
                value={formData.employmentStatus}
                onChange={(e) => handleDirectChange(e, 'employmentStatus')}
                required>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Resigned">Resigned</MenuItem>
                <MenuItem value="Deceased">Deceased</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
  <Typography variant="h6" gutterBottom>
    Personal Details
    <FieldTooltip title="Basic personal information of the employee" />
  </Typography>
  
  <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} md={9}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField 
            label="First Name" 
            fullWidth 
            value={formData.personalDetails.firstName} 
            onChange={(e) => handleChange(e, 'personalDetails', 'firstName')} 
            required 
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField 
            label="Last Name" 
            fullWidth 
            value={formData.personalDetails.lastName} 
            onChange={(e) => handleChange(e, 'personalDetails', 'lastName')} 
            required 
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField 
            label="Father Name" 
            fullWidth 
            value={formData.personalDetails.fatherName} 
            onChange={(e) => handleChange(e, 'personalDetails', 'fatherName')} 
            required 
            error={!!errors.fatherName}
            helperText={errors.fatherName}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField 
            label="Email" 
            fullWidth 
            value={formData.personalDetails.personalemail} 
            onChange={(e) => handleChange(e, 'personalDetails', 'personalemail')} 
            required 
            error={!!errors.personalemail}
            helperText={errors.personalemail}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              value={formData.personalDetails.gender}
              onChange={(e) => handleChange(e, 'personalDetails', 'gender')}
              required
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
    
    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Typography variant="subtitle1" gutterBottom>
        Personal Photo
        <FieldTooltip title="Upload a passport-sized photo (JPEG/PNG, max 2MB)" />
      </Typography>
      <Box 
        sx={{ 
          width: 120, 
          height: 120, 
          border: errors.personalPhoto ? '1px solid red' : '1px dashed grey', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mb: 2,
          position: 'relative'
        }}
      >
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Profile Preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No Photo
          </Typography>
        )}
      </Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="photo-upload"
        type="file"
        onChange={handlePersonalPhotoUpload}
        required
      />
      <label htmlFor="photo-upload">
        <Button variant="outlined" component="span" size="small" color={errors.personalPhoto ? "error" : "primary"}>
          {previewUrl ? 'Change Photo' : 'Upload Photo*'}
        </Button>
      </label>
      {errors.personalPhoto && (
        <FormHelperText error>{errors.personalPhoto}</FormHelperText>
      )}
    </Grid>
  </Grid>
  
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField 
        label="Date of Birth" 
        type="date" 
        fullWidth 
        value={formData.personalDetails.dateOfBirth} 
        InputLabelProps={{ shrink: true }} 
        onChange={(e) => handleChange(e, 'personalDetails', 'dateOfBirth')} 
        required 
        error={!!errors.dateOfBirth}
        helperText={errors.dateOfBirth}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField 
        label="Anniversary" 
        type="date" 
        fullWidth 
        value={formData.personalDetails.anniversary} 
        InputLabelProps={{ shrink: true }} 
        onChange={(e) => handleChange(e, 'personalDetails', 'anniversary')} 
      />
    </Grid>
   
    <Grid item xs={12}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TextField 
              label="PAN Card Number" 
              fullWidth 
              value={formData.personalDetails.panNumber} 
              onChange={(e) => handleChange(e, 'personalDetails', 'panNumber')} 
              required 
              error={!!errors.panNumber}
              helperText={errors.panNumber}
            />
            <FieldTooltip title="Format: ABCDE1234F (5 letters, 4 numbers, 1 letter)" />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" gutterBottom>
              PAN Card File*
              <FieldTooltip title="Upload a scanned copy of PAN card (PDF/JPEG/PNG)" />
            </Typography>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'personalDetails', 'panCardFile')} 
              required
            />
            {errors.panCardFile && (
              <FormHelperText error>{errors.panCardFile}</FormHelperText>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
    
    <Grid item xs={12}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TextField 
              label="Aadhar Card Number" 
              fullWidth 
              value={formData.personalDetails.adharCardNumber} 
              onChange={(e) => handleChange(e, 'personalDetails', 'adharCardNumber')} 
              required 
              error={!!errors.adharCardNumber}
              helperText={errors.adharCardNumber}
            />
            <FieldTooltip title="Format: 12 digits (e.g., 123456789012)" />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" gutterBottom>
              Aadhar Card File*
              <FieldTooltip title="Upload a scanned copy of Aadhar card (PDF/JPEG/PNG)" />
            </Typography>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'personalDetails', 'adharCardFile')} 
              required
            />
            {errors.adharCardFile && (
              <FormHelperText error>{errors.adharCardFile}</FormHelperText>
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
</Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
          <FieldTooltip title="Current residential address and contact details" />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField 
                label="Phone Number" 
                fullWidth 
                value={formData.contactInfo.phoneNumber} 
                onChange={(e) => handleChange(e, 'contactInfo', 'phoneNumber')} 
                required 
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
              <FieldTooltip title="10-digit mobile number without country code" />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="House Number" 
              fullWidth 
              value={formData.contactInfo.houseNumber} 
              onChange={(e) => handleChange(e, 'contactInfo', 'houseNumber')} 
              required 
              error={!!errors.houseNumber}
              helperText={errors.houseNumber}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Street" 
              fullWidth 
              value={formData.contactInfo.street} 
              onChange={(e) => handleChange(e, 'contactInfo', 'street')} 
              required 
              error={!!errors.street}
              helperText={errors.street}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Street Name" 
              fullWidth 
              value={formData.contactInfo.streetName} 
              onChange={(e) => handleChange(e, 'contactInfo', 'streetName')} 
              required
              error={!!errors.streetName}
              helperText={errors.streetName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Area" 
              fullWidth 
              value={formData.contactInfo.area} 
              onChange={(e) => handleChange(e, 'contactInfo', 'area')} 
              required 
              error={!!errors.area}
              helperText={errors.area}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="City" 
              fullWidth 
              value={formData.contactInfo.city} 
              onChange={(e) => handleChange(e, 'contactInfo', 'city')} 
              required 
              error={!!errors.city}
              helperText={errors.city}
            />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField 
                label="Pin Code" 
                fullWidth 
                value={formData.contactInfo.pinCode} 
                onChange={(e) => handleChange(e, 'contactInfo', 'pinCode')} 
                required 
                error={!!errors.pinCode}
                helperText={errors.pinCode}
              />
              <FieldTooltip title="6-digit postal code" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Emergency Contact
          <FieldTooltip title="Contact details in case of emergency" />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField 
                label="Mobile" 
                fullWidth 
                value={formData.emergencyContact.mobile} 
                onChange={(e) => handleChange(e, 'emergencyContact', 'mobile')} 
                required 
                error={!!errors.emergencyMobile}
                helperText={errors.emergencyMobile}
              />
              <FieldTooltip title="10-digit mobile number of emergency contact" />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Landline" 
              fullWidth 
              value={formData.emergencyContact.landline} 
              onChange={(e) => handleChange(e, 'emergencyContact', 'landline')} 
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Health Information
          <FieldTooltip title="Insurance details to be filled by company" />
        </Typography>
        {errors.insurance && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {errors.insurance}
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField 
              label="Individual Insurance" 
              fullWidth 
              value={formData.insurance.individualInsurance} 
              onChange={(e) => handleChange(e, 'insurance', 'individualInsurance')} 
              required 
              error={!!errors.individualInsurance}
              helperText={errors.individualInsurance}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Group Insurance" 
              fullWidth 
              value={formData.insurance.groupInsurance} 
              onChange={(e) => handleChange(e, 'insurance', 'groupInsurance')} 
              required 
              error={!!errors.groupInsurance}
              helperText={errors.groupInsurance}
              />
            </Grid>
          </Grid>
        </Paper>
  
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Nominations
            <FieldTooltip title="Add beneficiary/nominee details for company benefits" />
          </Typography>
          {errors.nominations && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {errors.nominations}
            </Typography>
          )}
          {formData.nominations.map((nomination, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <TextField
                  label="Name"
                  fullWidth
                  value={nomination.name}
                  onChange={handleArrayChange('nominations', index, 'name')}
                  required
                />
              </Grid>
              <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select 
                  value={nomination.relationship} 
                  onChange={handleArrayChange("nominations", index, "relationship")} 
                  label="Relationship" 
                  required
                >
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Child">Child</MenuItem>
                  <MenuItem value="Sibling">Sibling</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Age"
                  fullWidth
                  type="number"
                  value={nomination.age}
                  onChange={handleArrayChange('nominations', index, 'age')}
                  required
                />
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => addEntry('nominations', { name: '', relationship: '', age: '' })}
            sx={{ mt: 1 }}
          >
            Add Nominee
          </Button>
        </Paper>
  
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Qualifications
            <FieldTooltip title="Educational qualifications with supporting documents" />
          </Typography>
          {errors.qualifications && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {errors.qualifications}
            </Typography>
          )}
          {formData.qualifications.map((qualification, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <TextField
                  label="Degree/Diploma"
                  fullWidth
                  value={qualification.degree}
                  onChange={handleArrayChange('qualifications', index, 'degree')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Institution"
                  fullWidth
                  value={qualification.institution}
                  onChange={handleArrayChange('qualifications', index, 'institution')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Year of Completion"
                  fullWidth
                  value={qualification.year}
                  onChange={handleArrayChange('qualifications', index, 'year')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" gutterBottom>
                    Certificate
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleArrayFileUpload('qualifications', index, 'file')}
                  />
                </Box>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => addEntry('qualifications', { degree: '', institution: '', year: '', file: null })}
            sx={{ mt: 1 }}
          >
            Add Qualification
          </Button>
        </Paper>
  
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Certificates and Achievements
            <FieldTooltip title="Professional certifications and achievements" />
          </Typography>
          {errors.certificates && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {errors.certificates}
            </Typography>
          )}
          {formData.certificates.map((certificate, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <TextField
                  label="Certificate Name"
                  fullWidth
                  value={certificate.name}
                  onChange={handleArrayChange('certificates', index, 'name')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Issued By"
                  fullWidth
                  value={certificate.issuedBy}
                  onChange={handleArrayChange('certificates', index, 'issuedBy')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Date of Issue"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={certificate.date}
                  onChange={handleArrayChange('certificates', index, 'date')}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" gutterBottom>
                    Certificate
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleArrayFileUpload('certificates', index, 'file')}
                  />
                </Box>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => addEntry('certificates', { name: '', issuedBy: '', date: '', file: null })}
            sx={{ mt: 1 }}
          >
            Add Certificate
          </Button>
        </Paper>
  
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            {isEditMode ? "Update & Continue" : "Save & Continue"}
          </Button>
        </Box>
      </Box>
    );
  };
  
  export default Addpersonal;