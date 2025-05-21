import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Pagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  IconButton,
  Chip
} from "@mui/material";
import {
  Search,
  Person,
  Email,
  Phone,
  Code,
  WorkHistory,
  Add,
  Description,
  VisibilityOutlined,
  Schedule
} from "@mui/icons-material";

const CandidateFilter = () => {
  const [filters, setFilters] = useState({ skills: "", experience: "" });
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [displayedCandidates, setDisplayedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState("");
  
  // Resume viewer states
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (filteredCandidates.length > 0) {
      const sortedCandidates = [...filteredCandidates].sort((a, b) => b.id - a.id);

      const searchFilteredCandidates = searchTerm
        ? sortedCandidates.filter(candidate =>
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.positionApplied?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : sortedCandidates;

      updateDisplayedCandidates(searchFilteredCandidates, page);
    } else {
      setDisplayedCandidates([]);
    }
  }, [filteredCandidates, searchTerm, page]);

  const updateDisplayedCandidates = (candidates, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedCandidates(candidates.slice(startIndex, endIndex));
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/candidates");
      setCandidates(response.data);
      setFilteredCandidates(response.data);
    } catch (error) {
      setError("Failed to fetch candidates. Please try again.");
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/skills");
      if (response.data && Array.isArray(response.data)) {
        setAvailableSkills(response.data);
        localStorage.setItem('availableSkills', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching skills from API:", error);
      
      const localSkills = localStorage.getItem('availableSkills');
      if (localSkills) {
        try {
          const parsedSkills = JSON.parse(localSkills);
          setAvailableSkills(parsedSkills);
        } catch (parseError) {
          console.error("Error parsing local skills:", parseError);
          setDefaultSkills();
        }
      } else {
        setDefaultSkills();
      }
    }
  };

  const setDefaultSkills = () => {
    const defaultSkills = [
      "Node", "React", "Python", "Java", "MongoDB", "Express", "JavaScript", 
      "Django", "SQL", "Spring Boot", ".NET", "C#", "Angular", "TypeScript", 
      "PostgreSQL", "Kotlin", "C++", "Blockchain", "Vue.js", "Solidity"
    ];
    setAvailableSkills(defaultSkills);
    localStorage.setItem('availableSkills', JSON.stringify(defaultSkills));
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filterCandidates = () => {
    setFilteredCandidates(
      candidates.filter(
        (candidate) =>
          (!filters.skills || candidate.skills.includes(filters.skills)) &&
          (!filters.experience || candidate.experience === parseInt(filters.experience))
      )
    );
    setPage(1);
  };

  const scheduleInterview = (candidate) => {
    navigate("/interview-scheduling", { 
      state: { 
        id: candidate.id,
        name: candidate.name, 
        email: candidate.email,
        positionApplied: candidate.positionApplied || "Not specified",
        skills: candidate.skills.join(", "), 
        experience: `${candidate.experience} years`
      } 
    });
  };

  const handleOpenAddSkillDialog = () => {
    setOpenAddSkillDialog(true);
    setNewSkill("");
    setSkillError("");
  };

  const handleCloseAddSkillDialog = () => {
    setOpenAddSkillDialog(false);
  };

  const handleNewSkillChange = (e) => {
    setNewSkill(e.target.value);
    if (e.target.value.trim() === "") {
      setSkillError("Skill cannot be empty");
    } else if (availableSkills.includes(e.target.value.trim())) {
      setSkillError("This skill already exists");
    } else {
      setSkillError("");
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() === "") {
      setSkillError("Skill cannot be empty");
      return;
    }

    if (availableSkills.includes(newSkill.trim())) {
      setSkillError("This skill already exists");
      return;
    }

    const updatedSkills = [...availableSkills, newSkill.trim()];

    try {
      await axios.post("http://localhost:5000/api/skills", { skill: newSkill.trim() });
      setAvailableSkills(updatedSkills);
      localStorage.setItem('availableSkills', JSON.stringify(updatedSkills));
      setError("");
      handleCloseAddSkillDialog();
    } catch (error) {
      console.error("Error adding skill to API:", error);
      setAvailableSkills(updatedSkills);
      localStorage.setItem('availableSkills', JSON.stringify(updatedSkills));
      handleCloseAddSkillDialog();
    }
  };

  const viewResume = async (candidateId) => {
    setResumeLoading(true);
    setResumeDialogOpen(true);
    setSelectedResume(null);
    setError("");  // Clear previous errors
    
    try {
      // Debug logs
      console.log("Candidate ID received:", candidateId);
      console.log("Candidate ID type:", typeof candidateId);
      
      // Make sure we have a valid candidateId
      if (!candidateId && candidateId !== 0) {
        throw new Error("Invalid candidate ID");
      }
      
      // Create the URL for fetching the resume
      const resumeUrl = `http://localhost:5000/api/candidates/${candidateId}/resume`;
      console.log(`Attempting to fetch resume from: ${resumeUrl}`);
      
      // Set the response type to blob for file downloads
      const response = await axios.get(resumeUrl, {
        responseType: 'blob'
      });
      
      // Get content type from the response
      const contentType = response.headers['content-type'];
      console.log(`Received response with content type: ${contentType}`);
      
      // Create a local URL for the blob
      const fileBlob = new Blob([response.data], { type: contentType });
      const fileUrl = URL.createObjectURL(fileBlob);
      
      setSelectedResume({
        url: fileUrl,
        type: contentType,
        blob: fileBlob  // Store the blob for potential download
      });
      
    } catch (error) {
      console.error("Error fetching resume:", error);
      // More detailed error logging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      
      setError(`Failed to fetch resume. ${error.response?.status === 404 ? 
        "The resume might not be available or the file could not be found." : 
        "There was a problem retrieving the resume. " + error.message}`);
    } finally {
      setResumeLoading(false);
    }
  };
  const handleCloseResumeDialog = () => {
    setResumeDialogOpen(false);
    // No need to revoke object URL since we're using direct URLs now
  };

  // Enhanced function to determine if a candidate is from quick upload
  const isQuickUploadCandidate = (candidate) => {
    return candidate && 
           (candidate.positionApplied === 'To be determined' || !candidate.positionApplied) && 
           (candidate.referralreason === 'Quick resume upload for further review' || 
            candidate.resumePath && !candidate.positionApplied);
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Candidate Filter
      </Typography>
      
      <Box display="flex" gap={2} marginBottom={2}>
        <FormControl fullWidth>
          <InputLabel>Skills</InputLabel>
          <Select 
            name="skills" 
            label="Skills" 
            value={filters.skills} 
            onChange={handleChange}
            endAdornment={
              <InputAdornment position="end" sx={{ position: 'absolute', right: 28, pointerEvents: 'none' }}>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent select from opening
                    handleOpenAddSkillDialog();
                  }}
                  sx={{ minWidth: 'auto', pointerEvents: 'auto' }}
                >
                  <Add />
                </Button>
              </InputAdornment>
            }
          >
            <MenuItem value="">Any</MenuItem>
            {availableSkills.sort().map((skill) => (
              <MenuItem key={skill} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Experience (Years)</InputLabel>
          <Select
            name="experience"
            label="Experience (Years)"
            value={filters.experience}
            onChange={handleChange}
          >
            <MenuItem value="">Any</MenuItem>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((year) => (
              <MenuItem key={year} value={year}>{year} years</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: "180px", height: "40px", paddingTop: "10px" }}>
          <Button
            variant="contained"
            onClick={filterCandidates}
          >
            Filter
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", marginBottom: 2 }}>
        <TextField
          label="Search candidates"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <hr style={{ margin: "20px 0", border: "1px solid gray" }} />
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Person fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Name</TableCell>
                  <TableCell><Email fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Email</TableCell>
                  <TableCell><Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Phone</TableCell>
                  <TableCell><WorkHistory fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Job Title</TableCell>
                  <TableCell><Code fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Skills</TableCell>
                  <TableCell><WorkHistory fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Experience</TableCell>
                  <TableCell>Referred</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCandidates.length > 0 ? (
                  displayedCandidates.map((candidate) => (
                    <TableRow 
                      key={candidate.id} 
                      sx={{
                        backgroundColor: isQuickUploadCandidate(candidate) ? 'rgba(255, 244, 229, 0.7)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        {candidate.name}
                        {isQuickUploadCandidate(candidate) && (
                          <Chip 
                            label="Quick Upload" 
                            size="small" 
                            color="warning" 
                            sx={{ ml: 1, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>
                        {candidate.positionApplied === 'To be determined' || !candidate.positionApplied
                          ? <Typography color="text.secondary" fontStyle="italic">To be determined</Typography> 
                          : candidate.positionApplied || 'N/A'}
                      </TableCell>
                      <TableCell>{Array.isArray(candidate.skills) ? candidate.skills.join(", ") : 'N/A'}</TableCell>
                      <TableCell>{candidate.experience} years</TableCell>
                      <TableCell>{candidate.referrerName ? 'Yes' : '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {/* <Tooltip title="View Resume">
                            <IconButton 
                              color="primary"
                              onClick={() => viewResume(candidate.id)}
                              size="small"
                              disabled={!candidate.resumePath}
                            >
                              <VisibilityOutlined />
                            </IconButton>
                          </Tooltip> */}
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Schedule />}
                            onClick={() => scheduleInterview(candidate)}
                          >
                            Schedule
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No candidates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCandidates.length > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil(filteredCandidates.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={openAddSkillDialog} onClose={handleCloseAddSkillDialog}>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Skill Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSkill}
            onChange={handleNewSkillChange}
            error={!!skillError}
            helperText={skillError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSkillDialog}>Cancel</Button>
          <Button 
            onClick={handleAddSkill} 
            variant="contained" 
            disabled={!newSkill.trim() || !!skillError}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Resume Viewer Dialog */}
      <Dialog 
        open={resumeDialogOpen} 
        onClose={handleCloseResumeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center">
            <Description sx={{ mr: 1 }} />
            Resume Viewer
          </Box>
          <Button onClick={handleCloseResumeDialog}>Close</Button>
        </DialogTitle>
        <DialogContent>
          {resumeLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedResume ? (
            selectedResume.type.includes('pdf') ? (
              <iframe 
                src={selectedResume.url} 
                width="100%" 
                height="600px"
                title="Resume PDF"
                style={{ border: 'none' }}
              />
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                  This file type ({selectedResume.type}) cannot be displayed directly.
                </Typography>
                <Button 
                  variant="contained" 
                  href={selectedResume.url} 
                  download="resume"
                  startIcon={<Description />}
                >
                  Download Resume
                </Button>
              </Box>
            )
          ) : (
            <Alert severity="info">
              {error || "No resume available for this candidate."}
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CandidateFilter;