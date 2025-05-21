import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import { saveNotification } from "../utils/notifications.jsx"; 

const Bonafide = () => {
  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    department: "",
    reason: "",
    address: "",
    candidateEmail: "",
    hrEmail: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
     
        const userResponse = await axios.get("http://localhost:5000/api/user/current", {withCredentials: true});
        const employeeId = userResponse.data.employee_id;
        
        if (employeeId) {
       
          setForm(prevForm => ({
            ...prevForm,
            employee_id: employeeId
          }));
          
        
          const employeeResponse = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
          if (employeeResponse.data.success && employeeResponse.data.data) {
            const employeeData = employeeResponse.data.data;
            setForm(prevForm => ({
              ...prevForm,
              name: `${employeeData.firstName} ${employeeData.lastName}`,
              department: employeeData.department || "",
              candidateEmail: employeeData.companyemail || ""
            }));
          }
          
        
          try {
          
            const rolesResponse = await axios.get(`http://localhost:5000/api/roles/${employeeId}`);
            if (rolesResponse.data.success && rolesResponse.data.data && rolesResponse.data.data.reportingManager) {
              setForm(prevForm => ({
                ...prevForm,
                hrEmail: rolesResponse.data.data.reportingManager
              }));
            } else {
         
              const hrResponse = await axios.get("http://localhost:5000/api/roles/hr-manager");
              if (hrResponse.data.success && hrResponse.data.data && hrResponse.data.data.length > 0) {
                const hrManager = hrResponse.data.data[0]; 
                setForm(prevForm => ({
                  ...prevForm,
                  hrEmail: hrManager.email || ""
                }));
              }
            }
          } catch (hrErr) {
            console.error("Failed to fetch HR email:", hrErr);
       
          }
        }
      } catch (err) {
        console.error("Failed to fetch employee information:", err);
        setError("Failed to load employee information");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      await axios.post("http://localhost:5000/api/bonafide", form, {withCredentials: true});
      
      saveNotification({
        id: Date.now(),
        message: "New Bonafide Request Submitted",
        date: new Date().toISOString(),
        link: "/bonafiedlist",
        read: false
      });
  
      alert("Request Submitted Successfully");
      setForm({
        ...form,
        reason: "",
        address: ""
      
      });
    } catch (err) {
      setError("Failed to submit the request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
      <Container maxWidth="1500px">
        <Box mt={5} p={3} boxShadow={3} borderRadius={2} bgcolor="white">
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Bonafide Request
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField 
                fullWidth 
                margin="normal" 
                label="Name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
              <TextField 
                fullWidth 
                margin="normal" 
                label="Employee ID" 
                name="employee_id" 
                value={form.employee_id} 
                InputProps={{readOnly:true}}
                variant="filled"
              />
            </Box>

            <TextField 
              fullWidth 
              margin="normal" 
              label="Department" 
              name="department" 
              value={form.department} 
              onChange={handleChange} 
              required 
            />

            <TextField
              fullWidth
              margin="normal"
              label="Candidate Email"
              name="candidateEmail"
              type="email"
              value={form.candidateEmail}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              label="HR Email"
              name="hrEmail"
              type="email"
              value={form.hrEmail}
              onChange={handleChange}
              InputProps={{readOnly: form.hrEmail !== ""}}
              required
             
            />
            
            <TextField 
              fullWidth 
              margin="normal" 
              label="Address" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              required 
            />
            
            <TextField 
              fullWidth 
              margin="normal" 
              label="Reason" 
              name="reason" 
              multiline 
              rows={3} 
              value={form.reason} 
              onChange={handleChange} 
              required 
            />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ width: "120px" }} 
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              value="The bonafide certificate will be issued within 2 working days."
              InputProps={{ readOnly: true }}
            />
          </form>
          {error && <Typography color="error" align="center">{error}</Typography>}
        </Box>
      </Container>
    </div>
  );
};

export default Bonafide;



