import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Chip,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';
import PhoneIcon from '@mui/icons-material/Phone';


const EmployeeHierarchyTree = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddRoleDialog, setOpenAddRoleDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [newRole, setNewRole] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    department: "",
    reportingManagerId: "",
    companyemail: "",
    contactNumber: "",
    location: "",
    roleType: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      
   
      let employeeData;
      if (response.data.success && Array.isArray(response.data.data)) {
        employeeData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeeData = response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        employeeData = [];
      }
      
  
      const employeesWithPhotos = employeeData.filter(e => e.personalPhoto && e.personalPhoto.trim() !== '');
      console.log(`Found ${employeesWithPhotos.length} employees with photos out of ${employeeData.length} total`);
      
      if (employeesWithPhotos.length === 0) {
        console.warn("No employees have personalPhoto values - check your database or API");
      }
      
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setErrorMessage("Failed to load employee data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = (employee, size = {width: 60, height: 60}, borderColor = "#2e7d32") => {
 
    if (!employee) {
      return (
        <Avatar 
          sx={{ 
            mx: 'auto',
            mb: 1,
            bgcolor: '#f5f5f5',
            width: size.width,
            height: size.height,
            fontSize: `${Math.floor(size.width/2.5)}px`,
            border: `3px solid ${borderColor}`,
            color: '#888'
          }}
        >
          {"??"}
        </Avatar>
      );
    }
    
    const initials = getInitials(employee.firstName, employee.lastName);
    
    if (employee.personalPhoto && employee.personalPhoto.trim() !== '') {
      let photoPath = employee.personalPhoto.trim();
      
      const imageUrl = photoPath.startsWith('http') 
        ? photoPath 
        : `http://localhost:5000/uploads/${photoPath.replace(/^\/+/g, '')}`;
      
      console.log(`Rendering avatar for ${employee.employee_id} with image URL: ${imageUrl}`);
      
      const testImg = new Image();
      testImg.src = imageUrl;
      testImg.onload = () => console.log(`Image loaded successfully: ${imageUrl}`);
      testImg.onerror = () => console.error(`Failed to load image: ${imageUrl}`);
      
      return (
        <Avatar 
          src={imageUrl}
          alt={formatFullName(employee)}
          sx={{ 
            mx: 'auto',
            width: size.width, 
            height: size.height, 
            fontSize: `${Math.floor(size.width/2.5)}px`,
            mb: 1,
            bgcolor: getRoleColor(employee.roleType),
            border: `3px solid ${borderColor}`,
          }}
        
          onError={(e) => {
            console.error(`Failed to load image in component: ${imageUrl} for employee ${employee.employee_id}`);
            e.target.onerror = null; 
            e.target.src = ""; 
          }}
        >
          {initials}
        </Avatar>
      );
    } else {
      return (
        <Avatar 
          sx={{ 
            mx: 'auto',
            mb: 1,
            bgcolor: getRoleColor(employee.roleType) || '#f5f5f5',
            width: size.width,
            height: size.height,
            fontSize: `${Math.floor(size.width/2.5)}px`,
            border: `3px solid ${borderColor}`,
            color: employee.roleType ? 'white' : '#333'
          }}
        >
          {initials}
        </Avatar>
      );
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/roles');
      
      const rolesData = response.data.success 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
      
      setRoles(rolesData);
    } finally {
      setLoading(false);
    }
  };

  const mergeEmployeeAndRoleData = () => {
    return employees.map(employee => {
      const employeeRole = roles.find(role => role.employee_id === employee.employee_id);
      return {
        ...employee,
        ...employeeRole,
        reportingManagerId: employee.reportingManagerId || 
                        (employeeRole?.reportingManager ? findEmployeeIdByEmail(employeeRole.reportingManager) : null)
      };
    });
  };

  const findEmployeeIdByEmail = (email) => {
    const employee = employees.find(emp => emp.companyemail === email);
    return employee ? employee.employee_id : null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage("Please enter an employee ID, name, or email to search");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSelectedEmployee(null);

      const mergedData = mergeEmployeeAndRoleData();
      
      const foundEmployee = mergedData.find(emp => 
        emp.employee_id?.toLowerCase() === searchQuery.toLowerCase() ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.companyemail && emp.companyemail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.fullName && emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (foundEmployee) {
        setSelectedEmployee(foundEmployee);
      } else {
        try {
          const response = await axios.get(`http://localhost:5000/api/search-employee?query=${encodeURIComponent(searchQuery)}`);
          
          if (response.data.success && response.data.data) {
            const apiEmployee = response.data.data;
            
            const roleInfo = roles.find(role => role.employee_id === apiEmployee.employee_id);
            const enrichedEmployee = {
              ...apiEmployee,
              ...roleInfo
            };
            
            setSelectedEmployee(enrichedEmployee);
            
            if (!employees.some(e => e.employee_id === apiEmployee.employee_id)) {
              setEmployees(prev => [...prev, apiEmployee]);
            }
          } else {
            setErrorMessage("No employee found with the provided details");
          }
        } catch (error) {
          setErrorMessage("EMPLOYEE NOT FOUND ");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const findDirectReports = (employeeId) => {
    const mergedData = mergeEmployeeAndRoleData();
    
    return mergedData.filter(emp => {
      if (emp.reportingManagerId === employeeId) {
        return true;
      }
      
      const manager = employees.find(e => e.employee_id === employeeId);
      if (manager && manager.companyemail && emp.reportingManager === manager.companyemail) {
        return true;
      }
      
      return false;
    });
  };

  const handleEmployeeClick = async (employee) => {
    try {
      setLoading(true);
      
      let enrichedEmployee = {...employee};
      
      if (!employee.roleType) {
        const roleInfo = roles.find(role => role.employee_id === employee.employee_id);
        if (roleInfo) {
          enrichedEmployee = {
            ...enrichedEmployee,
            ...roleInfo
          };
        } else if (employee.companyemail) {
          const roleResponse = await axios.get(`http://localhost:5000/api/roles/${employee.employee_id}`);
          if (roleResponse.data.success && roleResponse.data.data) {
            enrichedEmployee = {
              ...enrichedEmployee,
              ...roleResponse.data.data
            };
            setRoles(prev => [...prev.filter(r => r.employee_id !== employee.employee_id), roleResponse.data.data]);
          }
        }
      }
      
      setEmployeeDetails(enrichedEmployee);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error getting employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerClick = async (managerEmail) => {
    try {
      setLoading(true);
      
      const existingManager = employees.find(emp => emp.companyemail === managerEmail);
      
      if (existingManager) {
        handleEmployeeClick(existingManager);
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/search-employee?query=${encodeURIComponent(managerEmail)}`);
      
      if (response.data.success && response.data.data) {
        const managerData = response.data.data;
        
        if (!employees.some(e => e.employee_id === managerData.employee_id)) {
          setEmployees(prev => [...prev, managerData]);
        }
        
        handleEmployeeClick(managerData);
      } else {
        setErrorMessage(`Manager with email ${managerEmail} not found`);
      }
    } catch (error) {
      console.error("Error finding manager:", error);
      setErrorMessage("Error loading manager details");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };
  
  const closeAddRoleDialog = () => {
    setOpenAddRoleDialog(false);
    setNewRole({
      firstName: "",
      lastName: "",
      designation: "",
      department: "",
      reportingManagerId: "",
      companyemail: "",
      contactNumber: "",
      location: "",
      roleType: ""
    });
  };
  
  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return (firstName[0] || '') + (lastName[0] || '');
    } else if (firstName) {
      return firstName[0] || '';
    } else {
      return "??";
    }
  };

  const getRoleColor = (roleType) => {
    switch (roleType) {
      case 'Manager':
        return "#2196f3"; 
      case 'Team Lead':
        return "#4caf50"; 
      case 'Individual Contributor':
        return "#d32f2f"; 
      case 'Support Staff':
        return "#ff9800"; 
      default:
        return "#d32f2f";
    }
  };

  const formatFullName = (employee) => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.fullName) {
      return employee.fullName;
    } else {
      return "Unknown";
    }
  };

  const getDirectReportCount = (employeeId) => {
    const directReports = findDirectReports(employeeId);
    return directReports.length;
  };

  const renderFamilyTree = (employee, level = 0) => {
    const directReports = findDirectReports(employee.employee_id);
    const roleInfo = roles.find(role => role.employee_id === employee.employee_id);
    
    const enrichedEmployee = {
      ...employee,
      ...roleInfo
    };
    
    const reportCount = getDirectReportCount(employee.employee_id);
    
    let managerInfo = null;
    let managerEmail = "";
    
    if (employee.reportingManagerId) {
      managerInfo = employees.find(emp => emp.employee_id === employee.reportingManagerId);
    } else if (employee.reportingManager) {
      managerInfo = employees.find(emp => 
        emp.companyemail === employee.reportingManager || 
        emp.email === employee.reportingManager
      );
      
      managerEmail = employee.reportingManager;
    }
    
    let managerRoleInfo = null;
    if (managerInfo) {
      managerRoleInfo = roles.find(role => role.employee_id === managerInfo.employee_id);
    }
    
    const employeeColor = getRoleColor(enrichedEmployee.roleType);
    const managerColor = managerInfo ? getRoleColor(managerRoleInfo?.roleType || 'Manager') : '#2196f3';
    
    // Group employees by their manager
    const employeesByManager = {};
    
    // Only show manager once at the top
    return (
      <Box key={employee.employee_id} sx={{ textAlign: 'center', width: '100%' }}>
        {level === 0 && managerInfo && (
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Box 
              sx={{ 
                display: 'inline-block',
                position: 'relative'
              }}
            >
              {renderAvatar(managerInfo, {width: 60, height: 60}, "#1976d2")}
              
              <Card 
                sx={{ 
                  width: 280,
                  borderRadius: '4px',
                  backgroundColor: '#fcebb3',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleEmployeeClick(managerInfo)}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                    {formatFullName(managerInfo)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'black', opacity: 0.9 }}>
                    {managerInfo.designation || managerRoleInfo?.roleType || "Manager"}
                  </Typography>
                  {managerRoleInfo?.department && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'black', opacity: 0.8 }}>
                      {managerRoleInfo.department}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'black', opacity: 0.8 }}>
                    {managerInfo.companyemail || managerInfo.email || managerEmail || "No email available"}
                  </Typography>
                </CardContent>
              </Card>
              
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                Reporting Manager
              </Typography>
            </Box>
              
            <Box sx={{ position: 'relative', mt: 0, mb: 2, height: 70 }}>
              <Box
                sx={{
                  position: 'absolute',
                  height: '100%',
                  width: 2,
                  bgcolor: '#546e7a',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '12px solid #546e7a'
                }}
              />
            </Box>
          </Box>
        )}
          
        <Box sx={{ display: 'inline-block', position: 'relative' }}>
          {renderAvatar(employee, {width: 60, height: 60}, "#2e7d32")}
            
          <Card 
            sx={{ 
              width: 240,
              borderRadius: '4px',
              backgroundColor: '#fcebb3',
              color: 'black',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }
            }}
            onClick={() => handleEmployeeClick(enrichedEmployee)}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'black' }}>
                {formatFullName(employee)}
              </Typography>
              {enrichedEmployee.department && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'black', opacity: 0.8 }}>
                  {enrichedEmployee.roleType}
                </Typography>
              )}
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'black', opacity: 0.8 }}>
                {enrichedEmployee.companyemail || employee.companyemail || enrichedEmployee.email || employee.email || "No email available"}
              </Typography>
            </CardContent>
          </Card>
            
          {reportCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: '#455a64',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                border: '2px solid white',
                zIndex: 2
              }}
            >
              {reportCount}
            </Box>
          )}
        </Box>
          

        {directReports.length > 0 && (
  <>
    <Box 
      sx={{ 
        height: 30, 
        width: 2, 
        bgcolor: '#546e7a', 
        mx: 'auto',
        mt: 2
      }} 
    /> 
      
    <Box sx={{ position: 'relative', mt: 1, mb: 2 }}>
      {directReports.length > 1 && (
        <Box 
          sx={{ 
            position: 'absolute',
            height: 2,
            bgcolor: '#546e7a',
            top: 0,
            left: `${100 / (directReports.length * 2)}%`,
            right: `${100 / (directReports.length * 2)}%`
          }}
        />
      )}
      
      {/* Fixed Grid container with proper spacing */}
      <Grid 
        container 
        spacing={4} 
        wrap="nowrap"
        justifyContent="center"
        sx={{
          minWidth: directReports.length * 250, // Ensure minimum width based on number of reports
          '& > .MuiGrid-item': {
            minWidth: 230, // Ensure each item has minimum width
            flex: '1 1 0px', // Make items grow equally
          }
        }}
      >
        {directReports.map((report, index) => (
          <Grid item key={report.employee_id} sx={{ width: `${100 / directReports.length}%` }}>
            <Box sx={{ position: 'relative' }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 30, 
                  width: 2, 
                  bgcolor: '#546e7a', 
                  mx: 'auto',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '10px solid #546e7a'
                  }}
                />
              </Box>
              {renderFamilyTree(report, level + 1)}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  </>
)}
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1400, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Employee search
      </Typography>
      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10}>
            <TextField
              fullWidth
              label="Search by Employee ID, Name or Email"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} /> : "Search"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {errorMessage && (
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 3, bgcolor: '#ffebee', borderRadius: '8px' }}>
          <Typography color="error">{errorMessage}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>


{selectedEmployee && (
  <Paper 
    elevation={3} 
    sx={{ 
      p: 3, 
      borderRadius: '12px',
      maxHeight: '80vh',
      overflow: 'hidden'
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
      Employee Hierarchy Visualization
    </Typography>
    
    {/* The outer box handles scrolling */}
    <Box sx={{ 
      height: 'calc(80vh - 100px)',
      width: '100%',
      overflowY: 'auto',
      overflowX: 'auto'
    }}>
      {(() => {
        // Calculate direct reports for selected employee
        const directReports = findDirectReports(selectedEmployee.employee_id);
        
        // Calculate total width needed for the tree
        // This is a recursive function to find the total width needed
        const calculateTotalWidth = (employee, level = 0) => {
          const reports = findDirectReports(employee.employee_id);
          
          if (reports.length === 0) {
            return 250; // Width for a single node with no children
          }
          
          // Calculate total width of all children
          let totalChildrenWidth = 0;
          reports.forEach(report => {
            totalChildrenWidth += calculateTotalWidth(report, level + 1);
          });
          
          // Return max of children width or minimum width for this node
          return Math.max(totalChildrenWidth, 250);
        };
        
        // Calculate minimum required width based on the tree structure
        const totalTreeWidth = calculateTotalWidth(selectedEmployee);
        
        // Ensure we have enough width - add extra padding
        const minWidth = Math.max(totalTreeWidth + 200, 1200);
        
        return (
          <Box sx={{ 
            width: minWidth,
            minWidth: '100%',
            paddingX: 4,
            paddingBottom: 10,
            // Important: center the content properly
            display: 'flex',
            justifyContent: 'center',
            margin: '0 auto'
          }}>
            {renderFamilyTree(selectedEmployee)}
          </Box>
        );
      })()}
    </Box>
  </Paper>
)}

          {!selectedEmployee && !loading && (
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: '12px' }}>
              <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Search for an employee to view their organizational hierarchy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter an employee ID, name or email to explore their organizational structure
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Employee & Role Details
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {employeeDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  {/* Use the improved renderAvatar function for consistency */}
                  {renderAvatar(employeeDetails, {width: 120, height: 120}, getRoleColor(employeeDetails.roleType))}
                  <Typography variant="h6" align="center">
                    {formatFullName(employeeDetails)}
                  </Typography>
                  <Chip 
                    label={employeeDetails.designation || employeeDetails.roleType || "Employee"} 
                    color="primary" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>Employee Information</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BadgeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                        <Typography variant="body1">{employeeDetails.employee_id}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Department</Typography>
                        <Typography variant="body1">{employeeDetails.department || "Not specified"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">PhoneNumber</Typography>
                        <Typography variant="body1">{employeeDetails.phoneNumber || "Not specified"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{employeeDetails.companyemail || employeeDetails.email || "Not available"}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Role Type</Typography>
                        <Typography variant="body1">{employeeDetails.roleType || "Not specified"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  {employeeDetails.reportingManager && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Reporting Manager</Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'primary.main', 
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              '&:hover': { color: 'primary.dark' }
                            }}
                            onClick={() => handleManagerClick(employeeDetails.reportingManager)}
                          >
                            {employeeDetails.reportingManager}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', marginLeft: 40 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      setSelectedEmployee(employeeDetails);
                      closeDialog();
                    }}
                  >
                    View Organization Chart
                  </Button>
                </Box>
              </Grid>
              
            
              
              {findDirectReports(employeeDetails.employee_id).length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Direct Reports ({findDirectReports(employeeDetails.employee_id).length})
                  </Typography>
                  <Grid container spacing={2}>
                    {findDirectReports(employeeDetails.employee_id).map(report => (
                      <Grid item xs={12} sm={6} md={4} key={report.employee_id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
                          }}
                          onClick={() => handleEmployeeClick(report)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: getRoleColor(report.roleType), mr: 2 }}>
                                {getInitials(report.firstName, report.lastName)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1">{formatFullName(report)}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {report.designation || report.roleType || "Employee"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {report.companyemail || report.email || "No email available"}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}     sx={{ fontWeight: 'bold', color: 'primary' }} 
          >Close</Button>
        </DialogActions>
      </Dialog>
   
    </Box>
  );
};

export default EmployeeHierarchyTree;