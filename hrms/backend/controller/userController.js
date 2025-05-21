import User from '../model/usermodel.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Employee from "../model/addpersonalmodel.js";
import { Op } from 'sequelize';

const setCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000 
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
};

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create(req.body);
    return res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
 
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
   
    if (user.role === 'employee' || user.role==="hr" || user.role==="manager") {
    
      const personal = await Employee.findOne({
        where: {
          [Op.or]: [
            { personalemail: email },
            { companyemail: email }
          ]
        }
      });
      
      if (personal && personal.employee_id) {
        req.session.employee_id = personal.employee_id;
      
        req.session.email = email;
        req.session.isCompanyEmail = (email === personal.companyemail);
        console.log(req.session.employee_id);
      }
    }
    
 
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = user.generateAccessToken();
    setCookies(res, newAccessToken, refreshToken);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};


export const getCurrentUser = async (req, res) => {
  try {
  
    if (!req.session || !req.session.employee_id) {
      return res.status(401).json({ message: "Unauthorized: Not logged in" });
    }
    
 
    return res.status(200).json({
      employee_id: req.session.employee_id,
  
     
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      await user.update({ refreshToken: null });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};