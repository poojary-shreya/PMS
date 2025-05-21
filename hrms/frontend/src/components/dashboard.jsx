// import { useState } from 'react';
// import React from 'react';
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import {
//   AppBar, Avatar, Badge, Box, Card, CardContent, CardHeader, 
//   Container, Divider, Grid, IconButton, LinearProgress, 
//   List, ListItem, ListItemAvatar, ListItemText, Paper, 
//   Tab, Tabs, Table, TableBody, TableCell, TableContainer, 
//   TableHead, TableRow, Typography, Chip, Button, Menu, MenuItem
// } from '@mui/material';
// import {
//   Assessment, Assignment, Dashboard as DashboardIcon, Notifications, People,
//   Settings, Person, KeyboardArrowDown, AttachMoney, Business, 
//   CheckCircle, Schedule, Warning
// } from '@mui/icons-material';

// // Sample data - would be fetched from API in a real implementation
// const projectData = [
//   { name: 'Warehouse Optimization', status: 'In Progress', completion: 65, budget: 120000, spent: 78000, dueDate: '2025-05-15', risk: 'Low' },
//   { name: 'Inventory System Upgrade', status: 'In Progress', completion: 30, budget: 85000, spent: 25500, dueDate: '2025-06-10', risk: 'Medium' },
//   { name: 'Supplier Onboarding', status: 'Not Started', completion: 0, budget: 45000, spent: 0, dueDate: '2025-07-01', risk: 'Low' },
//   { name: 'Logistics Route Planning', status: 'In Progress', completion: 80, budget: 95000, spent: 76000, dueDate: '2025-05-05', risk: 'High' },
//   { name: 'Order Processing Automation', status: 'Completed', completion: 100, budget: 75000, spent: 72000, dueDate: '2025-04-15', risk: 'Low' }
// ];

// const upcomingTasks = [
//   { id: 1, name: 'Finalize vendor contracts', project: 'Warehouse Optimization', assignee: 'John Doe', due: '2025-05-03' },
//   { id: 2, name: 'System deployment planning', project: 'Inventory System Upgrade', assignee: 'Emily Chen', due: '2025-05-04' },
//   { id: 3, name: 'Logistics route testing', project: 'Logistics Route Planning', assignee: 'Michael Smith', due: '2025-05-05' },
//   { id: 4, name: 'Supplier documentation', project: 'Supplier Onboarding', assignee: 'Sandra Lee', due: '2025-05-08' },
// ];

// const resourceUtilization = [
//   { name: 'IT Team', utilization: 85 },
//   { name: 'Warehouse Staff', utilization: 60 },
//   { name: 'Logistics Team', utilization: 75 },
//   { name: 'Procurement', utilization: 45 },
// ];

// const budgetSummary = [
//   { name: 'Total Budget', value: 420000 },
//   { name: 'Spent', value: 251500 },
//   { name: 'Remaining', value: 168500 },
// ];

// const COLORS = ['#3f51b5', '#00C49F', '#FFBB28', '#FF8042'];

// const Dashboard = () => {
//   const [value, setValue] = useState(0);
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const handleProfileClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleProfileClose = () => {
//     setAnchorEl(null);
//   };
  
//   // Format date to display in a readable format
//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };
  
//   // Calculate days remaining until due date
//   const getDaysRemaining = (dueDate) => {
//     const today = new Date();
//     const due = new Date(dueDate);
//     const diffTime = due - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   // Get color based on risk level
//   const getRiskColor = (risk) => {
//     switch(risk) {
//       case 'High': return '#f44336';
//       case 'Medium': return '#ff9800';
//       case 'Low': return '#4caf50';
//       default: return '#2196f3';
//     }
//   };

//   // Get color based on status
//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'Completed': return '#4caf50';
//       case 'In Progress': return '#ff9800';
//       case 'Not Started': return '#9e9e9e';
//       default: return '#2196f3';
//     }
//   };

//   return (
    
//     <Box sx={{  height: '100vh', width: '1500px' }}>
    
    
//       <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5',  overflowY: 'auto', width: '100%',paddingTop:'15' }}>
//         <Container maxWidth="1500px" sx={{ width: '100%' ,paddingTop:'25px'}}>
//           {/* Dashboard Summary Cards */}
//           <Grid container spacing={9} sx={{ mb: 3, width: '100%' }}>
//             <Grid item xs={12} sm={6} md={3}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' ,width:'220px'}}>
//                   <Box>
//                     <Typography variant="subtitle2" color="textSecondary">
//                       Total Projects
//                     </Typography>
//                     <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
//                       5
//                     </Typography>
//                   </Box>
//                   <Avatar sx={{ bgcolor: '#3f51b5', width: 56, height: 56 }}>
//                     <Business />
//                   </Avatar>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',width:'220px' }}>
//                   <Box>
//                     <Typography variant="subtitle2" color="textSecondary">
//                       Completed Projects
//                     </Typography>
//                     <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
//                       1
//                     </Typography>
//                   </Box>
//                   <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
//                     <CheckCircle />
//                   </Avatar>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Card elevation={9} sx={{ width: '100%' }}>
//                 <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',width:'220px' }}>
//                   <Box>
//                     <Typography variant="subtitle2" color="textSecondary">
//                       Upcoming Deadlines
//                     </Typography>
//                     <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
//                       4
//                     </Typography>
//                   </Box>
//                   <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
//                     <Schedule />
//                   </Avatar>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' ,width:'220px'}}>
//                   <Box>
//                     <Typography variant="subtitle2" color="textSecondary">
//                       High Risk Projects
//                     </Typography>
//                     <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
//                       1
//                     </Typography>
//                   </Box>
//                   <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
//                     <Warning />
//                   </Avatar>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* Charts Section */}
//           <Grid container spacing={3} sx={{ mb: 3, width: '100%',paddingTop:'25px'}}>
//             <Grid item xs={12} md={6}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardHeader 
//                   title="Project Completion Progress" 
//                   subheader="Current status of all projects"
//                 />
//                 <Divider />
//                 <CardContent sx={{ height: 300,width:'700px' }}>
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={projectData}
//                       margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="completion" name="Completion %" fill="#3f51b5" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardHeader 
//                   title="Budget Overview" 
//                   subheader="Financial summary across all projects"
//                 />
//                 <Divider />
//                 <CardContent sx={{ height: 300,width:'400px' }}>
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={budgetSummary}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         dataKey="value"
//                         label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       >
//                         {budgetSummary.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* Resource Utilization & Upcoming Tasks */}
//           <Grid container spacing={3} sx={{ mb: 3, width: '100%',paddingTop:'25px' }}>
//             <Grid item xs={12} md={6}>
//               {/* <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardHeader 
//                   title="Resource Utilization" 
//                   subheader="Team capacity allocation"
//                 />
//                 <Divider />
//                 <CardContent sx={{ height: 300 ,width:'500px'}}>
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={resourceUtilization}
//                       layout="vertical"
//                       margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis type="number" domain={[0, 100]} />
//                       <YAxis dataKey="name" type="category" width={100} />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="utilization" name="Utilization %" fill="#00C49F" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card> */}
//             </Grid>

//             {/* <Grid item xs={12} md={6}>
//               <Card elevation={3} sx={{ width: '100%' }}>
//                 <CardHeader 
//                   title="Upcoming Tasks" 
//                   subheader="Tasks due within the next week"
//                   action={
//                     <Button color="primary" size="small">
//                       View All
//                     </Button>
//                   }
//                 />
//                 <Divider />
//                 <List sx={{ height: 300, overflowY: 'auto', width: '100%' }}>
//                   {upcomingTasks.map((task) => (
//                     <React.Fragment key={task.id}>
//                       <ListItem alignItems="flex-start">
//                         <ListItemAvatar>
//                           <Avatar sx={{ bgcolor: '#3f51b5' }}>
//                             {task.assignee.charAt(0)}
//                           </Avatar>
//                         </ListItemAvatar>
//                         <ListItemText
//                           primary={task.name}
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="textPrimary">
//                                 {task.project}
//                               </Typography>
//                               {` — ${task.assignee} • Due: ${formatDate(task.due)}`}
//                             </>
//                           }
//                         />
//                       </ListItem>
//                       <Divider variant="inset" component="li" />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               </Card>
//             </Grid> */}
//           </Grid>

//           {/* Active Projects Table */}
//           <Card elevation={3} sx={{ width: '80%' }}>
//             <CardHeader
//               title="Active Projects"
//               subheader="Current status of ongoing projects"
//               // action={
//               //   <Button variant="contained" color="primary" startIcon={<Business />}>
//               //     Add Project
//               //   </Button>
//               // }
//             />
//             <Divider />
//             <TableContainer component={Paper} elevation={0} sx={{ width: '100%' }}>
//               <Table sx={{ minWidth: 650, width: '100%' }}>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Project Name</TableCell>
//                     <TableCell>Status</TableCell>
//                     <TableCell>Completion</TableCell>
//                     <TableCell>Budget</TableCell>
//                     <TableCell>Due Date</TableCell>
//                     <TableCell>Risk</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {projectData.filter(project => project.status !== 'Completed').map((project, index) => (
//                     <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//                       <TableCell>
//                         <Typography variant="subtitle2">{project.name}</Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Chip 
//                           label={project.status} 
//                           size="small" 
//                           sx={{ 
//                             bgcolor: `${getStatusColor(project.status)}20`, 
//                             color: getStatusColor(project.status),
//                             fontWeight: 'bold'
//                           }} 
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
//                           <Box sx={{ width: '100%', mr: 1 }}>
//                             <LinearProgress 
//                               variant="determinate" 
//                               value={project.completion} 
//                               sx={{ 
//                                 height: 8, 
//                                 borderRadius: 5,
//                                 bgcolor: '#e0e0e0',
//                                 '& .MuiLinearProgress-bar': {
//                                   bgcolor: '#3f51b5',
//                                   borderRadius: 5,
//                                 }
//                               }} 
//                             />
//                           </Box>
//                           <Box sx={{ minWidth: 35, mt: 1 }}>
//                             <Typography variant="body2" color="textSecondary">
//                               {`${project.completion}%`}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" noWrap>
//                           ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
//                         </Typography>
//                         <Typography variant="caption" color="textSecondary">
//                           {Math.round((project.spent / project.budget) * 100)}% spent
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">{formatDate(project.dueDate)}</Typography>
//                         <Typography variant="caption" color="textSecondary">
//                           {getDaysRemaining(project.dueDate)} days left
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Chip 
//                           label={project.risk} 
//                           size="small"
//                           icon={project.risk === 'High' ? <Warning fontSize="small" /> : null}
//                           sx={{ 
//                             bgcolor: `${getRiskColor(project.risk)}20`, 
//                             color: getRiskColor(project.risk),
//                             fontWeight: 'bold'
//                           }} 
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Card>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;



import { useState } from 'react';
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  AppBar, Avatar, Badge, Box, Card, CardContent, CardHeader, 
  Container, Divider, Grid, IconButton, LinearProgress, 
  List, ListItem, ListItemAvatar, ListItemText, Paper, 
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Chip, Button, Menu, MenuItem
} from '@mui/material';
import {
  Assessment, Assignment, Dashboard as DashboardIcon, Notifications, People,
  Settings, Person, KeyboardArrowDown, AttachMoney, Business, 
  CheckCircle, Schedule, Warning
} from '@mui/icons-material';

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };
  
  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get color based on risk level
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'High': return '#f44336';
      case 'Medium': return '#ff9800';
      case 'Low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return '#4caf50';
      case 'In Progress': return '#ff9800';
      case 'Not Started': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '1200px' }}>
      <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', width: '100%', paddingTop: '15' }}>
        <Container maxWidth="1500px" sx={{ width: '100%', paddingTop: '25px' }}>
          {/* Dashboard Summary Cards */}
          <Grid container spacing={9} sx={{ mb: 3, width: '100%' }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ width: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '220px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Projects
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                     6
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#3f51b5', width: 56, height: 56 }}>
                    <Business />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ width: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '220px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Completed Projects
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                     4
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <CheckCircle />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={9} sx={{ width: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '220px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Upcoming Deadlines
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      2
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                    <Schedule />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ width: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '220px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      High Risk Projects
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                    1
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                    <Warning />
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3, width: '100%', paddingTop: '25px' }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ width: '100%' }}>
                <CardHeader 
                  title="Project Completion Progress" 
                  subheader="Current status of all projects"
                />
                <Divider />
                <CardContent sx={{ height: 300, width: '700px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completion" name="Completion %" fill="#3f51b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ width: '100%' }}>
                <CardHeader 
                  title="Budget Overview" 
                  subheader="Financial summary across all projects"
                />
                <Divider />
                <CardContent sx={{ height: 300, width: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {/* Cells will be populated dynamically */}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Resource Utilization & Upcoming Tasks */}
          <Grid container spacing={3} sx={{ mb: 3, width: '100%', paddingTop: '25px' }}>
            <Grid item xs={12} md={6}>
              {/* Resource Utilization section (commented out in original) */}
            </Grid>
          </Grid>

          {/* Active Projects Table */}
          <Card elevation={3} sx={{ width: '80%' }}>
            <CardHeader
              title="Active Projects"
              subheader="Current status of ongoing projects"
            />
            <Divider />
            <TableContainer component={Paper} elevation={0} sx={{ width: '100%' }}>
              <Table sx={{ minWidth: 650, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Completion</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;