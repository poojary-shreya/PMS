import express from 'express';
import {
  createJobRequisition,
  getAllJobListings,
  getJobById,
  updateJobPosting,
  deleteJobPosting
} from '../controller/jobpostingController.js';

const router = express.Router();

router.post("/create", createJobRequisition);


router.get("/list", getAllJobListings);

router.get("/:id", getJobById);


router.put("/update/:id", updateJobPosting);


router.delete("/delete/:id", deleteJobPosting);

export default router;