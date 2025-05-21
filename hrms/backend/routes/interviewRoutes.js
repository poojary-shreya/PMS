import express from "express";
import {
  createInterview,
  getAllInterviews,
  updateInterviewStatus,
  getHRCompletedCandidates,
  getCandidateByEmail,
  markOfferSent
} from "../controller/interviewController.js";

const router = express.Router();


router.post("/", createInterview);
router.get("/", getAllInterviews);
router.put("/:id", updateInterviewStatus);
router.get("/hr-completed", getHRCompletedCandidates);
router.get("/candidate/:email", getCandidateByEmail);
router.put("/:id/mark-offer-sent", markOfferSent);

export default router;