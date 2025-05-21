import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';

const ManagerApproval = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    setManagerId('current_manager_id');
    fetchAllPendingLeaves('current_manager_id');
  }, []);

  const fetchAllPendingLeaves = async (manager_id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/pending/${manager_id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pending leaves');
      }

      const data = await response.json();
      setPendingLeaves(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status) => {
    if (!selectedLeave) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/update/${selectedLeave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          manager_comment: comment 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update leave');
      }

      setPendingLeaves(pendingLeaves.filter(leave => leave.id !== selectedLeave.id));
      setSelectedLeave(null);
      setComment('');
      alert(`Leave ${status.toLowerCase()} successfully. Email notification has been sent to the employee.`);
    } catch (error) {
      console.error('Update Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="1500px" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align='center' fontWeight="bold">Manager Approval</Typography>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      </Paper>

      {pendingLeaves.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No pending leave requests found</Typography>
        </Paper>
      ) : (
        pendingLeaves.map(leave => (
          <Paper key={leave.id} sx={{ p: 3, my: 2, borderLeft: '2px solid', borderColor: 'warning.main' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Employee ID:</Typography>
                <Typography variant="body1" fontWeight="medium">{leave.employeeId}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Employee Email:</Typography>
                <Typography variant="body1" fontWeight="medium">{leave.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Leave Type:</Typography>
                <Typography variant="body1" fontWeight="medium" textTransform="capitalize">{leave.leaveType}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary">Duration:</Typography>
                <Typography variant="body1">
                  {new Date(leave.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' to '}
                  {new Date(leave.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {leave.lastDay && ' (Last day: Half day)'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Reason:</Typography>
                <Typography variant="body2">{leave.reason}</Typography>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={leave.status}
                  color="warning"
                  sx={{ fontWeight: 'medium' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedLeave(leave)}
                  sx={{ ml: 'auto' }}
                >
                  Review
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}
      <Dialog open={!!selectedLeave} onClose={() => setSelectedLeave(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" textTransform="capitalize">
            {selectedLeave?.leaveType} Leave Request - {selectedLeave?.employeeId}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Employee Email:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedLeave?.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Duration:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedLeave && new Date(selectedLeave.startDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {' to '}
                {selectedLeave && new Date(selectedLeave.endDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                {selectedLeave?.lastDay && ' (Last day: Half day)'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Reason:</Typography>
              <Typography variant="body1">{selectedLeave?.reason}</Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 1 }}>
              <TextField
                label="Manager Comment"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSelectedLeave(null)} color="inherit">
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDecision('Rejected')}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Reject
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => handleDecision('Approved')}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagerApproval;