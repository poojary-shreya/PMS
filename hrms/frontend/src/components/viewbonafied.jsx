import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Alert, Select, MenuItem,
  Box, Pagination, Chip
} from "@mui/material";
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Settings as SettingsIcon,Email
} from "@mui/icons-material";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const BonafideRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/bonafide");
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch bonafide requests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });
  const handleFileUpload = async (event, id) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('certificate', file);
  
    try {
      const response = await axios.post(
        `http://localhost:5000/api/bonafide/${id}/certificate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.message) {
        alert('Certificate uploaded and email sent successfully!');
      
        const updatedRequests = requests.map(req => 
          req.id === id ? { ...req, certificate: response.data.certificatePath } : req
        );
        setRequests(updatedRequests);
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Failed to upload certificate. Please try again.');
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bonafide/${id}/status`, { status });
      alert(`Bonafide request has been ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'warning';
    }
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ maxWidth: "1500px", mt: 3, boxShadow: 3, mx: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Bonafide Request List
        </Typography>

        {isLoading && <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />}
        {error && <Alert severity="error">{error}</Alert>}

        {!isLoading && !error && (
          <>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      { icon: <PersonIcon />, text: "Name" },
                      { icon: <BadgeIcon />, text: "Employee ID" },
                      { icon: <Email />, text: "Candidate Email" },
                      { icon: <BusinessIcon />, text: "Department" },
                      { icon: <DescriptionIcon />, text: "Reason" },
                      { icon: <FlagIcon />, text: "Status" },
                      { icon: <SettingsIcon />, text: "Actions" }
                    ].map((header, index) => (
                      <TableCell key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {React.cloneElement(header.icon, { sx: { color: 'black', fontSize: 20 } })}
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'black' }}>
                            {header.text}
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>{request.employee_id}</TableCell>
                      <TableCell>{request.candidateEmail}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status || "Pending"}
                          color={getStatusColor(request.status)}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 600,
                            borderWidth: 2,
                            minWidth: 100
                          }}
                        />
                      </TableCell>
                      <TableCell>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Select
      value={request.status || "Pending"}
      onChange={(e) => handleStatusChange(request.id, e.target.value)}
      size="small"
    >
      <MenuItem value="Pending">Pending</MenuItem>
      <MenuItem value="Approved">Approved</MenuItem>
      <MenuItem value="Rejected">Rejected</MenuItem>
    </Select>
    
    {request.status === 'Approved' && (
      <Button
        component="label"
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        size="small"
        onChange={(e) => handleFileUpload(e, request.id)}
      >
        Upload Certificate
        <VisuallyHiddenInput
          type="file"
          accept="application/pdf"
        />
      </Button>
    )}
  </Box>
</TableCell>
                  
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(requests.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default BonafideRequestList;