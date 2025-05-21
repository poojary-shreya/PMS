import express from "express";
import { 
  createBonafideRequest, 
  getAllBonafideRequests,
  updateBonafideStatus,
  uploadCertificate,
  getCertificatesByEmployeeId,
  downloadCertificate,
  getCertificatesByEmployeeEmail
} from "../controller/bonafiedController.js";
import { upload } from '../controller/bonafiedController.js';

const router = express.Router();


router.post("/", createBonafideRequest);


router.get("/", getAllBonafideRequests);

router.get("/employee/:employeeId", getCertificatesByEmployeeId);


router.get("/certificates/:id", downloadCertificate);

router.put("/:id/status", updateBonafideStatus);


router.post('/:id/certificate', upload.single('certificate'), uploadCertificate);
router.get("/employee/email/:email", getCertificatesByEmployeeEmail);

export default router;


