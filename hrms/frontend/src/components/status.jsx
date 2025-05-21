import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Pagination,
  Chip,
  Tooltip,
  TablePagination,
  TextField
} from '@mui/material';
import {
  Person,
  Email,
  Work,
  SupervisorAccount,
  Looks3,
  EventAvailable,
  Notifications,
  CheckCircle,
  Mail,
  Search,Cancel,Warning,AccessTime
} from '@mui/icons-material';
import InterviewStatusUpdate from './interviewstatus.jsx';

const StatusPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInterviews, setFilteredInterviews] = useState([]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/interviews');
      const data = await response.json();
      
      const processedData = Array.isArray(data) ? data : 
                          data?.interviews ? data.interviews : [];
      
      setInterviews(processedData);
      setFilteredInterviews(processedData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInterviews(interviews);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = interviews.filter((interview) => {
        return (
          interview.name.toLowerCase().includes(lowercasedQuery) ||
          interview.candidateEmail.toLowerCase().includes(lowercasedQuery) ||
          interview.positionApplied.toLowerCase().includes(lowercasedQuery) ||
          interview.hiringManagerEmail.toLowerCase().includes(lowercasedQuery) ||
          interview.status.toLowerCase().includes(lowercasedQuery) ||
          (interview.result && interview.result.toLowerCase().includes(lowercasedQuery))
   ) });
      setFilteredInterviews(filtered);
    }
  }, [searchQuery, interviews]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleStatusUpdate = (updated) => {
    if (updated) fetchInterviews();
    setSelectedInterview(null);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      scheduled: { color: '#bbdefb', textColor: '#0d47a1', label: 'Scheduled' },
      completed: { color: '#c8e6c9', textColor: '#1b5e20', label: 'Completed' },
      cancelled: { color: '#ffcdd2', textColor: '#b71c1c', label: 'Cancelled' },
      pending: { color: '#fff9c4', textColor: '#f57f17', label: 'Pending' }
    };

    const config = statusConfig[status.toLowerCase()] || {};
    
    return (
      <Chip
        label={config.label || status}
        size="small"
        sx={{
          backgroundColor: config.color,
          color: config.textColor,
          fontWeight: 'bold',
          minWidth: 90
        }}
      />
    );
  };

  const getResultChip = (result) => {
    if (!result) return '-';
    
    const statusConfig = {
      selected: {
        color: '#c8e6c9',
        textColor: '#1b5e20',
      
        label: 'Selected'
      },
      rejected: {
        color: '#ffcdd2',
        textColor: '#b71c1c',
 
        label: 'Rejected'
      },
      'on hold': {
        color: '#ffe0b2',
        textColor: '#ef6c00',
     
        label: 'On Hold'
      },
      pending: {
        color: '#fff9c4',
        textColor: '#f57f17',
  
        label: 'Pending'
      }
    };
  
    const config = statusConfig[result.toLowerCase()] || {
      color: '#e0e0e0',
      textColor: '#424242',
      label: result
    };
    
    return (
      <Chip
      label={config.label}
      icon={config.icon}
      size="small"
      sx={{
        backgroundColor: config.color,
        color: config.textColor,
        fontWeight: 'bold',
        minWidth: 90
      }}
    />
    );
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Card sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 'auto' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                Interview Status
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: <Search color="action" />,
              }}
              sx={{ width: 300 }}
            />
          </Box>

          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, fontSize: '20px' }} />
                      Candidate
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, fontSize: '20px' }} />
                      Email
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work sx={{ mr: 1, fontSize: '20px' }} />
                      Position
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SupervisorAccount sx={{ mr: 1, fontSize: '20px' }} />
                      Hiring Manager
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Looks3 sx={{ mr: 1, fontSize: '20px' }} />
                      Round
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventAvailable sx={{ mr: 1, fontSize: '20px' }} />
                      Schedule
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Notifications sx={{ mr: 1, fontSize: '20px' }} />
                      Status
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ mr: 1, fontSize: '20px' }} />
                      Result
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Mail sx={{ mr: 1, fontSize: '20px' }} />
                      Offer
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {filteredInterviews
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((interview) => (
                  <TableRow 
                    key={interview.interviewId}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <TableCell>{interview.name}</TableCell>
                    <TableCell>
                      <Tooltip title={interview.candidateEmail}>
                        <span>{interview.candidateEmail}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{interview.positionApplied}</TableCell>
                    <TableCell>{interview.hiringManagerEmail}</TableCell>
                    <TableCell>{interview.round}</TableCell>
                    <TableCell>
                      {new Date(interview.interviewDate).toLocaleDateString()} {interview.interviewTime}
                    </TableCell>
                    <TableCell>{getStatusChip(interview.status)}</TableCell>
                    <TableCell>{getResultChip(interview.result)}</TableCell>
                    <TableCell>
                      {interview.offerSent ? (
                        <Chip 
                          label="Yes"
                          sx={{ 
                            backgroundColor: '#c8e6c9',
                            color: '#1b5e20',
                            fontWeight: 'bold'
                          }}
                        />
                      ) : (
                        <Chip 
                          label="No"
                          sx={{ 
                            backgroundColor: '#ffcdd2',
                            color: '#b71c1c',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ 
                          borderRadius: 1,
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 2 }
                        }}
                        onClick={() => setSelectedInterview(interview)}
                      >
                        Update 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={interviews.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {selectedInterview && (
        <InterviewStatusUpdate
          interviewId={selectedInterview.interviewId}
          currentStatus={{
            status: selectedInterview.status,
            result: selectedInterview.result,
            feedback: selectedInterview.feedback
          }}
          onClose={handleStatusUpdate}
        />
      )}
    </Box>
  );
};

export default StatusPage;