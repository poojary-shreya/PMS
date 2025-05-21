import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./associations.js";
import "./association.js"
import path from 'path';

import { sequelize, connectDB } from "./config/db.js";

import addfinancialRoutes from "./routes/addfinancialRoutes.js";
import addpersonalRoutes from "./routes/addpersonalRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobpostingRoutes from "./routes/jobpostingRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import onboardingRoutes from './routes/onboardingRoutes.js';
import documentRoutes from './routes/docroutes.js';
import searchRoutes from './routes/searchRoutes.js';
import employeeRoutes from './routes/employeeprofileRoutes.js';

import bonafideRoutes from "./routes/bonafiedRoutes.js";
import advanceSalaryRoutes from "./routes/advancesalary.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import attendanceRoutes from "./routes/attendenceRoutes.js";
import trainingRoutes from "./routes/trainingroutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import improvementPlanRoutes from "./routes/pipRoutes.js";
import successionPlanRoutes from "./routes/successionRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import rolesRoutes from "./routes/addroutes.js"
import payrollRoutes from "./routes/uploadsalaryRoutes.js";
import empUploadRoutes from "./routes/empuploadDocRoutes.js"; 
import adminRoutes from "./routes/documentRoutes.js";
import CompanyRoutes from "./routes/companyDetailsRoutes.js"
import PayrollTaxRoutes from"./routes/payrolltaxRoutes.js"
import payslipRoutes from "./routes/payslipRoutes.js";
import trainingVideoRoutes from './routes/videoRoutes.js';
import testingRoutes from "./routes/testingRoutes.js"
import ManualAttendanceRoutes from "./routes/manualentryAttandance.js";
import form16ARoutes from "./routes/formpartARoutes.js"
import form16BRoutes from "./routes/formpartBRoutes.js"
import form16Routes from "./routes/getForm16Routes.js"
import session from "express-session";
import Form12BBRoutes from "./routes/form12bbRoutes.js"
import claimRoutes from "./routes/claimRoutes.js"
import referRoutes from"./routes/referRoutes.js";
import rentRoutes from "./routes/rentRoutes.js"
import investmentDecRoutes from "./routes/investmentDecRoutes.js"
import investmentProofRoutes from "./routes/investmentProofRoutes.js"
import ApprovalRoutes from "./routes/investmentApprovalRoutes.js"
import taxRoutes from "./routes/taxcalculationRoutes.js"
import allowanceRoutes from "./routes/allowanceClaimRoutes.js"
import allowanceCalRoutes from "./routes/allowanceCalRoutes.js"
import ExemptionRoutes from "./routes/ExemptionRoutes.js"
import losspropertyRoutes from "./routes/losspropertyRoutes.js"
import employeeTdsRoutes from './routes/tdsRoutes.js';
import employeeTcsRoutes from './routes/tcsRoutes.js';
import projectRoutes from "./routes/projectRoutes.js";
import issueRoutes from './routes/issueRoutes.js';
import assignRoutes from "./routes/assignTeamRoutes.js";
import boardRoutes from "./routes/boardRoutes.js"
import TeamRoutes from "./routes/createTeamRoutes.js";
import contractRoutes from "./routes/ContractorRoutes.js"
import roadmapRoutes from './routes/roadmapRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(session({
  secret: "02052002",
  resave:false,
  saveUninitialized:true,
  cookie:{secure:false},
}))
const PORT = process.env.PORT || 5000;

app.use('/api', roadmapRoutes);
app.use("/api", addfinancialRoutes);
app.use("/api", addpersonalRoutes);
app.use('/api/roles', rolesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobpost", jobpostingRoutes);
app.use("/api/candidates", trackingRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/offers", offerRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', employeeRoutes);
app.use("/api/bonafide", bonafideRoutes);
app.use("/api/salary-request", advanceSalaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/improvement-plans", improvementPlanRoutes);
app.use("/api/succession-plans", successionPlanRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api",CompanyRoutes);
app.use('/api', searchRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/tax",PayrollTaxRoutes);
app.use("/api/form16A",form16ARoutes);
app.use("/api/form16B",form16BRoutes);
app.use("/api/form",form16Routes);
app.use("/api/employee", empUploadRoutes); 
app.use("/api/admin", adminRoutes);
app.use("/api/payslip",payslipRoutes)
app.use("/api/manual",ManualAttendanceRoutes);
app.use('/api', trainingVideoRoutes);
app.use('/api',testingRoutes)
app.use("/api/form12bb",Form12BBRoutes);
app.use("/api/claims",claimRoutes);
app.use("/api/refer",referRoutes);
app.use("/api/hra",rentRoutes);
app.use("/api/investment",investmentDecRoutes)
app.use("/api/investmentproof",investmentProofRoutes);
app.use("/api/approval",ApprovalRoutes);
app.use("/api/payrolltax",taxRoutes);
app.use("/api/allowanceclaim",allowanceRoutes);
app.use("/api/allowancecalculation",allowanceCalRoutes);
app.use("/api",ExemptionRoutes);
app.use("/api",losspropertyRoutes);
app.use('/api/employees', employeeTdsRoutes);
app.use('/api/employees', employeeTcsRoutes);
app.use("/api/projects", projectRoutes);
app.use('/api/issues', issueRoutes);

app.use("/api",boardRoutes)
app.use("/api/addteam",assignRoutes)
app.use("/api/createteam",TeamRoutes);
app.use('/api/contract',contractRoutes);
app.use('/api/sprints', sprintRoutes);
const startServer = async () => {
  try {
    await connectDB();
    console.log('🔄 Syncing database...');
    await sequelize.sync(); 
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Database Sync Error:', error);
  }
};

startServer();

export default app;
