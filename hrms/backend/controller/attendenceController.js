import Attendance from '../model/attendencemodel.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'attendance-' + Date.now() + path.extname(file.originalname));
  }
});


const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed!'), false);
  }
};


export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } 
}).single('excelFile'); 


export const uploadAttendanceExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);


    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

   
    const firstRow = data[0];
    const requiredFields = ['employee_id', 'name', 'status', 'date'];
    const missingFields = requiredFields.filter(field => !(field in firstRow));
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

 
    const results = [];
    let failures = [];

    for (const row of data) {
      try {
     
        let formattedDate = row.date;
        if (typeof row.date === 'number') {
      
          formattedDate = new Date(Math.floor((row.date - 25569) * 86400 * 1000));
          formattedDate = formattedDate.toISOString().split('T')[0];
        }

  
let inTime = row.in_time || null;
let outTime = row.out_time || null;
let totalHours = row.total_hours || null;


if (typeof inTime === 'number') {

  const totalMinutes = Math.round(inTime * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  inTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

if (typeof outTime === 'number') {

  const totalMinutes = Math.round(outTime * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  outTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


if (inTime && outTime && !totalHours) {
  
  const inParts = inTime.split(':');
  const outParts = outTime.split(':');
  
  if (inParts.length === 2 && outParts.length === 2) {
    const inMinutes = parseInt(inParts[0]) * 60 + parseInt(inParts[1]);
    const outMinutes = parseInt(outParts[0]) * 60 + parseInt(outParts[1]);
    

    const adjustedOutMinutes = outMinutes < inMinutes ? outMinutes + (24 * 60) : outMinutes;
    totalHours = Number(((adjustedOutMinutes - inMinutes) / 60).toFixed(2));
  }
}
   
const employeeId = typeof row.employee_id === 'number' 
? row.employee_id.toString() 
: row.employee_id;


const existingRecord = await Attendance.findOne({
where: {
  employee_id: employeeId,
  date: formattedDate
}
});

let record;

if (existingRecord) {

record = await existingRecord.update({
  name: row.name, 
  status: row.status,
  in_time: inTime,
  out_time: outTime,
  total_hours: totalHours
});
} else {

record = await Attendance.create({
  employee_id: employeeId,
  name: row.name,
  status: row.status,
  date: formattedDate,
  in_time: inTime,
  out_time: outTime,
  total_hours: totalHours
});
}
        
        results.push(record);
      } catch (error) {
        console.error('Error processing row:', row, error);
        failures.push({
          row: row,
          error: error.message
        });
      }
    }

  
    fs.unlinkSync(req.file.path);

    res.json({
      message: `Processed ${results.length} records successfully`,
      failed: failures.length > 0 ? failures : null
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error processing Excel file: ' + error.message });
  }
};




export const batchManualEntry = async (req, res) => {
  try {
    const { entries } = req.body;
      const employee_id = req.session.employee_id;
      if (!req.session.isCompanyEmail) {
        return res.status(403).json({ 
          message: "Access denied: failed to submit can only be accessed when logged in with company email" 
        });
      }
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Invalid entries format or empty entries array' });
    }
    
    const results = [];
    const failures = [];
    
    for (const entry of entries) {
      try {
        const { employee_id, name, status, date, in_time, out_time, total_hours } = entry;
        
 
        if (!employee_id || !name || !status || !date) {
          throw new Error('Missing required fields');
        }
        

        const existingRecord = await Attendance.findOne({
          where: {
            employee_id,
            date
          }
        });
        
        let record;
        
        if (existingRecord) {
      
          record = await existingRecord.update({
            status,
            in_time: in_time || existingRecord.in_time,
            out_time: out_time || existingRecord.out_time,
            total_hours: total_hours || existingRecord.total_hours
          });
        } else {
         
          record = await Attendance.create({
            employee_id,
            name,
            status,
            date,
            in_time,
            out_time,
            total_hours
          });
        }
        
        results.push(record);
      } catch (error) {
        failures.push({
          entry,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Processed ${results.length} records successfully`,
      successful: results.length,
      failed: failures.length,
      failures: failures.length > 0 ? failures : null
    });
  } catch (error) {
    console.error('Error processing batch entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAttendanceSummary = async (req, res) => {
  try {
   
    const [results] = await sequelize.query(`
      SELECT 
        employee_id,
        name,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        ROUND(AVG(CASE WHEN status = 'present' THEN total_hours ELSE NULL END), 2) as avg_hours,
        MAX(date) as last_attendance_date
      FROM attendance
      GROUP BY employee_id, name
      ORDER BY last_attendance_date DESC, name
    `);

    res.json(results);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPersonAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let whereClause = { person_id: id };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: endDate
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching person attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const recordAttendance = async (req, res) => {
  try {
    const { employee_id, name, status, date, in_time, out_time, total_hours } = req.body;
    
   
    if (!employee_id || !name || !status || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    
    const existingRecord = await Attendance.findOne({
      where: {
        employee_id,
        date
      }
    });
    
    if (existingRecord) {
     
      await existingRecord.update({
        status,
        in_time: in_time || existingRecord.in_time,
        out_time: out_time || existingRecord.out_time,
        total_hours: total_hours || existingRecord.total_hours
      });
      
      return res.json({ 
        message: 'Attendance record updated', 
        record: existingRecord 
      });
    }
    
   
    const newRecord = await Attendance.create({
      employee_id,
      name,
      status,
      date,
      in_time,
      out_time,
      total_hours
    });
    
    res.status(201).json({ 
      message: 'Attendance recorded successfully', 
      record: newRecord 
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findAll({
      where: {
        date: today
      },
      order: [['name', 'ASC']]
    });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await Attendance.findByPk(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    await record.destroy();
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      order: [['date', 'DESC']]
    });
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};