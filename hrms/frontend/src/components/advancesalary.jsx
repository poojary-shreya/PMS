import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import { saveNotification } from "../utils/notifications.jsx";

const AdvanceSalaryRequest = () => {
  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    department: "",
    salaryAmount: "",
    candidateEmail: "",    
    hrEmail: "",           
    reason: "",
    designation: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingEmployeeId, setFetchingEmployeeId] = useState(true);
  const [fetchingHrEmail, setFetchingHrEmail] = useState(false);

  // Fetch employee ID and basic details
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setFetchingEmployeeId(true);
        const response = await axios.get("http://localhost:5000/api/user/current", {withCredentials: true});
        
        // Set employee details
        setForm(prevForm => ({
          ...prevForm,
          employee_id: response.data.employee_id || "",
          // You can also fetch other details like name if available in the response
          // name: response.data.name || "",
        }));
        
        // After getting employee ID, fetch the HR email
        if (response.data.employee_id) {
          fetchHrEmail(response.data.employee_id);
        }
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
        setError("Failed to fetch employee data. Please try again later.");
      } finally {
        setFetchingEmployeeId(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Function to fetch HR email from the roles table
  const fetchHrEmail = async (employeeId) => {
    try {
      setFetchingHrEmail(true);
      
      // First, get the employee's department from employee details
      const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      const employeeDepartment = employeeResponse.data.data.department;
      
      // Update department and other fields if available
      setForm(prevForm => ({
        ...prevForm,
        department: employeeDepartment || "",
        name: `${employeeResponse.data.data.firstName} ${employeeResponse.data.data.lastName}` || "",
        candidateEmail: employeeResponse.data.data.companyemail || ""
      }));
      
      // Find HR Manager for this department
      const rolesResponse = await axios.get(`http://localhost:5000/api/roles`);
      const hrManager = rolesResponse.data.data.find(role => 
        role.roleType === "HR Manager" && 
        (!employeeDepartment || role.department === employeeDepartment)
      );
      
      if (hrManager) {
        setForm(prevForm => ({
          ...prevForm,
          hrEmail: hrManager.email || ""
        }));
      } else {
        // Fallback: Get any HR Manager if department-specific one not found
        const anyHrManager = rolesResponse.data.data.find(role => 
          role.roleType === "HR Manager"
        );
        
        if (anyHrManager) {
          setForm(prevForm => ({
            ...prevForm,
            hrEmail: anyHrManager.email || ""
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch HR email:", err);
      // We don't set error here to not block the form submission
    } finally {
      setFetchingHrEmail(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      await axios.post("http://localhost:5000/api/salary-request", form, {withCredentials: true});
  
      saveNotification({
        id: Date.now(),
        message: "New Salary Advance Request Submitted",
        date: new Date().toISOString(),
        link: "/salaryrequest",
        read: false
      });
  
      alert("Request submitted successfully!");
    
      const employee_id = form.employee_id;
      const hrEmail = form.hrEmail; 
      setForm({
        name: "",
        employee_id,
        department: "",
        salaryAmount: "",
        candidateEmail: "",
        hrEmail, 
        reason: "",
        designation: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
      <Container maxWidth="1500px">
        <Box mt={5} p={3} boxShadow={3} borderRadius={2} bgcolor="white">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Advance Salary Request
          </Typography>
          {fetchingEmployeeId ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField fullWidth margin="normal" label="Name" name="name" value={form.name} onChange={handleChange} required />
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Employee ID" 
                  name="employee_id" 
                  value={form.employee_id} 
                  InputProps={{ readOnly: true }}
                  sx={{ 
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#000",
                      backgroundColor: "#f5f5f5"
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField fullWidth label="Candidate Email" name="candidateEmail" value={form.candidateEmail} onChange={handleChange} required />
                <TextField 
                  fullWidth 
                  label="HR Email" 
                  name="hrEmail" 
                  value={form.hrEmail} 
                  onChange={handleChange} 
                  required
                  InputProps={{
                    readOnly: !!form.hrEmail, // Make it readonly if HR email is auto-filled
                    endAdornment: fetchingHrEmail ? <CircularProgress size={20} /> : null
                  }}
              
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField fullWidth margin="normal" label="Department" name="department" value={form.department} onChange={handleChange} required />
                <TextField fullWidth margin="normal" label="Salary Amount Requested" name="salaryAmount" value={form.salaryAmount} onChange={handleChange} required />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField fullWidth margin="normal" label="Reason" name="reason" value={form.reason} onChange={handleChange} required />
                <TextField fullWidth margin="normal" label="Designation" name="designation" value={form.designation} onChange={handleChange} required />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ width: "120px" }} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={24} /> : "Submit "}
                </Button>
              </Box>
              <TextField fullWidth margin="normal" value="Please apply at least 3 days in advance " InputProps={{ readOnly: true }} />
            </form>
          )}
          {error && <Typography color="error" align="center">{error}</Typography>}
        </Box>
      </Container>
    </div>
  );
};

export default AdvanceSalaryRequest;