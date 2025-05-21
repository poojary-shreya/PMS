import express from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser
} from '../controller/userController.js';
import { validateRegistration, validateLogin } from '../middlewares/validationMiddleware.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get("/current", getCurrentUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', verifyJWT(), logoutUser);


router.get('/profile', verifyJWT(), (req, res) => {
  res.json(req.user);
});


router.get('/admin', verifyJWT(['hr', 'manager']), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

export default router;