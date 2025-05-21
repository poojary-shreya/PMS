import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  LinearProgress,
  Link
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ManualAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [name, setName] = useState('');
  const [hasActiveCheckIn, setHasActiveCheckIn] = useState(false);
  const [location, setLocation] = useState(null);
  
  // Get employee's today's records on component mount
  useEffect(() => {
    fetchTodayRecords();
  }, []);
  
  const fetchTodayRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/manual/today', {withCredentials: true});
      setAttendanceRecords(response.data.records || []);
      setSummary(response.data.summary || null);
      setHasActiveCheckIn(response.data.summary?.hasActiveCheckIn || false);
    } catch (err) {
      console.error('Error fetching today\'s records:', err);
      // If 404, it means no records for today, which is fine
      if (err.response && err.response.status !== 404) {
        setError(err.response.data.message || 'Failed to fetch today\'s attendance records.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLocationLoading(true);
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
          setLocationLoading(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          reject(new Error('Unable to retrieve your location. Please enable location services.'));
          setLocationLoading(false);
        },
        { enableHighAccuracy: true }
      );
    });
  };
  
  const handleCheckIn = async () => {
    try {
      if (!name.trim() && attendanceRecords.length === 0) {
        setError('Please enter your name');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Get current location
      const position = await getCurrentLocation();
      
      const response = await axios.post('http://localhost:5000/api/manual/check-in', { 
        name: name || attendanceRecords[0]?.name,
        latitude: position.latitude,
        longitude: position.longitude
      }, {withCredentials: true});
      
      setSuccess(response.data.message);
      await fetchTodayRecords(); // Refresh records
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || err.response?.data?.error || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current location
      const position = await getCurrentLocation();
      
      const response = await axios.post('http://localhost:5000/api/manual/check-out', {
        latitude: position.latitude,
        longitude: position.longitude
      }, {withCredentials: true});
      
      setSuccess(response.data.message);
      await fetchTodayRecords(); // Refresh records
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err.message || err.response?.data?.error || 'Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   const getGoogleMapsLink = (lat, lng) => {
      if (!lat || !lng) return null;
      return `https://www.google.com/maps?q=${lat},${lng}`;
    };
    
    // Format location display
    const formatLocation = (lat, lng) => {
      if (!lat || !lng) return '-';
      
      return (
        <Link 
          href={getGoogleMapsLink(lat, lng)} 
          target="_blank" 
          rel="noopener"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {lat}, {lng}
          {/* <LocationOn fontSize="small" sx={{ ml: 0.5 }} /> */}
        </Link>
      );
    };
  
  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '---';
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          <AccessTimeIcon sx={{ mr: 1, fontSize: 32, verticalAlign: 'middle' }} />
          Attendance System
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Card sx={{ mb: 4, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Today's Attendance Summary
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    icon={attendanceRecords.length > 0 ? <HowToRegIcon /> : <AccessTimeIcon />}
                    label={attendanceRecords.length > 0 ? 'Present' : 'Not Checked In'} 
                    color={attendanceRecords.length > 0 ? 'success' : 'default'} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Entries</Typography>
                <Typography variant="body1">
                  {summary?.totalEntries || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Completed Entries</Typography>
                <Typography variant="body1">
                  {summary?.completedEntries || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {summary?.formatted_total_time || '---'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {attendanceRecords.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table aria-label="attendance entries table">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Sl.No</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>In Location</TableCell>
                  <TableCell>Check-out Time</TableCell>
                  <TableCell>Out Location</TableCell>
                  <TableCell>Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{formatTime(record.in_time)}</TableCell>
                    <TableCell>{formatLocation(record.in_latitude, record.in_longitude)}</TableCell>
                    <TableCell>{record.out_time ? formatTime(record.out_time) : '---'}</TableCell>
                    <TableCell>{formatLocation(record.out_latitude, record.out_longitude)}</TableCell>
                    <TableCell>{record.formatted_time || (record.total_hours ? record.formatted_time : '---')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {attendanceRecords.length === 0 && (
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
            Location Services: {locationLoading ? 'Accessing...' : location ? 'Ready' : 'Required for check-in/out'}
          </Typography>
          {locationLoading && <LinearProgress sx={{ mt: 1 }} />}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            // startIcon={<LoginIcon />}
            onClick={handleCheckIn}
            disabled={loading || hasActiveCheckIn || locationLoading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'In Time'}
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            // startIcon={<ExitToAppIcon />}
            onClick={handleCheckOut}
            disabled={loading || !hasActiveCheckIn || locationLoading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Out Time'}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={success ? "success" : "error"} sx={{ width: '100%' }}>
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManualAttendance;