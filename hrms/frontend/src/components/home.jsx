import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';

const HomePage = () => {
  const features = [
    {
      title: 'Employee Management',
      description: 'Track employee details, history, and performance.'
    },
    {
      title: 'Recruitment and Onboarding',
      description: 'Post jobs, track applicants, and onboard new hires.'
    },
    {
      title: 'Payroll and Compensation',
      description: 'Automatically calculate salaries, taxes, and benefits.'
    },
    {
      title: 'Training and Development',
      description: 'Plan and deliver employee training programs.'
    },
    {
      title: 'Performance Management',
      description: 'Set goals, review performance, and give feedback.'
    },
    {
      title: 'Leave Management',
      description: 'Manage employee leave requests easily.'
    },
    {
      title: 'Attendance Management',
      description: 'Monitor work hours and track overtime.'
    },
    {
      title: 'Reporting and Analytics',
      description: 'Generate HR reports and analyze data.'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',

        py: 4
      }}
    >
      <Container maxWidth="xl">

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 700, color: 'black', letterSpacing: '1px' }}
            gutterBottom
          >
            Welcome to HR Management System
          </Typography>
          <Typography variant="h5" sx={{ color: '#546e7a', mt: 2, p: '20px' }}>
            Easily handle all HR tasks like managing employee details, training, leave, and attendance...
          </Typography>
        </Box>


        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} p={2}>
              <Box
                sx={{
                  p: 4,
                  bgcolor: '#f9f9f9',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: 1,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 5,

                  }
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'black', fontWeight: 'bold' }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#546e7a' }}>
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
