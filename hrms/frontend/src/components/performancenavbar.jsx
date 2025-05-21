import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from "@mui/material";
import {
  Assignment,
  RateReviewOutlined,
  Feedback,
  Timeline,
  AccountTree,
  Person
} from "@mui/icons-material";

export const PerformanceSidebar = ({ isManager }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    if (path === "/navbar") {
      localStorage.removeItem('currentEmployeeId');
      localStorage.removeItem('currentEmployeeName');
      navigate(path);
    } else if (path === "/performance") {
      navigate("/view");
    } else {
      navigate(path);
    }
  };
  
  return (
    <List>
      <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
        Performance
      </Typography>
      <Divider />
      
      {isManager ? (
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation("/performance")}>
            <ListItemText primary="Performance Management" />
          </ListItemButton>
        </ListItem>
      ) : (
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation("/navbar")}>
            <ListItemText primary="View Performance" />
          </ListItemButton>
        </ListItem>
      )}
    </List>
  );
};

const SharedNavbar = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ 
    employee_id: "default", 
    firstName: "Employee", 
    lastName: "View" 
  });
  const [selectedTab, setSelectedTab] = useState('goals');
  
  const navigate = useNavigate();
  const location = useLocation();

  const routeToTab = {
    '/view': 'goals',
    '/viewreview': 'reviews',
    '/viewfeedback': 'feedback',
    '/viewpip': 'improve',
    '/viewsuccession': 'succession'
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const tabValue = routeToTab[currentPath] || 'goals';
    setSelectedTab(tabValue);

 
    const storedEmployeeId = localStorage.getItem('currentEmployeeId');
    const storedEmployeeName = localStorage.getItem('currentEmployeeName');
    
    if (storedEmployeeId) {
      setCurrentUser({
        employee_id: storedEmployeeId,
        firstName: storedEmployeeName || 'Employee',
        lastName: ''
      });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    const routes = {
      'goals': '/view',
      'reviews': '/viewreview',
      'feedback': '/viewfeedback',
      'improve': '/viewpip',
      'succession': '/viewsuccession'
    };
    
    navigate(routes[newValue]);
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={2} sx={{ zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Employee Performance Dashboard
          
          </Typography>
        </Toolbar>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: '#f5f5f5',
            '& .MuiTab-root': { fontWeight: 'medium', py: 1.5 }
          }}
        >
          <Tab icon={<Assignment />} label="Goals & Objectives" value="goals" />
          <Tab icon={<RateReviewOutlined />} label="Performance Reviews" value="reviews" />
          <Tab icon={<Feedback />} label="Feedback System" value="feedback" />
          <Tab icon={<Timeline />} label="Improvement Plans" value="improve" />
          <Tab icon={<AccountTree />} label="Succession Planning" value="succession" />
        </Tabs>
      </AppBar>
      
   
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {selectedTab === 'goals' && 'Goals & Objectives'}
          {selectedTab === 'reviews' && 'Performance Reviews'}
          {selectedTab === 'feedback' && 'Feedback System'}
          {selectedTab === 'improve' && 'Improvement Plans'}
          {selectedTab === 'succession' && 'Succession Planning'}
        </Typography>
        
     
        {children}
      </Box>
    </>
  );
};

export default SharedNavbar;