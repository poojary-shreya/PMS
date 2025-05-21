import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  Pagination,
  ButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewContractEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(0);
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchContractEmployees();
  }, []);
  const retryFetch = () => {
    fetchContractEmployees();
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredEmployees.length / rowsPerPage));
    setPage(1);
  }, [filteredEmployees, rowsPerPage]);

  const fetchContractEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get('http://localhost:5000/api/contract', {
        signal: controller.signal,
        validateStatus: status => status < 500
      });

      clearTimeout(timeoutId);

      if (response.data.success) {
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);
      } else {
        console.error('Error response:', response.data);
        setError('Failed to load contract employees data: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching contract employees data:', error);
      setError('Failed to connect to the server. Please check if the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = employees.filter(employee =>
      employee.c_employee_id?.toLowerCase().includes(term) ||
      employee.fullName?.toLowerCase().includes(term) ||
      employee.department?.toLowerCase().includes(term) ||
      employee.companyName?.toLowerCase().includes(term) ||
      employee.roleType?.toLowerCase().includes(term)
    );

    setFilteredEmployees(filtered);
  };

  const handleEdit = (employeeId) => {
    navigate('/contract', {
      state: {
        employee_id: employeeId,
        isEdit: true
      }
    });
  };
  // Function to create a printable version of the data
  const createPrintableContent = () => {
    // Create printable content element
    const printContent = document.createElement('div');
    printContent.style.padding = '20px';
    printContent.style.backgroundColor = 'white';
    printContent.style.fontFamily = 'Arial, sans-serif';
    
    // Create title
    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.marginBottom = '20px';
    titleDiv.innerHTML = `
      <h2 style="margin-bottom: 5px;">Contract Employees Report</h2>
      <p style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString()}</p>
      <p>Total Employees: ${filteredEmployees.length}</p>
    `;
    printContent.appendChild(titleDiv);
    
    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    
    // Add table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr style="background-color: #f5f5f5;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Employee ID</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Role</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Department</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Company</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Start Date</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">End Date</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Add table body
    const tbody = document.createElement('tbody');
    filteredEmployees.forEach(employee => {
      const tr = document.createElement('tr');
      
      // Get status style
      let statusStyle = '';
      const status = getContractStatusChip(employee.contractEndDate, true);
      if (status === 'Expired') {
        statusStyle = 'color: #d32f2f; font-weight: bold;'; // Red for expired
      } else if (status.includes('days left') && parseInt(status) <= 30) {
        statusStyle = 'color: #ed6c02; font-weight: bold;'; // Orange for warning
      } else if (status.includes('days left')) {
        statusStyle = 'color: #2e7d32; font-weight: bold;'; // Green for good
      }
      
      tr.innerHTML = `
        <td style="border: 1px solid #ddd; padding: 8px;">${employee.c_employee_id || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${employee.fullName || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${employee.roleType || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${employee.department || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${employee.companyName || ''}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(employee.contractStartDate)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(employee.contractEndDate)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; ${statusStyle}">${status}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    printContent.appendChild(table);
    
    return printContent;
  };

  // Function to handle printing
  const handlePrint = () => {
    try {
      const printContent = createPrintableContent();
      
      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-1000px';
      printFrame.style.left = '-1000px';
      document.body.appendChild(printFrame);
      
      // Add content to the iframe
      printFrame.contentDocument.open();
      printFrame.contentDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contract Employees Report</title>
            <style>
              @media print {
                body { margin: 0; padding: 15px; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                @page { size: landscape; }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      printFrame.contentDocument.close();
      
      // Wait for content to load before printing
      printFrame.onload = () => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    } catch (error) {
      console.error('Print error:', error);
      alert('Error printing. Please try again.');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const getCurrentPageData = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  const getDaysRemaining = (endDateStr) => {
    if (!endDateStr) return null;
    
    const endDate = new Date(endDateStr);
    const today = new Date();
    
    // Reset time portion for accurate day calculation
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getContractStatusChip = (endDateStr, forPdf = false) => {
    if (!endDateStr) {
      return forPdf ? "No End Date" : <Chip label="No End Date" color="default" />;
    }
    
    const daysRemaining = getDaysRemaining(endDateStr);
    
    if (daysRemaining < 0) {
      return forPdf ? "Expired" : <Chip label="Expired" color="error" />;
    } else if (daysRemaining <= 30) {
      return forPdf ? `${daysRemaining} days left` : <Chip label={`${daysRemaining} days left`} color="warning" />;
    } else {
      return forPdf ? `${daysRemaining} days left` : <Chip label={`${daysRemaining} days left`} color="success" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generatePDF = async () => {
    try {
      // Create printable content that can be converted to PDF
      const pdfContent = createPrintableContent();
      
      // Temporarily append to document for html2canvas to work
      document.body.appendChild(pdfContent);
      
      // Capture content with html2canvas
      const canvas = await html2canvas(pdfContent, { 
        scale: 1.5,
        useCORS: true,
        logging: false
      });
      
      // Remove temporary element
      document.body.removeChild(pdfContent);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for better fit
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('Contract_Employees_Report.pdf');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: "1500px", margin: 'auto', padding: 3, position: 'relative' }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Contract Employees
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search by name, ID, company, or department"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        
        
          <Button sx={{ml:50}}
            startIcon={<PictureAsPdfIcon />}
            onClick={generatePDF}
            disabled={loading || filteredEmployees.length === 0}
          >
            Export PDF
          </Button>
          <Button sx={{ml:3}}
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={loading || filteredEmployees.length === 0}
          >
            Print
          </Button>
        
      </Box>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#fff8f8', borderLeft: '4px solid #f44336' }}>
          <Typography color="error" gutterBottom><strong>Error:</strong> {error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={retryFetch}
            startIcon={<SearchIcon />}
          >
            Retry
          </Button>
        </Paper>
      )}

      <div style={{ position: 'relative' }} ref={pdfRef}>
        <TableContainer component={Paper} elevation={3} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Employee ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Start Date</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, zIndex: 1 }}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No contract employees found</TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((employee) => (
                  <TableRow key={employee.c_employee_id} hover>
                    <TableCell>{employee.c_employee_id}</TableCell>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>{employee.roleType}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Tooltip title={`Vendor: ${employee.companyName}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" />
                          <Typography>{employee.companyName}</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" />
                        <Typography>{formatDate(employee.contractStartDate)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" />
                        <Typography>{formatDate(employee.contractEndDate)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getContractStatusChip(employee.contractEndDate)}
                    </TableCell>
                    <TableCell
                      style={{
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'white',
                        zIndex: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(employee.c_employee_id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading || filteredEmployees.length === 0}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEmployees.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {
              Math.min(page * rowsPerPage, filteredEmployees.length)
            } of {filteredEmployees.length} contract employees
          </Typography>
        </Box>
      </div>
    </Box>
  );
};

export default ViewContractEmployees;