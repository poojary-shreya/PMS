import express from "express";
import upload from "../config/multerConfig.js";
import { companyDetails, getAllCompanies } from "../controller/companyDetailsController.js";
 const router =express.Router();

 router.post("/create",upload.single("companyLogo"),companyDetails);
 router.get("/getdetails",getAllCompanies);
  export default router;