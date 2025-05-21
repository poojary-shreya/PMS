
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Card, CardContent, Typography, TextField, Button, Grid, Box,
  FormControl, InputLabel, MenuItem, Select, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,Tooltip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

function TrainingVideoManagement() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [formMode, setFormMode] = useState("add"); 
  
  const [videoForm, setVideoForm] = useState({
    title: "",
    videoUrl: "",
    skillCategory: "",
    skillContent: "",
    description: ""
  });

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

  useEffect(() => {
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

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/training-videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError(error.response?.data?.message || "Failed to fetch training videos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideoForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'skillCategory' ? { skillContent: '' } : {})
    }));
  };

  const handleVideoAction = (video, mode) => {
    if (mode === "edit") {
      setVideoForm({
        title: video.title,
        videoUrl: video.videoUrl,
        skillCategory: video.skillCategory,
        skillContent: video.skillContent,
        description: video.description || ""
      });
      setCurrentVideo(video);
      setFormMode("edit");
    } else if (mode === "delete") {
      setCurrentVideo(video);
      setFormMode("delete");
    }
    setOpenDialog(true);
  };

  const addVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl || !videoForm.skillCategory || !videoForm.skillContent) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/training-videos", videoForm);
      setSuccess("Training video added successfully!");
      setOpenDialog(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      setError(error.response?.data?.message || "Failed to add training video");
    }
  };

  const updateVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl || !videoForm.skillCategory || !videoForm.skillContent) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/training-videos/${currentVideo.id}`, videoForm);
      setSuccess("Training video updated successfully!");
      setOpenDialog(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error updating video:", error);
      setError(error.response?.data?.message || "Failed to update training video");
    }
  };

  const deleteVideo = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/training-videos/${currentVideo.id}`);
      setSuccess("Training video deleted successfully!");
      setOpenDialog(false);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      setError(error.response?.data?.message || "Failed to delete training video");
    }
  };

  const resetForm = () => {
    setVideoForm({
      title: "",
      videoUrl: "",
      skillCategory: "",
      skillContent: "",
      description: ""
    });
    setCurrentVideo(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

 
  const formatYouTubeUrl = (url) => {
    if (!url) return "";
    return url.length > 40 ? url.substring(0, 40) + "..." : url;
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
            <Typography variant="h5" component="h2" >
              Training Video Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideoLibraryIcon />}
              onClick={() => {
                setFormMode("add");
                setOpenDialog(true);
              }}
            >
              Add New Video
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">Title</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Category</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Content</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold">Video URL</Typography></TableCell>
                  <TableCell align="center"><Typography fontWeight="bold">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                        {loading ? "Loading videos..." : "No training videos found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>{video.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={video.skillCategory} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{video.skillContent}</TableCell>
                      <TableCell>
                        <a 
                          href={video.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: '#1976d2' }}
                        >
                          {formatYouTubeUrl(video.videoUrl)}
                        </a>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleVideoAction(video, "edit")}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleVideoAction(video, "delete")}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

 
      <Dialog 
        open={openDialog && formMode !== "delete"} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === "add" ? "Add New Training Video" : "Edit Training Video"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
            <Tooltip title="Enter the full title of the training video" placement="top" arrow>
              <TextField
                fullWidth
                label="Video Title"
                name="title"
                value={videoForm.title}
                onChange={handleChange}
                required
              />
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
            <Tooltip title="Paste the complete YouTube URL (e.g., https://youtu.be/skqJ8n3EIjc)" placement="top" arrow>
              <TextField
                fullWidth
                label=" Video URL"
                name="videoUrl"
                value={videoForm.videoUrl}
                onChange={handleChange}
                placeholder="https://youtu.be/skqJ8n3EIjc"
                helperText="Enter the full  URL"
                required
              />
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
            <Tooltip title="Select the main category this video belongs to" placement="top" arrow>
              <FormControl fullWidth required>
                <InputLabel>Skill Category</InputLabel>
                <Select
                  name="skillCategory"
                  value={videoForm.skillCategory}
                  label="Skill Category"
                  onChange={handleChange}
                >
                  {skillOptions.map((skill, index) => (
                    <MenuItem key={index} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
            <Tooltip title="Select the specific skill content covered in this video" placement="top" arrow>
              <FormControl fullWidth required>
                <InputLabel>Skill Content</InputLabel>
                <Select
                  name="skillContent"
                  label="Skill Content"
                  value={videoForm.skillContent}
                  onChange={handleChange}
                  disabled={!videoForm.skillCategory}
                >
                  {skillContents[videoForm.skillCategory]?.map((content, index) => (
                    <MenuItem key={index} value={content}>
                      {content}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
            <Tooltip title="Add any additional information about the video content or learning objectives" placement="top" arrow>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={videoForm.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={formMode === "add" ? addVideo : updateVideo}
          >
            {formMode === "add" ? "Add Video" : "Update Video"}
          </Button>
        </DialogActions>
      </Dialog>

     
      <Dialog
        open={openDialog && formMode === "delete"}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Delete Training Video</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the video "{currentVideo?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteVideo}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TrainingVideoManagement;