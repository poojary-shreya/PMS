
import OnboardingDocument from '../model/docmodel.js';
import Onboarding from '../model/onboardingmodel.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'));
    }
  }
});

export const documentController = {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { onboardingId, documentType, uploadedBy } = req.body;


  if (isNaN(parseInt(onboardingId))) {

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid onboarding ID. ID must be a number.' 
    });
  }

  const onboarding = await Onboarding.findByPk(parseInt(onboardingId));
  if (!onboarding) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(404).json({ success: false, message: 'Onboarding process not found' });
  }

  
  const document = await OnboardingDocument.create({
    onboardingId: parseInt(onboardingId),
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    documentType,
    uploadedBy,
    status: 'Pending',
    
    documentName: req.file.originalname,
    documentPath: req.file.path
  });

  return res.status(201).json({ success: true, message: 'Document uploaded successfully', data: document });
} catch (error) {
  console.error('Error uploading document:', error);
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }
  return res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
}
  },
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid document ID. ID must be a number.' 
        });
      }

      const document = await OnboardingDocument.findByPk(parseInt(id), {
        include: [{ model: Onboarding, as: 'onboarding' }]
      });

      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await document.destroy();

      return res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
    }

  },
  async getAllDocuments(req, res) {
    try {
      const documents = await OnboardingDocument.findAll({
        include: [{ model: Onboarding, as: 'onboarding' }]
      });
      return res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
    }
  },

  async getDocumentById(req, res) {
    try {
      const { id } = req.params;
    
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid document ID. ID must be a number.' 
        });
      }
      
      const document = await OnboardingDocument.findByPk(parseInt(id), {
        include: [{ model: Onboarding, as: 'onboarding' }]
      });
    
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
    
      return res.status(200).json({ success: true, data: document });
    } catch (error) {
      console.error('Error fetching document:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch document', 
        error: error.message 
      });
    }
  },

  async getDocumentsByOnboardingId(req, res) {
    try {
      const { onboardingId } = req.params;
      
     
      if (isNaN(parseInt(onboardingId))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid onboarding ID. ID must be a number.' 
        });
      }
      
      const documents = await OnboardingDocument.findAll({
        where: { onboardingId: parseInt(onboardingId) },
        include: [{ model: Onboarding, as: 'onboarding' }]
      });
    
      return res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (error) {
      console.error('Error fetching documents by onboarding ID:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
    }
  },

  async updateDocumentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid document ID. ID must be a number.' 
        });
      }
    
      if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be Pending, Approved, or Rejected' });
      }
    
      const document = await OnboardingDocument.findByPk(parseInt(id), {
        include: [{ model: Onboarding, as: 'onboarding' }]
      });
    
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
    
      await document.update({ status });
    
      return res.status(200).json({ 
        success: true, 
        message: 'Document status updated successfully', 
        data: document
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update document status', error: error.message });
    }
    
  },

  async downloadDocument(req, res) {
    try {
      const { id } = req.params;
      
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid document ID. ID must be a number.' 
        });
      }
      
      const document = await OnboardingDocument.findByPk(parseInt(id));
    
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      
    
      if (!document.filePath || !fs.existsSync(document.filePath)) {
        return res.status(404).json({ success: false, message: 'Document file not found' });
      }
      
     
      return res.download(document.filePath, document.documentName || 'document.pdf');
    } catch (error) {
      console.error('Error downloading document:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to download document', 
        error: error.message 
      });
    }
  },
  
  async viewDocument(req, res) {
    try {
      const { id } = req.params;
      
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid document ID. ID must be a number.' 
        });
      }
      
      const document = await OnboardingDocument.findByPk(parseInt(id));
    
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      
      if (!document.filePath || !fs.existsSync(document.filePath)) {
        return res.status(404).json({ success: false, message: 'Document file not found' });
      }
      
     
      const fileExtension = path.extname(document.filePath).toLowerCase();
      let contentType = 'application/octet-stream'; 
      
      if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
        contentType = 'image/jpeg';
      } else if (fileExtension === '.png') {
        contentType = 'image/png';
      } else if (fileExtension === '.doc' || fileExtension === '.docx') {
        contentType = 'application/msword';
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${document.documentName || 'document'}"`);
      
 
      const fileStream = fs.createReadStream(document.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error viewing document:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to view document', 
        error: error.message 
      });
    }
  },
  
  async serveDocumentByPath(req, res) {
    try {
      const { documentPath } = req.params;
      if (!documentPath) {
        return res.status(400).json({ success: false, message: 'Document path is required' });
      }
      
     
      const fullPath = path.join(process.cwd(), 'uploads', documentPath);
      
      const normalizedPath = path.normalize(fullPath);
      if (!normalizedPath.startsWith(path.join(process.cwd(), 'uploads'))) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
   
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }
      
      const fileExtension = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream'; 
      
      if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
        contentType = 'image/jpeg';
      } else if (fileExtension === '.png') {
        contentType = 'image/png';
      } else if (fileExtension === '.doc' || fileExtension === '.docx') {
        contentType = 'application/msword';
      }
      
  
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(fullPath) + '"');
      
 
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving document by path:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to serve document', 
        error: error.message 
      });
    }
  }
};

export default documentController;