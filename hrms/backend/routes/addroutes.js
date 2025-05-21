
import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getEmployeeList,
  getEmployeesByRoleType,
  addManagerRole,
  removeManagerRole
} from '../controller/addrolesController.js';

const router = express.Router();


router.get('/', getAllRoles);


router.get('/employees', getEmployeeList);


router.get('/employees/byrole/:roleType', getEmployeesByRoleType);


router.get('/:id', getRoleById);

router.post('/', createRole);

router.post('/addmanager', addManagerRole);


router.put('/:id', updateRole);

router.delete('/:id', deleteRole);


router.delete('/removemanager/:email', removeManagerRole);

export default router;