import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Claims = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/current", { withCredentials: true })
      .then((response) => {
        const id = response.data.employee_id;
        setEmployeeId(id);
        setValue("employee_id", id);
        
        fetchEmployeeClaims();
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
        setLoading(false);
      });
  }, [setValue]);

  const fetchEmployeeClaims = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/claims/employee-claims", { withCredentials: true })
      .then((response) => {
        setClaims(response.data);
        console.log("Employee claims:", response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching claims:", error);
        setLoading(false);
      });
  };

  const openClaimDialog = () => {
    setOpen(true);
    setError(null);
  };

  const closeClaimDialog = () => {
    setOpen(false);
    reset({
      employee_id: employeeId
    });
    setError(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("purpose", data.purpose);
      formData.append("proofDocuments", data.proofDocuments[0]);

      const response = await axios.post(
        "http://localhost:5000/api/claims/submit",
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Claim submitted successfully!");
        
        reset({
          employee_id: employeeId
        });
        
        
        setOpen(false);
        
        
        fetchEmployeeClaims();
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setError(error.response.data.message); 
      } else {
        console.error("Error submitting claim:", error);
        setError("Submission failed! Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="1500px" sx={{ maxWidth: 1500, mt: 3, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom textAlign="center" sx={{marginTop:"40px",paddingTop:"8px"}} fontWeight="bold">
        Employee Claims Management
      </Typography>
      
      <Box display="flex" justifyContent="flex-start" mb={3}>
        <Button variant="contained" color="primary" onClick={openClaimDialog} sx={{width:"150px",height:"50px"}}>
          Submit Claim
        </Button>
      </Box>
      
      
      <Dialog open={open} onClose={closeClaimDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Submit New Claim
          <IconButton onClick={closeClaimDialog} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
           
            <TextField 
              fullWidth 
              label="Employee ID" 
              {...register("employee_id")} 
              variant="outlined" 
              value={employeeId}
              disabled
              InputProps={{
                readOnly: true,
              }}
              margin="normal"
              sx={{ "& .MuiInputBase-input.Mui-disabled": { 
                WebkitTextFillColor: "#000", 
                opacity: 0.8 
              } }}
            />
            
            <Tooltip title="Enter the claim amount (e.g., 500.00)" placement="top" arrow>
            <TextField 
              fullWidth 
              label="Amount" 
              {...register("amount", { 
                required: "Amount is required",
                pattern: {
                  value: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "Please enter a valid amount (up to 2 decimal places)"
                },
                min: {
                  value: 1,
                  message: "Amount must be at least 1"
                }
              })} 
              variant="outlined" 
              margin="normal"
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
            </Tooltip>
            
            <Tooltip title="Describe the reason for this claim"  placement="top" arrow>
            <TextField 
              fullWidth 
              label="Purpose" 
              {...register("purpose", { 
                required: "Purpose is required",
                minLength: {
                  value: 5,
                  message: "Purpose should be at least 5 characters"
                },
                maxLength: {
                  value: 100,
                  message: "Purpose should not exceed 100 characters"
                }
              })} 
              variant="outlined" 
              margin="normal"
              multiline
              rows={2}
              error={!!errors.purpose}
              helperText={errors.purpose?.message}
            />
            </Tooltip>
            
            <Tooltip title="Upload a valid file (PDF, JPG, PNG, DOCX)"  placement="top" arrow>
            <TextField 
              fullWidth 
              type="file" 
              {...register("proofDocuments", { 
                required: "Proof document is required"
              })} 
              variant="outlined" 
              margin="normal"
              inputProps={{ accept: ".pdf,.jpg,.png,.docx" }} 
              error={!!errors.proofDocuments}
              helperText={errors.proofDocuments?.message}
            />
            </Tooltip>

            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Box display="flex" justifyContent="center" mt={3} gap={2}>
              <Button variant="contained" color="primary" type="submit" sx={{width:"150px",height:"50px"}}>
                Submit Claim
              </Button>
              <Button variant="outlined" color="secondary" onClick={closeClaimDialog} sx={{width:"150px",height:"50px"}}>
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    
      <Typography variant="h5" gutterBottom>
        My Claims History
      </Typography>
    
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table sx={{ minWidth: 650, marginBottom:"10px" }} aria-label="claims table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Sl.NO</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Submitted Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Purpose</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Proof Document</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(claims) && claims.length > 0 ? (
                claims.map((claim, index) => (
                  <TableRow key={index}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{claim.purpose}</TableCell>
                    <TableCell>₹{claim.amount}</TableCell>
                    <TableCell>
                      <a href={`http://localhost:5000/uploads/${claim.proof_path}`} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    </TableCell>
                    <TableCell>
                     
                        {claim.status}
                      
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No claims found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Claims;