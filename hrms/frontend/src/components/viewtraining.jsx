import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Card, CardContent, Typography, Chip,
  LinearProgress, Button, Alert, CircularProgress, Divider, Pagination,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
  ListItemIcon, Paper, IconButton, Tooltip
} from '@mui/material';
import {
  PlayArrow, CheckCircle, PauseCircle, Assessment, CalendarToday,
  ArrowForward, Person, Search, FilterList, Notifications, Update, Close,
  Event, Comment, BarChart, History, ArrowUpward, ArrowDownward, ErrorOutline
} from '@mui/icons-material';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';


function HRTrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [sortHistoryBy, setSortHistoryBy] = useState('newest');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAllTrainings();
    fetchRecentUpdates();


    const updateInterval = setInterval(() => {
      fetchAllTrainings();
      fetchRecentUpdates();
    }, 60000);

    return () => clearInterval(updateInterval);
  }, []);

  const fetchAllTrainings = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get('http://localhost:5000/api/trainings');
      setTrainings(data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError(error.response?.data?.message || "Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUpdates = async () => {
    try {

      const { data } = await axios.get('http://localhost:5000/api/trainings/updates/recent');
      setRecentUpdates(data);
    } catch (error) {
      console.error("Error fetching recent updates:", error);
    }
  };

  const fetchTrainingHistory = async (trainingId) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {

      const { data } = await axios.get(`http://localhost:5000/api/trainings/${trainingId}/history`);
      setUpdateHistory(data);
    } catch (error) {
      console.error("Error fetching training history:", error);
      setHistoryError("Failed to load update history");
      setUpdateHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistoryDialog = (training) => {
    setSelectedTraining(training);
    fetchTrainingHistory(training.id);
    setHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialog(false);
    setSelectedTraining(null);
    setUpdateHistory([]);
  };

  const toggleHistorySortOrder = () => {
    setSortHistoryBy(sortHistoryBy === 'newest' ? 'oldest' : 'newest');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planned': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle fontSize="small" />;
      case 'In Progress': return <PlayArrow fontSize="small" />;
      case 'Planned': return <PauseCircle fontSize="small" />;
      case 'Cancelled': return <ErrorOutline fontSize="small" />;
      default: return null;
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const formatDateRange = (startDate, endDate) => {
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return "No updates";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };


  const getProgressChange = (currentProgress, index) => {
    if (index === updateHistory.length - 1) return null;

    const previousProgress = updateHistory[index + 1].progressPercentage;
    const change = currentProgress - previousProgress;

    if (change === 0) return null;
    return change;
  };


  const filteredTrainings = trainings.filter(training => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.skillContent?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || training.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const sortedUpdateHistory = [...updateHistory].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortHistoryBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedTrainings = filteredTrainings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Training List
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}


      {recentUpdates.length > 0 && (
        <Card sx={{ mb: 4, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Recent Updates</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentUpdates.slice(0, 3).map((update, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {update.employee} updated training
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Progress: {update.progressPercentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {new Date(update.lastUpdated).toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to={`/hr/training/${update.id}`}
                  variant="outlined"
                  size="small"
                >
                  View Details
                </Button>
              </Box>
            ))}
          </Box>
        </Card>
      )}


      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: '150px' }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilter}
            startAdornment={<FilterList sx={{ mr: 1 }} />}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredTrainings.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No trainings found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayedTrainings.map((training) => (
              <Card
                key={training.id}
                sx={{
                  width: '100%',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flexGrow: 1, minWidth: '60%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(training.status)}
                          label={training.status}
                          color={getStatusColor(training.status)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ID: {training.id}
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        component="div"
                        gutterBottom
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          display: 'inline-flex',
                          alignItems: 'center',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleOpenHistoryDialog(training)}
                      >
                        {training.title}
                        <History fontSize="small" sx={{ ml: 1 }} />
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {training.employee}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Assessment fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {training.skillCategory} - {training.skillContent}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDateRange(training.startDate, training.endDate)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '210px' }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Progress: {training.progressPercentage || 0}%
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={training.progressPercentage || 0}
                          sx={{ height: 8, borderRadius: 5, mb: 2, width: '100%' }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Update fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Updated: {formatLastUpdated(training.lastUpdated)}
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleOpenHistoryDialog(training)}
                        startIcon={<History />}
                        sx={{ mt: 2 }}
                      >
                        View History
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}


      <Dialog
        open={historyDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="training-history-dialog-title"
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle id="training-history-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            Training Update History
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <IconButton onClick={handleCloseHistoryDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTraining && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">{selectedTraining.title}</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                <Chip
                  icon={getStatusIcon(selectedTraining.status)}
                  label={selectedTraining.status}
                  color={getStatusColor(selectedTraining.status)}
                  size="small"
                />
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person fontSize="small" sx={{ mr: 0.5 }} />
                  {selectedTraining.employee}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                  {formatDateRange(selectedTraining.startDate, selectedTraining.endDate)}
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2, color: 'text.secondary' }}>
                Current Progress: {selectedTraining.progressPercentage || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={selectedTraining.progressPercentage || 0}
                sx={{ height: 8, borderRadius: 5, mt: 1, mb: 3 }}
              />
            </Box>
          )}

          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : historyError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {historyError}
            </Alert>
          ) : sortedUpdateHistory.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">No update history available for this training.</Typography>
            </Paper>
          ) : (
            <Timeline position="alternate" sx={{ p: 0 }}>
              {sortedUpdateHistory.map((update, index) => {
                const progressChange = getProgressChange(update.progressPercentage, index);
                const progressChangeDisplay = progressChange ? (
                  <Chip
                    size="small"
                    color={progressChange > 0 ? "success" : "error"}
                    label={`${progressChange > 0 ? '+' : ''}${progressChange}%`}
                    sx={{ ml: 1 }}
                  />
                ) : null;

                return (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      <Typography variant="body2">
                        {formatDateTime(update.updatedAt)}
                      </Typography>
                    </TimelineOppositeContent>

                    <TimelineSeparator>
                      {/* <TimelineDot color={getStatusColor(update.status)}>
                        {getStatusIcon(update.status)}
                      </TimelineDot> */}
                      {index < sortedUpdateHistory.length && <TimelineConnector />}
                    </TimelineSeparator>

                    <TimelineContent>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                              Progress: {update.progressPercentage}%

                            </Typography>

                            <Chip
                              size="small"
                              label={update.status}
                              color={getStatusColor(update.status)}
                            />
                          </Box>

                          <Box sx={{ mt: 2, bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Notes: {update.completionNotes}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" color="text.primary">
                              Updated by: {update.employeeName || update.employeeId || "You"}
                            </Typography>
                            {/* </Box>
                                          <Box sx={{ mt: 2, bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}> */}
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(update.updateDate)}
                            </Typography>

                          </Box>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HRTrainingList;