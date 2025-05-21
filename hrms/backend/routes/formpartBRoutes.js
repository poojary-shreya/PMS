import  express from "express";
import { generateForm16B } from "../controller/fompartBController.js";

const router = express.Router();

router.post("/generate",generateForm16B);
export default router;