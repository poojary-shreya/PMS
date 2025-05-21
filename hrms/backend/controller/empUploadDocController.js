import Employee from "../model/addpersonalmodel.js";
import Document from "../model/empUploadDocmodel.js";


export const uploadDocuments = async (req, res) => {
  try {
    let { category, amount,} = req.body;
    const employee_id=req.session.employee_id;
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({ 
        message: "Access denied: Payslip information can only be accessed when logged in with company email" 
      });
    }

    console.log("Request Body:", req.body);
    console.log("Files:", req.files);

    console.log(typeof employee_id);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedDocs = await Promise.all(
      req.files.map(async (file) => {
        
        let existingDocument = await Document.findOne({
          where: { employee_id, category }
        });

        if (existingDocument) {
          await existingDocument.update({
            amount,
            claimed_amount:0,
            rem_taxable_income: 0,
            file_path: file.filename,  
            status:"Pending"
          });
          return existingDocument;  
        } else {
         
          return await Document.create({
            employee_id,
            document_name: file.originalname,
            category,
            amount,
            claimed_amount:0,
            rem_taxable_income: 0, 
            file_path: file.filename,
            status:"Pending"
          });
        }
      })
    );

    res.status(201).json({ message: "Documents uploaded successfully", documents: uploadedDocs });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employee_id } = req.query;
    
    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }
    
    const documents = await Document.findAll({
      where: { employee_id },
      include: [
        {
          model: Employee,
          attributes: ["employee_id", "firstName", "lastName"],
        }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
