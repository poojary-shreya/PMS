import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Collapse,
  Divider,
  Badge,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Work as RecruitmentIcon,
  People as PeopleIcon,
  MonetizationOn as PayrollIcon,
  RequestPage as RequestIcon,
  EventNote as LeaveIcon,
  AccessTime as AttendanceIcon,
  School as TrainingIcon,
  Assessment as PerformanceIcon,
  PersonAdd as AddPersonIcon,
  Notifications as NotificationsIcon,
  Receipt as Form16Icon,
  Visibility as ViewIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
  Assignment as AssessmentIcon
} from '@mui/icons-material';

import PaymentsIcon from '@mui/icons-material/Payments';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import BugReportIcon from '@mui/icons-material/BugReport';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const isLoggedIn = !!token;
  const role = userRole || null;
  const [notifications, setNotifications] = useState([]);
  const [openProjects, setOpenProjects] = useState(false);
  const [openActiveProjects, setOpenActiveProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
 
  const [openMenus, setOpenMenus] = useState({
    recruitment: false,
    employeeManagement: false,
    payroll: false,
    employeeRequest: false,
    leave: false,
    attendance: false,
    performance: false,
    training: false,
    projectManagement: false,
    projects: false,
    activeProjects: false
  });

  // Fetch project data from API
  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`);
      if (response.data.status === "success") {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching project details:", error);
      return null;
    }
  };

  // Effect to handle project selection from URL or localStorage
  useEffect(() => {
    const loadProjectData = async () => {
      // Check if the URL contains a project ID
      const projectMatch = location.pathname.match(/\/project\/([^/]+)/);
      
      if (projectMatch && projectMatch[1]) {
        const projectId = projectMatch[1];
        
        // First, try to get from localStorage
        try {
          const storedProject = localStorage.getItem("selectedProject");
          let projectData = {};
          
          try {
            projectData = JSON.parse(localStorage.getItem("projectData") || "{}");
          } catch (error) {
            console.error("Error parsing project data:", error);
            projectData = {};
          }
          
          // Use the project ID from URL if it exists
          const currentProjectId = projectId || storedProject;
          
          if (currentProjectId) {
            // First check if we already have this project in localStorage
            if (projectData[currentProjectId]) {
              setSelectedProject({
                id: currentProjectId,
                name: projectData[currentProjectId].name || `Project ${currentProjectId}`
              });
              setSelectedProjectName(projectData[currentProjectId].name || `Project ${currentProjectId}`);
            } else {
              // If not in localStorage, fetch from API
              const projectDetails = await fetchProjectDetails(currentProjectId);
              
              if (projectDetails) {
                // Update with actual project name from database
                setSelectedProject({
                  id: currentProjectId,
                  name: projectDetails.name || `Project ${currentProjectId}`
                });
                setSelectedProjectName(projectDetails.name || `Project ${currentProjectId}`);
                
                // Update localStorage for future use
                const newProjectData = { ...projectData };
                newProjectData[currentProjectId] = {
                  id: currentProjectId,
                  name: projectDetails.name,
                  // Add other relevant project details as needed
                };
                localStorage.setItem("projectData", JSON.stringify(newProjectData));
              } else {
                // Fallback if API call fails
                setSelectedProject({
                  id: currentProjectId,
                  name: `Project ${currentProjectId}`
                });
                setSelectedProjectName(`Project ${currentProjectId}`);
              }
            }
            
            // Auto-expand the menus when a project is selected
            setOpenMenus(prev => ({
              ...prev,
              projectManagement: true,
              projects: true,
              activeProjects: true,
              [`project-${currentProjectId}`]: true  // Ensure the project submenu is open
            }));
          }
        } catch (error) {
          console.error("Error handling project selection:", error);
          
          // Attempt to fetch from API as fallback
          const projectDetails = await fetchProjectDetails(projectId);
          
          if (projectDetails) {
            setSelectedProject({
              id: projectId,
              name: projectDetails.name || `Project ${projectId}`
            });
            setSelectedProjectName(projectDetails.name || `Project ${projectId}`);
          } else {
            setSelectedProject({
              id: projectId,
              name: `Project ${projectId}`
            });
            setSelectedProjectName(`Project ${projectId}`);
          }
          
          // Auto-expand the menus when a project is selected
          setOpenMenus(prev => ({
            ...prev,
            projectManagement: true,
            projects: true,
            activeProjects: true,
            [`project-${projectId}`]: true  // Ensure the project submenu is open
          }));
        }
      } else {
        // No project in URL, but check if there's one in localStorage
        const storedProject = localStorage.getItem("selectedProject");
        if (storedProject) {
          try {
            const projectData = JSON.parse(localStorage.getItem("projectData") || "{}");
            
            if (projectData[storedProject]) {
              setSelectedProject({
                id: storedProject,
                name: projectData[storedProject].name || `Project ${storedProject}`
              });
              setSelectedProjectName(projectData[storedProject].name || `Project ${storedProject}`);
            } else {
              // If not in localStorage, fetch from API
              const projectDetails = await fetchProjectDetails(storedProject);
              
              if (projectDetails) {
                setSelectedProject({
                  id: storedProject,
                  name: projectDetails.name || `Project ${storedProject}`
                });
                setSelectedProjectName(projectDetails.name || `Project ${storedProject}`);
                
                // Update localStorage for future use
                const newProjectData = JSON.parse(localStorage.getItem("projectData") || "{}");
                newProjectData[storedProject] = {
                  id: storedProject,
                  name: projectDetails.name,
                  // Add other relevant project details as needed
                };
                localStorage.setItem("projectData", JSON.stringify(newProjectData));
              } else {
                // Fallback
                setSelectedProject({
                  id: storedProject,
                  name: `Project ${storedProject}`
                });
                setSelectedProjectName(`Project ${storedProject}`);
              }
            }
            
            // Also expand the necessary menus
            if (location.pathname.includes('/project/')) {
              setOpenMenus(prev => ({
                ...prev,
                projectManagement: true,
                projects: true,
                activeProjects: true,
                [`project-${storedProject}`]: true
              }));
            }
          } catch (error) {
            console.error("Error parsing project data:", error);
            setSelectedProject(null);
          }
        } else {
          setSelectedProject(null);
          setSelectedProjectName("");
        }
      }
    };
    
    loadProjectData();
  }, [location.pathname]);

  const handleMenuToggle = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  // Handle clicking on Active Projects menu item
  const handleActiveProjectsClick = () => {
    // Toggle the active projects submenu
    handleMenuToggle('activeProjects');
    // Navigate to active projects page
    navigate('/active-projects');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        setNotifications(storedNotifications.filter((n) => !n.read));
      } catch (error) {
        console.error("Error parsing notifications:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

 
  if (!isLoggedIn) {
    return null;
  }

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const rolePermissions = {
    hr: ["recruitment", "employeeManagement", "employeeRequest", "payroll", "leave", "attendance", "performance", "training", "projectManagement"],
    manager: ["recruitment", "employeeManagement", "leave", "attendance", "performance", "payroll", "projectManagement"],
    employee: ["employeeManagement", "employeeRequest", "leave", "performance", "attendance", "payroll", "recruitment", "training", "projectManagement"],
  };

  const isHR = role === "hr";
  const isManager = role === "manager" || role === "hr";
  const isEmployee = role === "employee";

  const getMenuItems = () => {
    const items = [];

    // Recruitment Section
    if (rolePermissions[role]?.includes("recruitment")) {
      items.push({
        title: "Recruitment & Onboarding",
        icon: <RecruitmentIcon />,
        key: "recruitment",
        submenu: isHR ? [
          { name: "Job Posting", path: "/job-posting" },
          { name: "Job View", path: "/jobview" },
          {name:"Job Referral", path:"/refer"},
          { name: "Candidate Filter", path: "/candidates" },
          { name: "Interview Scheduling", path: "/interview-scheduling" },
          { name: "Interview Status", path: "/status" },
          { name: "Create Offer", path: "/offer" },
          {name: "Offer Management", path:"/sendoffer"},
          { name: "Onboarding Processes", path: "/onboarding" },
          { name: "Onboarding List", path: "/OnboardingList" },

        ] : isEmployee ? [
         
          { name: "Employee Document Upload", path: "/upload" },
          {name:"Job Referral", path:"/refer"},

        ] : isManager ? [
          {name:"Offer Approval", path:"/offerapproval"},
          {name:"Job Referral", path:"/refer"},

        ]:[]
      });
    }

    // Employee Management Section
    if (rolePermissions[role]?.includes("employeeManagement")) {
      items.push({
        title: "Employee Management",
        icon: <PeopleIcon />,
        key: "employeeManagement",
        submenu: role === "hr" ? [
          { 
            name: "Add Employee", 
            path: null,
            icon: <AddPersonIcon />,
            submenu: [
              { name: "Add Personal Details", path: "/addpersonal" },
              { name: "Add Financial Details", path: "/addfinancial" },
              { name: "Add Roles", path: "/addrole" },
              { name: "Contract Employees", path: "/contract"},
            ]
          },
          { 
            name: "View Employees", 
            path: null,
            icon: <ViewIcon />,
            submenu: [
              { name: "View Personal Details", path: "/viewpersonal" },
              { name: "View Financial Details", path: "/viewfinancial" },
              { name: "View Roles", path: "/viewrole" },
              { name: "Contract Employee's List", path: "/contractlist"},
            ]
          },
          { 
            name: "Search Employees", 
            path: "/search",
            icon: <Search />
          },
          {
            name:"Employee request",
            path:null,
            icon: <AddPersonIcon />,
            submenu: [
              { name: "Bonafide Request list", path: "/bonafiedlist" },
              { name: "Advance Salary Request list", path: "/salaryrequest" },
              
            ]
          },{
            name:"Training",
    
          icon: <TrainingIcon />,
        
          submenu: [
            { name: "Knowledge Management", path: "/training" },
            { name: "Training List", path: "/trainings" },
               { name: "Add videos", path: "/video" },
            { name: "Add test", path: "/test" }
          ]
        },
    
        ] : role === "employee" ? [
          { name: "Employee Profile", path: "/employee" },
          {name:"Employee Request" ,path:null,
            icon: <AddPersonIcon />,
            submenu: [
              { name: "Bonafide ", path: "/bonafied" },
              { name: "Advance Salary  ", path: "/advancesalary" },
              { name: "View Certificate ", path: "/certificate" },
            ]
          },
          {
            name:"Training",
            icon: <AddPersonIcon />,
            submenu: [
              { name: "View training", path: "/updatetraining" }
            ]
          }
        ] : []
      });
    }

    // Payroll Section
    if (rolePermissions[role]?.includes("payroll")) {
      items.push({
        title: "Payroll",
        icon: <PayrollIcon />,
        key: "payroll",
        submenu: role === "hr" ? [
          { name: "Company Account Details", path: "/companydetails" },
          { name: "Upload CTC details", path: "/upload-salary" },
          // { name: "View Document", path: "/view-document" },
          { name: "Property Loss Details", path: "/view-lossproperty" },
          { name: "Investment Proof Approval", path: "/proofapproval" },
          { name: "Allowance Proof Approval", path: "/allowanceproofapproval" },
          { name: "Payroll Calculation", path: "/payroll-calculation" },
          { name: "Generate Payslip", path: "/generate-payslip" },
          { 
            name: "Form16", 
            path: null,
            icon: <Form16Icon />,
            submenu: [
              { name: "Form16 (Part A)", path: "/form16-partA" },
              { name: "Form16 (Part B)", path: "/form16-partB" }
            ]
          },
          {name:"Form12BB", path:"/viewform12bb"},
          { name: "Tax", 
            path: null,
            icon:<PaymentsIcon/>,
            submenu: [
              { name: "Monthly Tax (Specific)", path: "/monthly-tax-specific" },
              { name: "Yearly Tax (Specific)", path: "/yearly-tax-specific" },
              { name: "Monthly Tax (All)", path: "/monthly-tax-all" },
              { name: "Yearly Tax (All)", path: "/yearly-tax-all" }
            ]
          },
        ] : role==="manager"?[
          // {name:"Claims",path:"/viewclaims"}
          { name: "Allowance Proof Approval", path: "/allowanceproofapproval" },

        ]:
         [
          // {name :"Personal Details", path:"/personal"},
          {name:"Transactions",
            path:null,
            icon:<PaymentsIcon/>,
            submenu:[
              // {name:"Flex Planner", path:"/Flexplanner"},
              // {name:"Voluntary PF",path:"/vpf"},
              {name:"Investment Declaration",path:"/investmentdec"},
              // {name:"Loss On Property Declaration",path:"/lossproperty"},
              {name:"Submit Investment Proof",path:"/investmentproof"},
              // {name:"Claim Reimbursement", path:"/claims"},
              
              
            ]
          },
          {name:"Financial",
            path:null,
            icon:<PaymentsIcon/>,
            submenu:[
              // {name:"HRA Receipt Form", path:"/hrareceipt"},
              // {name:"HRA Undertaking Form", path:"/hraform"},
              // {name:"ESS", path:"/ess"},
              // {name:"ESOP Statement", path:"/esop"},
              // {name:"RISU Statement",path:"/risu"},
              // {name:"Current AGP",path:"/agp"},
              {name: "Claims", path:"/allowanceclaim"},
              { name: "View CTC Details", path: "/view-ctc" },
              { name: "Projected Tax", path: "/projected-tax" }
            ]
          },
          // { name: "View CTC Details", path: "/view-ctc" },
          // { name: "Submit Financial Document", path: "/submit-document" },
          // { name: "Projected Tax", path: "/projected-tax" },
          { name: "Employee Payslip", path: "/view-payslip" },
          { name: "Form 16", path: "/form16" },
          {name: "Form12BB", path:"/form12bb"},
          // {name: "Claims", path:"/allowanceclaim"},
        ]
      });
    }

    // Leave Section
    if (rolePermissions[role]?.includes("leave")) {
      items.push({
        title: "Leave",
        icon: <LeaveIcon />,
        key: "leave",
        submenu: isManager ? [
          { name: "Manage Leave Requests", path: "/manager" }
        ] : [
          { name: "Apply for Leave", path: "/leave" }
        ]
      });
    }

    // Attendance Section
    if (rolePermissions[role]?.includes("attendance")) {
      items.push({
        title: "Attendance",
        icon: <AttendanceIcon />,
        key: "attendance",
        submenu: role === "employee" ? [
          { name: "Manual Entry", path: "/manual-entry" }
        ] : [
          { name: "Attendance List", path: "/attendance" }
        ]
      });
    }

    // Performance Section
    if (rolePermissions[role]?.includes("performance")) {
      items.push({
        title: "Performance",
        icon: <PerformanceIcon />,
        key: "performance",
        submenu: isManager ? [
          { name: "Performance Management", path: "/performance" }
        ] : [
          { name: "View Performance", path: "/viewreview" }
        ]
      });
    }

    // Project Management Section
if (rolePermissions[role]?.includes("projectManagement")) {
  items.push({
    title: "Project Management",
    icon: <AssignmentIcon />,
    key: "projectManagement",
    submenu: role === "manager" ? [
      {
        name: "Dashboard",
        path: "/dash",
        icon: <DashboardIcon />
      },
      {
        name: "Projects",
        path: null,
        icon: <AssignmentIcon />,
        key: "projects",
        submenu: [
          { name: "All Projects", path: "/pro" },
          { name: "Create Project", path: "/create-project" },
          {
            name: "Active Projects",
            path: "/active-projects",
            key: "activeProjects",
            onClick: handleActiveProjectsClick,
            submenu: selectedProject ? [
              {
                name: selectedProjectName || `Project ${selectedProject.id}`,
                path: null,
                key: `project-${selectedProject.id}`,
                submenu: [
                  { name: "Roadmap", path: `/project/${selectedProject.id}/roadmap` },
                  // { name: "Timeline", path: `/project/${selectedProject.id}/timeline` },
                  { name: "New Request", path: `/project/${selectedProject.id}/new-request` },
                  { name: "Change Request", path: `/project/${selectedProject.id}/change-request` },
                  {
                    name: "Backlog",
                    path: `/project/${selectedProject.id}/backlog`,
                    key: `project-${selectedProject.id}-backlog`,
                  },
                   
                      {
                        name: "Sprint",
                      
                        key: `project-${selectedProject.id}-backlog-sprint`,
                        submenu: [
                          // { 
                          //   name: "Create Sprint", 
                          //   path: `/project/${selectedProject.id}/backlog/sprint/create`,
                          //   key: `project-${selectedProject.id}-backlog-sprint-create`
                          // },
                          { 
                            name: "Active Sprint", 
                            // path: `/project/${selectedProject.id}/backlog/sprint/active`,
                            path:'/activesprint',
                            key: `project-${selectedProject.id}-backlog-sprint-active`
                          },
                          { 
                            name: "Completed Sprints", 
                            path: `/project/${selectedProject.id}/backlog/sprint/completed`,
                            key: `project-${selectedProject.id}-backlog-sprint-completed`
                          }
                        ]
                      }
                   ,
                 
                  { name: "Calendar", path: `/project/${selectedProject.id}/calendar` },
                  {
                    name: "Dashboard", 
                    path: `/project/${selectedProject.id}/db`,
                    key: `project-${selectedProject.id}-dashboard` // Add a unique key
                  }
                ]
              }
            ] : []
          },
          { name: "Project Updates", path: "/proupdates" }
        ]
      },
      {
        name: "Team Management",
        path: null,
        icon: <GroupIcon />,
        submenu: [
          { name: "Create Team", path: "/createteam" },
          { name: "Assign Team Members", path: "/assignteam" },
          { name: "Manage Team", path: "/manageteam" },
        ]
      },
      {
        name: "Change Requirements",
        path: null,
        icon: <BugReportIcon />,
        submenu: [
          { name: "Create Change Requirement", path: "/createtask" },
          { name: "All Change Requirements", path: "/tasks" },
                 ]
      },
      // {
      //   name: "Calendar",
      //   path: "/calendar",
      //   icon: <CalendarTodayIcon />
      // },
    ] : role === "employee" ? [
      { name: "My Task", path: "/mytasks" }
    ] : []
  });
}
    
    return items;
  };

  const renderNestedSubmenu = (submenuItems, parentPath = "", level = 1) => {
    if (!submenuItems) return null;
    
    return submenuItems.map((subItem) => {
      const itemKey = subItem.key || `${subItem.name.replace(/\s+/g, '')}`;
      
      if (subItem.submenu) {
        return (
          <React.Fragment key={itemKey}>
            <ListItem
              button
              sx={{
                pl: open ? 2 + (level * 2) : 2,  // Increase padding based on nesting level
                '&:hover': { backgroundColor: '#dee3dc' },
                backgroundColor: 'transparent',
                justifyContent: open ? 'flex-start' : 'center',
                color: 'black'
              }}
              onClick={() => {
                if (subItem.onClick) {
                  subItem.onClick();
                } else {
                  handleMenuToggle(itemKey);
                }
              }}
              component={subItem.path ? Link : 'div'}
              to={subItem.path || undefined}
            >
              {subItem.icon && (
                <ListItemIcon 
                  sx={{ 
                    minWidth: open ? 30 : 'auto', 
                    justifyContent: 'center', 
                    color: 'inherit',
                    '& .MuiSvgIcon-root': { 
                      fontSize: '1.2rem' 
                    }
                  }}
                >
                  {subItem.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={open ? subItem.name : ''} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    color: 'black',
                    fontWeight: subItem.name === selectedProjectName ? 'bold' : 'normal'
                  } 
                }}
              />
              {open && (openMenus[itemKey] ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
            </ListItem>
            <Collapse in={open && openMenus[itemKey]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNestedSubmenu(subItem.submenu, subItem.path || parentPath, level + 1)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      } else {
        // Calculate actual path if needed
        const actualPath = subItem.path || (parentPath ? `${parentPath}/${subItem.name.toLowerCase()}` : '');
        const isActive = location.pathname === actualPath;
        
        return (
          <Tooltip 
            key={itemKey}
            title={open ? "" : subItem.name}
            placement="right"
          >
            <ListItem
              button
              component={Link}
              to={actualPath}
              sx={{
                pl: open ? 2 + (level * 2) : 2,
                '&:hover': { backgroundColor: '#dee3dc' },
                backgroundColor: isActive ? '#d5e2e5' : 'transparent',
                justifyContent: open ? 'flex-start' : 'center',
                color: 'black',
                textDecoration: 'none',
                '& .MuiListItemText-root': { 
                  color: 'black'
                }
              }}
            >
              {subItem.icon && (
                <ListItemIcon 
                  sx={{ 
                    minWidth: open ? 30 : 'auto', 
                    justifyContent: 'center', 
                    color: 'inherit',
                    '& .MuiSvgIcon-root': { 
                      fontSize: '1.2rem' 
                    }
                  }}
                >
                  {subItem.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={open ? subItem.name : ''} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    color: 'black'
                  } 
                }}
              />
            </ListItem>
          </Tooltip>
        );
      }
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 290 : 72,
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: open ? 290 : 72,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          overflowY: 'auto', 
          marginTop: "70px",
          backgroundColor: '#f0f4f8',
          borderRight: '1px solid #e0e0e0',
          height: 'calc(100vh - 70px)',
          '&::-webkit-scrollbar': {
            width: '1px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#f0f4f8',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f0f4f8',
          }
        },
        '& a': {
          color: 'black',
          textDecoration: 'none'
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'space-between' : 'center', 
          p: 1,
          position: 'sticky',
          top: 0,
          backgroundColor: '#f0f4f8',
          zIndex: 1,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <IconButton onClick={toggleSidebar}>
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ pb: 8 }}> 
        {getMenuItems().map((item) => {
          const itemKey = item.key || item.title;
          
          return (
            <React.Fragment key={itemKey}>
              <ListItem
                button
                onClick={() => handleMenuToggle(itemKey)}
                sx={{
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: '#dee3dc' },
                  justifyContent: open ? 'flex-start' : 'center',
                  color: 'black'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: open ? 30 : 'auto', 
                  justifyContent: 'center', 
                  color: 'inherit',
                  '& .MuiSvgIcon-root': { 
                    fontSize: '1.3rem' 
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText 
                  primary={item.title} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      color: 'black'
                    } 
                  }}
                />}
                {open && (openMenus[itemKey] ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
              </ListItem>
              <Collapse in={open && openMenus[itemKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderNestedSubmenu(item.submenu)}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;