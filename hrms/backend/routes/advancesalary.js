import express from "express";
import { createSalaryRequest, getAllSalaryRequests,updateSalaryRequestStatus } from "../controller/advancesalaryController.js";

const router = express.Router();

router.post("/", createSalaryRequest);
router.get("/", getAllSalaryRequests);
router.put("/:id/status", updateSalaryRequestStatus);

export default router;
