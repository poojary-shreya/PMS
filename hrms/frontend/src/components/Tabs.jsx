import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonalDetails from './PersonalDetails';
import InvestmentDec from './InvestmentDec';
import Rent from './Rent';
import CalcuatedTax from './CalculatedTax';
import LossProperty from './LossProperty';
import TdsAndTcs from './TDSAndTCS'
import axios from 'axios';

const TaxFormWithAccordions = () => {
  const currentYear = new Date().getFullYear();
  const financialYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`,
    `${currentYear+2}-${currentYear+3}`,
  ];


  const [formData, setFormData] = useState({
  
    employee_id: '',
    financial_year: financialYears[0],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        setLoading(true);
      
        const response = await axios.get('http://localhost:5000/api/user/current',{
          withCredentials: true});
        
        if (response.data && response.data.employee_id) {
          setFormData(prevData => ({
            ...prevData,
            employee_id: response.data.employee_id
          }));
        } else {
          setError('Employee ID not found in session');
        }
      } catch (err) {
        console.error('Error fetching employee ID:', err);
        setError('Failed to fetch employee ID');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeId();
  }, []);

 
  const [expanded, setExpanded] = useState({
    personalDetails: false,
    taxDeductions: false,
    hra: false,
    lossproperty:false
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({
      ...expanded,
      [panel]: isExpanded
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          TAX DECLARATION FORM
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Income Tax Act Deductions
        </Typography>
        
       
        <Grid container spacing={3} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Financial Year</InputLabel>
              <Select
                name="financial_year"
                value={formData.financial_year}
                onChange={handleInputChange}
                label="Financial Year"
              >
                {financialYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Accordion 
          expanded={expanded.personalDetails} 
          onChange={handleAccordionChange('personalDetails')}
          sx={{ mb: 1, bgcolor:"#f7f8fc"}}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="personal-details-content"
            id="personal-details-header"
          >
            <Typography variant="h6">Personal Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PersonalDetails 
              
            />
          </AccordionDetails>
        </Accordion>

        <Accordion 
          expanded={expanded.hra} 
          onChange={handleAccordionChange('hra')}
          sx={{ mb: 1,bgcolor:"#f7f8fc"  }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="summary-content"
            id="summary-header"
          >
            <Typography variant="h6">Rent Payment Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Rent
              employee_id={formData.employee_id} 
              financial_year={formData.financial_year}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion 
          expanded={expanded.lossproperty} 
          onChange={handleAccordionChange('lossproperty')}
          sx={{ mb: 1 ,bgcolor:"#f7f8fc" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="summary-content"
            id="summary-header"
          >
            <Typography variant="h6">Loss Due To Property</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LossProperty
              employee_id={formData.employee_id} 
              financial_year={formData.financial_year}
            />
          </AccordionDetails>
        </Accordion>


        <Accordion 
          expanded={expanded.tdsandtcs} 
          onChange={handleAccordionChange('tdsandtcs')}
          sx={{ mb: 1,bgcolor:"#f7f8fc"  }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="summary-content"
            id="summary-header"
          >
            <Typography variant="h6">TCS And TDS Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TdsAndTcs
              employee_id={formData.employee_id} 
              financial_year={formData.financial_year}
            />
          </AccordionDetails>
        </Accordion>





      
        <Accordion 
          expanded={expanded.taxDeductions} 
          onChange={handleAccordionChange('taxDeductions')}
          sx={{ mb: 1, bgcolor:"#f7f8fc" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="tax-deductions-content"
            id="tax-deductions-header"
          >
            <Typography variant="h6">Deduction Under Chapter VI-A</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InvestmentDec
              employee_id={formData.employee_id} 
              financial_year={formData.financial_year}
            />
          </AccordionDetails>
        </Accordion>


        <Accordion 
          expanded={expanded.calculatedtax} 
          onChange={handleAccordionChange('calculatedtax')}
          sx={{ mb: 1, bgcolor:"#f7f8fc" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="tax-deductions-content"
            id="tax-deductions-header"
          >
            <Typography variant="h6">Tax Calculation Computed Sheet</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CalcuatedTax
              employee_id={formData.employee_id} 
              financial_year={formData.financial_year}
            />
          </AccordionDetails>
        </Accordion>






        {/* Submit Button */}
        {/* <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ px: 4, py: 1.5 }}
            onClick={() => alert('Form would be submitted here')}
          >
            Submit Tax Declaration
          </Button>
        </Box> */}
      </Paper>
    </Container>
  );
};

export default TaxFormWithAccordions;