import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, } from '@mui/lab';
import { CheckCircle, } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';

import {
  Container, Tabs, Tab, Box, Button, TextField, Card, CardContent, Typography, List, ListItem,
  ListItemText, ListItemSecondaryAction, Chip, Grid, Paper, Divider, IconButton, Select,
  MenuItem, FormControl, InputLabel, LinearProgress, Tooltip,
} from "@mui/material";
import {
  Assignment, RateReview, Feedback, Timeline, Edit, Delete, Add, Person, AccessTime, Flag,
  FormatListNumbered, AccountTree,
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);


const teamGoals = {
  "Sales": [
    { id: "s1", title: "Increase Revenue", metric: "Revenue Growth", description: "Increase in overall sales revenue by a set percentage (e.g., 15% YoY)." },
    { id: "s2", title: "Improve Sales Performance", metric: "Sales Quota Attainment", description: "90%+ of sales reps achieving their sales quotas." },
    { id: "s3", title: "Maximize Lead Conversion", metric: "Lead Conversion Rate", description: "Achieve a conversion rate of 25% or higher." },
    { id: "s4", title: "Optimize Sales Cycle", metric: "Sales Cycle Length", description: "Decrease sales cycle time by 10%." },
    { id: "s5", title: "Improve Customer Acquisition Efficiency", metric: "Customer Acquisition Cost (CAC)", description: "Maintain CAC at or below $X per customer." },
    { id: "s6", title: "Increase Customer Lifetime Value", metric: "Customer Lifetime Value (CLV)", description: "Increase CLV by 20% through better customer relationships and upselling." },
    { id: "s7", title: "Increase Deal Size", metric: "Average Deal Size", description: "Increase average deal size by 15%." },
    { id: "s8", title: "Enhance Sales Team Productivity", metric: "Sales Activity", description: "Increase calls, meetings, or demos by 30% per sales rep." },
    { id: "s9", title: "Reduce Customer Churn", metric: "Churn Rate", description: "Reduce churn rate by 5% year-over-year." },
    { id: "s10", title: "Improve Forecasting Accuracy", metric: "Sales Forecast Accuracy", description: "Achieve 90%+ accuracy in monthly sales forecasts." },
  ],
  "Marketing": [
    { id: "m1", title: "Generate More Leads", metric: "Lead Generation", description: "Generate 25% more leads compared to last quarter." },
    { id: "m2", title: "Lower Lead Generation Costs", metric: "Cost Per Lead (CPL)", description: "Reduce CPL by 10% over the next quarter." },
    { id: "m3", title: "Improve Lead Quality", metric: "Marketing Qualified Leads (MQLs)", description: "Increase the number of MQLs by 15%." },
    { id: "m4", title: "Increase Conversion Rate", metric: "Conversion Rate", description: "Achieve a 20% conversion rate from lead to customer." },
    { id: "m5", title: "Maximize ROI on Marketing Efforts", metric: "Return on Investment (ROI)", description: "Achieve an ROI of 4:1 or better on marketing spend." },
    { id: "m6", title: "Increase Website Traffic", metric: "Website Traffic", description: "Increase website traffic by 30% over the next quarter." },
    { id: "m7", title: "Boost Email Engagement", metric: "Email Open Rate", description: "Achieve a 25% open rate for email campaigns." },
    { id: "m8", title: "Grow Social Media Presence", metric: "Social Media Engagement", description: "Increase social media interactions by 50% in the next 6 months." },
    { id: "m9", title: "Increase Brand Awareness", metric: "Brand Awareness", description: "Increase brand recognition score by 10% in target markets." },
    { id: "m10", title: "Improve Lead Nurturing", metric: "Lead Nurturing Success Rate", description: "Improve lead-to-customer conversion from nurtured leads by 20%." },
  ],
  "Finance": [
    { id: "f1", title: "Improve Profitability", metric: "Profit Margin", description: "Increase profit margin by 5% over the next fiscal year." },
    { id: "f2", title: "Optimize Operational Efficiency", metric: "Operating Expenses", description: "Reduce operational costs by 10% without sacrificing quality." },
    { id: "f3", title: "Maintain Cash Flow Stability", metric: "Cash Flow", description: "Ensure positive cash flow every quarter." },
    { id: "f4", title: "Improve Financial Leverage", metric: "Debt-to-Equity Ratio", description: "Maintain a debt-to-equity ratio of 0.5 or lower." },
    { id: "f5", title: "Enhance Forecast Accuracy", metric: "Financial Forecast Accuracy", description: "Achieve 95% or better accuracy in financial forecasting." },
    { id: "f6", title: "Increase Return on Assets", metric: "Return on Assets (ROA)", description: "Achieve a 12% return on assets annually." },
    { id: "f7", title: "Improve Working Capital Management", metric: "Working Capital", description: "Increase working capital by 10% by improving receivables and payables." },
    { id: "f8", title: "Increase Profit from Investments", metric: "Return on Investment (ROI)", description: "Achieve an ROI of 15% on capital expenditures." },
  ],
  "Product": [
    { id: "p1", title: "Increase Product Adoption", metric: "Feature Adoption Rate", description: "Achieve a 30% adoption rate for new features within the first 3 months." },
    { id: "p2", title: "Improve Product Quality", metric: "Product Quality", description: "Reduce product defect rate by 20%." },
    { id: "p3", title: "Speed up Time to Market", metric: "Time to Market", description: "Reduce time to market by 25% for the next product release." },
    { id: "p4", title: "Maintain Customer Satisfaction", metric: "Customer Satisfaction (CSAT)", description: "Achieve a customer satisfaction score of 90% or above." },
    { id: "p5", title: "Decrease Product Churn", metric: "Churn Rate", description: "Reduce churn rate by 10% year-over-year." },
    { id: "p6", title: "Improve Revenue per User", metric: "Revenue per User (ARPU)", description: "Increase ARPU by 20%." },
  ],
  "Supply Chain": [
    { id: "sc1", title: "Improve On-Time Deliveries", metric: "On-Time Delivery", description: "Achieve 95% or higher on-time delivery." },
    { id: "sc2", title: "Increase Inventory Efficiency", metric: "Inventory Turnover", description: "Increase inventory turnover rate by 15%." },
    { id: "sc3", title: "Reduce Supply Chain Costs", metric: "Supply Chain Costs", description: "Lower supply chain costs by 10%." },
    { id: "sc4", title: "Improve Demand Forecasting Accuracy", metric: "Demand Forecast Accuracy", description: "Achieve 90% forecast accuracy for demand." },
    { id: "sc5", title: "Improve Supplier Performance", metric: "Supplier Performance", description: "Achieve a 98% on-time and quality-compliant rate from suppliers." },
  ],
  "Engineering": [
    { id: "e1", title: "Increase Development Speed", metric: "Velocity", description: "Achieve 20% more story points completed per sprint." },
    { id: "e2", title: "Ensure High Code Quality", metric: "Code Quality", description: "Achieve a 90%+ code quality score with minimal bugs reported post-release." },
    { id: "e3", title: "Improve Deployment Frequency", metric: "Deployment Frequency", description: "Release new features or updates bi-weekly." },
    { id: "e4", title: "Enhance System Reliability", metric: "System Uptime", description: "Achieve 99.9% uptime in production systems." },
    { id: "e5", title: "Reduce Time to Recovery", metric: "Mean Time to Recovery (MTTR)", description: "Achieve a mean recovery time of under 30 minutes for critical issues." },
    { id: "e6", title: "Maintain High Test Coverage", metric: "Test Coverage", description: "Maintain 80% or higher automated test coverage." },
    { id: "e7", title: "Minimize Technical Debt", metric: "Technical Debt", description: "Reduce technical debt by 20% each quarter." },
  ],

};

const PerformanceManagement = () => {
  const [goals, setGoals] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", content: "", action: null });
  const [filters, setFilters] = useState({ department: "", status: "" });
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({
    goals: false,
    employees: false
  });
  const [updateProgress, setUpdateProgress] = useState({
    open: false,
    goal: null,
    progress: 0,
    note: '',
    status: 'In Progress'
  });


  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
  const overallProgress = totalGoals > 0
    ? Math.round((completedGoals / totalGoals) * 100)
    : 0;

  const goalStatusSummary = [
    { label: 'Completed', count: goals.filter(g => g.status === 'Completed').length, color: 'success' },
    { label: 'In Progress', count: goals.filter(g => g.status === 'In Progress').length, color: 'info' },
    { label: 'Not Started', count: goals.filter(g => g.status === 'Not Started').length, color: 'warning' },
    { label: 'Overdue', count: goals.filter(g => g.status === 'Overdue').length, color: 'error' }
  ];

  const upcomingDeadlines = goals
    .filter(goal =>
      goal.status !== 'Completed' &&
      goal.dueDate &&
      new Date(goal.dueDate) > new Date()
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);


  const handleAddGoal = () => {

    console.log('Opening goal creation form');
  };
  const handleOpenProgressUpdate = (goal) => {
    setUpdateProgress({
      open: true,
      goal,
      progress: goal.progress || 0,
      note: '',
      status: goal.status
    });
  };

  const handleEditGoal = (goal) => {
   
    console.log('Opening goal edit form for:', goal.id);
  
  };

  const handleViewDetails = (goal) => {
    
    console.log('Viewing detailed information for goal:', goal.id);

  };
 
  const userRole = 'manager';

  const navigate = useNavigate();
  const location = useLocation();

 
  const [selectedTeam, setSelectedTeam] = useState("Custom");
  const [selectedGoalTemplate, setSelectedGoalTemplate] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    employee_id: "",
    dueDate: null,
    status: "Not Started",
    metrics: "",
    priority: "Medium",
    progress: 0,
    team: "Custom"
  });
  const teamTooltip = {
    title: "Select the department or team this goal applies to",
    content: "Choose the relevant team to access team-specific goal templates and metrics."
  };
  
  // Employee ID Tooltip
  const employeeIdTooltip = {
    title: "Enter Employee ID",
    content: "Provide the unique identifier for the employee this goal is assigned to."
  };
  
  // Goal Title Tooltip
  const goalTitleTooltip = {
    title: "Select a predefined goal template",
    content: "Choose from team-specific goal templates or create a custom goal. Templates include predefined descriptions and metrics."
  };
  
  // Description Tooltip
  const descriptionTooltip = {
    title: "Goal Description",
    content: "Provide a detailed description of what needs to be accomplished. Include specific deliverables and success criteria for clarity."
  };
  
  // Metrics Tooltip
  const metricsTooltip = {
    title: "Select evaluation metric",
    content: "Choose how progress and success will be measured for this goal. Each department has specific relevant metrics available."
  };
  
  // Priority Tooltip
  const priorityTooltip = {
    title: "Set goal priority",
    content: "High: Critical for business success. Medium: Important but not urgent. Low: Beneficial but can be deprioritized if needed."
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchEmployees(),
          fetchGoals()
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGoalTemplate) {
     
      setNewGoal({
        ...newGoal,
        title: selectedGoalTemplate.title,
        description: selectedGoalTemplate.description,
        metrics: selectedGoalTemplate.metric,
        team: selectedTeam
      });
    }
  }, [selectedGoalTemplate]);

 
  const [dataLoaded, setDataLoaded] = useState(false);


  useEffect(() => {
    if (!loading.goals && !loading.employees) {
      setDataLoaded(true);
    }
  }, [loading.goals, loading.employees]);

  useEffect(() => {
   
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const openSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleConfirmDialogOpen = (title, content, action) => {
    setConfirmDialog({ open: true, title, content, action });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const fetchGoals = async () => {
    try {
      setLoading(prev => ({ ...prev, goals: true }));
      const response = await api.get('/goals');  
      console.log("Fetched goals:", response.data);
      setGoals(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching goals:", error);
      openSnackbar(`Failed to load goals: ${error.response?.data?.message || error.message || 'Unknown error'}`, 'error');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, goals: false }));
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      const response = await api.get('/goals/employees');  
      console.log("Fetched employees:", response.data);
      setEmployees(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      openSnackbar(`Failed to load employees: ${error.response?.data?.message || error.message || 'Unknown error'}`, 'error');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.dueDate || !newGoal.employee_id) {
      openSnackbar("Please fill in all required fields", "error");
      return;
    }

    try {
      const goalToSubmit = {
        ...newGoal,
        dueDate: newGoal.dueDate ? new Date(newGoal.dueDate).toISOString().split('T')[0] : null
      };

      const response = await api.post('/goals/create', goalToSubmit);  

     
      setGoals(prevGoals => [response.data, ...prevGoals]);
      console.log("Created new goal:", response.data);

   
      setNewGoal({
        title: "",
        description: "",
        employee_id: "",
        dueDate: null,
        status: "Not Started",
        metrics: "",
        priority: "Medium",
        progress: 0,
        team: "Custom"
      });

     
      setSelectedTeam("Custom");
      setSelectedGoalTemplate(null);

      openSnackbar("Goal created successfully");
    } catch (error) {
      console.error("Error creating goal:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
      openSnackbar(`Failed to create goal: ${errorMessage}`, "error");
    }
  };

  const toggleExpandGoal = (id) => {
    setExpandedGoalId(expandedGoalId === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "warning";
      case "Not Started":
        return "default";
      case "Overdue":
        return "error";
      case "Active":
        return "info";
      case "Terminated":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "info";
      default:
        return "default";
    }
  };

  const filteredGoals = useMemo(() => {
    if (!dataLoaded || !goals || goals.length === 0) return [];

    console.log("Calculating filtered goals from:", goals.length, "goals");

    return goals.filter(goal => {
    
      if (!goal.employee_id) return true;

      const employee = employees.find(emp => emp.employee_id === goal.employee_id);
      return (
        (!filters.department || (employee && employee.department === filters.department)) &&
        (!filters.status || goal.status === filters.status)
      );
    });
  }, [goals, employees, filters, dataLoaded]);

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unassigned";

    const emp = employees.find(e => e.employee_id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : employeeId;
  };


  const handleTeamChange = (event) => {
    const team = event.target.value;
    setSelectedTeam(team);
    setSelectedGoalTemplate(null); 


    setNewGoal({
      ...newGoal,
      team: team
    });
  };

  const handleGoalTemplateChange = (event) => {
    const templateId = event.target.value;
    if (!templateId) {
      setSelectedGoalTemplate(null);
      return;
    }

    const template = teamGoals[selectedTeam].find(goal => goal.id === templateId);
    if (template) {
      setSelectedGoalTemplate(template);
    }
  };

  const renderConfirmDialog = () => {
    return confirmDialog.open && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%"
        }}>
          <h3>{confirmDialog.title}</h3>
          <p>{confirmDialog.content}</p>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
            gap: "10px"
          }}>
            <Button
              variant="outlined"
              onClick={handleConfirmDialogClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDialog.action}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Performance Management System
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={location.pathname}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                backgroundColor: '#f5f5f5',
                '& .MuiTab-root': { fontWeight: 'medium', py: 2 }
              }}
            >
              <Tab icon={<Assignment />} label="Goals & Objectives" value="/performance" />
              <Tab icon={<RateReview />} label="Performance Reviews" value="/review" />
              <Tab icon={<Feedback />} label="Feedback System" value="/feedback" />
              <Tab icon={<Timeline />} label="Improvement Plans" value="/improve" />
              <Tab icon={<AccountTree />} label="Succession Planning" value="/succession" />
            </Tabs>
          </Box>
        </Paper>

        {location.pathname === '/performance' && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
            
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                      <Flag sx={{ mr: 1 }} /> Set SMART Goals
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Tooltip title={teamTooltip.content} arrow placement="right">
                
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Team</InputLabel>
                      <Select
                        value={selectedTeam}
                        onChange={handleTeamChange}
                        label="Team"
                      >

                        <MenuItem value="Sales">Sales </MenuItem>
                        <MenuItem value="Marketing">Marketing </MenuItem>
                        <MenuItem value="Finance">Finance </MenuItem>
                        <MenuItem value="Product">Product </MenuItem>
                        <MenuItem value="Supply Chain">Supply Chain </MenuItem>
                        <MenuItem value="Engineering">Engineering </MenuItem>
                      </Select>
                    </FormControl>
                    </Tooltip>
                    
    
    <Tooltip title={employeeIdTooltip.content} arrow placement="right">
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={newGoal.employee_id}
                      onChange={(e) => setNewGoal({ ...newGoal, employee_id: e.target.value })}
                      margin="normal"
                      required

                    />
</Tooltip>
                
                    {selectedTeam !== "Custom" && (
                         <Tooltip title={goalTitleTooltip.content} arrow placement="right">
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Goal Title</InputLabel>
                        <Select
                          value={selectedGoalTemplate ? selectedGoalTemplate.id : ""}
                          onChange={handleGoalTemplateChange}
                          label="Goal Title"
                        >
                          <MenuItem value=""><em>Select a predefined goal</em></MenuItem>
                          {teamGoals[selectedTeam].map((goal) => (
                            <MenuItem key={goal.id} value={goal.id}>
                              {goal.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      </Tooltip>
                    )}

<Tooltip title={descriptionTooltip.content} arrow placement="right">
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      margin="normal"
                      placeholder="Provide a detailed description of the goal..."
                    />
                    </Tooltip>

                    <Tooltip title={metricsTooltip.content} arrow placement="right">
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Metric to Evaluate</InputLabel>
                      <Select
                        value={newGoal.metrics}
                        onChange={(e) => setNewGoal({ ...newGoal, metrics: e.target.value })}
                        label="Metric to Evaluate"
                      >
                        <MenuItem value=""><em>Select Metric</em></MenuItem>
                    
                        <MenuItem value="Revenue Growth">Revenue Growth</MenuItem>
                        <MenuItem value="Sales Quota Attainment">Sales Quota Attainment</MenuItem>
                        <MenuItem value="Lead Conversion Rate">Lead Conversion Rate</MenuItem>
                        <MenuItem value="Sales Cycle Length">Sales Cycle Length</MenuItem>
                        <MenuItem value="Customer Acquisition Cost (CAC)">Customer Acquisition Cost (CAC)</MenuItem>
                        <MenuItem value="Customer Lifetime Value (CLV)">Customer Lifetime Value (CLV)</MenuItem>
                        <MenuItem value="Average Deal Size">Average Deal Size</MenuItem>
                        <MenuItem value="Sales Activity">Sales Activity</MenuItem>
                        <MenuItem value="Churn Rate">Churn Rate</MenuItem>
                        <MenuItem value="Sales Forecast Accuracy">Sales Forecast Accuracy</MenuItem>

              
                        <MenuItem value="Lead Generation">Lead Generation</MenuItem>
                        <MenuItem value="Cost Per Lead (CPL)">Cost Per Lead (CPL)</MenuItem>
                        <MenuItem value="Marketing Qualified Leads (MQLs)">Marketing Qualified Leads (MQLs)</MenuItem>
                        <MenuItem value="Conversion Rate">Conversion Rate</MenuItem>
                        <MenuItem value="Return on Investment (ROI)">Return on Investment (ROI)</MenuItem>
                        <MenuItem value="Website Traffic">Website Traffic</MenuItem>
                        <MenuItem value="Email Open Rate">Email Open Rate</MenuItem>
                        <MenuItem value="Social Media Engagement">Social Media Engagement</MenuItem>
                        <MenuItem value="Brand Awareness">Brand Awareness</MenuItem>
                        <MenuItem value="Lead Nurturing Success Rate">Lead Nurturing Success Rate</MenuItem>

                
                        <MenuItem value="Profit Margin">Profit Margin</MenuItem>
                        <MenuItem value="Operating Expenses">Operating Expenses</MenuItem>
                        <MenuItem value="Cash Flow">Cash Flow</MenuItem>
                        <MenuItem value="Debt-to-Equity Ratio">Debt-to-Equity Ratio</MenuItem>
                        <MenuItem value="Financial Forecast Accuracy">Financial Forecast Accuracy</MenuItem>
                        <MenuItem value="Return on Assets (ROA)">Return on Assets (ROA)</MenuItem>
                        <MenuItem value="Working Capital">Working Capital</MenuItem>

                        <MenuItem value="Feature Adoption Rate">Feature Adoption Rate</MenuItem>
                        <MenuItem value="Product Quality">Product Quality</MenuItem>
                        <MenuItem value="Time to Market">Time to Market</MenuItem>
                        <MenuItem value="Customer Satisfaction (CSAT)">Customer Satisfaction (CSAT)</MenuItem>
                        <MenuItem value="Revenue per User (ARPU)">Revenue per User (ARPU)</MenuItem>

                       
                        <MenuItem value="On-Time Delivery">On-Time Delivery</MenuItem>
                        <MenuItem value="Inventory Turnover">Inventory Turnover</MenuItem>
                        <MenuItem value="Supply Chain Costs">Supply Chain Costs</MenuItem>
                        <MenuItem value="Demand Forecast Accuracy">Demand Forecast Accuracy</MenuItem>
                        <MenuItem value="Supplier Performance">Supplier Performance</MenuItem>

                    
                        <MenuItem value="Velocity">Velocity</MenuItem>
                        <MenuItem value="Code Quality">Code Quality</MenuItem>
                        <MenuItem value="Deployment Frequency">Deployment Frequency</MenuItem>
                        <MenuItem value="System Uptime">System Uptime</MenuItem>
                        <MenuItem value="Mean Time to Recovery (MTTR)">Mean Time to Recovery (MTTR)</MenuItem>
                        <MenuItem value="Test Coverage">Test Coverage</MenuItem>
                        <MenuItem value="Technical Debt">Technical Debt</MenuItem>


                      </Select>
                    </FormControl>
                    </Tooltip>
                    <Tooltip title={priorityTooltip.content} arrow placement="right">
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                        label="Priority"
                      >
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                      </Select>
                    </FormControl>
</Tooltip>

                    <DatePicker
                      label="Due Date"
                      value={newGoal.dueDate}
                      onChange={(date) => setNewGoal({ ...newGoal, dueDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                      sx={{ marginTop: "17px" }}
                    />




                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={addGoal}
                      disabled={loading.goals}
                      sx={{ mt: 2, bgcolor: '#1976d2', color: 'white', marginLeft: "28px", marginTop: "22px" }}
                    >
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

             
          
              <Grid item xs={12} md={8}>
                <Paper elevation={3}>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormatListNumbered sx={{ mr: 1 }} /> Active Goals ({filteredGoals.length})
                    </Typography>
                    {employees.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Filter by Status</InputLabel>
                          <Select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            label="Filter by Status"
                          >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="Not Started">Not Started</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Overdue">Overdue</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {loading.goals ? (
                    <Box sx={{ p: 3 }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Loading goals...
                      </Typography>
                    </Box>
                  ) : filteredGoals.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1">
                        No goals found. Create a new goal to get started.
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {filteredGoals.map((goal) => (
                        <React.Fragment key={goal.id || goal._id}>
                          <ListItem
                            button
                            onClick={() => toggleExpandGoal(goal.id || goal._id)}
                            sx={{
                              borderLeft: '4px solid',
                              borderLeftColor: getPriorityColor(goal.priority) === 'error'
                                ? '#f44336'
                                : getPriorityColor(goal.priority) === 'warning'
                                  ? '#ff9800'
                                  : '#2196f3',
                              mb: 1
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {goal.title}
                                  </Typography>
                                  {goal.completionDetails && (
                                    <Tooltip title="Employee has provided completion details">
                                      <InfoIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Assigned to: {getEmployeeName(goal.employee_id)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Due: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No due date'}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={goal.progress || 0}
                                    sx={{ mt: 1, mb: 0.5, height: 8, borderRadius: 2 }}
                                  />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Progress: {goal.progress || 0}%
                                    </Typography>
                                    {goal.progressUpdates && goal.progressUpdates.length > 0 && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTime fontSize="inherit" sx={{ mr: 0.5 }} />
                                        Last update: {new Date(goal.progressUpdates[goal.progressUpdates.length - 1].date).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={goal.status}
                                  color={getStatusColor(goal.status)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Chip
                                  label={goal.priority}
                                  color={getPriorityColor(goal.priority)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>

                          {expandedGoalId === goal.id && (
                            <Box sx={{ px: 4, pb: 2 }}>
                              <Paper elevation={2} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="body1" paragraph>
                                      <strong>Description:</strong> {goal.description}
                                    </Typography>
                                    <Typography variant="body1">
                                      <strong>Metrics:</strong> {goal.metrics}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={12} md={6}>
                                    <Typography variant="body1">
                                      <strong>Team:</strong> {goal.team}
                                    </Typography>
                                    <Typography variant="body1">
                                      <strong>Priority:</strong> {goal.priority}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {goal.progressUpdates?.length > 0 && (
                                  <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                      Progress History
                                    </Typography>
                                    {goal.progressUpdates.map((update, index) => (
                                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                       
                                          <Typography variant="caption" color="textSecondary">
                                            {new Date(update.date).toLocaleString('en-IN', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                            })}
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2">{update.note}</Typography>
                                        <Chip
                                          label={update.status}
                                          size="small"
                                          color={getStatusColor(update.status)}
                                          sx={{ mt: 1 }}
                                        />
                                          <Chip
  label={`${update.progress}%`}
  size="small"
  color={getStatusColor(update.progress)}
  sx={{ mt: 1 }}
/>

                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Paper>
                            </Box>
                          )}
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </LocalizationProvider>


  );
}
export default PerformanceManagement;