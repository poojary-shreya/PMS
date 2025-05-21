import express from "express";
import upload from "../config/multerConfig.js";
import { uploadDocuments,getEmployeeDocuments } from "../controller/empUploadDocController.js";

const router = express.Router();
router.post("/upload-documents", upload.array("files"), uploadDocuments);
router.get("/status/documents", getEmployeeDocuments);



export default router;