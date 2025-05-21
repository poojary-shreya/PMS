import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Container,
  Paper,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  InputAdornment,
  CircularProgress,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from "@mui/material";
import {
  ArrowBack,
  KeyboardArrowRight,
  Check,
  Description,
  CalendarToday,Add,
} from "@mui/icons-material";

// Main component
export default function ProjectManagementFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("templateSelection");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectType, setProjectType] = useState(null); // "team" or "company"
  const [projectData, setProjectData] = useState({
    basicInfo: {
      name: "",
      key: "",
      projectType: "",
      description: ""
    },
    timeline: {
      startDate: "",
      endDate: "",
      budget: ""
    }
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  

  // Check if we're in edit mode by examining URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const editMode = queryParams.get("edit") === "true";
    const id = queryParams.get("id");
    
    if (editMode && id) {
      setIsEditMode(true);
      setProjectId(id);
      loadProjectData(id);
    }
  }, [location]);

  const loadProjectData = async (id) => {
    setIsLoading(true);
    try {
      // First try to get the data from localStorage (passed from the projects page)
      const storedProject = localStorage.getItem('editProject');
      
      if (storedProject) {
        const projectToEdit = JSON.parse(storedProject);
        console.log("Project data loaded from localStorage:", projectToEdit);
        
        // Determine template based on project data
        const templateType = determineTemplateType(projectToEdit);
        setSelectedTemplate(templateType);
        
        // Determine project type (team or company)
        const projType = projectToEdit.projectManagement === "Team-managed project" ? "team" : "company";
        setProjectType(projType);
        
        // Debug the date values
        console.log("Original start date:", projectToEdit.startDate);
        console.log("Original end date:", projectToEdit.endDate);
        
        // Enhanced date handling with additional logging and fallback options
        let formattedStartDate = "";
        let formattedEndDate = "";
        
        if (projectToEdit.startDate) {
          formattedStartDate = formatDateForInput(projectToEdit.startDate);
          console.log("Formatted start date:", formattedStartDate);
        }
        
        if (projectToEdit.endDate) {
          formattedEndDate = formatDateForInput(projectToEdit.endDate);
          console.log("Formatted end date:", formattedEndDate);
        }
        
        // Additional fallback if dates are still empty
        if (!formattedStartDate && projectToEdit.startDate) {
          // Try direct ISO string format
          try {
            const startDateObj = new Date(projectToEdit.startDate);
            if (!isNaN(startDateObj.getTime())) {
              formattedStartDate = startDateObj.toISOString().split('T')[0];
              console.log("Fallback formatted start date:", formattedStartDate);
            }
          } catch (e) {
            console.error("Fallback date formatting failed:", e);
          }
        }
        
        if (!formattedEndDate && projectToEdit.endDate) {
          // Try direct ISO string format
          try {
            const endDateObj = new Date(projectToEdit.endDate);
            if (!isNaN(endDateObj.getTime())) {
              formattedEndDate = endDateObj.toISOString().split('T')[0];
              console.log("Fallback formatted end date:", formattedEndDate);
            }
          } catch (e) {
            console.error("Fallback date formatting failed:", e);
          }
        }
        
        // Ensure budget is handled properly (could be string or number)
        const budget = projectToEdit.budget ? String(projectToEdit.budget) : "";
        
        // Set project data
        setProjectData({
          basicInfo: {
            name: projectToEdit.name || "",
            key: projectToEdit.key || "",
            projectType: projectToEdit.type || "",
            description: projectToEdit.description || ""
          },
          timeline: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            budget: budget
          }
        });
        
        // Skip template selection and go directly to form
        setCurrentPage("projectForm");
      } else {
        // Fallback to API call if data isn't in localStorage
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        if (response.data.status === "success") {
          const projectToEdit = response.data.data;
          console.log("Project data loaded from API:", projectToEdit);
          
          // Same processing as above
          const templateType = determineTemplateType(projectToEdit);
          setSelectedTemplate(templateType);
          
          const projType = projectToEdit.projectManagement === "Team-managed project" ? "team" : "company";
          setProjectType(projType);
          
          // Enhanced date handling with additional logging
          let formattedStartDate = "";
          let formattedEndDate = "";
          
          if (projectToEdit.startDate) {
            formattedStartDate = formatDateForInput(projectToEdit.startDate);
            console.log("API formatted start date:", formattedStartDate);
          }
          
          if (projectToEdit.endDate) {
            formattedEndDate = formatDateForInput(projectToEdit.endDate);
            console.log("API formatted end date:", formattedEndDate);
          }
          
          // Additional fallback if dates are still empty
          if (!formattedStartDate && projectToEdit.startDate) {
            // Try direct ISO string format
            try {
              const startDateObj = new Date(projectToEdit.startDate);
              if (!isNaN(startDateObj.getTime())) {
                formattedStartDate = startDateObj.toISOString().split('T')[0];
                console.log("API fallback formatted start date:", formattedStartDate);
              }
            } catch (e) {
              console.error("API fallback date formatting failed:", e);
            }
          }
          
          if (!formattedEndDate && projectToEdit.endDate) {
            // Try direct ISO string format
            try {
              const endDateObj = new Date(projectToEdit.endDate);
              if (!isNaN(endDateObj.getTime())) {
                formattedEndDate = endDateObj.toISOString().split('T')[0];
                console.log("API fallback formatted end date:", formattedEndDate);
              }
            } catch (e) {
              console.error("API fallback date formatting failed:", e);
            }
          }
          
          // Ensure budget is handled properly
          const budget = projectToEdit.budget ? String(projectToEdit.budget) : "";
          
          setProjectData({
            basicInfo: {
              name: projectToEdit.name || "",
              key: projectToEdit.key || "",
              projectType: projectToEdit.type || "",
              description: projectToEdit.description || ""
            },
            timeline: {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
              budget: budget
            }
          });
          
          setCurrentPage("projectForm");
        }
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      // Handle error - maybe show an alert
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine template based on project data
  const determineTemplateType = (project) => {
    // This is a simplified logic - in a real app, you'd have more concrete mapping
    const templateMap = {
      "kanban": {
        id: "kanban",
        title: "KANBAN",
        subtitle: "Visualize workflow and maximize efficiency",
        description: "Visualize your project workflow with intuitive cards on a drag-and-drop board to track progress in real-time.",
        color: "#bbdefb",
        bgColor: "#2196f3",
        icon: "📊"
      },
      "scrum": {
        id: "scrum",
        title: "SCRUM",
        subtitle: "Iterative development with time-boxed sprints",
        description: "Organize work into fixed-length sprints with planning, daily standups, and retrospectives to continuously improve.",
        color: "#b2dfdb",
        bgColor: "#009688",
        icon: "🔄"
      },
      "business": {
        id: "business",
        title: "BUSINESS",
        subtitle: "Streamlined project management for business teams",
        description: "Perfect for marketing, finance, and operations teams with customizable workflows, reports, and stakeholder views.",
        color: "#c8e6c9",
        bgColor: "#4caf50",
        icon: "💼"
      }
    };
    
    // Try to determine template by project type
    if (project.type === "Software Development") {
      return templateMap.scrum;
    } else if (project.type === "Business" || project.type === "Marketing") {
      return templateMap.business;
    } else {
      // Default to kanban
      return templateMap.kanban;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      // First, try to clean up any potential date format issues
      // Some common formats might be "YYYY-MM-DD", "MM/DD/YYYY", etc.
      // Remove any time component if it exists
      const cleanedDateString = dateString.split('T')[0].split(' ')[0];
      
      // Try to create a date from the cleaned string
      const date = new Date(cleanedDateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "";
      }
      
      // Format date as YYYY-MM-DD for input fields
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      console.log(`Formatted date from ${dateString} to ${year}-${month}-${day}`);
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "";
    }
  };
  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  // Navigate to template details page
  const handleViewTemplateDetails = () => {
    setCurrentPage("templateDetails");
  };

  // Navigate to project type selection page
  const handleNavigateToProjectTypeSelection = () => {
    setCurrentPage("projectTypeSelection");
  };

  // Navigate to project form page
  const handleNavigateToProjectForm = (type) => {
    setProjectType(type);
    setCurrentPage("projectForm");
  };

  // Navigate back to template selection
  const handleBackToTemplates = () => {
    setCurrentPage("templateSelection");
  };

  // Navigate back to template details
  const handleBackToTemplateDetails = () => {
    setCurrentPage("templateDetails");
  };

  // Navigate back to project type selection
  const handleBackToProjectTypeSelection = () => {
    setCurrentPage("projectTypeSelection");
  };

  // Handle project creation/update submission
  const handleCreateProject = async (formData) => {
    setProjectData(formData);
    
    try {
      if (isEditMode) {
        // Update existing project
        await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
          ...formData,
          selectedTemplate,
          projectType
        });
        alert("Project updated successfully!");
      } else {
        // Create new project
        await axios.post('http://localhost:5000/api/projects', {
          ...formData,
          selectedTemplate,
          projectType
        });
        alert("Project created successfully!");
      }
      
      // Clean up localStorage
      localStorage.removeItem('editProject');
      
      // Navigate back to projects page
      navigate('/create-project');
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    }
  };

  // Get active step for stepper
  const getActiveStep = () => {
    switch (currentPage) {
      case "templateSelection":
        return 0;
      case "templateDetails":
        return 1;
      case "projectTypeSelection":
        return 2;
      case "projectForm":
        return 3;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit Project" : "Project Creation"}
      </Typography>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!isEditMode && (
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={getActiveStep()} alternativeLabel>
              <Step>
                <StepLabel>Select Template</StepLabel>
              </Step>
              <Step>
                <StepLabel>Template Details</StepLabel>
              </Step>
              <Step>
                <StepLabel>Project Type</StepLabel>
              </Step>
              <Step>
                <StepLabel>Create Project</StepLabel>
              </Step>
            </Stepper>
          </Box>
        )}

        {currentPage === "templateSelection" && (
          <TemplateSelectionPage 
            onSelectTemplate={handleSelectTemplate}
            selectedTemplate={selectedTemplate}
            onNext={handleViewTemplateDetails}
          />
        )}
        
        {currentPage === "templateDetails" && (
          <TemplateDetailsPage 
            template={selectedTemplate}
            onNext={handleNavigateToProjectTypeSelection}
            onBack={handleBackToTemplates}
          />
        )}
        
        {currentPage === "projectTypeSelection" && (
          <ProjectTypeSelectionPage 
            template={selectedTemplate}
            onSelect={handleNavigateToProjectForm}
            onBack={handleBackToTemplateDetails}
          />
        )}
        
        {currentPage === "projectForm" && (
          <ProjectFormPage 
            initialData={projectData}
            selectedTemplate={selectedTemplate}
            projectType={projectType}
            onSubmit={handleCreateProject}
            onBack={handleBackToProjectTypeSelection}
            isEditMode={isEditMode}
          />
        )}
      </Container>
    </Box>
  );
}

// Template Selection Page Component
function TemplateSelectionPage({ onSelectTemplate, selectedTemplate, onNext }) {
  const templates = [
    {
      id: "kanban",
      title: "KANBAN",
      subtitle: "Visualize workflow and maximize efficiency",
      description: "Visualize your project workflow with intuitive cards on a drag-and-drop board to track progress in real-time.",
      color: "#bbdefb",
      bgColor: "#2196f3",
      icon: "📊"
    },
    {
      id: "scrum",
      title: "SCRUM",
      subtitle: "Iterative development with time-boxed sprints",
      description: "Organize work into fixed-length sprints with planning, daily standups, and retrospectives to continuously improve.",
      color: "#b2dfdb",
      bgColor: "#009688",
      icon: "🔄"
    },
    {
      id: "business",
      title: "BUSINESS",
      subtitle: "Streamlined project management for business teams",
      description: "Perfect for marketing, finance, and operations teams with customizable workflows, reports, and stakeholder views.",
      color: "#c8e6c9",
      bgColor: "#4caf50",
      icon: "💼"
    }
  ];

  return (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 4 }}>
        Select a template for your project
      </Typography>
      
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card 
              sx={{ 
                height: "100%", 
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: selectedTemplate?.id === template.id ? 4 : 1,
                border: selectedTemplate?.id === template.id ? 2 : 0,
                borderColor: selectedTemplate?.id === template.id ? "primary.main" : "transparent",
                "&:hover": {
                  boxShadow: 4
                }
              }}
              onClick={() => onSelectTemplate(template)}
            >
              <CardMedia
                component="div"
                sx={{
                  bgcolor: template.bgColor,
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem"
                }}
              >
                {template.icon}
              </CardMedia>
              <CardContent>
                <Typography variant="h6" component="h3" fontWeight="bold">
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {template.subtitle}
                </Typography>
                <Typography variant="body2">
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={!selectedTemplate}
          endIcon={<KeyboardArrowRight />}
        >
          Next
        </Button>
      </Box>
    </Paper>
  );
}


function TemplateDetailsPage({ template, onNext, onBack }) {
  if (!template) return null;

  const getTemplateBenefits = () => {
    if (template.id === "kanban") {
      return [
        "Visualize tasks and workflow stages at a glance",
        "Identify and eliminate bottlenecks quickly",
        "Optimize resource allocation across projects",
        "Improve delivery predictability with flow metrics"
      ];
    } else if (template.id === "scrum") {
      return [
        "Deliver value in short, focused iterations",
        "Adapt to changing requirements efficiently",
        "Increase team collaboration and ownership",
        "Facilitate continuous improvement through retrospectives"
      ];
    } else {
      return [
        "Streamline cross-functional team coordination",
        "Enhance visibility into project financials",
        "Simplify resource planning and allocation",
        "Create professional dashboards for stakeholders"
      ];
    }
  };

  const getBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 2 }}>
      <Link
        component="button"
        variant="body2"
        color="inherit"
        onClick={onBack}
        sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
      >
        Project templates
      </Link>
      <Typography color="text.primary">{template.title}</Typography>
    </Breadcrumbs>
  );

  return (
    <Box>
      {getBreadcrumbs()}
      
      <Paper elevation={3} sx={{ p: 0, mb: 4, overflow: "hidden" }}>
        {/* Banner */}
        <Box sx={{ p: 4, bgcolor: template.bgColor, color: "white", height: "100px" }}>
          <Typography variant="h5" gutterBottom>{template.title}</Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {template.subtitle}
          </Typography>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {template.id === "kanban" ? (
              <>
                Kanban is a visual workflow management method that helps teams optimize productivity and efficiency. Originating from Toyota's manufacturing principles, modern Kanban helps teams visualize their work, limit work-in-progress, and identify bottlenecks to continuously improve flow and deliver value faster. It adapts to your existing workflow while providing powerful metrics to drive improvement.
              </>
            ) : template.id === "scrum" ? (
              <>
                Scrum is a lightweight agile framework that empowers teams to tackle complex problems through iterative development. With fixed-length sprints, daily synchronization meetings, and defined roles, Scrum creates a rhythm of planning, execution, and reflection. Teams build a product increment each sprint, gathering feedback and adjusting priorities to maximize value delivery.
              </>
            ) : (
              <>
                The Business template provides a flexible environment for managing non-software projects with business-oriented workflows and views. Designed for marketing campaigns, finance projects, operations initiatives, and cross-functional collaboration, this template comes with customizable reporting tools, resource management, and specialized views for different stakeholder needs.
              </>
            )}
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Key Features</Typography>
              <List>
                {getTemplateBenefits().map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Check color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>How it works</Typography>
            {template.id === "kanban" && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Visualize work with digital cards</strong> - Each work item is represented as a card that moves across your customizable board columns. At a glance, see what's in progress, who's working on what, and where bottlenecks are forming in your workflow.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Optimize flow with WIP limits</strong> - Set work-in-progress limits for each column to prevent overloading team members and ensure smoother delivery. Flow metrics help you identify process improvements and make data-driven decisions about resource allocation.
                </Typography>
              </>
            )}
            {template.id === "scrum" && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Organize work into sprints</strong> - Plan your work in 1-4 week sprints with clearly defined goals. The sprint backlog makes work transparent while the burndown chart provides real-time visibility into progress toward sprint goals.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Facilitate continuous improvement</strong> - Built-in ceremonies like sprint planning, daily standups, and retrospectives foster team collaboration and adaptation. The product backlog ensures the team always knows what's next and what delivers the most value.
                </Typography>
              </>
            )}
            {template.id === "business" && (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Flexibility for business teams</strong> - Easily switch between list, board, calendar, and Gantt views to visualize project information in the most relevant format. Custom fields let you track budgets, ROI, campaign metrics, and any other business-specific data.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Enhanced stakeholder engagement</strong> - Create specialized dashboards and reports for different stakeholders with exactly the information they need. Approval workflows, automated notifications, and document management streamline collaboration across departments.
                </Typography>
              </>
            )}
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={onNext}
              endIcon={<KeyboardArrowRight />}
            >
              Use template
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

// Project Type Selection Page Component
function ProjectTypeSelectionPage({ template, onSelect, onBack }) {
  if (!template) return null;

  return (
    <Box>
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          color: "primary.main", 
          cursor: "pointer", 
          mb: 2,
          "&:hover": { textDecoration: "underline" } 
        }}
        onClick={onBack}
      >
        <ArrowBack fontSize="small" sx={{ mr: 1 }} />
        <Typography>Back to template details</Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 1, 
              color: "white", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "1.5rem", 
              mr: 2 
            }}
          >
            {template.icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold">{template.title}</Typography>
            <Typography variant="body2" color="text.secondary">{template.description}</Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Choose a project type</Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ borderTop: 4, borderColor: "primary.main", pt: 2 }}>
              <Typography variant="h6" color="primary.dark" fontWeight="bold" sx={{ mb: 1 }}>
                Team-managed
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                Autonomous and self-contained workspaces.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Perfect for teams that want complete control over their processes, tools, and workflows. Team members can customize their workspace as needed and adapt quickly to changing requirements without dependencies on other teams.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onSelect("team")}
              >
                Select a team-managed project
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ borderTop: 4, borderColor: "primary.main", pt: 2 }}>
              <Typography variant="h6" color="primary.dark" fontWeight="bold" sx={{ mb: 1 }}>
                Company-managed
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                Standardized environments with central governance.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ideal for enterprise coordination where consistency and compliance are essential. Centralized administration ensures alignment with organizational standards while enabling seamless collaboration across multiple teams and departments.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onSelect("company")}
              >
                Select a company-managed project
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

// Project Form Page Component
function ProjectFormPage({ initialData, selectedTemplate, projectType, onSubmit, onBack, isEditMode = false }) {
  const [projectData, setProjectData] = useState({
    ...initialData,
    basicInfo: {
      ...initialData.basicInfo,
      projectType: initialData.basicInfo.projectType || (selectedTemplate?.id === "business" ? "Business" : "Software")
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectType, setNewProjectType] = useState("");
  
  const [projectTypes, setProjectTypes] = useState([
    { value: "Software", label: "Software Development" },
    { value: "Hardware", label: "Hardware" },
    { value: "Business", label: "Business" },
    { value: "Marketing", label: "Marketing" }
  ]);
  
  // Form handlers
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      basicInfo: {
        ...projectData.basicInfo,
        [name]: value
      }
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  const handleTimelineChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      timeline: {
        ...projectData.timeline,
        [name]: value
      }
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Generate project key based on name
  const generateProjectKey = () => {
    if (projectData.basicInfo.name && !isEditMode) {
      const words = projectData.basicInfo.name.split(" ");
      let key = "";
      
      for (let i = 0; i < Math.min(words.length, 3); i++) {
        if (words[i]) {
          key += words[i][0].toUpperCase();
        }
      }
      
      if (key.length < 3) {
        key += "PRJ";
      }
      
      setProjectData({
        ...projectData,
        basicInfo: {
          ...projectData.basicInfo,
          key: key
        }
      });
    }
  };
// In ProjectFormPage component, around line ~818
const handleAddProjectType = async () => {
  if (!newProjectType.trim()) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Call API to create new project type
    const response = await axios.post('http://localhost:5000/api/projects/type', {
      value: newProjectType.trim(),
      label: newProjectType.trim()
    });
    
    if (response.data.status === "success") {
      const newType = {
        value: response.data.data.value,
        label: response.data.data.label
      };
      
      // Update state with new project type
      const updatedTypes = [...projectTypes, newType];
      setProjectTypes(updatedTypes);
      
      // Update the project data with the new project type
      setProjectData({
        ...projectData,
        basicInfo: {
          ...projectData.basicInfo,
          projectType: newType.value // Make sure to use the value, not the whole object
        }
      });
      
      console.log("Project data after adding new type:", {
        ...projectData,
        basicInfo: {
          ...projectData.basicInfo,
          projectType: newType.value
        }
      });
      
      // Close dialog
      handleCloseDialog();
    }
  } catch (error) {
    console.error("Error creating project type:", error);
    
    // Handle error
    if (error.response && error.response.data) {
      setApiError(error.response.data.message || "Failed to create project type");
    } else {
      setApiError("Failed to create project type. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

// Fix for handleSubmit in ProjectFormPage
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setLoading(true);
  setApiError(null);
  
  try {
    // Log the project data before submission
    console.log("Submitting project data:", projectData);
    
    // Call onSubmit to handle API call
    onSubmit(projectData);
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.error("Error saving project:", error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const serverErrors = error.response.data.errors;
      if (serverErrors) {
        // Map server validation errors to form fields
        const formErrors = {};
        Object.entries(serverErrors).forEach(([key, value]) => {
          if (value) formErrors[key] = value;
        });
        setErrors({...errors, ...formErrors});
      }
      setApiError(error.response.data.message || "Server error occurred");
    } else if (error.request) {
      // Request made but no response received
      setApiError("No response received from server. Please check your connection.");
    } else {
      // Error setting up request
      setApiError(error.message || "An unexpected error occurred");
    }
  }
};
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewProjectType("");
  };
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate basic info
    if (!projectData.basicInfo.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!projectData.basicInfo.key.trim()) {
      newErrors.key = "Project key is required";
    } else if (!/^[A-Z][A-Z0-9]{2,9}$/.test(projectData.basicInfo.key)) {
      newErrors.key = "Project key must be 3-10 uppercase letters/numbers and start with a letter";
    }
    
    if (!projectData.basicInfo.projectType) {
      newErrors.projectType = "Project type is required";
    }
    
    if (!projectData.basicInfo.description.trim()) {
      newErrors.description = "Project description is required";
    }
    
    // Validate timeline
    if (!projectData.timeline.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!projectData.timeline.endDate) {
      newErrors.endDate = "End date is required";
    } else if (
      projectData.timeline.startDate && 
      new Date(projectData.timeline.endDate) <= new Date(projectData.timeline.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    
    // Validate budget
    if (!projectData.timeline.budget) {
      newErrors.budget = "Budget is required";
    } else if (isNaN(parseFloat(projectData.timeline.budget)) || parseFloat(projectData.timeline.budget) <= 0) {
      newErrors.budget = "Budget must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!isEditMode && projectData.basicInfo.name && !projectData.basicInfo.key) {
      const generatedKey = generateProjectKey(projectData.basicInfo.name);
      setProjectData({
        ...projectData,
        basicInfo: {
          ...projectData.basicInfo,
          key: generatedKey
        }
      });
    }
  }, [projectData.basicInfo.name, isEditMode]);

  
  


  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 4 }}>
      {isEditMode ? "Edit Project" : `Create ${projectType === "team" ? "Team-Managed" : "Company-Managed"} Project`}
      </Typography>
      
      {apiError && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "#ffebee", borderRadius: 1 }}>
          <Typography color="error">{apiError}</Typography>
        </Box>
      )}
      
      {!isEditMode && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box 
            sx={{ 
              display: "inline-flex", 
              alignItems: "center", 
              color: "primary.main", 
              cursor: "pointer", 
              "&:hover": { textDecoration: "underline" } 
            }}
            onClick={onBack}
          >
            <ArrowBack fontSize="small" sx={{ mr: 1 }} />
            <Typography>Back to project type</Typography>
          </Box>
        </Box>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            <Description sx={{ mr: 1, verticalAlign: "middle" }} />
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project Name"
                name="name"
                fullWidth
                required
                value={projectData.basicInfo.name}
                onChange={handleBasicInfoChange}
                onBlur={generateProjectKey}
                error={!!errors.name}
                helperText={errors.name || "Give your project a descriptive name"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project Key"
                name="key"
                fullWidth
                required
                value={projectData.basicInfo.key}
                onChange={handleBasicInfoChange}
                disabled={isEditMode}
                error={!!errors.key}
                helperText={errors.key || "3-10 character unique identifier (auto-generated)"}
                InputProps={{
                  sx: isEditMode ? { bgcolor: "#f5f5f5" } : {}
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.projectType} disabled={loading}>
                <InputLabel id="project-type-label">Project type</InputLabel>
                <Select
                  labelId="project-type-label"
                  id="project-type"
                  name="projectType"
                  value={projectData.basicInfo.projectType}
                  onChange={handleBasicInfoChange}
                  label="Project type"
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.projectType && (
                  <FormHelperText>{errors.projectType}</FormHelperText>
                )}
              </FormControl>
              
              <Button
                startIcon={<Add />}
                onClick={handleOpenDialog}
                sx={{ mt: 1 }}
                disabled={loading}
              >
                Add project type
              </Button>
            </Grid>
            
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Management"
                value={projectType === "team" ? "Team-managed project" : "Company-managed project"}
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Project Description"
                name="description"
                fullWidth
                required
                multiline
                rows={4}
                value={projectData.basicInfo.description}
                onChange={handleBasicInfoChange}
                error={!!errors.description}
                helperText={errors.description || "Describe the purpose and goals of this project"}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            <CalendarToday sx={{ mr: 1, verticalAlign: "middle" }} />
            Timeline & Budget
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                fullWidth
                required
                value={projectData.timeline.startDate}
                onChange={handleTimelineChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                fullWidth
                required
                value={projectData.timeline.endDate}
                onChange={handleTimelineChange}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Budget"
                name="budget"
                fullWidth
                required
                value={projectData.timeline.budget}
                onChange={handleTimelineChange}
                error={!!errors.budget}
                helperText={errors.budget || "Total budget for this project"}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          {!isEditMode && (
            <Button
              variant="outlined"
              color="primary"
              onClick={onBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            {isEditMode ? "Save Changes" : "Create Project"}
          </Button>
        </Box>
      </form>
       {/* Dialog for adding custom project type */}
       <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add custom project type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a custom project type that fits your organization's needs.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Project type name"
            fullWidth
            variant="outlined"
            value={newProjectType}
            onChange={(e) => setNewProjectType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddProjectType} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

