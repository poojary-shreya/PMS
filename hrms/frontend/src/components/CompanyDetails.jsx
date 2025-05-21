
import React, { useState } from "react";
import { Box, TextField, Button, Typography, Grid, Paper, Divider } from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";


const CompanyDetails = () => {
    const [accounts, setAccounts] = useState([{ accountNumber: "", purpose: "" , bankname:"", ifsc:""}]);

  const [companyData, setCompanyData] = useState({
    companyname: "",
    registration_no: "",
    contactemail: "",
    contactNumber: "",
    companyLogo:null,
    hq:"",
    address: "",
    tan: "",
    pfTrustName:"",
    pfRegno:"",
    pfAddress:""
  });

  const handleAccountChange = (e, index) => {
    const { name, value } = e.target;
    const newAccounts = [...accounts];
    newAccounts[index][name] = value;
    setAccounts(newAccounts);
  };
  
  const addAccount = () => {
    setAccounts([...accounts, { accountNumber: "", purpose: "",bankname:"",ifsc:"" }]);
  };
  
  const removeAccount = (index) => {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
  };
  

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!companyData.companyLogo) newErrors.companyLogo = "Company Logo is required";

    if (!companyData.companyname) newErrors.companyname = "Company name is required.";
    if (!companyData.registration_no) newErrors.registration_no = "Registration number is required.";

    if (!companyData.contactemail) {
      newErrors.contactemail = "Email is required.";
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(companyData.contactemail)) {
      newErrors.contactemail = "Enter a valid email.";
    }

    if (!companyData.contactNumber) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!/^\d{10}$/.test(companyData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits.";
    }

    if (!companyData.address) newErrors.address = "Address is required.";
    if (!companyData.branchLocation) newErrors.branchLocation = "branch Location is required.";
    if (!companyData.hq) newErrors.hq = "head quaters is required.";

    if (!companyData.tan) {
      newErrors.tan = "TAN is required.";
    } else if (!/^[A-Za-z]{4}\d{5}[A-Za-z]{1}$/.test(companyData.tan)) {
      newErrors.tan = "TAN should be alphanumeric with 10 characters.";
    }
    accounts.forEach((account, index) => {
        if (!account.accountNumber) {
          newErrors[`accountNumber_${index}`] = `Account number is required for account ${index + 1}`;
        } else if (!/^\d{9,18}$/.test(account.accountNumber)) {
          newErrors[`accountNumber_${index}`] = `Invalid account number for account ${index + 1}`;
        }
  
        if (!account.purpose) {
          newErrors[`purpose_${index}`] = `Purpose is required for account ${index + 1}`;
        }

        if (!account.ifsc) {
          newErrors[`ifsc_${index}`] = `IFSC code is required ${index+1}.`;
        } else if (!/^[A-Za-z]{4}\d{7}$/.test(account.ifsc)) {
          newErrors[`ifsc_${index}`] = `IFSC code must be 4 letters followed by 7 digits${index+1}`;
        }
        if (!account.bankname){

         newErrors[`bankname_${index}`] = `bank name is required ${index+1}`;
        }
      });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setCompanyData({ ...companyData, companyLogo: e.target.files[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const formData = new FormData();
  
        Object.keys(companyData).forEach((key) => {
          if (key === "companyLogo") {
            if (companyData.companyLogo) {
              formData.append("companyLogo", companyData.companyLogo);
            }
          } else {
            formData.append(key, companyData[key]);
          }
        });
  
        formData.append("accounts", JSON.stringify(accounts));
  
        await axios.post("http://localhost:5000/api/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        alert("Company created successfully!");
  
        setCompanyData({
          companyname: "",
          registration_no: "",
          contactemail: "",
          contactNumber: "",
          companyLogo: null,
          hq: "",
          address: "",
          branchLocation: "",
          tan: "",
          pfTrustName: "",
          pfRegno: "",
          pfAddress: "",
        });
  
        setAccounts([{ accountNumber: "", purpose: "", bankname: "", ifsc: "" }]);
      } catch (error) {
        console.error("Error creating company:", error);
        alert("Failed to create company. Please try again.");
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Add Company Details
      </Typography>

      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Company Details
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField
              label="Company Name"
              name="companyname"
              value={companyData.companyname}
              onChange={handleChange}
              error={!!errors.companyname}
              helperText={errors.companyname}
              fullWidth
              required
            />
          </Grid>
        
            <Grid item xs={6}>
            <TextField
              label="Registration No."
              name="registration_no"
              value={companyData.registration_no}
              onChange={handleChange}
              error={!!errors.registration_no}
              helperText={errors.registration_no}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
              <Typography>Company Logo:</Typography>
                <input
                  type="file"
                  accept="image/*"
                  error={!!errors.companyLogo}
              helperText={errors.companyLogo}
                  onChange={(e) => setCompanyData({ ...companyData, companyLogo: e.target.files[0] })}
                />        
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Contact Email"
              name="contactemail"
              value={companyData.contactemail}
              onChange={handleChange}
              error={!!errors.contactemail}
              helperText={errors.contactemail}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={companyData.contactNumber}
              onChange={handleChange}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="head Quaters"
              name="hq"
              value={companyData.hq}
              onChange={handleChange}
              error={!!errors.hq}
              helperText={errors.hq}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Branch Location"
              name="branchLocation"
              value={companyData.branchLocation}
              onChange={handleChange}
              error={!!errors.branchLocation}
              helperText={errors.branchLocation}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={companyData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              fullWidth
              required
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Paper>


<Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
  <Typography variant="h6" gutterBottom>
    Account Details
  </Typography>
  <Divider sx={{ marginBottom: 2 }} />

  {accounts.map((acc, index) => (
    <Grid container spacing={2} key={index} alignItems="center">
      <Grid item xs={6}>
        <TextField
        margin="normal"
          label="Account Number"
          name="accountNumber"
          value={acc.accountNumber}
          error={!!errors[`accountNumber_${index}`]}
          helperText={errors[`accountNumber_${index}`]}
          onChange={(e) => handleAccountChange(e, index)}
          fullWidth
          required
        />
      </Grid>

      <Grid item xs={6} >
        <TextField
        margin="normal"
          label="Purpose"
          name="purpose"
          value={acc.purpose}
          error={!!errors[`purpose_${index}`]}
          helperText={errors[`purpose_${index}`]}
          onChange={(e) => handleAccountChange(e, index)}
          fullWidth
          required
        /></Grid>
      <Grid item xs={5.8}>
      <TextField
        label="Bank Name"
        name="bankname"
        value={acc.bankname}
        error={!!errors[`bankname_${index}`]}
          helperText={errors[`bankname_${index}`]}
          onChange={(e) => handleAccountChange(e, index)}
        fullWidth
        required
      />
    </Grid>

    <Grid item xs={5.8}>
      <TextField
        label="IFSC Code"
        name="ifsc"
        value={acc.ifsc}
        error={!!errors[`ifsc_${index}`]}
          helperText={errors[`ifsc_${index}`]}
          onChange={(e) => handleAccountChange(e, index)}
        fullWidth
        required
      />
    </Grid>
      

      {index > 0 && (

        <CloseIcon
          sx={{ cursor: "pointer", color: "balck", marginLeft: 1 , marginTop:3}}
          onClick={() => removeAccount(index)}
        />

      )}
    </Grid>
  ))}

  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
    <Button variant="outlined" onClick={addAccount}>
      Add Another Account
    </Button>
  </Box>

  <Grid container spacing={2} sx={{ marginTop: 2 }}>

    <Grid item xs={12}>
      <TextField
        label="TAN"
        name="tan"
        value={companyData.tan}
        error={!!errors.tan}
        helperText={errors.tan}
        onChange={handleChange}
        fullWidth
        required
      />
    </Grid>
  </Grid>
</Paper>

<Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
  <Typography variant="h6" gutterBottom>
    PF/Trust Details(if applicable)
  </Typography>
  <Divider sx={{ marginBottom: 2 }} />
  <Grid container spacing={2}>

    <Grid item xs={6}>
      <TextField
        label="Trust Name"
        name="trustName"
        value={companyData.pfTrustName || ""}
        onChange={handleChange}
        fullWidth
      />
    </Grid>

    <Grid item xs={6}>
      <TextField
        label="Registration Number"
        name="pfRegistrationNo"
        value={companyData.pfRegno || ""}
        onChange={handleChange}
        fullWidth
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        label="Trust Address"
        name="trustAddress"
        value={companyData.pfAddress || ""}
        onChange={handleChange}
        fullWidth
        required
        multiline
        rows={2}
      />
    </Grid>
  </Grid>


  </Paper>




      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Button variant="contained" onClick={handleSubmit} size="large">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default CompanyDetails;