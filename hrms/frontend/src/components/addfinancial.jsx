import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Paper, Grid, TextField, Button } from "@mui/material";

const AddFinancial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const isEditMode = state?.isEdit;
  
  const [formData, setFormData] = useState({
    employeeDetails: {
      employeeId: state?.employee_id || "",
      department: "",
      resignationDate: "",
      noticePeriod: "",
      advanceSalary: "",
      creditCardOffered: "",
    },
    finance: {
      bankName: "",
      accountDetails: "",
      ifscCode: "",
    },
    perviousfinance:{
      currentSalary: "",
      previousSalary:"",
      ctc: "",
      taxCalculation: "",
    }
  });

  const [errors, setErrors] = useState({
    finance: {
      bankName: false,
      accountDetails: false,
      accountDetailsMessage: "",
      ifscCode: false,
      ifscCodeMessage: ""
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (isEditMode && state?.employee_id) {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/api/financial/${state.employee_id}`
          );
          
          if (response.data.success && response.data.data) {
            const financialData = response.data.data; 
            setFormData({
              employeeDetails: {
                employeeId: financialData.employee_id,
                department: financialData.department,
                resignationDate: financialData.resignationDate || "",
                noticePeriod: financialData.noticePeriod || "",
                advanceSalary: financialData.advanceSalary || "",
                creditCardOffered: financialData.creditCardOffered || "",
              },
              finance: {
                bankName: financialData.bankName || "",
                accountDetails: financialData.accountNumber || "", 
                ifscCode: financialData.ifscCode || "",
              },
              perviousfinance:{
                currentSalary: financialData.currentSalary || "",
                previousSalary: financialData.previousSalary || "",
                ctc: financialData.ctc || "",
                taxCalculation: financialData.taxCalculation || "",
              }
            });
          }
        } catch (error) {
          console.error("Error fetching financial data:", error);
          alert("Failed to load financial details");
        } finally {
          setLoading(false);
        }
      }
    };
  
    if (isEditMode) fetchFinancialData();
  }, [isEditMode, state?.employee_id]);

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  
    // Validate fields
    if (section === 'finance') {
      if (field === 'bankName') {
        setErrors(prev => ({
          ...prev,
          finance: {
            ...prev.finance,
            [field]: !value.trim()
          }
        }));
      } else if (field === 'accountDetails') {
        const validation = validateAccountNumber(value);
        setErrors(prev => ({
          ...prev,
          finance: {
            ...prev.finance,
            accountDetails: !validation.isValid,
            accountDetailsMessage: validation.message
          }
        }));
      } else if (field === 'ifscCode') {
        const validation = validateIFSC(value);
        setErrors(prev => ({
          ...prev,
          finance: {
            ...prev.finance,
            ifscCode: !validation.isValid,
            ifscCodeMessage: validation.message
          }
        }));
      }
    }
  };
  const validateAccountNumber = (accountNum) => {
    const accountNumber = accountNum.trim();
    if (!accountNumber) {
      return { isValid: false, message: "Account Number is required" };
    }
    
    // Check if account number only contains digits and is between 9-18 digits
    const accountRegex = /^\d{9,18}$/;
    if (!accountRegex.test(accountNumber)) {
      return { isValid: false, message: "Account Number must be 9-18 digits" };
    }
    
    return { isValid: true, message: "" };
  };
  
  const validateIFSC = (ifsc) => {
    const ifscCode = ifsc.trim();
    if (!ifscCode) {
      return { isValid: false, message: "IFSC Code is required" };
    }
    
    // IFSC code format: First 4 characters are alphabets representing bank, 5th is 0, and last 6 are alphanumeric
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      return { isValid: false, message: "Invalid IFSC format. Should be like 'ABCD0123456'" };
    }
    
    return { isValid: true, message: "" };
  };
    
    
   

  const customLabels = {
    ifscCode: "IFSC Code",
    ctc: "CTC",
  };
  
  const validateForm = () => {
    const accountValidation = validateAccountNumber(formData.finance.accountDetails);
    const ifscValidation = validateIFSC(formData.finance.ifscCode);
    
    const newErrors = {
      finance: {
        bankName: !formData.finance.bankName.trim(),
        accountDetails: !accountValidation.isValid,
        accountDetailsMessage: accountValidation.message,
        ifscCode: !ifscValidation.isValid,
        ifscCodeMessage: ifscValidation.message
      }
    };
  
    setErrors(newErrors);
  
    return !(
      newErrors.finance.bankName || 
      newErrors.finance.accountDetails || 
      newErrors.finance.ifscCode ||
      !formData.employeeDetails.employeeId || 
      !formData.employeeDetails.department
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (!formData.employeeDetails.employeeId || !formData.employeeDetails.department) {
        alert("Employee ID and Department are required!");
      } else {
        alert("Bank Name, Account Number, and IFSC Code are required!");
      }
      return;
    }
  
    try {
      const payload = {
        employee_id: formData.employeeDetails.employeeId,
        department: formData.employeeDetails.department,
        resignationDate: formData.employeeDetails.resignationDate || null,
        noticePeriod: formData.employeeDetails.noticePeriod,
        advanceSalary: formData.employeeDetails.advanceSalary,
        creditCardOffered: formData.employeeDetails.creditCardOffered,
        bankName: formData.finance.bankName,
        accountNumber: formData.finance.accountDetails, 
        ifscCode: formData.finance.ifscCode,
        currentSalary: parseFloat(formData.perviousfinance.currentSalary) || 0,
        previousSalary: parseFloat(formData.perviousfinance.previousSalary) || 0,
        ctc: parseFloat(formData.perviousfinance.ctc) || 0,
        taxCalculation: parseFloat(formData.perviousfinance.taxCalculation) || 0,
      };
  
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: isEditMode 
          ? `http://localhost:5000/api/financial/${formData.employeeDetails.employeeId}`
          : "http://localhost:5000/api/financial",
        data: payload,
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (response.data.success || response.status === 201) {
        alert(`Financial details ${isEditMode ? 'updated' : 'added'} successfully!`);
       
        navigate("/addrole", { 
          state: { 
            employee_id: formData.employeeDetails.employeeId,
            isEdit: isEditMode 
          } 
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to save financial details";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit Financial Details" : "Add Financial Details"}
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom> Employee Details </Typography>
        <Grid container spacing={2}>
          {Object.keys(formData.employeeDetails).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                fullWidth
                label={field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim()}
                type={field === "resignationDate" ? "date" : "text"}
                InputLabelProps={field === "resignationDate" ? { shrink: true } : {}}
                value={formData.employeeDetails[field]}
                onChange={(e) => handleChange(e, "employeeDetails", field)}
                required={["department", "employeeId"].includes(field)}
                disabled={field === "employeeId" && (state?.employee_id || isEditMode)}
                error={["department", "employeeId"].includes(field) && !formData.employeeDetails[field]}
                helperText={["department", "employeeId"].includes(field) && !formData.employeeDetails[field] ? `${field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim()} is required` : ""}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom> Finance Information </Typography>
        <Grid container spacing={2}>
        {Object.keys(formData.finance).map((field) => (
  <Grid item xs={6} key={field}>
    <TextField
      fullWidth
      label={
        customLabels[field] ||
        field
          .replace(/([A-Z])/g, " $1")
          .replace(/\b\w/g, char => char.toUpperCase())
          .trim()
      }
      value={formData.finance[field]}
      onChange={(e) => handleChange(e, "finance", field)}
      required={true}
      error={errors.finance[field]}
      helperText={errors.finance[field] ? 
        (field === 'accountDetails' ? errors.finance.accountDetailsMessage : 
         field === 'ifscCode' ? errors.finance.ifscCodeMessage :
         `${customLabels[field] || field.replace(/([A-Z])/g, " $1").replace(/\b\w/g, char => char.toUpperCase()).trim()} is required`) 
        : ""}
    />
  </Grid>
))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom> Previous Finance Information </Typography>
        <Grid container spacing={2}>
          {Object.keys(formData.perviousfinance).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                fullWidth
                label={
                  customLabels[field] ||
                  field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/\b\w/g, char => char.toUpperCase())
                    .trim()
                }
                value={formData.perviousfinance[field]}
                onChange={(e) => handleChange(e, "perviousfinance", field)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate("/addrole", { 
              state: { 
                employee_id: formData.employeeDetails.employeeId,
                isEdit: isEditMode 
              } 
            })} 
          >
            Role & responsibilities
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddFinancial;