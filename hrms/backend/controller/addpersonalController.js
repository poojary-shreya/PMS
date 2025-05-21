import Employee from '../model/addpersonalmodel.js';
import upload from '../middlewares/upload.js';
import multer from 'multer';
import path from 'path';

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      // Include ALL attributes
      attributes: { exclude: [] } // This ensures no fields are excluded
    });

    // Debug log - check if personalPhoto exists in any records
    const photoCheck = employees.map(e => ({
      id: e.employee_id,
      hasPhoto: !!e.personalPhoto,
      photoValue: e.personalPhoto
    }));
    console.log("Employee photo data check:", photoCheck);
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error in getEmployees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: []
    });
  }
};
export const addEmployee = async (req, res) => {
  try {
    let generatedEmployeeId;
    let isUnique = false;

    while (!isUnique) {
      const currentYear = new Date().getFullYear().toString().slice(-2); 
      const datePart = new Date().toISOString().slice(5, 10).replace("-", ""); 
      const randomNum = Math.floor(1000 + Math.random() * 9000); 
      generatedEmployeeId = `${currentYear}${datePart}${randomNum}`;
      
      const existing = await Employee.findOne({ where: { employee_id: generatedEmployeeId } });
      if (!existing) isUnique = true; 
    }

    console.log("Generated Employee ID:", generatedEmployeeId);

    const personalDetails = JSON.parse(req.body.personalDetails);
    const contactInfo = JSON.parse(req.body.contactInfo);
    const nominations = JSON.parse(req.body.nominations);
    const qualifications = JSON.parse(req.body.qualifications);
    const certificates = JSON.parse(req.body.certificates);
    const insurance = JSON.parse(req.body.insurance);
    const emergencyContact = JSON.parse(req.body.emergencyContact);

    const firstName = personalDetails.firstName?.trim().toLowerCase();
    const lastName = personalDetails.lastName?.trim().toLowerCase() || "";
    let companyemail = `${firstName}.${lastName}@bridgemetechnologies.com`;
    let existingEmployee = await Employee.findOne({ where: { companyemail } });
    if (existingEmployee) {
      const uniqueNumber = Math.floor(1000 + Math.random() * 9000); 
      companyemail = `${firstName}.${lastName}${uniqueNumber}@bridgemetechnologies.com`;
    }

    const anniversary = personalDetails.anniversary && personalDetails.anniversary.trim() !== "" 
      ? personalDetails.anniversary 
      : null;

    const employeeData = {
      employee_id: generatedEmployeeId,
      companyemail,
      employmentStatus: req.body.employmentStatus,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      fatherName: personalDetails.fatherName,
      personalemail: personalDetails.personalemail,
      dateOfBirth: personalDetails.dateOfBirth,
      anniversary: anniversary,
      gender: personalDetails.gender,
      panNumber: personalDetails.panNumber,
      adharCardNumber: personalDetails.adharCardNumber,
      phoneNumber: contactInfo.phoneNumber,
      houseNumber: contactInfo.houseNumber,
      street: contactInfo.street,
      crossStreet: contactInfo.crossStreet,
      area: contactInfo.area,
      city: contactInfo.city,
      pinCode: contactInfo.pinCode,
      mobile: emergencyContact.mobile,
      landline: emergencyContact.landline,
      individualInsurance: insurance.individualInsurance,
      groupInsurance: insurance.groupInsurance,
      company_registration_no: req.body.company_registration_no,
    };

    // Store only filename.type format in DB instead of full path
    if (req.files) {
      if (req.files.panCardFile && req.files.panCardFile.length > 0) {
        const file = req.files.panCardFile[0];
        employeeData.panCardFile = file.filename;
      }
      
      if (req.files.adharCardFile && req.files.adharCardFile.length > 0) {
        const file = req.files.adharCardFile[0];
        employeeData.adharCardFile = file.filename;
      }
      
      if (req.files.qualificationFile && req.files.qualificationFile.length > 0) {
        const file = req.files.qualificationFile[0];
        employeeData.qualificationFile = file.filename;
      }

      if (req.files.certificationFile && req.files.certificationFile.length > 0) {
        const file = req.files.certificationFile[0];
        employeeData.certificationFile = file.filename;
      }
      
      if (req.files.personalPhoto && req.files.personalPhoto.length > 0) {
        const file = req.files.personalPhoto[0];
        employeeData.personalPhoto = file.filename;
      }
    }

    if (nominations && nominations.length > 0) {
      employeeData.nomineeName = nominations[0].name || null;
      employeeData.relationship = nominations[0].relationship || null;
      employeeData.nomineeAge = nominations[0].age || null;
    }

    if (qualifications && qualifications.length > 0) {
      employeeData.degree = qualifications[0].degree || null;
      employeeData.institution = qualifications[0].institution || null;
      employeeData.year = qualifications[0].year || null;
    }

    if (certificates && certificates.length > 0) {
      employeeData.certificationName = certificates[0].name || null;
      employeeData.issuedBy = certificates[0].issuedBy || null;
      employeeData.certificationDate = certificates[0].date || null;
    }

    const employee = await Employee.create(employeeData);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Add Employee Error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { employee_id: req.params.employee_id }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const response = {
      ...employee.toJSON(),
      company_registration_no: employee.company_registration_no,
      nominations: [{
        name: employee.nomineeName || "",
        relationship: employee.relationship || "",
        age: employee.nomineeAge || ""
      }],
      qualifications: [{
        degree: employee.degree || "",
        institution: employee.institution || "",
        year: employee.year || ""
      }],
      certificates: [{
        name: employee.certificationName || "",
        issuedBy: employee.issuedBy || "",
        date: employee.certificationDate || ""
      }]
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { employee_id: req.params.employee_id }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const personalDetails = JSON.parse(req.body.personalDetails);
    const contactInfo = JSON.parse(req.body.contactInfo);
    const nominations = JSON.parse(req.body.nominations);
    const qualifications = JSON.parse(req.body.qualifications);
    const certificates = JSON.parse(req.body.certificates);
    const insurance = JSON.parse(req.body.insurance);
    const emergencyContact = JSON.parse(req.body.emergencyContact);

    const anniversary = personalDetails.anniversary && personalDetails.anniversary.trim() !== "" 
      ? personalDetails.anniversary 
      : null;

    const updateData = {
      employmentStatus: req.body.employmentStatus,
      company_registration_no: req.body.company_registration_no || employee.company_registration_no,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      fatherName: personalDetails.fatherName,
      personalemail: personalDetails.personalemail,
      dateOfBirth: personalDetails.dateOfBirth,
      anniversary: anniversary,
      gender: personalDetails.gender,
      panNumber: personalDetails.panNumber,
      adharCardNumber: personalDetails.adharCardNumber,
      phoneNumber: contactInfo.phoneNumber,
      houseNumber: contactInfo.houseNumber,
      street: contactInfo.street,
      crossStreet: contactInfo.crossStreet,
      area: contactInfo.area,
      city: contactInfo.city,
      pinCode: contactInfo.pinCode,
      mobile: emergencyContact.mobile,
      landline: emergencyContact.landline,
      individualInsurance: insurance.individualInsurance,
      groupInsurance: insurance.groupInsurance
    };

    // Store only filename.type format in DB instead of full path
    if (req.files) {
      if (req.files.panCardFile && req.files.panCardFile.length > 0) {
        const file = req.files.panCardFile[0];
        updateData.panCardFile = file.filename;
      }
      
      if (req.files.adharCardFile && req.files.adharCardFile.length > 0) {
        const file = req.files.adharCardFile[0];
        updateData.adharCardFile = file.filename;
      }
      
      if (req.files.qualificationFile && req.files.qualificationFile.length > 0) {
        const file = req.files.qualificationFile[0];
        updateData.qualificationFile = file.filename;
      }

      if (req.files.certificationFile && req.files.certificationFile.length > 0) {
        const file = req.files.certificationFile[0];
        updateData.certificationFile = file.filename;
      }
      
      if (req.files.personalPhoto && req.files.personalPhoto.length > 0) {
        const file = req.files.personalPhoto[0];
        updateData.personalPhoto = file.filename;
      }
    }

    if (nominations && nominations.length > 0) {
      updateData.nomineeName = nominations[0].name || null;
      updateData.relationship = nominations[0].relationship || null;
      updateData.nomineeAge = nominations[0].age || null;
    }

    if (qualifications && qualifications.length > 0) {
      updateData.degree = qualifications[0].degree || null;
      updateData.institution = qualifications[0].institution || null;
      updateData.year = qualifications[0].year || null;
    }

    if (certificates && certificates.length > 0) {
      updateData.certificationName = certificates[0].name || null;
      updateData.issuedBy = certificates[0].issuedBy || null;
      updateData.certificationDate = certificates[0].date || null;
    }

    await employee.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadFiles = (req, res, next) => {
  const cpUpload = upload.fields([
    { name: 'personalPhoto', maxCount: 1 },
    { name: 'panCardFile', maxCount: 1 },
    { name: 'adharCardFile', maxCount: 1 },
    { name: 'qualificationFile', maxCount: 10 }, 
    { name: 'certificationFile', maxCount: 10 }  
  ]);

  cpUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.error('File Upload Error:', err);
      return res.status(500).json({ success: false, message: 'File upload failed' });
    }
    next();
  });
};

export const getEmployeeImage = async (req, res) => {
  try {
    const employee = await EmployeeModel.findOne({
      employee_id: req.params.employeeId
    });
    
    if (!employee || !employee.personalPhoto) {
      return res.status(404).send('Image not found');
    }
    
    const fixedPhotoName = employee.personalPhoto.replace(/\.(jpg|png|webp|avif)\.\1$/i, '.$1');
    
    const imagePath = path.join(__dirname, '..', 'uploads', fixedPhotoName);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Image file not found');
    }
    
    const ext = path.extname(fixedPhotoName).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif'
    }[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(imagePath).pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Server error');
  }
};

export const getEmployeeBasicDetails = async (req, res) => {
  try {
    const employee_id = req.session.employee_id;
    
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Employee details can only be accessed when logged in with company email"
      });
    }
    
    const employee = await Employee.findOne({ 
      where: { employee_id },
      attributes: ['firstName', 'lastName', 'fatherName', 'panNumber', 'adharCardNumber', 'companyemail']
    });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }
    
    const loggedInEmail = req.session.email;
    if (loggedInEmail !== employee.companyemail) {
      return res.status(403).json({
        success: false, 
        message: "Access denied: You can only access your own information"
      });
    }
    
    console.log("Fetching basic details for employee_id:", employee_id || "N/A");
    
    return res.status(200).json({
      success: true,
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        fatherName: employee.fatherName,
        panNumber: employee.panNumber,
        adharCardNumber: employee.adharCardNumber
      }
    });
    
  } catch (error) {
    console.error("Error fetching employee basic details:", error);
    res.status(500).json({
      success: false,
      message: "Server error", 
      error: error.message
    });
  }
};