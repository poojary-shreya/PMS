import Employee from "../model/addpersonalmodel.js";
import Claim from "../model/claimModel.js";

export const submitClaim = async (req, res) => {
  try {
    let { amount, purpose } = req.body;
    const employee_id = req.session.employee_id;

    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        message: "Access denied: claims can only be submitted when logged in with company email"
      });
    }

    console.log("Request Body:", req.body);
    console.log("Files:", req.files);
    console.log("Employee ID:", employee_id);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Proof document is required" });
    }

    const file = req.files[0];
    const newClaim = await Claim.create({
      employee_id,
      amount,
      purpose,
      proof_path: file.filename,
      status: "Pending"
    });

    res.status(201).json({ 
      message: "Claim submitted successfully", 
      claim: newClaim 
    });
  } catch (error) {
    console.error("Error submitting claim:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getEmployeeClaims = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;

    if (!employee_id) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const claims = await Claim.findAll({
      where: { employee_id },
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


export const updateClaimStatus = async (req, res) => {
    try {
      const { employee_id } = req.params;
      const { status, purpose } = req.body; 
      
      const claim = await Claim.findOne({
        where: {
          employee_id,
          purpose,
        },
      });
      
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      claim.status = status;
      await claim.save();
      
      res.status(200).json({ message: "Status updated successfully", claim });
    } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  export const getAllClaims = async (req, res) => {
    try {
      const claims = await Claim.findAll({
        include: [
          {
            model: Employee,
            attributes: ["employee_id", "firstName", "lastName"],
          },
        ],
        order: [['updatedAt', 'DESC']]
      });
  
      res.status(200).json({ success: true, data: claims });
    } catch (error) {
      console.error("Error fetching all claims:", error);
      res.status(500).json({ success: false, message: "Error fetching claims" });
    }
  };