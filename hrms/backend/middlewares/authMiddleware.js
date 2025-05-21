import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';

export const verifyToken = async (req, res, next) => {
  try {
   
    const token = req.cookies?.accessToken || 
                 req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const verifyJWT = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || 
                   req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized request' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Invalid access token' });
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: error?.message || 'Invalid access token' 
      });
    }
  };
};

