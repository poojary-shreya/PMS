import express from "express"
import { checkIn,checkOut, getTodayAttendance } from "../controller/manualentryAttandanceController.js";
const router=express.Router();
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
export default router