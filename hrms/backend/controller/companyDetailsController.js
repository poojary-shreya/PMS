import Company from "../model/companyDetailsmodel.js";

export const companyDetails = async (req, res) => {
  try {
    const {
      companyname,
      registration_no,
      contactemail,
      contactNumber,
      address,
      hq,
      branchLocation,
      tan,
      pfTrustName,
      pfRegno,
      pfAddress,
      accounts
    } = req.body;

    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    let companyLogo = req.file ? req.file.filename : null;

    let parsedAccounts;
    try {
      parsedAccounts = typeof accounts === "string" ? JSON.parse(accounts) : accounts;
    } catch (error) {
      return res.status(400).json({ message: "Invalid accounts format. Must be a valid JSON array." });
    }

    if (!Array.isArray(parsedAccounts) || parsedAccounts.length === 0) {
      return res.status(400).json({ message: "Please provide at least one account." });
    }

    for (let account of parsedAccounts) {
      if (!account.accountNumber || !account.purpose || !account.bankname || !account.ifsc) {
        return res.status(400).json({
          message: "Each account must have an accountNumber, purpose, bankname, and IFSC code.",
        });
      }
    }

    const companyDetails = {
      companyname,
      registration_no,
      contactemail,
      contactNumber,
      address,
      hq,
      branchLocation,
      tan,
      pfTrustName,
      pfRegno,
      pfAddress,
      accounts: parsedAccounts,
      companyLogo, 
    };

    const company = await Company.create(companyDetails);

    res.status(201).json({
      message: "Company created successfully!",
      company,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(400).json({
      message: "Error creating company.",
      error: error.message,
    });
  }
};



export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching companies.",
      error: error.message,
    });
  }
};