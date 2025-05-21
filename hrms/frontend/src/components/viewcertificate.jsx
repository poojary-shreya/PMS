import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, CircularProgress, Alert,
  Box, Grid, Paper, Divider, List, ListItem, ListItemText, ListItemIcon,
  useTheme, useMediaQuery
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessCenterIcon,
  CalendarToday as CalendarIcon,
  AbcOutlined as AssignmentIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import Button from '@mui/material/Button';

const EmployeeCertificateView = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    department: "",
    reason: "",
    address: "",
    candidateEmail: "",
    hrEmail: ""
  });


  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchUserDataAndCertificates = async () => {
      try {

        const userResponse = await axios.get(`${API_BASE_URL}/api/user/current`, { withCredentials: true });

        if (!userResponse.data || !userResponse.data.employee_id) {
          throw new Error("Couldn't retrieve employee ID from session");
        }

        const employeeIdValue = userResponse.data.employee_id;
        setEmployeeId(employeeIdValue);


        const certsResponse = await axios.get(`${API_BASE_URL}/api/bonafide/employee/${employeeIdValue}`,
          { withCredentials: true }
        );

        setCertificates(certsResponse.data);
      } catch (err) {
        console.error("Error fetching user data or certificates:", err);
        setError("Failed to fetch your certificates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndCertificates();
  }, []);


  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {

        const response = await axios.get("http://localhost:5000/api/user/current", { withCredentials: true });

        setForm(prevForm => ({
          ...prevForm,
          employee_id: response.data.employee_id || ""
        }));
      } catch (err) {
        console.error("Failed to fetch employee ID from session:", err);
        setError("Failed to load employee information");
      }
    };

    fetchEmployeeId();
  }, []);


  const handleDownload = async (certificateId, fileName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/bonafide/certificates/${certificateId}`,
        { responseType: 'blob', withCredentials: true }
      );


      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'bonafide_certificate.pdf');


      document.body.appendChild(link);


      link.click();

      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const handleViewCertificate = (certificatePath) => {

    if (certificatePath) {
      window.open(`${API_BASE_URL}/${certificatePath}`, '_blank');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: "1400px" }}>
      <Container maxWidth={false} sx={{ maxWidth: "1400px" }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            mb: 4
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="bold"
          >
            My Bonafide Certificates
          </Typography>
          <Divider sx={{ mb: 4, mt: 2 }} />

          {isLoading && (
            <Box display="flex" justifyContent="center" mt={4} mb={4}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

          {!isLoading && !error && certificates.length === 0 && (
            <Alert severity="info" sx={{ mt: 2, mb: 4 }}>
              You do not have any bonafide certificates yet.
            </Alert>
          )}

          {!isLoading && !error && certificates.length > 0 && (
            <Grid container spacing={4}>
              {certificates.map((cert) => (
                <Grid item xs={12} key={cert.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: isMobile ? 2 : 4,
                      borderRadius: 2,
                      borderLeft: '6px solid',
                      borderColor: 'primary.main',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Grid container spacing={3}>

                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" color="primary" fontWeight="medium">
                            Bonafide Certificate
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <List>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Name"
                              secondary={cert.name}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <BusinessCenterIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Employee ID"
                              secondary={cert.employee_id}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <AssignmentIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Department"
                              secondary={cert.department}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <DescriptionIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Reason"
                              secondary={cert.reason}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <BusinessCenterIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Address"
                              secondary={cert.address}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemIcon>
                              <CalendarIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Issued Date"
                              secondary={new Date(cert.updatedAt || cert.createdAt).toLocaleDateString()}
                              primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary', fontWeight: 'bold' }}
                              secondaryTypographyProps={{ variant: 'body1', }}
                            />
                          </ListItem>
                        </List>
                      </Grid>


                      <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: 3
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<DescriptionIcon />}
                          fullWidth
                          onClick={() => handleViewCertificate(cert.certificatePath)}
                          disabled={!cert.certificatePath}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: 2
                          }}
                        >
                          View Certificate
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          startIcon={<DownloadIcon />}
                          fullWidth
                          onClick={() => handleDownload(cert.id, `bonafide_${cert.employee_id}.pdf`)}
                          disabled={!cert.certificatePath}
                          sx={{
                            py: 1.5,
                            borderRadius: 2
                          }}
                        >
                          Download Certificate
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default EmployeeCertificateView;