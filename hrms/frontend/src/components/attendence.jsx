import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  IconButton,
  Grid,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  FormGroup,
  FormControlLabel,
  Switch,
  Stack,LinearProgress,Link
} from '@mui/material';
import {
  Refresh,
  AccessTime,
  Person,
  CalendarMonth,
  HourglassEmpty,
  WorkOutline,
  CheckCircle,
  Cancel,
  Warning,
  HowToReg,
  Add,
  Upload,
  Save,
  Close,LocationOn
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api/attendance';

function AttendanceTracker() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    status: 'present',
    date: new Date(),
    in_time: null,
    out_time: null,
    total_hours: '',
  })
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    early: 0,
  });
  

  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    employee_id: '',
    name: '',
    status: 'present',
    date: new Date(),
    in_time: null,
    out_time: null,
    total_hours: '',
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batchEntries, setBatchEntries] = useState([]);
  
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  const calculateStats = () => {
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.status === 'late').length;
    const early = attendance.filter(record => record.in_time && record.in_time < '09:01').length;

    setStats({ present, absent, late, early });
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/all`);
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
      showNotification('Failed to fetch attendance records', 'error');
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    

    if (typeof time === 'number') {
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    

    return time.split(':').slice(0, 2).join(':');
  };
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle fontSize="small" />;
      case 'absent':
        return <Cancel fontSize="small" />;
      case 'late':
        return <Warning fontSize="small" />;
      default:
        return <HowToReg fontSize="small" />;
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
 
  
  const handleManualEntryClose = () => {
    setOpenManualDialog(false);
  };
  
  const handleManualEntryChange = (field, value) => {
    setManualEntry({
      ...manualEntry,
      [field]: value
    });
  };
  
  
  
  const handleRemoveFromBatch = (index) => {
    const updatedEntries = [...batchEntries];
    updatedEntries.splice(index, 1);
    setBatchEntries(updatedEntries);
    showNotification('Entry removed from batch', 'info');
  };

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
    
        const response = await axios.get("http://localhost:5000/api/user/current", {withCredentials: true});
        const employeeId = response.data.employee_id || "";
        const employeeName = response.data.name || ""; 
        
   
        setForm(prevForm => ({
          ...prevForm,
          employee_id: employeeId
        }));
        
        setManualEntry(prevEntry => ({
          ...prevEntry,
          employee_id: employeeId,
          name: employeeName
        }));
      } catch (err) {
        console.error("Failed to fetch employee ID from session:", err);
        setError("Failed to load employee information");
      }
    };
  
    fetchEmployeeId();
  }, []);
  
  const handleManualEntryOpen = () => {
    setOpenManualDialog(true);
    setManualEntry(prevEntry => ({
      ...prevEntry,
      status: 'present',
      date: new Date(),
      in_time: null,
      out_time: null,
      total_hours: '',
  
    }));
    setBatchMode(false);
    setBatchEntries([]);
  };
  const handleSubmitManualEntry = async () => {
    try {
      if (batchMode && batchEntries.length > 0) {
      
        await axios.post(`${API_URL}/batch-entry, { entries: batchEntries }`);
        showNotification(`Successfully added ${batchEntries.length} attendance records, 'success'`);
      } else {
      
        if (!manualEntry.employee_id || !manualEntry.name) {
          showNotification('Employee ID and Name are required', 'error');
          return;
        }
        
        const formattedEntry = {
          ...manualEntry,
          date: format(manualEntry.date, 'yyyy-MM-dd'),
          in_time: manualEntry.in_time ? format(manualEntry.in_time, 'HH:mm') : null,
          out_time: manualEntry.out_time ? format(manualEntry.out_time, 'HH:mm') : null,
        };
        
        await axios.post(`${API_URL}/record, formattedEntry`);
        showNotification('Attendance record added successfully', 'success');
      }
      
   
      setOpenManualDialog(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      showNotification('Failed to save attendance records', 'error');
    }
  };
  

  const handleUploadDialogOpen = () => {
    setOpenUploadDialog(true);
    setSelectedFile(null);
    setUploadProgress(0);
  };
  
  const handleUploadDialogClose = () => {
    setOpenUploadDialog(false);
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
   
      const validExts = ['.xlsx', '.xls', '.csv'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExts.includes(fileExt)) {
        showNotification('Please select a valid Excel file (.xlsx, .xls, .csv)', 'error');
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const handleUploadExcel = async () => {
    if (!selectedFile) {
      showNotification('Please select a file to upload', 'error');
      return;
    }
    
    try {
      setUploading(true);
     
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      
      const response = await axios.post(`${API_URL}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploading(false);
      setOpenUploadDialog(false);
      fetchAttendance();
      
    
      if (response.data.failed && response.data.failed.length > 0) {
        showNotification(`Processed ${response.data.message}, but ${response.data.failed.length} records had errors, 'warning'`);
      } else {
        showNotification(response.data.message, 'success');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      showNotification('Failed to upload Excel file', 'error');
    }
  };
  const handleAddToBatch = () => {
  
    if (!manualEntry.employee_id || !manualEntry.name) {
      showNotification('Employee ID and Name are required', 'error');
      return;
    }
    
 
    const formattedEntry = {
      ...manualEntry,
      date: format(manualEntry.date, 'yyyy-MM-dd'),
      in_time: manualEntry.in_time ? format(manualEntry.in_time, 'HH:mm') : null,
      out_time: manualEntry.out_time ? format(manualEntry.out_time, 'HH:mm') : null,
    };
    
 
    setBatchEntries([...batchEntries, formattedEntry]);
    
  
    setManualEntry(prevEntry => ({
      ...prevEntry,
      status: 'present',
      date: new Date(),
      in_time: null,
      out_time: null,
      total_hours: '',
    }));
    
    showNotification('Entry added to batch', 'success');
  };
  
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1500px' }}>
      <Box sx={{ my: 4 }}>
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Grid container alignItems="center">
                <Grid item xs>
                  <Typography variant="h4" gutterBottom align='center' fontWeight="bold">
                    Employee Attendance Records
                  </Typography>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={2}>
             
                    {/* <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Add />}
                      onClick={handleManualEntryOpen}
                    >
                      Manual Entry
                    </Button> */}
                    
                
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<Upload />}
                      onClick={handleUploadDialogOpen}
                    >
                      Upload Excel
                    </Button>
                    
                    <Tooltip title="Refresh data">
                      <IconButton onClick={fetchAttendance} color="primary">
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ color: '#2e7d32', mr: 1 }} />
                      <Typography variant="h6">Present</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {stats.present}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Cancel sx={{ color: '#c62828', mr: 1 }} />
                      <Typography variant="h6">Absent</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {stats.absent}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ color: '#f57c00', mr: 1 }} />
                      <Typography variant="h6">Late</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {stats.late}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HourglassEmpty sx={{ color: '#1565c0', mr: 1 }} />
                      <Typography variant="h6">Early Arrivals</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {stats.early}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>
                  <Box sx={{  color: 'black',display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'black' }} />
                    Employee ID
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center',color: 'black' }}>
                    <Person sx={{ mr: 1, color: 'black' }} />
                    Name
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' ,color: 'black'}}>
                    <CalendarMonth sx={{ mr: 1, color: 'black' }} />
                    Date
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center',color: 'black' }}>
                    <WorkOutline sx={{ mr: 1, color: 'black' }} />
                    Status
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center',color: 'black' }}>
                    <AccessTime sx={{ mr: 1, color: 'black' }} />
                    In Time
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'black' }}>
                    <LocationOn sx={{ mr: 1, color: 'black' }} />
                    In Location
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center',color: 'black' }}>
                    <AccessTime sx={{ mr: 1, color: 'black' }} />
                    Out Time
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'black' }}>
                    <LocationOn sx={{ mr: 1, color: 'black' }} />
                    Out Location
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center',color: 'black' }}>
                    <HourglassEmpty sx={{ mr: 1, color: 'black' }} />
                    Total Hours
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id} >
                  <TableCell>{record.employee_id}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      color={getStatusColor(record.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatTime(record.in_time)}</TableCell>
                  <TableCell>
                    {formatLocation(record.in_latitude, record.in_longitude)}
                  </TableCell>
                  <TableCell>{formatTime(record.out_time)}</TableCell>
                  <TableCell>
                    {formatLocation(record.out_latitude, record.out_longitude)}
                  </TableCell>
                  <TableCell>
                    {record.total_hours ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {formatTime(record.total_hours)}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
   
      <Dialog open={openManualDialog} onClose={handleManualEntryClose} maxWidth="md" fullWidth>
       
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    label="Employee ID"
    value={manualEntry.employee_id}
    onChange={(e) => handleManualEntryChange('employee_id', e.target.value)}
    required
    InputProps={{ readOnly: true }} 
  />
</Grid>
<Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    label="Employee Name"
    value={manualEntry.name}
    onChange={(e) => handleManualEntryChange('name', e.target.value)}
    required
   
  />
</Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={manualEntry.status}
                    label="Status"
                    onChange={(e) => handleManualEntryChange('status', e.target.value)}
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={manualEntry.date}
                  onChange={(newValue) => handleManualEntryChange('date', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="In Time"
                  value={manualEntry.in_time}
                  onChange={(newValue) => handleManualEntryChange('in_time', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Out Time"
                  value={manualEntry.out_time}
                  onChange={(newValue) => handleManualEntryChange('out_time', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Hours"
                  type="number"
                  value={manualEntry.total_hours}
                  onChange={(e) => handleManualEntryChange('total_hours', e.target.value)}
                  InputProps={{
                    inputProps: { min: 0, step: 0.5 }
                  }}
                />
              </Grid>
              
              {batchMode && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddToBatch}
                    startIcon={<Add />}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Add to Batch
                  </Button>
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>
          
      
          {batchMode && batchEntries.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Batch Entries ({batchEntries.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batchEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.employee_id}</TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={entry.status}
                            color={getStatusColor(entry.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleRemoveFromBatch(index)}>
                            <Close fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualEntryClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitManualEntry} 
            color="primary" 
            variant="contained"
            startIcon={<Save />}
          >
            {batchMode ? 'Save Batch' : 'Save Entry'}
          </Button>
        </DialogActions>
      </Dialog>
      
     
      <Dialog open={openUploadDialog} onClose={handleUploadDialogClose}>
        <DialogTitle>Upload Attendance Excel File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select an Excel file (.xlsx, .xls, .csv) containing attendance records.
            The file should have columns for: employee_id, name, status, date, in_time,
            out_time , and total_hours.
          </DialogContentText>
          <Box sx={{ mt: 3 }}>
            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="excel-file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="excel-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                disabled={uploading}
              >
                Select File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Uploading: {uploadProgress}%
                </Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose} color="inherit" disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadExcel} 
            color="primary" 
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      
  
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AttendanceTracker;