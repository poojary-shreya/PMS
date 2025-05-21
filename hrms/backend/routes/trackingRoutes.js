import express from "express";
import { getCandidates, scheduleInterview ,getCandidateResume} from "../controller/trackingController.js";

const router = express.Router();

router.get("/", getCandidates);
router.post("/schedule/:id", scheduleInterview);
router.get("/:id/resume", getCandidateResume);
export default router;
