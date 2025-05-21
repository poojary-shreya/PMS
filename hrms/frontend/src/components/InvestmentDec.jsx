import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  Checkbox,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  AppBar,
  Toolbar,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

const TaxDeductionForm = ({employee_id,financial_year}) => {
  const currentYear = new Date().getFullYear();
  const financialYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`,
    `${currentYear+2}-${currentYear+3}`,
  ];
  
  // State for form data
  const [formData, setFormData] = useState({
    employee_id: employee_id,
    financial_year: financial_year || financialYears[1],
    // HRA details
    rent_paid: '0',
    // Left Side - Medical Insurance
    medical_insurance_beneficiaries:[],
    "80D_self_spouse_children_under60": "0",
    "80D_self_spouse_children_over60": "0",
    "80D_self_spouse_children_over60_no_insurance": "0",
    "80D_parents_under60": "0",
    "80D_parents_over60": "0",
    "80D_parents_over60_no_insurance": "0",
    
    // Education Loan
    "80E_education_loan": "0",
    
    // Disability
    "80U_disability_40_to_80": "0",
    "80U_disability_above_80": "0",
    
    // Handicapped Dependent
    "80DD_disability_40_to_80": "0",
    "80DD_disability_above_80": "0",
    
    // Medical Treatment
    "80DDB_self_dependent": "0",
    "selectedMedicalCategory": "not_senior_citizen",
    "superSeniorCitizen": false,
    
    // Other Deductions
    "80TTA_savings_interest": "0",
    "80TTB_sr_citizen_interest": "0",
    "80CCD_salary_deduction": "0",
    "80CCD1B_additional_nps": "0",
    "80CCD1B_atal_pension": "0",
    "80CCD1B_nps_vatsalya": "0",
    "80CCD2_employer_contribution": "0",
    "80EE_additional_housing_loan": "0",
    "80EEA_housing_loan_benefit": "0",
    "80EEB_electric_vehicle_loan": "0",
    
    // Right Side - Deductions under 80CCE
    "80CCC_pension_fund": "0",
    
    // 80C Investments
    "80C_provident_fund": "0",
    "80C_housing_loan_principal": "0",
    "80C_mutual_fund": "0",
    "80C_ppf": "0",
    "80C_nsc": "0",
    "80C_nsc_interest": "0",
    "80C_ulip": "0",
    "80C_elss": "0",
    "80C_life_insurance": "0",
    "80C_mutual_fund_pension": "0",
    "80C_tuition_fees": "0",
    "80C_infrastructure_bond": "0",
    "80C_bank_fd": "0",
    "80C_senior_citizens_savings": "0",
    "80C_post_office_time_deposit": "0",
    "80C_nps_tier1": "0",
    "80C_atal_pension": "0",
    "80C_sukanya_samriddhi": "0",
  });

    const [currentBeneficiary, setCurrentBeneficiary] = useState({
      name: '',
      relation: 'self',
      age: '',
      fieldId: '' 
    });

  // Field labels for search functionality
  const fieldLabels = {
    "employee_id": "Employee ID",
    "financial_year": "Financial Year",
    "rent_paid": "HRA Exemption",
    // 80D Medical Insurance
    "80D_self_spouse_children_under60": "Self/Spouse/Children (<60 yrs)",
    "80D_self_spouse_children_over60": "Self/Spouse/Children (>60 yrs)",
    "80D_self_spouse_children_over60_no_insurance": "Self/Spouse/Children (>60 yrs) - No Insurance",
    "80D_parents_under60": "Parents (<60 yrs)",
    "80D_parents_over60": "Parents (>60 yrs)",
    "80D_parents_over60_no_insurance": "Parents (>60 yrs) - No Insurance",
    // 80E Education Loan
    "80E_education_loan": "Interest on Education Loan",
    // 80U Disability
    "80U_disability_40_to_80": "Disability between 40% and 80%",
    "80U_disability_above_80": "Disability 80% and above",
    // 80DD Handicapped Dependent
    "80DD_disability_40_to_80": "Disability between 40% and 80%",
    "80DD_disability_above_80": "Disability 80% and above",
    // Medical Treatment
    "80DDB_self_dependent": "For Self/Dependent",
    // Other Deductions
    "80TTA_savings_interest": "80TTA - Interest on Savings Account",
    "80TTB_sr_citizen_interest": "80TTB - Interest on deposits held by Sr. Citizen Employee",
    "80CCD_salary_deduction": "80CCD - NPS Tier 1 - Employee Contribution (Salary Deduction)",
    "80CCD1B_additional_nps": "80CCD1B - Additional NPS Tier 1 - Employee Contribution",
    "80CCD1B_atal_pension": "80CCD1B - Atal Pension Yojana - Employee Contribution",
    "80CCD1B_nps_vatsalya": "80CCD1B - NPS Vatsalya – Employee Contribution",
    "80CCD2_employer_contribution": "80CCD2 - NPS Employer Contribution (Company pays)",
    "80EE_additional_housing_loan": "80EE - Additional Housing Loan Interest (1st property FY 16-17)",
    "80EEA_housing_loan_benefit": "80EEA - Housing Loan Interest Benefit Apr'19 - Mar'22",
    "80EEB_electric_vehicle_loan": "80EEB - Electric Vehicle Loan Interest Benefit Apr'19 - Mar'23",
    // 80CCE Section
    "80CCC_pension_fund": "Contribution to Pension Fund",
    // 80C Investments
    "80C_provident_fund": "Provident Fund (PF) (Deduction from Salary)",
    "80C_housing_loan_principal": "Housing Loan Principal",
    "80C_mutual_fund": "Mutual Fund",
    "80C_ppf": "Public Provident Fund",
    "80C_nsc": "National Savings Certificate",
    "80C_nsc_interest": "NSC Interest",
    "80C_ulip": "Unit Linked Insurance Plan (ULIP)",
    "80C_elss": "Equity Linked Saving Scheme (ELSS)",
    "80C_life_insurance": "Life Insurance Policy",
    "80C_mutual_fund_pension": "Mutual Fund Pension",
    "80C_tuition_fees": "Education Tuition Fees",
    "80C_infrastructure_bond": "Infrastructure Bond",
    "80C_bank_fd": "Scheduled Bank FDs (5-year lock-in)",
    "80C_senior_citizens_savings": "Senior Citizens Savings Scheme",
    "80C_post_office_time_deposit": "Post Office Time Deposit",
    "80C_nps_tier1": "80CCD-NPS Tier 1 - Employee Contribution",
    "80C_atal_pension": "80CCD-Atal Pension Yojana - Employee Contribution",
    "80C_sukanya_samriddhi": "Sukanya Samriddhi Account Deposit Scheme",
  };

  // Field descriptions/helper text
  const fieldHelperText = {
    "80D_self_spouse_children_under60": "Limit: ₹25,000",
    "80D_self_spouse_children_over60": "Limit: ₹50,000",
    "80D_self_spouse_children_over60_no_insurance": "Medical Expenditure",
    "80D_parents_under60": "Limit: ₹25,000",
    "80D_parents_over60": "Limit: ₹50,000",
    "80D_parents_over60_no_insurance": "Medical Expenditure",
    "80E_education_loan": "No Limit",
    "80U_disability_40_to_80": "Maximum Allowed: ₹75,000",
    "80U_disability_above_80": "Maximum Allowed: ₹1,25,000",
    "80DD_disability_40_to_80": "Fixed Deduction: ₹75,000",
    "80DD_disability_above_80": "Fixed Deduction: ₹1,25,000",
    "80DDB_self_dependent": "Depends on category",
    "80TTA_savings_interest": "Limit: ₹10,000",
    "80TTB_sr_citizen_interest": "Limit: ₹50,000",
    "80CCD_salary_deduction": "Part of overall limit of ₹1,50,000 under Sec 80CCE",
    "80CCD1B_additional_nps": "Limit: ₹50,000",
    "80CCD1B_atal_pension": "Limit: ₹50,000",
    "80CCD1B_nps_vatsalya": "Limit: ₹50,000",
    "80CCD2_employer_contribution": "Limit: 10% of Basic Salary",
    "80EE_additional_housing_loan": "Limit: ₹50,000",
    "80EEA_housing_loan_benefit": "Limit: ₹1,50,000",
    "80EEB_electric_vehicle_loan": "Limit: ₹1,50,000",
    "80CCC_pension_fund": "Part of overall limit of ₹1,50,000 under Sec 80CCE"
  };


  const fieldTooltips = {
    "employee_id": "Your unique employee identification number.",
    "financial_year": "The financial year for which you are declaring investments and deductions.",
    "rent_paid": "Total rent paid annually for HRA exemption. PAN of landlord required if rent exceeds ₹1,00,000 per year.",
    
    // 80D Medical Insurance
    "80D_self_spouse_children_under60": "Premium paid for medical insurance of self, spouse, or children (below 60 years). Max ₹25,000.",
    "80D_self_spouse_children_over60": "Premium for medical insurance of self/spouse (above 60). Max ₹50,000.",
    "80D_self_spouse_children_over60_no_insurance": "Deduction for medical expenses if no insurance is taken (age >60). Max ₹50,000.",
    "80D_parents_under60": "Premium for medical insurance of parents below 60. Max ₹25,000.",
    "80D_parents_over60": "Premium for medical insurance of senior citizen parents. Max ₹50,000.",
    "80D_parents_over60_no_insurance": "Medical expenses for senior citizen parents without insurance. Max ₹50,000.",
    
    // 80E Education Loan
    "80E_education_loan": "Interest paid on education loan for self or family. No upper limit on amount.",
    
    // 80U Disability
    "80U_disability_40_to_80": "For taxpayer with disability between 40% and 80%. Flat deduction of ₹75,000.",
    "80U_disability_above_80": "For taxpayer with disability above 80%. Flat deduction of ₹1,25,000.",
    
    // 80DD Handicapped Dependent
    "80DD_disability_40_to_80": "Expenditure on dependent with 40%-80% disability. Deduction up to ₹75,000.",
    "80DD_disability_above_80": "Expenditure on dependent with 80%+ disability. Deduction up to ₹1,25,000.",
    
    // Medical Treatment
    "80DDB_self_dependent": "Medical treatment expenses for specified diseases for self or dependents. Limit varies (₹40,000–₹1,00,000).",
    
    // Other Deductions
    "80TTA_savings_interest": "Interest from savings account up to ₹10,000 (Non-senior citizens only).",
    "80TTB_sr_citizen_interest": "Interest on savings & deposits for senior citizens. Limit up to ₹50,000.",
    
    "80CCD_salary_deduction": "NPS Tier 1 - Employee's contribution via salary. Limit: ₹1.5L (part of 80C).",
    "80CCD1B_additional_nps": "Additional NPS Tier 1 contribution. Additional benefit up to ₹50,000 (over 80C).",
    "80CCD1B_atal_pension": "Atal Pension Yojana employee contribution. Deduction under 80CCD(1B).",
    "80CCD1B_nps_vatsalya": "Employee contribution to NPS Vatsalya scheme (deductible under 80CCD(1B)).",
    "80CCD2_employer_contribution": "Employer contribution to NPS (not part of 80C limit). Max: 10% of salary.",
    
    "80EE_additional_housing_loan": "Interest on housing loan for first-time buyers (FY 2016-17). Max ₹50,000.",
    "80EEA_housing_loan_benefit": "Interest on housing loan (affordable housing Apr’19–Mar’22). Max ₹1.5L.",
    "80EEB_electric_vehicle_loan": "Interest on loan for buying electric vehicles. Max deduction: ₹1.5L.",
    
    // 80CCE Section
    "80CCC_pension_fund": "Contribution to certain pension funds (LIC/Annuity). Part of ₹1.5L 80C limit.",
    
    // 80C Investments
    "80C_provident_fund": "PF deducted from salary (eligible under 80C).",
    "80C_housing_loan_principal": "Principal repaid on housing loan. Eligible under 80C limit.",
    "80C_mutual_fund": "Investment in ELSS mutual funds with 3-year lock-in (eligible for 80C).",
    "80C_ppf": "Investment in Public Provident Fund (PPF).",
    "80C_nsc": "Investment in National Savings Certificate (NSC).",
    "80C_nsc_interest": "Interest accrued on NSC (considered reinvested).",
    "80C_ulip": "Investment in Unit Linked Insurance Plans (ULIPs).",
    "80C_elss": "Investment in Equity Linked Saving Scheme (ELSS).",
    "80C_life_insurance": "Life insurance premium paid (self, spouse, children).",
    "80C_mutual_fund_pension": "Investment in pension-linked mutual funds (within 80C limit).",
    "80C_tuition_fees": "Tuition fees for up to 2 children (excluding donation/transport etc).",
    "80C_infrastructure_bond": "Investment in infrastructure bonds (if notified).",
    "80C_bank_fd": "5-year tax-saving Fixed Deposits with scheduled banks.",
    "80C_senior_citizens_savings": "Investments in Senior Citizens Saving Scheme.",
    "80C_post_office_time_deposit": "5-year time deposit in post office.",
    "80C_nps_tier1": "NPS Tier 1 - Employee contribution (also shown under 80CCD).",
    "80C_atal_pension": "Atal Pension Yojana contribution (also part of NPS deductions).",
    "80C_sukanya_samriddhi": "Investment in Sukanya Samriddhi Account for girl child.",
  };
  
  // Field categories for organization
  const fieldCategories = {
    "Medical Insurance": ["80D_self_spouse_children_under60", "80D_self_spouse_children_over60", "80D_self_spouse_children_over60_no_insurance", "80D_parents_under60", "80D_parents_over60", "80D_parents_over60_no_insurance"],
    "Education Loan": ["80E_education_loan"],
    "Disability": ["80U_disability_40_to_80", "80U_disability_above_80"],
    "Handicapped Dependent": ["80DD_disability_40_to_80", "80DD_disability_above_80"],
    "Medical Treatment": ["80DDB_self_dependent"],
    "Other Deductions": ["80TTA_savings_interest", "80TTB_sr_citizen_interest", "80CCD_salary_deduction", "80CCD1B_additional_nps", "80CCD1B_atal_pension", "80CCD1B_nps_vatsalya", "80CCD2_employer_contribution", "80EE_additional_housing_loan", "80EEA_housing_loan_benefit", "80EEB_electric_vehicle_loan"],
    "Pension Fund": ["80CCC_pension_fund"],
    "80C Investments": ["80C_provident_fund", "80C_housing_loan_principal", "80C_mutual_fund", "80C_ppf", "80C_nsc", "80C_nsc_interest", "80C_ulip", "80C_elss", "80C_life_insurance", "80C_mutual_fund_pension", "80C_tuition_fees", "80C_infrastructure_bond", "80C_bank_fd", "80C_senior_citizens_savings", "80C_post_office_time_deposit", "80C_nps_tier1", "80C_atal_pension", "80C_sukanya_samriddhi"]
  };

  // Find category for a field
  const getCategoryForField = (fieldId) => {
    for (const [category, fields] of Object.entries(fieldCategories)) {
      if (fields.includes(fieldId)) {
        return category;
      }
    }
    return "General";
  };

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFullForm, setShowFullForm] = useState(true);

  // Search function
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowFullForm(true);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = Object.keys(fieldLabels).filter(fieldKey => {
      const label = fieldLabels[fieldKey].toLowerCase();
      const category = getCategoryForField(fieldKey).toLowerCase();
      return label.includes(term) || fieldKey.toLowerCase().includes(term) || category.includes(term);
    }).map(fieldKey => ({
      id: fieldKey,
      label: fieldLabels[fieldKey],
      category: getCategoryForField(fieldKey),
      helperText: fieldHelperText[fieldKey] || ""
    }));

    setSearchResults(results);
    setShowFullForm(results.length === 0);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate totals
  const calculateSection80CTotal = () => {
    const fields = [
      "80C_provident_fund", "80C_housing_loan_principal", "80C_mutual_fund", 
      "80C_ppf", "80C_nsc", "80C_nsc_interest", "80C_ulip", "80C_elss", 
      "80C_life_insurance", "80C_mutual_fund_pension", "80C_tuition_fees", 
      "80C_infrastructure_bond", "80C_bank_fd", "80C_senior_citizens_savings", 
      "80C_post_office_time_deposit", "80C_nps_tier1", "80C_atal_pension", 
      "80C_sukanya_samriddhi", "80CCC_pension_fund"
    ];
    
    return fields.reduce((total, field) => {
      const value = parseFloat(formData[field] || 0);
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const section80CTotal = calculateSection80CTotal();
  const section80CCELimit = 150000;
  const exceeds80CCELimit = section80CTotal > section80CCELimit;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
  
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Handle radio button changes
  const handleRadioChange = (event) => {
    setFormData({
      ...formData,
      selectedMedicalCategory: event.target.value
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      superSeniorCitizen: event.target.checked
    });
  };

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      employee_id: employee_id || prevData.employee_id,
      financial_year: financial_year || prevData.financial_year
    }));
  }, [employee_id, financial_year]);


  const determineFieldId = (relation, age) => {
    const ageNum = parseInt(age, 10);
    if (!ageNum) return '';
    
    // Self, spouse, or children
    if (['self', 'spouse', 'children'].includes(relation)) {
      return ageNum >= 60 ? '80D_self_spouse_children_over60' : '80D_self_spouse_children_under60';
    }
    // Parents or parents-in-law
    else if (['parents', 'parents_in_law'].includes(relation)) {
      return ageNum >= 60 ? '80D_parents_over60' : '80D_parents_under60';
    }
    
    return '';
  };

  // Handle beneficiary input changes
  const handleBeneficiaryChange = (e) => {
    const { name, value } = e.target;
    
    // If relation or age changes, determine the corresponding field
    let updates = { [name]: value };
    
    if (name === 'relation' || name === 'age') {
      const relation = name === 'relation' ? value : currentBeneficiary.relation;
      const age = name === 'age' ? value : currentBeneficiary.age;
      
      if (relation && age) {
        const fieldId = determineFieldId(relation, age);
        updates.fieldId = fieldId;
      }
    }
    
    setCurrentBeneficiary(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Add beneficiary to the list
  const addBeneficiary = () => {
    if (!currentBeneficiary.name || !currentBeneficiary.age || !currentBeneficiary.fieldId) {
      // Show error notification
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      medical_insurance_beneficiaries: [
        ...prev.medical_insurance_beneficiaries,
        {...currentBeneficiary}
      ]
    }));
    
    // Reset current beneficiary
    setCurrentBeneficiary({
      name: '',
      relation: 'self',
      age: '',
      fieldId: ''
    });
  };
  
  // Remove beneficiary from the list
  const removeBeneficiary = (index) => {
    setFormData(prev => ({
      ...prev,
      medical_insurance_beneficiaries: prev.medical_insurance_beneficiaries.filter((_, i) => i !== index)
    }));
  };


  // Group beneficiaries by their field ID
  const groupedBeneficiaries = formData.medical_insurance_beneficiaries.reduce((acc, beneficiary) => {
    const { fieldId } = beneficiary;
    if (!acc[fieldId]) {
      acc[fieldId] = [];
    }
    acc[fieldId].push(beneficiary);
    return acc;
  }, {});

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const processedData = { ...formData };
    
    // Convert empty strings to null or 0 for numeric fields
    Object.keys(processedData).forEach(key => {
      // Skip non-numeric fields and fields that should be strings
      if (key === 'employee_id' || key === 'financial_year' || 
          key === 'selectedMedicalCategory' || key === 'superSeniorCitizen' ||
          key === 'medical_insurance_beneficiaries') {
        return;
      }
      
      if (processedData[key] === '') {
        processedData[key] = null; // or 0, depending on your backend requirements
      } else if (processedData[key]) {
        // Convert to number if it's not empty
        processedData[key] = Number(processedData[key]);
      }
    });
      // API endpoint would be defined here
      const response = await axios.post('http://localhost:5000/api/investment/declarations', formData);
      
      setNotification({
        open: true,
        message: 'Tax deduction form submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Unknown error occurred';
      const errorDetails = error.response?.data?.error || '';
      console.error('Form submission error:', errorMsg, errorDetails);
      setNotification({
        open: true,
        message: `Error: ${errorMsg}`,
        severity: 'error'
      });
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Group search results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg">
      {/* Search in Header */}
      <AppBar position="sticky" color="default" elevation={0} sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tax Deduction Form
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            <TextField
              variant="outlined"
              placeholder="Search fields..."
              size="small"
              value={searchTerm}
              onChange={handleSearchInputChange}
              InputProps={{
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => {
                      setSearchTerm('');
                      setShowFullForm(true);
                    }}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Income Tax Act Deductions
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information - Always visible */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Financial Year</InputLabel>
                <Select
                  name="financial_year"
                  value={formData.financial_year}
                  // onChange={(e) => setFormData({...formData, financial_year: e.target.value})}   
                                 label="Financial Year"
                >
                  {financialYears.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Show search results if search is active */}
          {!showFullForm && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results
              </Typography>
              
              {Object.keys(groupedResults).length > 0 ? (
                Object.entries(groupedResults).map(([category, fields]) => (
                  <Card variant="outlined" sx={{ mb: 3 }} key={category}>
                    <CardHeader title={category} />
                    <CardContent>
                      <Grid container spacing={2}>
                        {fields.map(field => (
                          <Grid item xs={12} key={field.id}>
                            <TextField
                              fullWidth
                              label={field.label}
                              name={field.id}
                              value={formData[field.id]}
                              onChange={handleInputChange}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              helperText={field.helperText}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  No matching fields found. Try a different search term.
                </Typography>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 3, mb: 3 }}>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setShowFullForm(true);
                  }}
                >
                  Show Full Form
                </Button>
              </Box>
            </Box>
          )}

          {/* Full Form Display */}
          {showFullForm && (
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader title="80D - Medical Insurance" />
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          Add Beneficiary Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={currentBeneficiary.name}
              onChange={handleBeneficiaryChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Relation</InputLabel>
              <Select
                name="relation"
                value={currentBeneficiary.relation}
                onChange={handleBeneficiaryChange}
                label="Relation"
              >
                <MenuItem value="self">Self</MenuItem>
                <MenuItem value="spouse">Spouse</MenuItem>
                <MenuItem value="children">Children</MenuItem>
                <MenuItem value="parents">Parents</MenuItem>
                <MenuItem value="parents_in_law">Parents-in-law</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={currentBeneficiary.age}
              onChange={handleBeneficiaryChange}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={addBeneficiary}
              fullWidth
              disabled={!currentBeneficiary.name || !currentBeneficiary.age || !currentBeneficiary.fieldId}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        {/* Show the appropriate field based on the current beneficiary selection */}
        {currentBeneficiary.fieldId && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Selected category for {currentBeneficiary.name}: {fieldLabels[currentBeneficiary.fieldId]}
            </Typography>
          </Box>
        )}
        
        {/* Display beneficiaries grouped by their field */}
        {Object.keys(groupedBeneficiaries).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Medical Insurance Fields
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(groupedBeneficiaries).map(([fieldId, beneficiaries]) => (
                <Grid item xs={12} key={fieldId}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {fieldLabels[fieldId]}
                    </Typography>
                    
                    
                    {/* List of beneficiaries in this field */}
                    <Box sx={{ mb: 2 }}>
                      {beneficiaries.map((beneficiary, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1
                          }}
                        >
                          <Typography variant="body2">
                            {beneficiary.name} ({beneficiary.relation}, {beneficiary.age} yrs)
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => removeBeneficiary(
                              formData.medical_insurance_beneficiaries.findIndex(b => 
                                b.name === beneficiary.name && 
                                b.relation === beneficiary.relation && 
                                b.age === beneficiary.age
                              )
                            )}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                    
                    {/* Input field for this category */}
                    <Tooltip title={fieldTooltips[fieldId]} placement='top' arrow>
                    <TextField
                      fullWidth
                      label={`Amount for ${fieldLabels[fieldId]}`}
                      name={fieldId}
                      value={formData[fieldId]}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText={fieldHelperText[fieldId]}
                      sx={{ 
                        bgcolor: 'background.paper',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          }
                        }
                      }}
                    />
                    </Tooltip>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Show remaining 80D fields that don't have associated beneficiaries */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Additional Medical Insurance Options
          </Typography>
          
          <Grid container spacing={2}>
            {['80D_self_spouse_children_over60_no_insurance', '80D_parents_over60_no_insurance'].map(fieldId => (
              <Grid item xs={12} key={fieldId}>
                <Tooltip title={fieldTooltips[fieldId]} placement='top' arrow>
                <TextField
                  fullWidth
                  label={fieldLabels[fieldId]}
                  name={fieldId}
                  value={formData[fieldId]}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  helperText={fieldHelperText[fieldId]}
                />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="80E - Interest on Education Loan" />
                  <CardContent>
                    <Tooltip placement='top' arrow title={fieldTooltips["80E_education_loan"]}>
                    <TextField
                      fullWidth
                      label="Interest on Education Loan"
                      name="80E_education_loan"
                      value={formData["80E_education_loan"]}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText="No Limit"
                    />
                    </Tooltip>
                    
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="80DDB - Deduction for Medical Treatment" />
                  <CardContent>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <RadioGroup
                        name="medicalCategory"
                        value={formData.selectedMedicalCategory}
                        onChange={handleRadioChange}
                      >
                        <FormControlLabel 
                          value="not_senior_citizen" 
                          control={<Radio />} 
                          label="Self/Dependent/Parents (Not Sr Citizen)" 
                        />
                        <FormControlLabel 
                          value="senior_citizen" 
                          control={<Radio />} 
                          label="Self/Dependent/Parents (Sr Citizen)" 
                        />
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.superSeniorCitizen}
                          onChange={handleCheckboxChange}
                          name="superSeniorCitizen"
                        />
                      }
                      label="Medical expenditure for specified diseases for Super Senior Citizens"
                    />
                    
                    <TextField
                      fullWidth
                      label="For Self/Dependent"
                      name="80DDB_self_dependent"
                      value={formData["80DDB_self_dependent"]}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText={formData.selectedMedicalCategory === "not_senior_citizen" ? "Limit: ₹40,000" : "Limit: ₹1,00,000"}
                    />
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardHeader title="Other Deductions" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80TTA_savings_interest"]}>
                        <TextField
                          fullWidth
                          label="80TTA - Interest on Savings Account"
                          name="80TTA_savings_interest"
                          value={formData["80TTA_savings_interest"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹10,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80TTB_sr_citizen_interest"]}>
                        <TextField
                          fullWidth
                          label="80TTB - Interest on deposits held by Sr. Citizen Employee"
                          name="80TTB_sr_citizen_interest"
                          value={formData["80TTB_sr_citizen_interest"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCD_salary_deduction"]}>
                        <TextField
                          fullWidth
                          label="80CCD - NPS Tier 1 - Employee Contribution (Salary Deduction)"
                          name="80CCD_salary_deduction"
                          value={formData["80CCD_salary_deduction"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Part of overall limit of ₹1,50,000 under Sec 80CCE"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCD1B_additional_nps"]}>
                        <TextField
                          fullWidth
                          label="80CCD1B - Additional NPS Tier 1 - Employee Contribution"
                          name="80CCD1B_additional_nps"
                          value={formData["80CCD1B_additional_nps"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCD1B_atal_pension"]}>
                        <TextField
                          fullWidth
                          label="80CCD1B - Atal Pension Yojana - Employee Contribution"
                          name="80CCD1B_atal_pension"
                          value={formData["80CCD1B_atal_pension"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCD1B_nps_vatsalya"]}>
                        <TextField
                          fullWidth
                          label="80CCD1B - NPS Vatsalya – Employee Contribution"
                          name="80CCD1B_nps_vatsalya"
                          value={formData["80CCD1B_nps_vatsalya"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCD2_employer_contribution"]}>
                        <TextField
                          fullWidth
                          label="80CCD2 - NPS Employer Contribution (Company pays)"
                          name="80CCD2_employer_contribution"
                          value={formData["80CCD2_employer_contribution"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: 10% of Basic Salary"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80EE_additional_housing_loan"]}>
                        <TextField
                          fullWidth
                          label="80EE - Additional Housing Loan Interest (1st property FY 16-17)"
                          name="80EE_additional_housing_loan"
                          value={formData["80EE_additional_housing_loan"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80EEA_housing_loan_benefit"]}>
                        <TextField
                          fullWidth
                          label="80EEA - Housing Loan Interest Benefit Apr'19 - Mar'22"
                          name="80EEA_housing_loan_benefit"
                          value={formData["80EEA_housing_loan_benefit"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹1,50,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80EEB_electric_vehicle_loan"]}>
                        <TextField
                          fullWidth
                          label="80EEB - Electric Vehicle Loan Interest Benefit Apr'19 - Mar'23"
                          name="80EEB_electric_vehicle_loan"
                          value={formData["80EEB_electric_vehicle_loan"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Limit: ₹1,50,000"
                        />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader 
                    title="80U - Disability" 
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80U_disability_40_to_80"]}>
                        <TextField
                          fullWidth
                          label="Disability between 40% and 80%"
                          name="80U_disability_40_to_80"
                          value={formData["80U_disability_40_to_80"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Maximum Allowed: ₹75,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80U_disability_above_80"]}>
                        <TextField
                          fullWidth
                          label="Disability 80% and above"
                          name="80U_disability_above_80"
                          value={formData["80U_disability_above_80"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Maximum Allowed: ₹1,25,000"
                        />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="80DD - Handicapped Dependent" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80DD_disability_40_to_80"]}>
                        <TextField
                          fullWidth
                          label="Disability between 40% and 80%"
                          name="80DD_disability_40_to_80"
                          value={formData["80DD_disability_40_to_80"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Fixed Deduction: ₹75,000"
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80DD_disability_above_80"]}>
                        <TextField
                          fullWidth
                          label="Disability 80% and above"
                          name="80DD_disability_above_80"
                          value={formData["80DD_disability_above_80"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Fixed Deduction: ₹1,25,000"
                        />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader 
                    title="80CCE - Deduction under Section 80C" 
                    subheader={`Total: ₹${section80CTotal.toLocaleString()} / ₹${section80CCELimit.toLocaleString()}`}
                    subheaderTypographyProps={{ 
                      color: exceeds80CCELimit ? 'error.main' : 'text.secondary'
                    }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80CCC_pension_fund"]}>
                        <TextField
                          fullWidth
                          label="Contribution to Pension Fund"
                          name="80CCC_pension_fund"
                          value={formData["80CCC_pension_fund"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Part of overall limit of ₹1,50,000 under Sec 80CCE"
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="80C - Investments" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_provident_fund"]}>
                        <TextField
                          fullWidth
                          label="Provident Fund (PF) (Deduction from Salary)"
                          name="80C_provident_fund"
                          value={formData["80C_provident_fund"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_housing_loan_principal"]}>
                        <TextField
                          fullWidth
                          label="Housing Loan Principal"
                          name="80C_housing_loan_principal"
                          value={formData["80C_housing_loan_principal"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_mutual_fund"]}>
                        <TextField
                          fullWidth
                          label="Mutual Fund"
                          name="80C_mutual_fund"
                          value={formData["80C_mutual_fund"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_ppf"]}>
                        <TextField
                          fullWidth
                          label="Public Provident Fund"
                          name="80C_ppf"
                          value={formData["80C_ppf"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_nsc"]}>
                        <TextField
                          fullWidth
                          label="National Savings Certificate"
                          name="80C_nsc"
                          value={formData["80C_nsc"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_nsc_interest"]}>
                        <TextField
                          fullWidth
                          label="NSC Interest"
                          name="80C_nsc_interest"
                          value={formData["80C_nsc_interest"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        /</Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_ulip"]}>
                        <TextField
                          fullWidth
                          label="Unit Linked Insurance Plan (ULIP)"
                          name="80C_ulip"
                          value={formData["80C_ulip"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_elss"]}>
                        <TextField
                          fullWidth
                          label="Equity Linked Saving Scheme (ELSS)"
                          name="80C_elss"
                          value={formData["80C_elss"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_life_insurance"]}>
                        <TextField
                          fullWidth
                          label="Life Insurance Policy"
                          name="80C_life_insurance"
                          value={formData["80C_life_insurance"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_mutual_fund_pension"]}>
                        <TextField
                          fullWidth
                          label="Mutual Fund Pension"
                          name="80C_mutual_fund_pension"
                          value={formData["80C_mutual_fund_pension"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_tuition_fees"]}>
                        <TextField
                          fullWidth
                          label="Education Tuition Fees"
                          name="80C_tuition_fees"
                          value={formData["80C_tuition_fees"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_infrastructure_bond"]}>
                        <TextField
                          fullWidth
                          label="Infrastructure Bond"
                          name="80C_infrastructure_bond"
                          value={formData["80C_infrastructure_bond"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_bank_fd"]}>
                        <TextField
                          fullWidth
                          label="Scheduled Bank FDs (5-year lock-in)"
                          name="80C_bank_fd"
                          value={formData["80C_bank_fd"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_senior_citizens_savings"]}>
                        <TextField
                          fullWidth
                          label="Senior Citizens Savings Scheme"
                          name="80C_senior_citizens_savings"
                          value={formData["80C_senior_citizens_savings"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_post_office_time_deposit"]}>
                        <TextField
                          fullWidth
                          label="Post Office Time Deposit"
                          name="80C_post_office_time_deposit"
                          value={formData["80C_post_office_time_deposit"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_nps_tier1"]}>
                        <TextField
                          fullWidth
                          label="80CCD-NPS Tier 1 - Employee Contribution"
                          name="80C_nps_tier1"
                          value={formData["80C_nps_tier1"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_atal_pension"]}>
                        <TextField
                          fullWidth
                          label="80CCD-Atal Pension Yojana - Employee Contribution"
                          name="80C_atal_pension"
                          value={formData["80C_atal_pension"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12}>
                      <Tooltip placement='top' arrow title={fieldTooltips["80C_sukanya_samriddhi"]}>
                        <TextField
                          fullWidth
                          label="Sukanya Samriddhi Account Deposit Scheme"
                          name="80C_sukanya_samriddhi"
                          value={formData["80C_sukanya_samriddhi"]}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          error={exceeds80CCELimit}
                        />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="HRA Exemption" />
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Rent Paid"
                      name="rent_paid"
                      value={formData.rent_paid}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </CardContent>
                </Card> */}
              </Grid>
            </Grid>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Declarations'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaxDeductionForm