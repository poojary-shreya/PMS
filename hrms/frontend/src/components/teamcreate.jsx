import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Team and role data structure
const TEAM_ROLES = {
  'Testing Team': [
    'QA Manager',
    'Test Lead',
    'Manual Test Engineer',
    'Automation Test Engineer',
    'Performance Tester',
    'Security Tester',
    'Test Analyst'
  ],
  'Development Team': [
    'Software Architect',
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'Mobile App Developer',
    'API Developer',
    'Database Developer'
  ],
  'DevOps Team': [
    'DevOps Engineer',
    'Build & Release Engineer',
    'Site Reliability Engineer (SRE)',
    'CI/CD Pipeline Specialist',
    'Cloud Engineer',
    'Infrastructure as Code Engineer',
    'Monitoring & Logging Specialist'
  ],
  'IT Support Team': [
    'IT Support Technician',
    'System Administrator',
    'Network Administrator',
    'Help Desk Analyst',
    'Hardware Support Engineer',
    'IT Security Support',
    'Software Installation Specialist'
  ],
  'Security Team': [
    'Security Analyst',
    'Penetration Tester',
    'Security Engineer',
    'Security Architect',
    'SOC Analyst',
    'IAM Specialist',
    'Compliance Officer'
  ],
  'UI/UX Team': [
    'UI Designer',
    'UX Designer',
    'UX Researcher',
    'Interaction Designer',
    'Visual Designer',
    'Information Architect',
    'Accessibility Specialist'
  ],
  'Product Design Team':[
    'Product Designer',
    'Design Systems Manager',
    'Motion Designer',
    'Design Researcher',
  ],
  'Graphic Design Team':[
    'Graphic Designer',
    'Visual Designer',
    'Brand Designer',
    'Illustrator',
    'Animation Designer'
  ],
  'Product Management Team':[
    'Product Manager',
    'Product Owner',
    'Product Analyst',
    'Associate Product Manager',
    'Growth Product Manager',
  ],
  'Project Management Team':[
    'Project Manager',
    'Project Coordinator',
    'Project Lead',
    'Risk Manager'
  ],
  'Business Analysis Team':[
    'Business Analyst',
    'System Analyst',
    'Data Analyst',
    'Process Analyst'
  ],
  'Marketing Team':[
    'Marketing Manager',
    'Digital Marketing Specialist',
  ],
  'Sales Team':[
    'Sales Executive',
    'Sales Manager',
    'Business Development Executive',
    'Inside Sales Representative',
    
  ],
  'Social Media Team':[
    'Social Media Manager',
    'Content Creator',
    'Social Media Analyst',
    'Vedio Editor'
  ],
  'Custom Team': [] 
};

const TeamService = {
  createTeam: async (teamData) => {
    return await axios.post('http://localhost:5000/api/createteam', teamData);
  },
  
  getEmployees: async () => {
    return await axios.get('http://localhost:5000/api/addteam/employees');
  }
};

const CreateTeamForm = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');
  const [members, setMembers] = useState([{ employee_id: '', role: '' }]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await TeamService.getEmployees();
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setAlert({
          open: true,
          message: 'Failed to load employees',
          severity: 'error'
        });
      }
    };
    
    fetchEmployees();
  }, []);
  
  const handleAddMember = () => {
    setMembers([...members, { employee_id: '', role: '' }]);
  };
  
  const handleRemoveMember = (index) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };
  
  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };
  
  const handleTeamChange = (event) => {
    const team = event.target.value;
    setSelectedTeam(team);
    if (team !== 'Custom Team') {
      setCustomTeamName('');
    }
    // Reset roles when team changes
    setMembers(members.map(member => ({ ...member, role: '' })));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const teamName = selectedTeam === 'Custom Team' ? customTeamName : selectedTeam;
    
    // Validate form
    if (!teamName.trim()) {
      setAlert({
        open: true,
        message: 'Team name is required',
        severity: 'error'
      });
      return;
    }

    const hasEmptyMembers = members.some(
      (member) => !member.employee_id || !member.role.trim()
    );

    if (hasEmptyMembers) {
      setAlert({
        open: true,
        message: 'All members must have an employee and a role assigned.',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await TeamService.createTeam({
        team_name: teamName,
        members,
      });
      
      setAlert({
        open: true,
        message: 'Team created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setSelectedTeam('');
      setCustomTeamName('');
      setMembers([{ employee_id: '', role: '' }]);
    } catch (error) {
      console.error('Error creating team:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to create team',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  return (
    <Container maxWidth="1200px">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Team
        </Typography>
        
        <form onSubmit={handleSubmit}>
         <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>Select Team</InputLabel>
  <Select
    value={selectedTeam}
    onChange={handleTeamChange}
    label="Select Team"
    required
  >
    <MenuItem value="Custom Team">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AddCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
        Add Custom Team
      </Box>
    </MenuItem>
    <MenuItem sx={{ borderBottom: '1px solid #e0e0e0', py: 0 }} disabled />
    {Object.keys(TEAM_ROLES)
      .filter(team => team !== 'Custom Team')
      .map((team) => (
        <MenuItem key={team} value={team}>
          {team}
        </MenuItem>
    ))}
  </Select>
</FormControl>

          {selectedTeam === 'Custom Team' && (
            <TextField
              fullWidth
              label="Custom Team Name"
              value={customTeamName}
              onChange={(e) => setCustomTeamName(e.target.value)}
              margin="normal"
              required
              variant="outlined"
            />
          )}
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Team Members
          </Typography>
          
          {members.map((member, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={member.employee_id}
                    onChange={(e) => handleMemberChange(index, 'employee_id', e.target.value)}
                    label="Employee"
                    required
                  >
                    <MenuItem value="" disabled>Select Employee</MenuItem>
                    {employees.map((employee) => (
                      <MenuItem key={employee.employee_id} value={employee.employee_id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={7}>
                {selectedTeam === 'Custom Team' ? (
                  <TextField
                    fullWidth
                    label="Role"
                    value={member.role}
                    onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                    variant="outlined"
                    placeholder="Enter role"
                    required
                  />
                ) : (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                      label="Role"
                      required
                    >
                      <MenuItem value="" disabled>Select Role</MenuItem>
                      {TEAM_ROLES[selectedTeam]?.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              
              <Grid item xs={12} sm={1}>
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveMember(index)}
                  disabled={members.length === 1}
                  sx={{ height: '100%' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 4 }}>
            <Button 
              variant="outlined" 
              startIcon={<AddCircleOutlineIcon />} 
              onClick={handleAddMember}
            >
              Add Another Member
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateTeamForm;