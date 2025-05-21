import Employee from "../model/addpersonalmodel.js";
import AllowanceClaim from "../model/allowanceModel.js";



export const allowanceClaim = async (req, res) => {
    try {
      let { amount, purpose, comment, financial_year } = req.body;
      const employee_id = req.session.employee_id;
      
      // Check if user is logged in with company email
      if (!req.session.isCompanyEmail) {
        return res.status(403).json({
          message: "Access denied: claims can only be submitted when logged in with company email"
        });
      }
      
      console.log("Request Body:", req.body);
      console.log("Files:", req.files);
      console.log("Employee ID:", employee_id);
      
      // Validate proof document
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Proof document is required" });
      }
      
      const file = req.files[0];
      
      // Create a new claim without checking for existing ones
      const claim = await AllowanceClaim.create({
        employee_id,
        amount,
        purpose,
        comment,
        proof_path: file.filename,
        financial_year,
        status: "Pending"
      });
      
      res.status(201).json({
        message: "Claim submitted successfully",
        claim
      });
    } catch (error) {
      console.error("Error submitting claim:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };



  


export const getEmployeeAllowanceClaims = async (req, res) => {
  try {
    // Get employee_id and financial_year from request parameters or body
    const employee_id = req.session.employee_id;
    
    // Validate required parameters
    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    
    const claims = await AllowanceClaim.findAll({
      where: {
        employee_id
      },
      include: [
        {
          model: Employee,
          attributes: ["employee_id", "firstName", "lastName"],
        }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    if (claims.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching employee claims:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





export const getAllAllowanceClaims = async (req, res) => {
    try {
      const {
        id,
        employee_id,
        financial_year,
        purpose,
        status
      } = req.query;
      
      const whereClause = {};
      
      if (id) whereClause.id = id;
      if (employee_id) whereClause.employee_id = employee_id;
      if (financial_year) whereClause.financial_year = financial_year;
      if (purpose) whereClause.purpose = purpose;
      if (status) whereClause.status = status;
      
      const allowanceClaims = await AllowanceClaim.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'personal',
            attributes: ["employee_id", "firstName", "lastName"]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      if (allowanceClaims.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No allowance claims found',
          data: []
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Allowance claims retrieved successfully',
        data: allowanceClaims
      });
    } catch (error) {
      console.error('Error retrieving allowance claims:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  
  export const updateAllowanceClaimStatus = async (req, res) => {
    try {
      const { claim_id, status, reviewer_comment } = req.body;
      
      // Validate required fields
      if (!claim_id || !status) {
        return res.status(400).json({
          success: false,
          message: 'Claim ID and status are required'
        });
      }
      
      // Validate status value
      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value. Must be Pending, Approved, or Rejected.'
        });
      }
      
      // Find the allowance claim by its unique ID
      const allowanceClaim = await AllowanceClaim.findByPk(claim_id);
      
      if (!allowanceClaim) {
        return res.status(404).json({
          success: false,
          message: 'Allowance claim not found'
        });
      }
      
      // Update the status and reviewer comment
      allowanceClaim.status = status;
      allowanceClaim.review_comment = reviewer_comment || ''; // Note: Fixed field name to match model
      allowanceClaim.reviewed_at = new Date(); // Uncommented this line
      
      await allowanceClaim.save();
      
      return res.status(200).json({
        success: true,
        message: 'Allowance claim status updated successfully',
        data: allowanceClaim
      });
    } catch (error) {
      console.error('Error updating allowance claim status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };