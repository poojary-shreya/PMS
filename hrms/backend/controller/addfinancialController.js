import Financial from "../model/addfinancialmodel.js";
import Employee from "../model/addpersonalmodel.js";

export const addFinancialDetails = async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const newFinancial = await Financial.create(req.body);

    res.status(201).json({
      success: true,
      message: "Financial details added successfully",
      data: newFinancial,
    });
  } catch (error) {
    console.error("Error in addFinancialDetails:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const updateFinancialDetails = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    const [updatedCount] = await Financial.update(
      req.body,
      { where: { employee_id } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Financial record not found"
      });
    }

    const updatedRecord = await Financial.findOne({ where: { employee_id } });
    
    res.status(200).json({
      success: true,
      message: "Financial details updated",
      data: updatedRecord
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const getEmployees = async (req, res) => {
  try {

    const employees = await Employee.findAll();


    const employeeData = employees.map(employee => employee.dataValues);


    res.json(employeeData);

    console.log(employeeData);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send("Server error");
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    console.log("Employees fetched:", employees);
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
};

export const getFinancialDetails = async (req, res) => {
  try {
    const financialData = await Financial.findAll();
    console.log("Financial data fetched:", financialData);
    res.status(200).json(financialData);
  } catch (error) {
    console.error("Error fetching financial data:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const editEmployee = async (req, res) => {
  try {
    const employee_id = req.params.id;
    const employee = await Employee.findByPk(employee_id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }


    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





export const getFinancialRecord = async (req, res) => {
  try {
    const record = await Financial.findOne({
      where: { employee_id: req.params.employee_id }
    });

    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: "Financial record not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        employee_id: record.employee_id,
        department: record.department,
        resignationDate: record.resignationDate,
        noticePeriod: record.noticePeriod,
        advanceSalary: record.advanceSalary,
        creditCardOffered: record.creditCardOffered,
        bankName: record.bankName,
        accountNumber: record.accountNumber,
        ifscCode: record.ifscCode,
        currentSalary: record.currentSalary,
        previousSalary: record.previousSalary,
        ctc: record.ctc,
        taxCalculation: record.taxCalculation,
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
