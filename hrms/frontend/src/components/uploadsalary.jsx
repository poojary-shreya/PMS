import { useEffect, useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { 
  Container, TextField, Button, Typography, Paper, Dialog, DialogTitle, 
  DialogContent, IconButton, Box, Grid, Tooltip, Divider, Alert,
  Tabs, Tab
} from "@mui/material";

const UploadSalary = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [pfno, setPfno] = useState("");
  const [uan, setUan] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [ctc, setCtc] = useState("");
  const [joiningBonus, setJoiningBonus] = useState("");
  const [variableSalary, setVariableSalary] = useState("");
  const [isJoiningBonusPaid, setIsJoiningBonusPaid] = useState(false); // Always false
  const [isVariableSalaryPaid, setIsVariableSalaryPaid] = useState(false); // Always false
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [taxDetails, setTaxDetails] = useState(null);
  const [taxRegimeTab, setTaxRegimeTab] = useState(0); // 0 for recommended, 1 for old, 2 for new
  const [open, setOpen] = useState(false);
  const [existingPayroll, setExistingPayroll] = useState(null);

  const location = useLocation();

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      setEmployeeDetails(res.data.data);
      
      // Always keep these false
      setIsJoiningBonusPaid(false);
      setIsVariableSalaryPaid(false);
      
      // Check if employee already has payroll data
      try {
        const payrollRes = await axios.get(`http://localhost:5000/api/payroll/employee/${employeeId}`);
        if (payrollRes.data && payrollRes.data.data) {
          const payroll = payrollRes.data.data;
          setExistingPayroll(payroll);
          
          // Pre-fill payroll data if exists, but keep switches to false
          setPfno(payroll.pfno || "");
          setUan(payroll.uan || "");
          setCtc(payroll.ctc || "");
          setJoiningBonus(payroll.joining_bonus || "");
          setVariableSalary(payroll.variable_salary || "");
          // Always set to false
          setIsJoiningBonusPaid(false);
          setIsVariableSalaryPaid(false);
          
          // Calculate salary components based on existing data
          // IMPORTANT CHANGE: Include bonus and variable in calculations regardless of payment status
          calculateSalaryComponents(payroll.ctc, 
                                   payroll.joining_bonus,
                                   payroll.variable_salary,
                                   false, // Always false for UI display
                                   false); // Always false for UI display
        }
      } catch (payrollError) {
        console.log("No existing payroll found or error fetching payroll");
      }
      
      setOpen(false); // Automatically close dialog after successful fetch
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("Employee not found");
    }
  };

  const calculateSalaryComponents = (
    enteredCTC, 
    enteredJoiningBonus = joiningBonus, 
    enteredVariableSalary = variableSalary,
    jbPaid = false, // Always false for UI display
    vsPaid = false  // Always false for UI display
  ) => {
    if (enteredCTC <= 0) {
      alert("CTC must be greater than 0");
      return;
    }
    
    const base_salary = enteredCTC * 0.50;
    
    // City-based HRA calculation
    const employeeCity = employeeDetails?.city?.toLowerCase() || "non-metro";
    const metroCities = ["mumbai", "delhi", "kolkata", "chennai", "bangalore", "hyderabad", "ahmedabad", "bengaluru"];
    let hra;
    
    if (metroCities.includes(employeeCity)) {
      hra = base_salary * 0.50; // 50% for metro cities
    } else {
      hra = base_salary * 0.40; // 40% for non-metro cities
    }
    
    // PF calculation
    const employerPf = base_salary * 0.12;
    const employeePf = base_salary * 0.12;
    const pf = employerPf + employeePf;
    
    // Professional tax (capped at 200 or 0.2% of CTC, whichever is lower)
    const professional_tax = Math.min(200, enteredCTC * 0.002);
    
    // Allowances
    const medical_allowance = base_salary * 0.10;
    const newspaper_allowance = base_salary * 0.04; // Updated to match backend (4%)
    const dress_allowance = base_salary * 0.04; // Updated to match backend (4%)
    
    // Process bonus and variable salary
    const joiningBonusValue = parseFloat(enteredJoiningBonus) || 0;
    const variableSalaryValue = parseFloat(enteredVariableSalary) || 0;
    
    // IMPORTANT CHANGE: Always include these values in calculations regardless of payment status
    // We want to include them for payslip generation and tax calculations
    
    // Calculate other allowance
    let other_allowance = enteredCTC - (base_salary + hra + pf + (professional_tax * 12) + 
                          medical_allowance + newspaper_allowance + dress_allowance);
    
    if (other_allowance < 0) {
      other_allowance = 0;
    }
    
    // Calculate gross salary - IMPORTANT CHANGE: Always include bonus and variable
    const gross_salary = base_salary + hra + medical_allowance + newspaper_allowance + 
                         dress_allowance + other_allowance + joiningBonusValue + 
                         variableSalaryValue;
    
    // Calculate deductions
    const deduction = pf + (professional_tax * 12);
    
    // Calculate taxable income
    const taxable_income = gross_salary - deduction;
    
    // Calculate old regime tax
    const calculateOldRegimeTax = (income) => {
      let tax = 0;
      const standard_deduction = 50000; // For reporting only
      
      // HRA exemption calculation (for reporting only)
      let hraExemption = 0;
      if (metroCities.includes(employeeCity)) {
        hraExemption = Math.min(hra, base_salary * 0.50, hra - (0.10 * base_salary));
      } else {
        hraExemption = Math.min(hra, base_salary * 0.40, hra - (0.10 * base_salary));
      }
      
      // Apply tax slabs
      if (income > 1000000) {
        tax += (income - 1000000) * 0.30;
        tax += 500000 * 0.20;
        tax += 250000 * 0.05;
      } else if (income > 500000) {
        tax += (income - 500000) * 0.20;
        tax += 250000 * 0.05;
      } else if (income > 250000) {
        tax += (income - 250000) * 0.05;
      }
      
      // Apply rebate for income up to Rs 5 lakhs
      if (income <= 500000) {
        tax = Math.max(0, tax - 12500);
      }
      
      const taxBeforeCess = tax;
      tax += tax * 0.04; // Add 4% cess
      
      return {
        tax,
        taxBeforeCess,
        exemptions: standard_deduction + hraExemption,
        finalTaxableIncome: income
      };
    };
    
    // Calculate new regime tax
    const calculateNewRegimeTax = (income) => {
      let tax = 0;
      const standard_deduction = 50000; // For reporting only
      
      // Apply tax slabs for new regime
      if (income > 1500000) {
        tax += (income - 1500000) * 0.30;
        tax += 500000 * 0.20;
        tax += 500000 * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (income > 1000000) {
        tax += (income - 1000000) * 0.20;
        tax += 500000 * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (income > 750000) {
        tax += (income - 750000) * 0.15;
        tax += 300000 * 0.10;
        tax += 200000 * 0.05;
      } else if (income > 500000) {
        tax += (income - 500000) * 0.10;
        tax += 200000 * 0.05;
      } else if (income > 300000) {
        tax += (income - 300000) * 0.05;
      }
      
      // Apply rebate for income up to Rs 7 lakhs
      if (income <= 700000) {
        tax = Math.max(0, tax - 25000);
      }
      
      const taxBeforeCess = tax;
      tax += tax * 0.04; // Add 4% cess
      
      return {
        tax,
        taxBeforeCess,
        exemptions: standard_deduction,
        finalTaxableIncome: income
      };
    };
    
    // Calculate both tax regimes
    const oldRegimeResult = calculateOldRegimeTax(taxable_income);
    const newRegimeResult = calculateNewRegimeTax(taxable_income);
    
    // Determine recommended regime
    const tax_regime_used = oldRegimeResult.tax <= newRegimeResult.tax ? "old" : "new";
    const total_tax = tax_regime_used === "old" ? oldRegimeResult.tax : newRegimeResult.tax;
    const tax_savings = Math.abs(oldRegimeResult.tax - newRegimeResult.tax);
    const monthly_tax = total_tax / 12;
    
    // Set tax details
    setTaxDetails({
      old_regime: oldRegimeResult,
      new_regime: newRegimeResult,
      recommended_regime: tax_regime_used,
      tax_savings: tax_savings,
      monthly_tax: monthly_tax
    });
    
    // Set salary details - IMPORTANT: Store full values, not "effective" ones
    setSalaryDetails({
      ctc: enteredCTC,
      base_salary,
      hra,
      pf,
      professional_tax,
      medical_allowance,
      newspaper_allowance,
      dress_allowance,
      other_allowance,
      joining_bonus: joiningBonusValue,
      variable_salary: variableSalaryValue,
      gross_salary,
      taxable_income,
      total_tax,
      monthly_tax
    });
    
    // Set tax regime tab to recommended by default
    setTaxRegimeTab(0);
  };

  const handleCtcChange = (e) => {
    let enteredCTC = parseFloat(e.target.value);
    
    if (enteredCTC < 0) {
      alert("CTC cannot be negative!");
      setCtc(""); 
      return;
    }
  
    setCtc(enteredCTC);
    if (!isNaN(enteredCTC)) {
      calculateSalaryComponents(
        enteredCTC, 
        joiningBonus, 
        variableSalary,
        false, // Always false for UI
        false  // Always false for UI
      );
    }
  };

  const handleJoiningBonusChange = (e) => {
    let value = parseFloat(e.target.value);
    
    if (value < 0) {
      alert("Joining Bonus cannot be negative!");
      setJoiningBonus(""); 
      return;
    }
  
    setJoiningBonus(value);
    
    if (ctc && !isNaN(parseFloat(ctc))) {
      calculateSalaryComponents(
        parseFloat(ctc), 
        value, 
        variableSalary,
        false, // Always false for UI
        false  // Always false for UI
      );
    }
  };

  const handleVariableSalaryChange = (e) => {
    let value = parseFloat(e.target.value);
    
    if (value < 0) {
      alert("Variable Salary cannot be negative!");
      setVariableSalary(""); 
      return;
    }
  
    setVariableSalary(value);
    
    if (ctc && !isNaN(parseFloat(ctc))) {
      calculateSalaryComponents(
        parseFloat(ctc), 
        joiningBonus, 
        value,
        false, // Always false for UI
        false  // Always false for UI
      );
    }
  };
  
  const handleTaxRegimeTabChange = (event, newValue) => {
    setTaxRegimeTab(newValue);
  };
  
  const submitPayroll = async () => {
    if (!salaryDetails || !pfno.trim() || !uan.trim() || ctc === "") {
      alert("Please fill in all required fields (CTC, PF Number, and UAN) before submitting.");
      return;
    }

    try {
      const payload = {
        employee_id: employeeId,
        pfno,
        uan,
        ctc: parseFloat(ctc),
        joining_bonus: parseFloat(joiningBonus) || 0,
        variable_salary: parseFloat(variableSalary) || 0,
        is_joining_bonus_paid: false, // Always false when submitting
        is_variable_salary_paid: false // Always false when submitting
      };

      await axios.post("http://localhost:5000/api/payroll/createPayroll", payload);
      alert(`Salary details ${existingPayroll ? "updated" : "submitted"} successfully!`);
    } catch (error) {
      console.error("Error submitting payroll:", error);
      alert(`Error ${existingPayroll ? "updating" : "submitting"} salary details`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTaxRegimeDetails = () => {
    if (!taxDetails) return null;

    if (taxRegimeTab === 0) { // Recommended
      const regime = taxDetails.recommended_regime === "old" ? taxDetails.old_regime : taxDetails.new_regime;
      return {
        name: taxDetails.recommended_regime === "old" ? "Old Regime" : "New Regime",
        tax: regime.tax,
        taxBeforeCess: regime.taxBeforeCess,
        savings: taxDetails.tax_savings
      };
    } else if (taxRegimeTab === 1) { // Old Regime
      return {
        name: "Old Regime",
        tax: taxDetails.old_regime.tax,
        taxBeforeCess: taxDetails.old_regime.taxBeforeCess,
        savings: taxDetails.recommended_regime === "old" ? taxDetails.tax_savings : 0
      };
    } else { // New Regime
      return {
        name: "New Regime",
        tax: taxDetails.new_regime.tax,
        taxBeforeCess: taxDetails.new_regime.taxBeforeCess,
        savings: taxDetails.recommended_regime === "new" ? taxDetails.tax_savings : 0
      };
    }
  };

  return (
    <>
      {!open && !employeeDetails && (
        <Box display="flex" justifyContent="left" mt={3} ml={3}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            {existingPayroll ? "Update Salary" : "Upload CTC"}
          </Button>
        </Box>
      )}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {existingPayroll ? "Update Salary Details" : "Upload CTC Details"}
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Employee ID"
            variant="outlined"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            margin="normal"
          />
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={fetchEmployeeDetails}>
              Fetch
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Container width="95%" maxWidth="none" sx={{mt:4}}>
        {existingPayroll && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Existing payroll data found. Any changes will update the current record.
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 6 }}>
          {employeeDetails && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Employee Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" variant="outlined" value={employeeDetails.firstName} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" variant="outlined" value={employeeDetails.lastName} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Phone Number" variant="outlined" value={employeeDetails.phoneNumber} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="City" variant="outlined" value={employeeDetails.city} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Enter the PF number of the employee" placement="top" arrow>
                    <TextField fullWidth label="PF Number" variant="outlined" value={pfno} onChange={(e) => setPfno(e.target.value)} required />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Enter the UAN number of the employee" placement="top" arrow>
                    <TextField fullWidth label="UAN" variant="outlined" value={uan} onChange={(e) => setUan(e.target.value)} required />
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Enter the CTC of the employee" placement="top" arrow>
                    <TextField 
                      fullWidth 
                      label="Enter CTC" 
                      variant="outlined" 
                      type="number" 
                      value={ctc} 
                      onChange={handleCtcChange} 
                      required 
                    />
                  </Tooltip>
                </Grid>

                {/* Joining Bonus Section */}
                <Grid item xs={12}>
                  <Tooltip title="Enter the Joining bonus amount of the employee (if applicable else enter zero to the field)" placement="top" arrow>
                    <TextField 
                      fullWidth 
                      label="Joining Bonus" 
                      variant="outlined" 
                      type="number" 
                      value={joiningBonus} 
                      onChange={handleJoiningBonusChange} 
                      required
                      inputProps={{
                        min: "0",
                        step: "1",
                        pattern: "[0-9]*"
                      }}
                      helperText="Joining bonus will be included in taxable income calculations"
                    />
                  </Tooltip>
                </Grid>

                {/* Variable Salary Section */}
                <Grid item xs={12}>
                  <Tooltip title="Enter the Variable pay amount of the employee (if applicable else enter zero to the field)" placement="top" arrow>
                    <TextField 
                      fullWidth 
                      label="Variable Salary" 
                      variant="outlined" 
                      type="number" 
                      value={variableSalary} 
                      onChange={handleVariableSalaryChange} 
                      required
                      inputProps={{
                        min: "0",
                        step: "1",
                        pattern: "[0-9]*"
                      }}
                      helperText="Variable salary will be included in taxable income calculations"
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </>
          )}

          {salaryDetails && (
            <>
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Salary Breakdown
              </Typography>
              
              <Paper sx={{ mt: 3, p: 3, backgroundColor: "#e3f2fd" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Base Salary:</strong> {formatCurrency(salaryDetails.base_salary)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>HRA:</strong> {formatCurrency(salaryDetails.hra)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>PF:</strong> {formatCurrency(salaryDetails.pf)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Professional Tax:</strong> {formatCurrency(salaryDetails.professional_tax * 12)} (yearly)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Medical Allowance:</strong> {formatCurrency(salaryDetails.medical_allowance)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Newspaper Allowance:</strong> {formatCurrency(salaryDetails.newspaper_allowance)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Dress Allowance:</strong> {formatCurrency(salaryDetails.dress_allowance)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Other Allowance:</strong> {formatCurrency(salaryDetails.other_allowance)}</Typography>
                  </Grid>
                  
                  {salaryDetails.joining_bonus > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>
                          <strong>Joining Bonus:</strong> {formatCurrency(salaryDetails.joining_bonus)}
                          {" (included in calculations)"}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  {salaryDetails.variable_salary > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>
                          <strong>Variable Salary:</strong> {formatCurrency(salaryDetails.variable_salary)}
                          {" (included in calculations)"}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography><strong>Gross Salary:</strong> {formatCurrency(salaryDetails.gross_salary)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Taxable Income:</strong> {formatCurrency(salaryDetails.taxable_income)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}

          {taxDetails && (
            <>
              <Paper sx={{ mt: 3, p: 3, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h6">Tax Calculation</Typography>
                
                <Tabs value={taxRegimeTab} onChange={handleTaxRegimeTabChange} sx={{ mb: 2, mt: 1 }}>
                  <Tab label="Recommended" />
                  <Tab label="Old Regime" />
                  <Tab label="New Regime" />
                </Tabs>
                
                {getTaxRegimeDetails() && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        {getTaxRegimeDetails().name}
                        {taxRegimeTab === 0 && ` (Recommended)`}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Tax (Before Cess):</strong> {formatCurrency(getTaxRegimeDetails().taxBeforeCess)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Total Tax (With 4% Cess):</strong> {formatCurrency(getTaxRegimeDetails().tax)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Monthly Tax:</strong> {formatCurrency(getTaxRegimeDetails().tax / 12)}</Typography>
                    </Grid>
                    {getTaxRegimeDetails().savings > 0 && (
                      <Grid item xs={6}>
                        <Typography color="success.main">
                          <strong>Tax Savings:</strong> {formatCurrency(getTaxRegimeDetails().savings)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Paper>
            </>
          )}

          {salaryDetails && (
            <Box textAlign="center">
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={submitPayroll}>
                {existingPayroll ? "Update Payroll" : "Submit Payroll"}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default UploadSalary;