
import Document from "../model/empUploadDocmodel.js";
import Employee from "../model/addpersonalmodel.js";
import Payroll from "../model/uploadsalrymodel.js";

export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        {
            model: Employee, 
            as: "personal", 
            attributes: ["employee_id", "firstName", "lastName"],
          },
      ],
    });

    for (const doc of documents) {
      const payroll = await Payroll.findOne({ where: { employee_id: doc.employee_id } });
      console.log(payroll);

      if (payroll) {
        let salaryComponent = 0;
        let isInvestmentCategory = false;

        switch (doc.category.toLowerCase()) {
          case "hra":
            salaryComponent = payroll.hra ?? 0;
            break;
          case "medical_allowance":
            salaryComponent = payroll.medical_allowance || 0;
            break;
            case "newspaper_allowance":
            salaryComponent = payroll.newspaper_allowance || 0;
            break;
            case "dress_allowance":
            salaryComponent = payroll.dress_allowance || 0;
            break;
          case "other_allowance":
            salaryComponent = payroll.other_allowance || 0;
            break;
          case "section80c_investment":
          case "section80ccc_investment":
          case "other_investment":
            salaryComponent = 150000;
            isInvestmentCategory = true;
            break;
            case "section80ccd_1b":
            salaryComponent = 50000;
            isInvestmentCategory = true;
            break;
            case "section80d": 
            salaryComponent = 25000;
            isInvestmentCategory = true;
            break;
          case "section80ccd_2": 
            salaryComponent = 200000;
            isInvestmentCategory = true;
            break;
          case "section24_b": 
            salaryComponent = 200000;
            isInvestmentCategory = true;
            break;
          case "section80e": 
            salaryComponent = 100000;
            isInvestmentCategory = true;
            break;
          case "section80eeb": 
            salaryComponent = 150000;
            isInvestmentCategory = true;
            break;
          default:
            salaryComponent = 0;
        }

        if (doc.status === "Approved") {
          if (isInvestmentCategory) {
            doc.claimed_amount = Math.min(doc.amount, salaryComponent);
            doc.rem_taxable_income = 0; 
          } else {
            doc.claimed_amount = Math.min(doc.amount, salaryComponent);
            doc.rem_taxable_income = Math.max(salaryComponent - doc.claimed_amount, 0);
          }
        } else {
          if (isInvestmentCategory) {
            doc.claimed_amount = 0;
            doc.rem_taxable_income = 0;
          } else {
            doc.claimed_amount = 0;
            doc.rem_taxable_income = salaryComponent;
          }
        }

        await doc.save();
      }
    }

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: "Error fetching documents" });
  }
};


export const updateDocumentStatus = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { status, category } = req.body; 

    const document = await Document.findOne({
      where: {
        employee_id,
        category, 
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.status = status;
    await document.save();

    res.status(200).json({ message: "Status updated successfully", document });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};