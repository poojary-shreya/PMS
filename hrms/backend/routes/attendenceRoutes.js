import express from 'express';
import multer from 'multer';
import { 
  getAttendanceSummary,
  getPersonAttendance,
  recordAttendance,
  getTodayAttendance,
  deleteAttendance,
  getAllAttendance,
  upload,
  uploadAttendanceExcel,
  batchManualEntry
} from '../controller/attendenceController.js';

const router = express.Router();


router.post('/upload-excel', (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {

      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
    
      return res.status(400).json({ message: err.message });
    }

    uploadAttendanceExcel(req, res);
  });
});


router.get('/summary', getAttendanceSummary);
router.get('/person/:id', getPersonAttendance);
router.get('/today', getTodayAttendance);
router.post('/record', recordAttendance);
router.delete('/:id', deleteAttendance);
router.get('/all', getAllAttendance);


router.post('/batch-entry', batchManualEntry);

export default router;