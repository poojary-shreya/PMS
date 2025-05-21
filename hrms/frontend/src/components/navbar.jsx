import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  Container,
  Divider,
  ListItemIcon,
  Badge,
  IconButton,
  ListItemText,
  List,
  ListItem,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import img from "../assets/bdot-removebg-preview.png";

const getNotifications = () => {
  try {
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    return notifications;
  } catch (error) {
    console.error("Error parsing notifications from localStorage:", error);
    return [];
  }
};

const saveNotification = (notification) => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem("notifications", JSON.stringify(notifications));
};

const rolePermissions = {
  hr: ["recruitment", "employeeManagement", "employeeRequest", "payroll", "leave", "attendance", "performance", "training"],
  manager: ["recruitment", "employeeManagement", "leave", "attendance", "performance", "payroll"],
  employee: ["employeeManagement", "employeeRequest", "leave", "performance", "attendance", "payroll", "recruitment", "training"],
};


const navigationItems = [

  { name: "Job Posting", path: "/job-posting", feature: "recruitment", roles: ["hr"] },
  { name: "Job View", path: "/jobview", feature: "recruitment", roles: ["hr", "manager", "employee"] },
  { name: "Job Referral", path: "/refer", feature: "recruitment", roles: ["hr", "employee"] },
  { name: "Candidate Filter", path: "/candidates", feature: "recruitment", roles: ["hr"] },
  { name: "Interview Scheduling", path: "/interview-scheduling", feature: "recruitment", roles: ["hr"] },
  { name: "Interview Status", path: "/status", feature: "recruitment", roles: ["hr"] },
  { name: "Create Offer", path: "/offer", feature: "recruitment", roles: ["hr"] },
  { name: "Offer Management", path: "/sendoffer", feature: "recruitment", roles: ["hr"] },
  { name: "Onboarding Processes", path: "/onboarding", feature: "recruitment", roles: ["hr"] },
  { name: "Onboarding List", path: "/OnboardingList", feature: "recruitment", roles: ["hr"] },
  { name: "Employee Document Upload", path: "/upload", feature: "recruitment", roles: ["employee"] },
  

  { name: "Add Personal Details", path: "/addpersonal", feature: "employeeManagement", roles: ["hr"] },
  { name: "Add Financial Details", path: "/addfinancial", feature: "employeeManagement", roles: ["hr"] },
  { name: "Add Roles", path: "/addrole", feature: "employeeManagement", roles: ["hr"] },
  { name: "View Personal Details", path: "/viewpersonal", feature: "employeeManagement", roles: ["hr"] },
  { name: "View Financial Details", path: "/viewfinancial", feature: "employeeManagement", roles: ["hr"] },
  { name: "View Roles", path: "/viewrole", feature: "employeeManagement", roles: ["hr"] },
  { name: "Employee Profile", path: "/employee", feature: "employeeManagement", roles: ["employee"] },
  { name: "Search Employees", path: "/search", feature: "employeeManagement", roles: ["hr"] },

  
  { name: "Bonafide", path: "/bonafied", feature: "employeeRequest", roles: ["employee"] },
  { name: "Advance Salary", path: "/advancesalary", feature: "employeeRequest", roles: ["employee"] },
  { name: "View Certificates", path: "/certificate", feature: "employeeRequest", roles: ["employee"] },
  { name: "Bonafide Request List", path: "/bonafiedlist", feature: "employeeRequest", roles: ["hr"] },
  { name: "Advance Salary Request List", path: "/salaryrequest", feature: "employeeRequest", roles: ["hr"] },


  { name: "Knowledge Management", path: "/training", feature: "training", roles: ["hr"] },
  { name: "Training List", path: "/trainings", feature: "training", roles: ["hr", "manager"] },
  { name: "Add Videos", path: "/video", feature: "training", roles: ["hr"] },
  { name: "Add Test", path: "/test", feature: "training", roles: ["hr"] },
  { name: "View Training", path: "/updatetraining", feature: "training", roles: ["employee"] },


  { name: "Company Account Details", path: "/companydetails", feature: "payroll", roles: ["hr"] },
  { name: "Upload CTC Details", path: "/upload-salary", feature: "payroll", roles: ["hr"] },
  { name: "View Document", path: "/view-document", feature: "payroll", roles: ["hr"] },
  { name: "Investment Proof Approval", path: "/proofapproval", feature: "payroll", roles: ["hr"] },
  { name: "Payroll Calculation", path: "/payroll-calculation", feature: "payroll", roles: ["hr"] },
  { name: "Generate Payslip", path: "/generate-payslip", feature: "payroll", roles: ["hr"] },
  { name: "View Loss House Property", path: "/viewlossproperty", feature: "payroll", roles: ["hr"] },
  { name: "Form16 (Part A)", path: "/form16-partA", feature: "payroll", roles: ["hr"] },
  { name: "Form16 (Part B)", path: "/form16-partB", feature: "payroll", roles: ["hr"] },
  { name: "Form12BB", path: "/viewform12bb", feature: "payroll", roles: ["hr"] },
  { name: "Monthly Tax (Specific)", path: "/monthly-tax-specific", feature: "payroll", roles: ["hr"] },
  { name: "Yearly Tax (Specific)", path: "/yearly-tax-specific", feature: "payroll", roles: ["hr"] },
  { name: "Monthly Tax (All)", path: "/monthly-tax-all", feature: "payroll", roles: ["hr"] },
  { name: "Yearly Tax (All)", path: "/yearly-tax-all", feature: "payroll", roles: ["hr"] },
  { name: "Claims", path: "/viewclaims", feature: "payroll", roles: ["manager"] },
  { name: "Personal Details", path: "/personal", feature: "payroll", roles: ["employee"] },
  { name: "Flex Planner", path: "/Flexplanner", feature: "payroll", roles: ["employee"] },
  { name: "Voluntary PF", path: "/vpf", feature: "payroll", roles: ["employee"] },
  { name: "Investment Declaration", path: "/investmentdec", feature: "payroll", roles: ["employee"] },
  { name: "Loss On Property Declaration", path: "/lossproperty", feature: "payroll", roles: ["employee"] },
  { name: "Submit Investment Proof", path: "/investmentproof", feature: "payroll", roles: ["employee"] },
  { name: "Claim Reimbursement", path: "/claims", feature: "payroll", roles: ["employee"] },
  { name: "TDS & TCS", path: "/tcs", feature: "payroll", roles: ["employee"] },
  { name: "HRA Receipt Form", path: "/hrareceipt", feature: "payroll", roles: ["employee"] },
  { name: "HRA Undertaking Form", path: "/hraform", feature: "payroll", roles: ["employee"] },
  { name: "ESS", path: "/ess", feature: "payroll", roles: ["employee"] },
  { name: "ESOP Statement", path: "/esop", feature: "payroll", roles: ["employee"] },
  { name: "RISU Statement", path: "/risu", feature: "payroll", roles: ["employee"] },
  { name: "Current AGP", path: "/agp", feature: "payroll", roles: ["employee"] },
  { name: "View CTC Details", path: "/view-ctc", feature: "payroll", roles: ["employee"] },
  { name: "Submit Financial Document", path: "/submit-document", feature: "payroll", roles: ["employee"] },
  { name: "Projected Tax", path: "/projected-tax", feature: "payroll", roles: ["employee"] },
  { name: "Employee Payslip", path: "/view-payslip", feature: "payroll", roles: ["employee"] },
  { name: "Form 16", path: "/form16", feature: "payroll", roles: ["employee"] },
  { name: "Form12BB", path: "/form12bb", feature: "payroll", roles: ["employee"] },


  { name: "Manage Leave Requests", path: "/manager", feature: "leave", roles: ["hr", "manager"] },
  { name: "Apply for Leave", path: "/leave", feature: "leave", roles: ["employee"] },

  
  { name: "Manual Entry", path: "/manual-entry", feature: "attendance", roles: ["employee"] },
  { name: "Attendance List", path: "/attendance", feature: "attendance", roles: ["hr", "manager"] },

  { name: "Performance Management", path: "/performance", feature: "performance", roles: ["hr", "manager"] },
  { name: "View Performance", path: "/view", feature: "performance", roles: ["employee"] },

 
  { name: "Project Management", path: "/project", feature: "projectManagement", roles: ["hr", "manager", "employee"] },
];

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const isLoggedIn = !!token;
  const role = userRole || null;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [employeeManagementAnchor, setEmployeeManagementAnchor] = useState(null);
  const [addEmployeeAnchor, setAddEmployeeAnchor] = useState(null);
  const [viewEmployeeAnchor, setViewEmployeeAnchor] = useState(null);
  const [payrollAnchor, setPayrollAnchor] = useState(null);
  const [employeeRequestAnchor, setEmployeeRequestAnchor] = useState(null);
  const [leaveAnchor, setLeaveAnchor] = useState(null);
  const [trainingAnchor, setTrainingAnchor] = useState(null);
  const [taxAnchor, setTaxAnchor] = useState(null);
  const [performanceAnchor, setPerformanceAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [attendanceAnchor, setAttendanceAnchor] = useState(null);
  const [form16, setform16]=useState(null);
  const [onlyEmployeeAnchor, setOnlyEmployeeAnchor] = useState(null);
  const [projectAnchor, setProjectAnchor] = useState(null);
 
  const [form16Anchor, setForm16Anchor] = useState(null);
  const [transactionsAnchor, setTransactionsAnchor] = useState(null);
  const [financialAnchor, setFinancialAnchor] = useState(null);

  
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const handleMenuOpen = (event, setter) => setter(event.currentTarget);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(getNotifications().filter((n) => !n.read));
    }, 5000);
    
   
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchValue.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = navigationItems.filter(item => {

      const isRoleAllowed = item.roles.includes(role);
     
      const matchesSearch = item.name.toLowerCase().includes(searchValue.toLowerCase());
      
      return isRoleAllowed && matchesSearch;
    });
    
    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [searchValue, role]);

  const handleNotificationClick = (notificationId) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleCloseMenus = () => {
    setMenuAnchor(null);
    setEmployeeManagementAnchor(null);
    setAddEmployeeAnchor(null);
    setViewEmployeeAnchor(null);
    setPayrollAnchor(null);
    setEmployeeRequestAnchor(null);
    setLeaveAnchor(null);
    setTrainingAnchor(null);
    setTaxAnchor(null);
    setPerformanceAnchor(null);
    setform16(null);
    setAttendanceAnchor(null);
    setForm16Anchor(null);
    setTransactionsAnchor(null);
    setFinancialAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleNavigation = (path, feature) => {
    handleCloseMenus();
    setShowSearchResults(false);
    setSearchValue("");
    
    const currentToken = localStorage.getItem("token");
    const currentRole = localStorage.getItem("role")?.toLowerCase();

    if (!currentToken) {
      localStorage.setItem("redirectPath", path);
      localStorage.setItem("requiredFeature", feature);
      navigate("/login");
    } else {
      const allowedFeatures = rolePermissions[currentRole] || [];
      if (allowedFeatures.includes(feature)) {
        navigate(path);
      } else {
        alert("You don't have access to this feature!");
      }
    }
  };

  const handleSearchResultClick = (item) => {
    handleNavigation(item.path, item.feature);
  };

  const clearSearch = () => {
    setSearchValue("");
    setShowSearchResults(false);
  };

  const isManager = role === "manager" || role === "hr";
  const isHR = role === "hr";
  const isEmployee = role === "employee";

  const renderHRRecruitmentMenuItems = () => [
    <MenuItem key="job-posting" onClick={() => handleNavigation("/job-posting", "recruitment")}>Job Posting</MenuItem>,
    <MenuItem key="jobview" onClick={() => handleNavigation("/jobview", "recruitment")}>Job View</MenuItem>,
    <MenuItem key="refer" onClick={() => handleNavigation("/refer", "recruitment")}>Job Referral</MenuItem>,
    <MenuItem key="candidates" onClick={() => handleNavigation("/candidates", "recruitment")}>Candidate Filter</MenuItem>,
    <MenuItem key="interview-scheduling" onClick={() => handleNavigation("/interview-scheduling", "recruitment")}>Interview Scheduling</MenuItem>,
    <MenuItem key="status" onClick={() => handleNavigation("/status", "recruitment")}>Interview Status</MenuItem>,
    <MenuItem key="offer" onClick={() => handleNavigation("/offer", "recruitment")}>Create Offer </MenuItem>,
    <MenuItem key="sendoffer" onClick={() => handleNavigation("/sendoffer", "recruitment")}>Offer Management</MenuItem>,
    <MenuItem key="onboarding" onClick={() => handleNavigation("/onboarding", "recruitment")}>Onboarding Processes</MenuItem>,
    <MenuItem key="OnboardingList" onClick={() => handleNavigation("/OnboardingList", "recruitment")}> OnboardingList </MenuItem>
  ];

  const renderEmployeeRecruitmentMenuItems = () => [
    <MenuItem key="upload" onClick={() => handleNavigation("/upload", "recruitment")}>Employee Document Upload </MenuItem>,
    <MenuItem key="refer" onClick={() => handleNavigation("/refer", "recruitment")}>Job Referral</MenuItem>
  ];

  const renderManagerRecruitmentMenuItems = () => [
    <MenuItem key="jobapproval" onClick={() => handleNavigation("/offerapproval", "recruitment")}>Offer approval</MenuItem>,
    <MenuItem key="refer" onClick={() => handleNavigation("/refer", "recruitment")}>Job Referral</MenuItem>
  ];

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#B2D8E9", top: 0, zIndex: 1100 }}>
      <Container maxWidth="xl" sx={{ px: 1 }}> 
        <Toolbar disableGutters sx={{ minHeight: '48px', px: 0 }}> 
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1,gap:1 }}>
            <Link to="/" style={{ textDecoration: "none", marginRight: '4px' }}>
              <img src={img} alt="HR Logo" style={{ height: "32px", cursor: "pointer", backgroundColor:"#B2D8E9" }} />
            </Link>

          
            <Button 
              color="inherit" 
              onClick={(e) => handleMenuOpen(e, setMenuAnchor)} 
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }} 
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Recruitment & Onboarding
            </Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenus}>
              {isHR ? renderHRRecruitmentMenuItems() :
               isEmployee ? renderEmployeeRecruitmentMenuItems() :
               renderManagerRecruitmentMenuItems()}
            </Menu>

            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, setEmployeeManagementAnchor)}
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Employee Management
            </Button>

            <Menu
              anchorEl={employeeManagementAnchor}
              open={Boolean(employeeManagementAnchor)}
              onClose={handleCloseMenus}
            >
              {userRole === "hr" && [
                <MenuItem key="add-employee" onClick={(e) => handleMenuOpen(e, setAddEmployeeAnchor)}>Add Employee  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" /></MenuItem>,
                <MenuItem key="view-employee" onClick={(e) => handleMenuOpen(e, setViewEmployeeAnchor)}>View Employee  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" /></MenuItem>,
                <MenuItem key="search" onClick={() => handleNavigation("/search", "employeeManagement")}>
                  Search Employees
                </MenuItem>
              ]}

              {userRole === "employee" && 
                <MenuItem key="profile" onClick={() => handleNavigation("/employee", "employeeManagement")}>
                  Employee Profile
                </MenuItem>
              }
              
              <MenuItem key="employee-request" onClick={(e) => handleMenuOpen(e, setEmployeeRequestAnchor)}>Employee Request  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" /></MenuItem>
              <MenuItem key="training" onClick={(e) => handleMenuOpen(e, setTrainingAnchor)}>Training  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" /></MenuItem>
            </Menu>

            <Menu
              anchorEl={addEmployeeAnchor}
              open={Boolean(addEmployeeAnchor)}
              onClose={handleCloseMenus}
              PaperProps={{ sx: { ml: 23,mt:4 } }}
            >
              <MenuItem onClick={() => handleNavigation("/addpersonal", "employeeManagement")}>Add Personal Details</MenuItem>
              <MenuItem onClick={() => handleNavigation("/addfinancial", "employeeManagement")}>Add Financial Details</MenuItem>
              <MenuItem onClick={() => handleNavigation("/addrole", "employeeManagement")}>Add Roles</MenuItem>
            </Menu>

            <Menu
              anchorEl={viewEmployeeAnchor}
              open={Boolean(viewEmployeeAnchor)}
              onClose={handleCloseMenus}
              PaperProps={{ sx: { ml:23 } }}
            >
              <MenuItem onClick={() => handleNavigation("/viewpersonal", "employeeManagement")}>View Personal Details</MenuItem>
              <MenuItem onClick={() => handleNavigation("/viewfinancial", "employeeManagement")}>View Financial Details</MenuItem>
              <MenuItem onClick={() => handleNavigation("/viewrole", "employeeManagement")}>View Roles</MenuItem>
            </Menu>

            <Menu 
              anchorEl={employeeRequestAnchor} 
              open={Boolean(employeeRequestAnchor)} 
              onClose={handleCloseMenus}
              PaperProps={{ sx: { ml:23 } }}
            >
              {role === "employee" && [
                <MenuItem key="bonafied" onClick={() => handleNavigation("/bonafied", "employeeRequest")}>
                  Bonafide
                </MenuItem>,
                <MenuItem key="advancesalary" onClick={() => handleNavigation("/advancesalary", "employeeRequest")}>
                  Advance Salary
                </MenuItem>,
                <MenuItem key="certificate" onClick={() => handleNavigation("/certificate", "employeeRequest")}>
                  View certificates
                </MenuItem>
              ]}

              {role === "hr" && [
                <MenuItem key="bonafiedlist" onClick={() => handleNavigation("/bonafiedlist", "employeeRequest")}>
                  Bonafide Request List
                </MenuItem>,
                <MenuItem key="salaryrequest" onClick={() => handleNavigation("/salaryrequest", "employeeRequest")}>
                  Advance Salary Request List
                </MenuItem>
              ]}
            </Menu>

            <Menu anchorEl={trainingAnchor} open={Boolean(trainingAnchor)} onClose={handleCloseMenus} PaperProps={{ sx: { ml:23 } }}>
              {isHR ? [
                <MenuItem key="knowledge" onClick={() => handleNavigation("/training", "training")}>Knowledge Management</MenuItem>,
                <MenuItem key="trainings" onClick={() => handleNavigation("/trainings", "training")}>Training List</MenuItem>,
                <MenuItem key="video" onClick={() => handleNavigation("/video", "training")}>Add videos</MenuItem>,
                <MenuItem key="test" onClick={() => handleNavigation("/test", "training")}>Add test</MenuItem>
              ] : isEmployee ? [
                <MenuItem key="updatetraining" onClick={() => handleNavigation("/updatetraining", "training")}>View training</MenuItem>
              ] : [
                <MenuItem key="trainings" onClick={() => handleNavigation("/trainings", "training")}>Training List</MenuItem>
              ]}
            </Menu>

            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, setPayrollAnchor)}
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Payroll
            </Button>

            <Menu anchorEl={payrollAnchor} open={Boolean(payrollAnchor)} onClose={handleCloseMenus}>
              {role === "hr" ? [
                <MenuItem key="company" onClick={() => handleNavigation("/companydetails", "payroll")}>
                  Company Account Details
                </MenuItem>,
                <MenuItem key="upload-salary" onClick={() => handleNavigation("/upload-salary", "payroll")}>
                  Upload CTC details
                </MenuItem>,
                // <MenuItem key="view-document" onClick={() => handleNavigation("/view-document", "payroll")}>
                //   View Document
                // </MenuItem>,
                <MenuItem key="viewlossproperty" onClick={() => handleNavigation("/view-lossproperty", "payroll")}>
                View loss house property
              </MenuItem>,
                <MenuItem key="proofapproval" onClick={() => handleNavigation("/proofapproval", "payroll")}>
                  Investment Proof Approval
                </MenuItem>,
                   <MenuItem key="AllowanceProofApproval" onClick={() => handleNavigation("/allowanceproofapproval", "payroll")}>
                   Allowance Proof Approval
                 </MenuItem>,
                <MenuItem key="payroll-calculation" onClick={() => handleNavigation("/payroll-calculation", "payroll")}>
                  Payroll Calculation
                </MenuItem>,
                <MenuItem key="generate-payslip" onClick={() => handleNavigation("/generate-payslip", "payroll")}>
                  Generate Payslip
                </MenuItem>,
             
                <MenuItem key="form16" onClick={(e) => handleMenuOpen(e, setForm16Anchor)}>
                  Form16
                  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" />
                </MenuItem>,
                <MenuItem key="viewform12bb" onClick={() => handleNavigation("/viewform12bb", "payroll")}>
                  Form12BB
                </MenuItem>,
                <MenuItem key="tax" onClick={(e) => handleMenuOpen(e, setTaxAnchor)}>
                  Tax
                  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" />
                </MenuItem>
              ] : role === "manager" ? 
                // <MenuItem key="viewclaims" onClick={() => handleNavigation("/viewclaims", "payroll")}>
                //   Claims
                // </MenuItem>,
                <MenuItem key="AllowanceProofApproval" onClick={() => handleNavigation("/allowanceproofapproval", "payroll")}>
             Allowance Proof Approval
              </MenuItem>
               : [
                // <MenuItem key="personal" onClick={() => handleNavigation("/personal", "payroll")}>
                //   Personal Details
                // </MenuItem>,
                <MenuItem key="transactions" onClick={(e) => handleMenuOpen(e, setTransactionsAnchor)}>
                  Transactions
                  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" />
                </MenuItem>,
                <MenuItem key="financial" onClick={(e) => handleMenuOpen(e, setFinancialAnchor)}>
                  Financial
                  <KeyboardArrowRightIcon sx={{ ml: 1 }} fontSize="small" />
                </MenuItem>,
                // <MenuItem key="view-ctc" onClick={() => handleNavigation("/view-ctc", "payroll")}>
                //   View CTC Details
                // </MenuItem>,
                // <MenuItem key="submit-document" onClick={() => handleNavigation("/submit-document", "payroll")}>
                //   Submit Financial Document
                // </MenuItem>,
                // <MenuItem key="projected-tax" onClick={() => handleNavigation("/projected-tax", "payroll")}>
                //   Projected Tax
                // </MenuItem>,
                <MenuItem key="view-payslip" onClick={() => handleNavigation("/view-payslip", "payroll")}>
                  Employee Payslip
                </MenuItem>,
                <MenuItem key="form16-emp" onClick={() => handleNavigation("/form16", "payroll")}>
                  Form 16
                </MenuItem>,
                <MenuItem key="form12bb-emp" onClick={() => handleNavigation("/form12bb", "payroll")}>
                  Form12BB
                </MenuItem>,
                // <MenuItem key="claims-emp" onClick={() => handleNavigation("/claims", "payroll")}>
                //   Claims
                // </MenuItem>
              ]}
            </Menu>

            <Menu
              anchorEl={form16Anchor}
              open={Boolean(form16Anchor)}
              onClose={handleCloseMenus}
              PaperProps={{
                style: {
                  marginLeft: "220px",
                },
              }}
            >
              <MenuItem onClick={() => handleNavigation("/form16-partA", "payroll")}>
                Form16 (Part A)
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/form16-partB", "payroll")}>
                Form16 (Part B)
              </MenuItem>
            </Menu>

       
            <Menu
              anchorEl={taxAnchor}
              open={Boolean(taxAnchor)}
              onClose={handleCloseMenus}
              PaperProps={{
                style: {
                  marginLeft: "220px",
                },
              }}
            >
              <MenuItem onClick={() => handleNavigation("/monthly-tax-specific", "payroll")}>
                Monthly Tax (Specific)
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/yearly-tax-specific", "payroll")}>
                Yearly Tax (Specific)
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/monthly-tax-all", "payroll")}>
                Monthly Tax (All)
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/yearly-tax-all", "payroll")}>
                Yearly Tax (All)
              </MenuItem>
            </Menu>

            
            <Menu
              anchorEl={transactionsAnchor}
              open={Boolean(transactionsAnchor)}
              onClose={handleCloseMenus}
              PaperProps={{
                style: {
                  marginLeft: "196px",
                },
              }}
            >
              {/* <MenuItem onClick={() => handleNavigation("/Flexplanner", "payroll")}>
                Flex Planner
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/vpf", "payroll")}>
                Voluntary PF
              </MenuItem> */}
              <MenuItem onClick={() => handleNavigation("/investmentdec", "payroll")}>
                Investment Declaration
              </MenuItem>
              {/* <MenuItem onClick={() => handleNavigation("/lossproperty", "payroll")}>
                Loss On Property Declaration
              </MenuItem> */}
              <MenuItem onClick={() => handleNavigation("/investmentproof", "payroll")}>
                Submit Investment Proof
              </MenuItem>
              {/* <MenuItem onClick={() => handleNavigation("/claims", "payroll")}>
                Claim Reimbursement
              </MenuItem> */}
              {/* <MenuItem onClick={() => handleNavigation("/tcs", "payroll")}>
                TDS & TCS
              </MenuItem> */}
            </Menu>

        
            <Menu
              anchorEl={financialAnchor}
              open={Boolean(financialAnchor)}
              onClose={handleCloseMenus}
              PaperProps={{
                style: {
                  marginLeft: "196px",
                },
              }}
            >
              {/* <MenuItem onClick={() => handleNavigation("/hrareceipt", "payroll")}>
                HRA Receipt Form
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/hraform", "payroll")}>
                HRA Undertaking Form
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/ess", "payroll")}>
                ESS
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/esop", "payroll")}>
                ESOP Statement
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/risu", "payroll")}>
                RISU Statement
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/agp", "payroll")}>
                Current AGP
              </MenuItem> */}
            </Menu>

            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, setLeaveAnchor)}
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Leave
            </Button>
            <Menu
              anchorEl={leaveAnchor}
              open={Boolean(leaveAnchor)}
              onClose={handleCloseMenus}
            >
              {isManager ? 
                <MenuItem onClick={() => handleNavigation("/manager", "leave")}>
                  Manage Leave Requests
                </MenuItem>
               : 
                <MenuItem onClick={() => handleNavigation("/leave", "leave")}>
                  Apply for Leave
                </MenuItem>
              }
            </Menu>

            <Button 
              color="inherit" 
              onClick={(e) => handleMenuOpen(e, setAttendanceAnchor)}
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Attendance
            </Button>
            <Menu 
              anchorEl={attendanceAnchor} 
              open={Boolean(attendanceAnchor)} 
              onClose={handleCloseMenus}
            >
              {role === "employee" ? 
                <MenuItem key="manualentry" onClick={() => handleNavigation("/manual-entry", "attendance")}>Manual Entry</MenuItem>
               : 
                <MenuItem key="attendance" onClick={() => handleNavigation("/attendance", "attendance")}>Attendance List</MenuItem>
              }
            </Menu>
            
            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, setPerformanceAnchor)}
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Performance
            </Button>

            <Menu
              anchorEl={performanceAnchor}
              open={Boolean(performanceAnchor)}
              onClose={handleCloseMenus}
            >
              {isManager ? 
                <MenuItem onClick={() => handleNavigation("/performance", "performance")}>
                  Performance Management
                </MenuItem>
               : 
                <MenuItem onClick={() => handleNavigation("/view", "performance")}>
                  View Performance
                </MenuItem>
              }
            </Menu>

            <Button 
              color="inherit" 
              onClick={(e) => handleMenuOpen(e, setProjectAnchor)} 
              sx={{ 
                color: "black", 
                fontSize: '0.90rem', 
                py: 0, 
                px: 0.5,
                minWidth: 'unset'
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
            >
              Project Management
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
       
            <Box ref={searchRef} sx={{ position: "relative", width: "150px" }}>
              <TextField
                size="small"
                placeholder="Search "
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchValue && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={clearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4 }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                  }
                }}
              />
              
   
              {showSearchResults && searchResults.length > 0 && (
                <Paper
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    mt: 0.5,
                    maxHeight: "300px",
                    overflow: "auto",
                    zIndex: 1500,
                  }}
                >
                  <List dense>
                    {searchResults.map((item, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSearchResultClick(item)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(178, 216, 233, 0.3)",
                          },
                        }}
                      >
                        <ListItemText primary={item.name} secondary={`${item.feature} feature`} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              
          
              {showSearchResults && searchValue && searchResults.length === 0 && (
                <Paper
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    mt: 0.5,
                    p: 1,
                    zIndex: 1500,
                  }}
                >
                  <ListItemText primary="No results found" />
                </Paper>
              )}
            </Box>
          <IconButton 
            color="inherit"
            onClick={(e) => isLoggedIn && userRole === 'hr' ? setNotificationAnchor(e.currentTarget) : null}
          >
            <Badge 
              badgeContent={isLoggedIn && userRole === 'hr' ? notifications.filter(n => !n.read).length : 0} 
              color="error"
            >
              <NotificationsIcon sx={{ color: "black" }} />
            </Badge>
          </IconButton>

          {isLoggedIn && userRole === 'hr' && (
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
            >
              <List sx={{ width: 300 }}>
                {notifications.length > 0 ? 
                  notifications.map((notification) => (
                    <ListItem 
                      key={notification.id}
                      button
                      onClick={() => {
                        handleNotificationClick(notification.id);
                        navigate(notification.link);
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <NotificationsIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.date).toLocaleString()}
                        sx={{ 
                          textDecoration: notification.read ? 'none' : 'underline',
                          fontWeight: notification.read ? 400 : 600
                        }}
                      />
                    </ListItem>
                  ))
                 : 
                  <ListItem>
                    <ListItemText primary="No new notifications" />
                  </ListItem>
                }
              </List>
            </Menu>
          )}

          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout} sx={{ color: "black" }}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ color: "black" }}>
              Login
            </Button>
          )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;