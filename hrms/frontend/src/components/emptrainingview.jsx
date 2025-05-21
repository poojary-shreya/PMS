import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  FormControl, CircularProgress, Alert, Divider, Paper, Chip, 
  Accordion, AccordionSummary, AccordionDetails, LinearProgress, Select, MenuItem,
  Radio, RadioGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, 
  DialogActions, Badge, Slider
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import HistoryIcon from '@mui/icons-material/History';
import UpdateIcon from '@mui/icons-material/Update';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function EmployeeTrainingView() {
  const [employeeId, setEmployeeId] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTrainings, setShowTrainings] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" or "test"
  const [form, setForm] = useState({
    employee_id: ""
  });
  const [progressUpdate, setProgressUpdate] = useState({
    status: "",
    progressPercentage: 0,
    completionNotes: "",
    completionDate: null
  });
  
  // Test related states
  const [testQuestions, setTestQuestions] = useState([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [showTest, setShowTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [videosCompleted, setVideosCompleted] = useState(false);
  const [retakingTest, setRetakingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [filteredQuestions, setFilteredQuestions] = useState([]);


  const statusOptions = ["Not Started", "In Progress", "Completed", "Deferred"];

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        
        const response = await axios.get("http://localhost:5000/api/user/current", {withCredentials: true});
        
        const employeeIdFromSession = response.data.employee_id || "";
        setForm(prevForm => ({
          ...prevForm,
          employee_id: employeeIdFromSession
        }));
       
        setEmployeeId(employeeIdFromSession);
      } catch (err) {
        console.error("Failed to fetch employee ID from session:", err);
        setError("Failed to load employee information");
      }
    };
  
    fetchEmployeeId();
  }, []);

 
  useEffect(() => {
    if (selectedTraining && selectedTraining.skillCategory && selectedTraining.skillContent) {
      fetchRelatedVideos(selectedTraining.skillCategory, selectedTraining.skillContent);
      fetchUpdateHistory(selectedTraining.id);
      fetchTestQuestions(selectedTraining.skillCategory, selectedTraining.skillContent);
      checkTestStatus(selectedTraining.id);
    }
  }, [selectedTraining]);

  useEffect(() => {
    if (selectedTraining && testQuestions.length > 0) {
     
      const filtered = testQuestions.filter(question => 
        question.skillContent === selectedTraining.skillContent
      );
      setFilteredQuestions(filtered.length > 0 ? filtered : testQuestions);
      setCurrentQuestionIndex(0); 
    }
  }, [testQuestions, selectedTraining]);

  const fetchTrainings = async () => {
    if (!employeeId.trim()) {
      setError("Please enter an employee ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/trainings/employee/id/${employeeId}`,{ withCredentials: true});
      if (response.data.length === 0) {
        setError("No trainings found for this employee ID");
        setShowTrainings(false);
      } else {
        setTrainings(response.data);
        setShowTrainings(true);
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError(error.response?.data?.message || "Failed to fetch trainings");
      setShowTrainings(false);
    } finally {
      setLoading(false);
    }
  };


  const fetchUpdateHistory = async (trainingId) => {
    setLoadingHistory(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/trainings/${trainingId}/history`,
        { withCredentials: true }
      );
      setUpdateHistory(response.data);
    } catch (error) {
      console.error("Error fetching update history:", error);
      setUpdateHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };


  const fetchRelatedVideos = async (category, content) => {
    setLoadingVideos(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/training-videos/category/${category}/content/${content}`
      );
      
   
      const formattedVideos = response.data.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || "Training video for " + video.skillContent,
        url: video.videoUrl
      }));
      
      setRelatedVideos(formattedVideos);
    } catch (error) {
      console.error("Error fetching related videos:", error);
      setRelatedVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };
  
  const handleTakeTest = () => {
   
    setTestAnswers({});
    setTestSubmitted(false);
    setShowTest(true);
    setRetakingTest(testSubmitted);
    setCurrentQuestionIndex(0);
    
 
    if (filteredQuestions.length === 0 && selectedTraining) {
    
      fetchTestQuestions(selectedTraining.skillCategory, selectedTraining.skillContent);
    }
  };

  const fetchTestQuestions = async (category, content) => {
    setLoadingTest(true);
    try {
     
      const response = await axios.get(
        `http://localhost:5000/api/test-questions`,
        { 
          params: { 
            skillCategory: category, 
            skillContent: content 
          },
          withCredentials: true 
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
       
        const formattedQuestions = response.data.map(q => {
  
          const options = {};
          if (q.optionA) options.A = q.optionA;
          if (q.optionB) options.B = q.optionB;
          if (q.optionC) options.C = q.optionC;
          if (q.optionD) options.D = q.optionD;
          
          return {
            id: q.id,
            question: q.question,
            options: options,
            correctAnswer: q.correctAnswer,
            skillContent: q.skillContent,
            skillCategory: q.skillCategory,
            ...q
          };
        });
        
        setTestQuestions(formattedQuestions);
      } else {
        console.error("Invalid test questions data format:", response.data);
        setTestQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching test questions:", error);
      setTestQuestions([]);
    } finally {
      setLoadingTest(false);
    }
  };
  const checkTestStatus = async (trainingId) => {
    if (!trainingId || !employeeId) return;
    
    try {
     
      const response = await axios.get(
        `http://localhost:5000/api/test-results/training/${trainingId}/employee/${employeeId}`,
        { withCredentials: true }
      );
      
      console.log("Test status response:", response.data);
      
      if (response.data && response.data.result) {
        setTestResult(response.data);
        setTestSubmitted(true);
   
        if (response.data.passed) {
          setVideosCompleted(true);
        }
      } else {
        setTestResult(null);
        setTestSubmitted(false);
      }
    } catch (error) {
      console.error("Error checking test status:", error);
 
      setTestResult(null);
      setTestSubmitted(false);
    }
  };

  const handleTrainingSelect = (training) => {
    setSelectedTraining(training);
    setProgressUpdate({
      status: training.status || "Not Started",
      progressPercentage: training.progressPercentage || 0,
      completionNotes: training.completionNotes || "",
      completionDate: training.completionDate || null
    });
    

    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
    setShowTest(false);
    setVideosCompleted(training.progressPercentage >= 50);
    setActiveTab("videos");
    setRetakingTest(false);
    setCurrentQuestionIndex(0);
   
  };

  const handleProgressChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "status" && value === "Completed") {
      setProgressUpdate(prev => ({
        ...prev,
        [name]: value,
        completionDate: new Date().toISOString().split('T')[0]
      }));
    } else {
      setProgressUpdate(prev => ({
        ...prev,
        [name]: name === "progressPercentage" ? parseInt(value) : value
      }));
    }
  };

  const updateTrainingProgress = async () => {
    if (!selectedTraining) return;
    
    try {
      const updateData = {
        ...progressUpdate,
        employeeId: employeeId,
        employeeName: selectedTraining.employee || "Employee", 
        updateDate: new Date().toISOString()
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/trainings/${selectedTraining.id}/progress`, 
        updateData
      );
      
      
      const updatedTrainings = trainings.map(training => 
        training.id === selectedTraining.id ? { ...training, ...progressUpdate } : training
      );
      setTrainings(updatedTrainings);
      setSelectedTraining({ ...selectedTraining, ...progressUpdate });
     
      fetchUpdateHistory(selectedTraining.id);
      
      setSuccess("Training progress updated successfully!");
    } catch (error) {
      console.error("Error updating training progress:", error);
      setError(error.response?.data?.message || "Failed to update training progress");
    }
  };

  const handleCloseTest = () => {
    setShowTest(false);
  };

  const handleAnswerChange = (questionId, answer) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isQuestionAnswered = (questionId) => {
    return testAnswers[questionId] !== undefined;
  };
  const handleSubmitTest = async () => {
    if (!selectedTraining) {
      setError("No training selected");
      return;
    }
  
   
    if (filteredQuestions.length === 0) {
      setError("No questions available for this test");
      return;
    }
  

    const answeredQuestions = Object.keys(testAnswers).length;
    if (answeredQuestions !== filteredQuestions.length) {
      setError(`Please answer all questions before submitting. ${answeredQuestions}/${filteredQuestions.length} questions answered.`);
      return;
    }
  
    try {
     
      let correctAnswers = 0;
      for (const question of filteredQuestions) {
        const userAnswer = testAnswers[question.id];
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      }
      const clientScore = Math.round((correctAnswers / filteredQuestions.length) * 100);
   
      const testSubmission = {
        trainingId: selectedTraining.id,
        employeeId: employeeId,
        answers: testAnswers,
        submissionDate: new Date().toISOString(),
        skillCategory: selectedTraining.skillCategory,
        skillContent: selectedTraining.skillContent
      };
  
      console.log("Submitting test with data:", testSubmission);
  
     
      const response = await axios.post(
        `http://localhost:5000/api/test-questions/submit`,
        testSubmission,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
  
      console.log("Test submission response:", response.data);
  
      let result;
      if (response.data && typeof response.data === 'object') {
   
        result = {
          passed: response.data.passed === true,
          score: response.data.score !== undefined ? response.data.score : clientScore,
          feedback: response.data.feedback || ""
        };
      } else {
      
        result = {
          passed: clientScore >= 70,
          score: clientScore,
          feedback: clientScore >= 70 ? 
            "Congratulations! You passed the test." : 
            "You did not pass. Please review the material and try again."
        };
      }
  
      console.log("Final test result:", result);
      
      setTestResult(result);
      setTestSubmitted(true);
      setShowTest(false);
  
      
      if (result.passed && selectedTraining.status !== "Completed") {
        const today = new Date().toISOString().split('T')[0];
        const updateData = {
          status: "Completed",
          progressPercentage: 100,
          completionNotes: `Test passed on ${today}. Training completed.`,
          completionDate: today,
          employeeId: employeeId,
          employeeName: selectedTraining.employee || "Employee",
          updateDate: new Date().toISOString()
        };
  
        try {
          await axios.put(
            `http://localhost:5000/api/trainings/${selectedTraining.id}/progress`, 
            updateData,
            { withCredentials: true }
          );
  
         
          const updatedTrainings = trainings.map(training => 
            training.id === selectedTraining.id ? { ...training, ...updateData } : training
          );
          setTrainings(updatedTrainings);
          setSelectedTraining({ ...selectedTraining, ...updateData });
          setProgressUpdate(updateData);
          
    
          fetchUpdateHistory(selectedTraining.id);
          
          setSuccess("Congratulations! You passed the test and completed the training.");
        } catch (updateError) {
          console.error("Error updating training progress:", updateError);
          setSuccess("Test passed successfully! However, there was an issue updating your training progress. Please try refreshing the page.");
        }
      } else if (result.passed) {
        setSuccess("Test passed successfully!");
      } else {
        setError("You did not pass the test. Please review the material and try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timed out. Please check your connection and try again.");
        return;
      }
      
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
        
        if (error.response.status === 404) {
          setError("The test submission endpoint could not be found. Please contact IT support or try again later.");
        } else if (error.response.status === 401 || error.response.status === 403) {
          setError("You are not authorized to submit this test. Please log in again.");
        } else {
          setError(error.response.data?.message || `Server error (${error.response.status}). Please try again later.`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection and try again.");
      } else {
        setError(`Failed to submit test: ${error.message || "Unknown error"}`);
      }
    }
  };
  const handleRetakeTest = () => {
    setTestSubmitted(false);
    setTestResult(null);
    setTestAnswers({});
    setShowTest(true);
    setRetakingTest(true);
    setCurrentQuestionIndex(0);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      case "Deferred": return "warning";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };


  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };


  const YouTubeEmbed = ({ videoUrl }) => {
    const videoId = getYouTubeVideoId(videoUrl);
    
    if (!videoId) return null;
    
    return (
      <Box sx={{ width: '100%', height: 0, paddingBottom: '56.25%', position: 'relative', mb: 3 }}>
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    );
  };
 
  const handleVideosCompleted = () => {
    setVideosCompleted(true);
    setActiveTab("test");
    
    if (progressUpdate.progressPercentage < 50) {
      const updatedProgress = {
        ...progressUpdate,
        progressPercentage: 50,
        status: "In Progress"
      };
      setProgressUpdate(updatedProgress);

      const updateData = {
        ...updatedProgress,
        employeeId: employeeId,
        employeeName: selectedTraining.employee || "Employee",
        updateDate: new Date().toISOString()
      };
      
      axios.put(
        `http://localhost:5000/api/trainings/${selectedTraining.id}/progress`, 
        updateData
      ).then(() => {
    
        const updatedTrainings = trainings.map(training => 
          training.id === selectedTraining.id ? { ...training, ...updatedProgress } : training
        );
        setTrainings(updatedTrainings);
        setSelectedTraining({ ...selectedTraining, ...updatedProgress });
      }).catch(error => {
        console.error("Error updating progress after video completion:", error);
      });
    }
    
    setSuccess("Videos completed! Now take the assessment test to complete your training.");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ 
        p: 3, 
        flexGrow: 1, 
        overflow: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}>
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Access Your Training Records
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8} md={9}>
                <TextField
                  fullWidth
                  label="Enter Employee ID"
                  variant="outlined"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={fetchTrainings}
                  disabled={loading}
                  sx={{ height: "56px" }}
                >
                  {loading ? <CircularProgress size={24} /> : "View My Trainings"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {showTrainings && (
          <Grid container spacing={3} sx={{ height: 'calc(100% - 100px)' }}>
            <Grid item xs={12} md={4} lg={3} sx={{ height: { md: '100%' }, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                My Training Programs
              </Typography>
              <Paper sx={{ 
                flexGrow: 1, 
                overflow: "auto", 
                maxHeight: { xs: '400px', md: 'none' }, 
                boxShadow: 3 
              }}>
                {trainings.map((training) => (
                  <Box
                    key={training.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: "pointer",
                      borderLeft: selectedTraining?.id === training.id ? "4px solid #1976d2" : "none",
                      bgcolor: selectedTraining?.id === training.id ? "rgba(25, 118, 210, 0.08)" : "transparent",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" }
                    }}
                    onClick={() => handleTrainingSelect(training)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {training.title}
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item>
                        <Chip 
                          size="small" 
                          label={training.status || "Not Started"} 
                          color={getStatusChipColor(training.status)} 
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item>
                        <Chip 
                          size="small" 
                          label={`${training.progressPercentage || 0}% Complete`} 
                          variant="outlined" 
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {formatDate(training.startDate)} - {formatDate(training.endDate)}
                    </Typography>
                    {training.completionDate && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                        Completed: {formatDate(training.completionDate)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12} md={8} lg={9} sx={{ height: { md: '100%' }, display: 'flex', flexDirection: 'column' }}>
              {selectedTraining ? (
                <Card sx={{ boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedTraining.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                  
                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant={activeTab === "videos" ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setActiveTab("videos")}
                        startIcon={<OndemandVideoIcon />}
                      >
                        Training Videos
                      </Button>
                      <Button
                        variant={activeTab === "test" ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => setActiveTab("test")}
                        startIcon={<QuizIcon />}
                        disabled={!videosCompleted && !testSubmitted}
                      >
                        Assessment Test
                        {testResult?.passed && (
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                        )}
                      </Button>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Start Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(selectedTraining.startDate)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                End Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(selectedTraining.endDate)}
                              </Typography>
                            </Grid>
                            {selectedTraining.status === "Completed" && selectedTraining.completionDate && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                  Completion Date
                                </Typography>
                                <Typography variant="body1" color="success.main">
                                  {formatDate(selectedTraining.completionDate)}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Trainer
                          </Typography>
                          <Typography variant="body1">
                            {selectedTraining.trainer}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Skill Category
                          </Typography>
                          <Typography variant="body1">
                            {selectedTraining.skillCategory}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Skill Content
                          </Typography>
                          <Typography variant="body1">
                            {selectedTraining.skillContent}
                          </Typography>
                        </Box>

                      
                        {activeTab === "videos" && (
                          <>
                      
                            {selectedTraining.videoUrl && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Main Training Video
                                </Typography>
                                <YouTubeEmbed videoUrl={selectedTraining.videoUrl} />
                              </Box>
                            )}
                            
                          
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                Related Training Videos
                              </Typography>
                              
                              {loadingVideos ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                  <CircularProgress size={30} />
                                </Box>
                              ) : relatedVideos.length > 0 ? (
                                <Box>
                                  {relatedVideos.map((video, index) => (
                                    <Box key={index} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                                      <Typography variant="subtitle1" fontWeight="medium">{video.title}</Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {video.description}
                                      </Typography>
                                      <YouTubeEmbed videoUrl={video.url} />
                                    </Box>
                                  ))}
                                  
                                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button 
                                      variant="contained" 
                                      color="primary"
                                      onClick={handleVideosCompleted}
                                      disabled={videosCompleted}
                                    >
                                      {videosCompleted ? "Videos Completed" : "I've Completed Watching All Videos"}
                                    </Button>
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                                  <Typography color="text.secondary">
                                    No related videos available for this skill category.
                                  </Typography>
                                  
                                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button 
                                      variant="contained" 
                                      color="primary"
                                      onClick={handleVideosCompleted}
                                    >
                                      Continue to Assessment Test
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </>
                        )}
                        
                        {activeTab === "test" && (
  <>
   
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Skill Assessment Test for {selectedTraining.skillContent}
      </Typography>
      
      {loadingTest ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      ) : testSubmitted ? (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
       
         
          
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            {testResult && testResult.passed ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                Congratulations! You Passed!
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
                <ErrorOutlineIcon sx={{ mr: 1 }} />
                You Did Not Pass
              </Box>
            )}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your Score: {testResult ? (testResult.score || 0) : 0}%
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {testResult && testResult.passed 
              ? "You have successfully completed this training module." 
              : "Please review the training materials and try again."}
          </Typography>
          
          {(!testResult || !testResult.passed) && (
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              onClick={handleRetakeTest}
            >
              Retake Test
            </Button>
          )}
        </Box>
      ) : (
        
                                <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                                  <Typography variant="body1" sx={{ mb: 3 }}>
                                    This assessment test will evaluate your understanding of the training material.
                                    You must score 70% or higher to pass.
                                  </Typography>
                                  
                                  <Button 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth
                                    onClick={handleTakeTest}
                                  >
                                    Take Assessment Test
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                  
                        <Paper sx={{ p: 2, mb: 3, boxShadow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            <UpdateIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Update Progress
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Status
                                </Typography>
                                <Select
                                  value={progressUpdate.status}
                                  name="status"
                                  onChange={handleProgressChange}
                                  size="small"
                                >
                                  {statusOptions.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Progress: {progressUpdate.progressPercentage}%
                              </Typography>
                              <Slider
                                value={progressUpdate.progressPercentage}
                                onChange={(e, newValue) => 
                                  setProgressUpdate(prev => ({ ...prev, progressPercentage: newValue }))
                                }
                                min={0}
                                max={100}
                                step={10}
                                marks
                                valueLabelDisplay="auto"
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Completion Notes"
                                name="completionNotes"
                                value={progressUpdate.completionNotes}
                                onChange={handleProgressChange}
                                size="small"
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Button 
                                variant="contained" 
                                color="primary"
                                onClick={updateTrainingProgress}
                                fullWidth
                              >
                                Update Progress
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                        
                      
                        <Accordion sx={{ mb: 3, boxShadow: 1 }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <Typography>
                              <HistoryIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Progress History
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {loadingHistory ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                              </Box>
                            ) : updateHistory.length > 0 ? (
                              <Box>
                                {updateHistory.map((update, index) => (
                                  <Box 
                                    key={index} 
                                    sx={{ 
                                      p: 2, 
                                      mb: 1, 
                                      bgcolor: 'background.paper', 
                                      borderRadius: 1,
                                      boxShadow: 1
                                    }}
                                  >
                                    <Typography variant="subtitle2">
                                      Status: {update.status}
                                    </Typography>
                                    <Typography variant="body2">
                                      Progress: {update.progressPercentage}%
                                    </Typography>
                                    {update.completionNotes && (
                                      <Typography variant="body2" color="text.secondary">
                                        Notes: {update.completionNotes}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      Updated: {formatDateTime(update.updateDate)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Typography color="text.secondary" align="center">
                                No update history available.
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 3,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <Box>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Select a Training
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a training from the list to view details and track your progress.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
      

      <Dialog 
        open={showTest} 
        onClose={handleCloseTest}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Assessment Test: {selectedTraining?.skillContent}
            </Typography>
            <Typography variant="body2">
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {filteredQuestions.length > 0 && currentQuestionIndex < filteredQuestions.length ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {filteredQuestions[currentQuestionIndex].question}
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                <RadioGroup
                  value={testAnswers[filteredQuestions[currentQuestionIndex].id] || ''}
                  onChange={(e) => handleAnswerChange(filteredQuestions[currentQuestionIndex].id, e.target.value)}
                >
                  {Object.entries(filteredQuestions[currentQuestionIndex].options).map(([key, value]) => (
                    <FormControlLabel 
                      key={key} 
                      value={key} 
                      control={<Radio />} 
                      label={`${key}: ${value}`}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  variant="outlined"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Box>
              
{currentQuestionIndex === filteredQuestions.length - 1 ? (
  <Button 
    variant="contained" 
    color="primary"
    onClick={handleSubmitTest}
    disabled={!isQuestionAnswered(filteredQuestions[currentQuestionIndex].id)}
  >
    Submit Test ({Object.keys(testAnswers).length}/{filteredQuestions.length} Answered)
  </Button>
) : (
  <Button 
    variant="contained" 
    color="primary"
    onClick={handleNextQuestion}
    disabled={!isQuestionAnswered(filteredQuestions[currentQuestionIndex].id)}
  >
    Next
  </Button>
)}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <CircularProgress size={30} />
              <Typography>Loading test questions...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTest} color="primary">
            Cancel Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployeeTrainingView;