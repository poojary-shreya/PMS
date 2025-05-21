import express from 'express';
import { 
  getForm16ByEmployeeAndYear, 
 
} from '../controller/getForm16Controller.js';

const router = express.Router();

router.get('/form16',getForm16ByEmployeeAndYear);      
 export default router;