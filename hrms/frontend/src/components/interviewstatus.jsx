import React, { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress
} from '@mui/material';

const InterviewStatusUpdate = ({ interviewId, currentStatus, onClose }) => {
  const [status, setStatus] = useState(currentStatus?.status || '');
  const [result, setResult] = useState(currentStatus?.result || '');
  const [feedback, setFeedback] = useState(currentStatus?.feedback || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, result, feedback })
      });
  
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'Update failed'); 
      }
  
      onClose(true);
    } catch (error) {
      console.error('Update error:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={() => onClose(false)}>
      <DialogTitle>Update Interview Status</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Result</InputLabel>
          <Select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            label="Result"
          >
            <MenuItem value="Selected">Selected</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Feedback"
          fullWidth
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewStatusUpdate;