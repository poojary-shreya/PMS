import express from "express";
import { getAllDocuments, updateDocumentStatus } from "../controller/documentViewController.js";

const router = express.Router();
router.get("/documents", getAllDocuments);
router.put("/documents/:employee_id/status", updateDocumentStatus);

export default router;