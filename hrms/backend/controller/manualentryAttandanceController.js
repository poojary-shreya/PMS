import Attendance from "../model/attendencemodel.js";
import { Op } from "sequelize"; 


export const checkIn = async (req, res) => {
  try {
    const { employee_id } = req.session;
    const { name, latitude, longitude } = req.body;
   
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        message: "Access denied: check-in can only be accessed when logged in with company email"
      });
    }
    

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: "GPS location is required for check-in. Please enable location services."
      });
    }
    

    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const in_time = today.toTimeString().split(' ')[0]; 
    
  
    const activeCheckIn = await Attendance.findOne({
      where: {
        employee_id,
        date,
        out_time: null
      }
    });
    
    if (activeCheckIn) {
      return res.status(400).json({
        error: "You already have an active check-in. Please check-out first."
      });
    }
    
 
    const record = await Attendance.create({
      employee_id,
      name,
      status: 'present',
      date,
      in_time,
      out_time: null,
      total_hours: null,
      in_latitude: latitude,
      in_longitude: longitude,
      out_latitude: null,
      out_longitude: null
    });
    
    res.json({
      message: "Check-in successful",
      record
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const checkOut = async (req, res) => {
  try {
    const { employee_id } = req.session; 
    const { latitude, longitude } = req.body;
    
 
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        message: "Access denied: check-out can only be accessed when logged in with company email"
      });
    }
    

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: "GPS location is required for check-out. Please enable location services."
      });
    }
    
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const out_time = today.toTimeString().split(' ')[0];
    
  
    const record = await Attendance.findOne({
      where: {
        employee_id,
        date,
        out_time: null
      },
      order: [['in_time', 'DESC']]
    });
    
    if (!record) {
      return res.status(404).json({
        error: "No active check-in found. Please check-in first."
      });
    }
    
    const inTime = new Date(`${date}T${record.in_time}`);
    let outTime = new Date(`${date}T${out_time}`);

  
    if (outTime <= inTime) {
      outTime.setDate(outTime.getDate() + 1);
    }

    const totalMilliseconds = outTime - inTime;
    
   
    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
  
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    

    const decimalHours = totalMinutes / 60;
    
 
    await record.update({
      out_time,
      total_hours: decimalHours,
      out_latitude: latitude,
      out_longitude: longitude
    });
    
  
    const allEntries = await Attendance.findAll({
      where: {
        employee_id,
        date,
        out_time: {
          [Op.not]: null 
        }
      }
    });
    
  
    const totalMinutesForDay = allEntries.reduce((sum, entry) => {
      return sum + (entry.total_hours * 60 || 0);
    }, 0);
    
  
    const totalHoursForDay = Math.floor(totalMinutesForDay / 60);
    const totalMinutesRemaining = Math.floor(totalMinutesForDay % 60);
    
   
    const formattedTotalTime = `${totalHoursForDay}:${totalMinutesRemaining.toString().padStart(2, '0')}`;
    
    res.json({
      message: "Check-out successful",
      record: {
        ...record.toJSON(),
        total_hours: decimalHours,
        formatted_time: formattedTime
      },
      dailySummary: {
        entries: allEntries.length,
        totalHours: decimalHours,
        formatted_total_time: formattedTotalTime
      }
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getTodayAttendance = async (req, res) => {
  try {
    const { employee_id } = req.session; 
    
    
    if (!req.session.isCompanyEmail) {
      return res.status(403).json({
        message: "Access denied: can only be accessed when logged in with company email"
      });
    }
    
    
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    
    const records = await Attendance.findAll({
      where: {
        employee_id,
        date
      },
      order: [['in_time', 'ASC']]
    });
    
    if (!records.length) {
      return res.status(404).json({
        message: "No attendance records found for today"
      });
    }
    

    const completedEntries = records.filter(record => record.out_time);
    const totalMinutes = completedEntries.reduce((sum, entry) => {
      return sum + (entry.total_hours * 60 || 0);
    }, 0);
    
  
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    const formattedTotalTime = `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;
    
   
    const formattedRecords = records.map(record => {
      const recordData = record.toJSON();
      if (recordData.total_hours) {
        const hours = Math.floor(recordData.total_hours);
        const mins = Math.floor((recordData.total_hours - hours) * 60);
        recordData.formatted_time = `${hours}:${mins.toString().padStart(2, '0')}`;
      }
      return recordData;
    });
    
   
    const activeEntry = records.find(record => !record.out_time);
    
    res.json({
      message: "Today's attendance records retrieved successfully",
      records: formattedRecords,
      summary: {
        totalEntries: records.length,
        completedEntries: completedEntries.length,
        totalHours: totalMinutes / 60,
        formatted_total_time: formattedTotalTime,
        hasActiveCheckIn: !!activeEntry
      }
    });
  } catch (error) {
    console.error('Error retrieving today\'s attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};