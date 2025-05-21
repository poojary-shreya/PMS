import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Tooltip,
  ListItemText,
  Alert
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
const EmployeeUploadDoc = () => {
  const { register, handleSubmit, reset, setValue, control,formState:{ errors } } = useForm();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");

  const categoryTooltips = {
    hra: "House Rent Allowance - Tax exemption on rent paid for residential accommodation",
    medical_allowance: "Reimbursement for medical expenses incurred by employee",
    newspaper_allowance: "Reimbursement for newspaper subscriptions",
    dress_allowance: "Allowance for formal or work-related clothing expenses",
    other_allowance: "Any allowance not covered in the standard categories",
    section80C_investment: "Deduction up to ₹1.5 lakh for specified investments like PPF, life insurance premiums",
    section80CCC_investment: "Deduction for payments towards pension plans",
    section80D: "Deduction for health insurance premiums paid for self, family, and parents",
    section80CCD_1B: "Additional deduction up to ₹50,000 for contribution to NPS",
    section80CCD_2: "Employer's contribution to NPS (up to 10% of salary)",
    section24_b: "Interest on housing loan for self-occupied property (up to ₹2 lakh)",
    section80E: "Deduction for interest paid on education loan",
    section80EEB: "Deduction for interest on loan for electric vehicle purchase (up to ₹1.5 lakh)",
    otherInvestment: "Any investment not covered under standard tax-saving sections"
  };

  const fieldTooltips = {
    documentName: "Name of the document you're uploading",
    amount: "enter the amount which you want to claim",
    category: "Select the appropriate category for your document",
    file: "Upload supporting document in PDF, JPG, PNG, or DOCX format"
  };

  // Fetch employee ID and documents on component mount
  useEffect(() => {
    // Get employee ID from session
    axios
      .get("http://localhost:5000/api/user/current", { withCredentials: true })
      .then((response) => {
        const id = response.data.employee_id;
        setEmployeeId(id);
        setValue("employee_id", id); // Set the form value
        
        // Then fetch documents
        fetchEmployeeDocuments();
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
        setLoading(false);
      });
  }, [setValue]);

  // Function to fetch employee documents
  const fetchEmployeeDocuments = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/employee/status/documents", { withCredentials: true })
      .then((response) => {
        setDocuments(response.data);
        console.log("Employee documents:", response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
        setLoading(false);
      });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // No need to append employee_id as it will come from the session
      formData.append("document_name", data.document_name);
      formData.append("category", data.category);
      formData.append("amount", data.amount);
      formData.append("files", data.files[0]);

      const response = await axios.post(
        "http://localhost:5000/api/employee/upload-documents",
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true // Include cookies/session
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("File uploaded successfully!");
        
        // Reset form but keep employee_id
        reset({
          employee_id: employeeId
        });
        
        // Refresh the documents list
        fetchEmployeeDocuments();
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message); 
      } else {
        console.error("Error uploading file:", error);
        alert("Upload failed! Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="1500px" sx={{ maxWidth: 1500, mt: 3, boxShadow: 3,}}>
      <Typography variant="h4" gutterBottom textAlign="center" sx={{marginTop:"40px"}} fontWeight="bold">
        Employee Financial Document Upload
      </Typography>
            <Alert
        severity="info"
        sx={{
          mb: 3,
          mt: 2,
          ml:15,
          backgroundColor: 'transparent',
          border: 'none',
          color: 'inherit', 
          boxShadow: 'none' ,
          textAlign:"center"
        }}
      >
        <Typography variant="body1">
          <strong>Please Note:</strong> Document verification and approval process requires three to four working days to complete.
        </Typography>
      </Alert>

    
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ marginBottom: "30px", width: "100%" }}>
        <Grid container spacing={2} sx={{ width: "100%", margin: 0 }}>
          {/* Read-only Employee ID field */}
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              label="Employee ID" 
              {...register("employee_id")} 
              variant="outlined" 
              InputProps={{
                readOnly: true,
              }}
              sx={{ "& .MuiInputBase-input.Mui-disabled": { 
                WebkitTextFillColor: "#000", 
                opacity: 0.8 
              } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
          <Tooltip title={fieldTooltips.documentName} placement="top" arrow>
              <TextField 
                fullWidth
                label="Document Name" 
                {...register("document_name", {
                  required: "Document name is required",
                  minLength: {
                    value: 2,
                    message: "Document name should be at least 2 characters"
                  },
                  
                })}
                variant="outlined" 
                error={!!errors.document_name}
                helperText={errors.document_name?.message}
                
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Tooltip title={fieldTooltips.amount} placement="top" arrow>
              <TextField 
                fullWidth 
                label="Claiming Amount" 
                {...register("amount", { 
                  required: "Amount is required",
                  pattern: {
                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                    message: "Please enter a valid amount"
                  },
                  validate: value => 
                    parseFloat(value) > 0 || "Amount must be greater than zero"
                })} 
                variant="outlined"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Controller
                name="category"
                control={control}
                defaultValue=""
                rules={{ required: "please select a category" }}
                render={({ field }) => (
                  <Select {...field} 
                  label="Category"
                  error={!!errors.category}
                  >
                    
                    {Object.entries(categoryTooltips).map(([value, tooltipText]) => {
                      // Convert value to a readable label
                      const label = value
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                        .replace(/section/i, 'Section ');
                        
                      return (
                        <MenuItem key={value} value={value}>
                          <Box display="flex" alignItems="center">
                            <ListItemText primary={label} />
                            <Tooltip 
                              title={tooltipText} 
                              placement="right" 
                              arrow
                            >
                              <InfoOutlinedIcon 
                                fontSize="small" 
                                sx={{ ml: 1, color: 'grey.500' }} 
                              />
                            </Tooltip>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Tooltip title={fieldTooltips.file}placement="top" arrow>
            <TextField fullWidth type="file" {...register("files", {
               required: "please upload a document or proof"
                })}
                 variant="outlined" 
                 error={!!errors.files}
                //  helperText={errors.amount?.message}
                 inputProps={{ accept: ".pdf,.jpg,.png,.docx" }} />
               </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} display="flex">
            <Button variant="contained" color="primary" type="submit" sx={{width:"150px",height:"50px"}} >
              Upload
            </Button>
          </Grid>
        </Grid>
      </Box>
    
      <Typography variant="h5" gutterBottom>
        My Uploaded Documents
      </Typography>
    
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table sx={{ minWidth: 650 }} aria-label="uploaded documents table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Document Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount Claimed</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Claim Approved</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Remaining Taxable Income</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>File</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(documents) && documents.length > 0 ? (
                documents.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.document_name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {doc.category}
                        {/* {categoryTooltips[doc.category] && (
                          <Tooltip title={categoryTooltips[doc.category]} placement="right" arrow>
                            <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: 'grey.500' }} />
                          </Tooltip>
                        )} */}
                      </Box>
                    </TableCell>
                    <TableCell>{doc.amount}</TableCell>
                    <TableCell>{doc.claimed_amount}</TableCell>
                    <TableCell>{doc.rem_taxable_income}</TableCell>
                    <TableCell>
                      <a href={`http://localhost:5000/uploads/${doc.file_path}`} target="_blank" rel="noopener noreferrer">
                        View File
                      </a>
                    </TableCell>
                    <TableCell>{doc.status || "Pending"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No documents found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default EmployeeUploadDoc;