import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    role: 'employee',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

  
    if (!Object.values(formData).every(Boolean)) {
      setError('All fields are required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/user/register', {
        firstName: formData.firstName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      setSuccess(response.data.message || 'Registration successful!');
      setTimeout(() => navigate(`/login?role=${formData.role}`), 2000);
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError?.errors) {
        setError(serverError.errors[0].msg);
      } else {
        setError(serverError?.message || 'Registration failed. Check console for details');
      }
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>Register</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="firstName"
            fullWidth
            margin="normal"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            margin="normal"
            value={formData.role}
            onChange={handleChange}
          >
            {['employee', 'manager', 'hr'].map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
            inputProps={{ minLength: 6 }}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" type="submit">
              Register
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </Box>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <Button onClick={() => navigate('/login')} color="primary">
              Login here
            </Button>
          </Typography>
        </form>
      </Box>
    </Container>
  );
};

export default Register;