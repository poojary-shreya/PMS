import express from "express";
import {
  verifyEmployee,
  submitHRADetails,
  submitLTCDetails,
  submitHomeLoanDetails,
  submitChapterVIADetails,
  getForm12BBData,
  updateHRAStatus,
  updateLTCStatus,
  updateHomeLoanStatus,
  updateChapterVIAStatus,
  getAllForms,
  
} from "../controller/form12bbController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/verify", verifyEmployee);

router.post("/hra", upload.single("rentReceipt"), submitHRADetails);

router.post("/ltc", upload.single("travelBill"), submitLTCDetails);

router.post("/homeloan", upload.single("certificate"), submitHomeLoanDetails);

router.post("/chaptervia", upload.fields([
  { name: 'receipt_0', maxCount: 1 },
  { name: 'receipt_1', maxCount: 1 },
  { name: 'receipt_2', maxCount: 1 },
  { name: 'receipt_3', maxCount: 1 },
  { name: 'receipt_4', maxCount: 1 },
  { name: 'receipt_5', maxCount: 1 },
  { name: 'receipt_6', maxCount: 1 },
]), submitChapterVIADetails);

router.get("/:employee_id", getForm12BBData);
router.get("/form/all",getAllForms)
router.post("/update-hra-status", updateHRAStatus);
router.post("/update-ltc-status", updateLTCStatus);
router.post("/update-homeloan-status", updateHomeLoanStatus);
router.post("/update-chaptervia-status", updateChapterVIAStatus);



export default router;