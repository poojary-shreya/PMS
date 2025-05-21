import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Card, CardContent, Typography, TextField, Button, Grid, Box,
  FormControl, InputLabel, MenuItem, Select, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Accordion, AccordionSummary, AccordionDetails, Radio, RadioGroup, FormControlLabel,
  Tooltip, Tabs, Tab, Paper, Divider, Badge, Chip, FormHelperText
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

function TestQuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); 
  const [bulkQuestions, setBulkQuestions] = useState([]);
  

  const [filterSkillCategory, setFilterSkillCategory] = useState("");
  const [filterSkillContent, setFilterSkillContent] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  

  const [bulkSkillCategory, setBulkSkillCategory] = useState("");
  const [bulkSkillContent, setBulkSkillContent] = useState("");

  const skillOptions = [
    "Process Management", "People Management", "Interpersonal Skills",
    "Communication Skills", "Managing Skills", "Technical Skills",
    "Cultural Skills", "Business Skills", "Accounting Skills", "Industrial Certificates",
  ];

  const skillContents = {
    "Process Management": ["Workflow Optimization", "Lean Six Sigma", "Agile Methodology"],
    "People Management": ["Team Leadership", "Conflict Resolution", "Performance Evaluation"],
    "Interpersonal Skills": ["Empathy Building", "Active Listening", "Networking Strategies"],
    "Communication Skills": ["Business Writing", "Presentation Skills", "Negotiation Techniques"],
    "Managing Skills": ["Time Management", "Risk Management", "Decision Making"],
    "Technical Skills": ["Python Programming", "Cloud Computing", "Data Analysis", "Machine Learning"],
    "Cultural Skills": ["Diversity Training", "Cross-Cultural Communication", "Inclusive Leadership"],
    "Business Skills": ["Market Analysis", "Strategic Planning", "Entrepreneurship"],
    "Accounting Skills": ["Financial Reporting", "Tax Planning", "Budgeting"],
    "Industrial Certificates": ["AWS Certified", "PMP Certification", "ISO Compliance"]
  };

  const difficultyLevels = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    fetchQuestions();
    fetchVideos();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/test-questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(error.response?.data?.message || "Failed to fetch test questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/training-videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };
  
  const addBulkQuestions = async () => {
    if (!bulkSkillCategory || !bulkSkillContent || bulkQuestions.length === 0) {
      setError("Please fill all required fields and add at least one question");
      return;
    }
    
    try {
      const questionsToAdd = bulkQuestions.map(q => ({
        ...q,
        skillCategory: bulkSkillCategory,
        skillContent: bulkSkillContent
      }));
      
      await axios.post("http://localhost:5000/api/test-questions/bulk", { questions: questionsToAdd });
      setSuccess(`Successfully added ${bulkQuestions.length} questions`);
      setOpenBulkDialog(false);
      resetBulkForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error adding bulk questions:", error);
      setError(error.response?.data?.message || "Failed to add bulk questions");
    }
  };
  
  const resetBulkForm = () => {
    setBulkSkillCategory("");
    setBulkSkillContent("");
    setBulkQuestions([]);
  };
  
  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    resetBulkForm();
  };

  const toggleAccordion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };


  const getVideoTitle = (videoId) => {
    const video = videos.find(v => v.id === videoId);
    return video ? video.title : "No video";
  };
  

  const addEmptyQuestion = () => {
    setBulkQuestions([...bulkQuestions, {
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      difficulty: "Medium",
      videoId: ""
    }]);
  };
  

  const handleBulkQuestionChange = (index, field, value) => {
    const updatedQuestions = [...bulkQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setBulkQuestions(updatedQuestions);
  };
  

  const handleBulkOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...bulkQuestions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: options
    };
    setBulkQuestions(updatedQuestions);
  };
  
  
  const addBulkOption = (questionIndex) => {
    if (bulkQuestions[questionIndex].options.length < 6) {
      const updatedQuestions = [...bulkQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...updatedQuestions[questionIndex].options, ""]
      };
      setBulkQuestions(updatedQuestions);
    } else {
      setError("Maximum 6 options allowed");
    }
  };
  

  const removeBulkOption = (questionIndex, optionIndex) => {
    if (bulkQuestions[questionIndex].options.length > 2) {
      const updatedQuestions = [...bulkQuestions];
      const newOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      
    
      let newCorrectAnswer = updatedQuestions[questionIndex].correctAnswer;
      if (optionIndex === newCorrectAnswer) {
        newCorrectAnswer = 0;
      } else if (optionIndex < newCorrectAnswer) {
        newCorrectAnswer -= 1;
      }
      
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: newOptions,
        correctAnswer: newCorrectAnswer
      };
      
      setBulkQuestions(updatedQuestions);
    } else {
      setError("Minimum 2 options required");
    }
  };
  

  const removeBulkQuestion = (index) => {
    const updatedQuestions = bulkQuestions.filter((_, i) => i !== index);
    setBulkQuestions(updatedQuestions);
  };
  

  const filteredQuestions = questions.filter(q => {
    return (!filterSkillCategory || q.skillCategory === filterSkillCategory) &&
           (!filterSkillContent || q.skillContent === filterSkillContent);
  });
  

  const questionCountByCategory = skillOptions.map(category => {
    return {
      category,
      count: questions.filter(q => q.skillCategory === category).length
    };
  });
  

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilterSkillCategory(newValue === 0 ? "" : skillOptions[newValue - 1]);
    setFilterSkillContent("");
  };

  const deleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/test-questions/${questionId}`);
      setSuccess("Test question deleted successfully!");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      setError(error.response?.data?.message || "Failed to delete test question");
    }
  };

  return (
    <Container maxWidth="1400px" sx={{ mt: 4, mb: 4 }}>
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

      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" component="h2">
              Test Question Management
            </Typography>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FilterListIcon />}
                onClick={() => setOpenFilterDialog(true)}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FormatListBulletedIcon />}
                onClick={() => setOpenBulkDialog(true)}
              >
                Add Multiple Questions
              </Button>
            </Box>
          </Box>
          
    
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="skill category tabs"
            >
              <Tab 
                label={
                  <Badge badgeContent={questions.length} color="primary">
                    All Categories
                  </Badge>
                } 
              />
              {questionCountByCategory.map((item, index) => (
                <Tab 
                  key={index}
                  label={
                    <Badge badgeContent={item.count} color="primary">
                      {item.category}
                    </Badge>
                  }
                />
              ))}
            </Tabs>
          </Paper>
          
       
          {currentTab > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label="All Content" 
                color={!filterSkillContent ? "primary" : "default"} 
                onClick={() => setFilterSkillContent("")} 
                clickable
              />
              {skillContents[skillOptions[currentTab - 1]]?.map((content, idx) => (
                <Chip 
                  key={idx} 
                  label={content} 
                  color={filterSkillContent === content ? "primary" : "default"}
                  onClick={() => setFilterSkillContent(content)}
                  clickable
                />
              ))}
            </Box>
          )}

          {filteredQuestions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {loading ? "Loading questions..." : "No test questions found with the selected filters."}
              </Typography>
            </Box>
          ) : (
            filteredQuestions.map((question) => (
              <Accordion 
                key={question.id} 
                expanded={expandedQuestion === question.id}
                onChange={() => toggleAccordion(question.id)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`question-${question.id}-content`}
                  id={`question-${question.id}-header`}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ fontWeight: 'medium' }}>
                        {question.question.length > 100 
                          ? question.question.substring(0, 100) + "..." 
                          : question.question}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Chip 
                        label={question.skillCategory} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={3} md={2}>
                      <Chip 
                        label={question.difficulty} 
                        size="small" 
                        color={
                          question.difficulty === 'Easy' ? 'success' : 
                          question.difficulty === 'Medium' ? 'info' : 'warning'
                        }
                      />
                    </Grid>
                    <Grid item xs={3} md={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this question?")) {
                              deleteQuestion(question.id);
                            }
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Question:
                    </Typography>
                    <Typography paragraph>
                      {question.question}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      Options:
                    </Typography>
                    <RadioGroup value={question.correctAnswer}>
                      {question.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          value={index}
                          control={<Radio checked={index === question.correctAnswer} />}
                          label={option}
                          sx={{
                            backgroundColor: index === question.correctAnswer ? '#e8f5e9' : 'transparent',
                            p: 1,
                            borderRadius: 1,
                            mb: 1
                          }}
                        />
                      ))}
                    </RadioGroup>
                    
                    {question.explanation && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Explanation:
                        </Typography>
                        <Typography paragraph>
                          {question.explanation}
                        </Typography>
                      </>
                    )}
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Category:</strong> {question.skillCategory}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Content:</strong> {question.skillContent}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2">
                          <strong>Related Video:</strong> {question.videoId ? getVideoTitle(question.videoId) : "None"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

  
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Questions</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Skill Category</InputLabel>
                <Select
                  value={filterSkillCategory}
                  label="Skill Category"
                  onChange={(e) => {
                    setFilterSkillCategory(e.target.value);
                    setFilterSkillContent("");
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {skillOptions.map((skill, index) => (
                    <MenuItem key={index} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!filterSkillCategory}>
                <InputLabel>Skill Content</InputLabel>
                <Select
                  value={filterSkillContent}
                  label="Skill Content"
                  onChange={(e) => setFilterSkillContent(e.target.value)}
                >
                  <MenuItem value="">All Content</MenuItem>
                  {skillContents[filterSkillCategory]?.map((content, index) => (
                    <MenuItem key={index} value={content}>
                      {content}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilterSkillCategory("");
            setFilterSkillContent("");
            setOpenFilterDialog(false);
          }} color="inherit">
            Clear Filters
          </Button>
          <Button onClick={() => setOpenFilterDialog(false)} color="primary" variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
  
   
      <Dialog
        open={openBulkDialog}
        onClose={handleCloseBulkDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Add Multiple Questions</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Skill Category</InputLabel>
                <Select
                  value={bulkSkillCategory}
                  label="Skill Category"
                  onChange={(e) => {
                    setBulkSkillCategory(e.target.value);
                    setBulkSkillContent("");
                  }}
                >
                  {skillOptions.map((skill, index) => (
                    <MenuItem key={index} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  All questions will be assigned to this category
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!bulkSkillCategory}>
                <InputLabel>Skill Content</InputLabel>
                <Select
                  value={bulkSkillContent}
                  label="Skill Content"
                  onChange={(e) => setBulkSkillContent(e.target.value)}
                >
                  {skillContents[bulkSkillCategory]?.map((content, index) => (
                    <MenuItem key={index} value={content}>
                      {content}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  All questions will be assigned to this specific content area
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Questions ({bulkQuestions.length})
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={addEmptyQuestion}
                >
                  Add Question
                </Button>
              </Box>
              
              {bulkQuestions.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 1 }}>
                  <Typography variant="body1" color="textSecondary">
                    No questions added yet. Click "Add Question" to start.
                  </Typography>
                </Box>
              ) : (
                bulkQuestions.map((question, qIndex) => (
                  <Accordion key={qIndex} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Question {qIndex + 1}: {question.question.substring(0, 50)}{question.question.length > 50 ? '...' : ''}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => removeBulkQuestion(qIndex)}
                              size="small"
                            >
                              Remove Question
                            </Button>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Question Text"
                            value={question.question}
                            onChange={(e) => handleBulkQuestionChange(qIndex, 'question', e.target.value)}
                            multiline
                            rows={3}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">
                              Options
                            </Typography>
                            <Button 
                              startIcon={<AddCircleIcon />} 
                              onClick={() => addBulkOption(qIndex)}
                              size="small"
                              variant="outlined"
                            >
                              Add Option
                            </Button>
                          </Box>
                          
                          {question.options.map((option, oIndex) => (
                            <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <RadioGroup
                                value={question.correctAnswer.toString()}
                                onChange={(e) => handleBulkQuestionChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                                row
                              >
                                <FormControlLabel
                                  value={oIndex.toString()}
                                  control={<Radio />}
                                  label=""
                                />
                              </RadioGroup>
                              
                              <TextField
                                fullWidth
                                label={`Option ${oIndex + 1}${oIndex === question.correctAnswer ? ' (Correct Answer)' : ''}`}
                                value={option}
                                onChange={(e) => handleBulkOptionChange(qIndex, oIndex, e.target.value)}
                                required
                                sx={{ 
                                  flexGrow: 1,
                                  backgroundColor: oIndex === question.correctAnswer ? '#e8f5e9' : 'transparent'
                                }}
                              />
                              
                              {question.options.length > 2 && (
                                <IconButton 
                                  color="error" 
                                  onClick={() => removeBulkOption(qIndex, oIndex)}
                                  sx={{ ml: 1 }}
                                >
                                  <RemoveCircleIcon />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Explanation (Optional)"
                            value={question.explanation}
                            onChange={(e) => handleBulkQuestionChange(qIndex, 'explanation', e.target.value)}
                            multiline
                            rows={2}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                              value={question.difficulty}
                              label="Difficulty"
                              onChange={(e) => handleBulkQuestionChange(qIndex, 'difficulty', e.target.value)}
                            >
                              {difficultyLevels.map((level, index) => (
                                <MenuItem key={index} value={level}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                      
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={addBulkQuestions} 
            variant="contained" 
            color="primary"
            disabled={!bulkSkillCategory || !bulkSkillContent || bulkQuestions.length === 0}
          >
            Add {bulkQuestions.length} Questions
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TestQuestionManagement;