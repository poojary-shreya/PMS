
import React, { useState} from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, Link, useLocation,} from "react-router-dom";

import { Outlet } from 'react-router-dom';

import Navbar from "./components/navbar.jsx";
import HomePage from "./components/home.jsx";
import Training from "./components/training.jsx";
import Leave from "./components/leave.jsx";
import Attendance from "./components/attendence.jsx";
import Performance from "./components/performance.jsx";
import JobPosting from "./components/jobposting.jsx";
import Tracking from "./components/tracking.jsx";
import Addpersonal from "./components/addpersonal.jsx";
import Addfinancial from "./components/addfinancial.jsx";
import Viewpersonal from "./components/viewpersonal.jsx";
import Viewfinancial from "./components/viewfinancial.jsx";
import Interview from "./components/Interview.jsx";
import Bonafied from "./components/bonafied.jsx";
import AdvanceSalary from "./components/advancesalary.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import OfferForm from "./components/offer.jsx";
import OnboardingForm from "./components/onboarding.jsx";
import ProtectedRoute from "./components/protected.jsx";
import ManagerApproval from "./components/managerapproval.jsx";

import Jobview from "./components/jobview.jsx";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

import { Feedback, Reviews } from "@mui/icons-material";
import ImprovementManagement from "./components/improvement.jsx";
import FeedbackPage from "./components/feedback.jsx";
import PerformanceReviewsTab from "./components/review.jsx";
import SuccessionPlan from "./components/succession.jsx";
import TrainingList from "./components/viewtraining.jsx";
import UploadSal from "./components/uploadsalary.jsx";
import EmployeeUploadDoc from "./components/employeedocument.jsx";
import DocumentStatus from "./components/viewdocument.jsx";
import PayrollTax from "./components/payrolltax.jsx";
import GeneratePayslip from "./components/generatepayslip.jsx";
import Payslip from "./components/payslip.jsx";
import MonthlyTax from "./components/monthlytax.jsx"
import YearlyTax from "./components/yeartax.jsx";
import TotalTax from "./components/totaltax.jsx"
import BonafideRequestList from "./components/viewbonafied.jsx";
import AdvanceSalaryRequestList from "./components/viewsalaryreq.jsx";
import EmployeeDashboard from "./components/viewperformance.jsx";
import EmployeeReviewsPage from "./components/viewreview.jsx";
import ViewFeedbackPage from "./components/viewfeedback.jsx";
import ViewImprovementPlans from "./components/viewpip.jsx";
import EmployeeSuccessionPlan from "./components/viewsuccession.jsx"
import SharedNavbar from "./components/performancenavbar.jsx";
import InterviewStatusUpdate from "./components/interviewstatus.jsx"
import StatusPage from "./components/status.jsx";
import MonthlyTaxSpecific from "./components/MonthlyTaxSpecific.jsx"
import CompanyDetails from "./components/CompanyDetails.jsx"
import UploadDocument from "./components/upload.jsx";
import { AuthProvider } from './components/onboardinglist.jsx';
import OnboardingList from "./components/onboardinglist.jsx"
import EmployeeCertificateView from "./components/viewcertificate.jsx"
import AddRoles from "./components/addroles.jsx";
import ViewRoles from "./components/viewroles.jsx";
import EmployeeTrainingView from "./components/emptrainingview.jsx"
import HRTrainingDetail from "./components/trainingdetails.jsx"
import TrainingVideoManagement from "./components/trainingvideo.jsx";
import SearchEmployee from "./components/searchemployee.jsx"
import ProjectedTax from "./components/projectedtax.jsx"
import FormPartA from "./components/FormPartA.jsx";
import FormPartB from "./components/FormPartB.jsx";
import Form16 from "./components/form16.jsx";
import ManualAttendance from "./components/ManualAttendance.jsx";
import HRTestManagement from "./components/addtest.jsx";
import EmployeeProfile from "./components/employeeprofile.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Form12BB from "./components/Form12BB.jsx";
import ViewCtc from "./components/ViewCtc.jsx";
import ViewForm12BB from "./components/View12BB.jsx"
import Claims from "./components/Claims.jsx";
import ViewClaims from "./components/ViewClaims.jsx";
import PersonalDetails from "./components/PersonalDetails.jsx";
import Referral from './components/Referral.jsx';
import OfferApproval from './components/OfferApproval.jsx';
import SendOffer from './components/SendOffer.jsx'
// import HraExemptionCalculator from './components/HraExemption.jsx';
import InvestmentDeclarationForm from './components/InvestmentDec.jsx';
import PropertyLossForm from './components/LossProperty.jsx';
import InvestmentProofSubmission from './components/InvestmentProof.jsx';
import TaxFormWithTabs from './components/Tabs.jsx';
import ProofApproval from './components/Approval.jsx';
import AllowanceClaimSystem from './components/AllowanceClaim.jsx';
import AllowanceClaimApproval from './components/AllowanceApproval.jsx';
import HRPropertyLossDashboard from './components/ViewLossProperty.jsx';
import CreateProject from './components/createproject.jsx';
import ActiveProjects from './components/activeprojects.jsx';

import AllTasksPage from './components/alltask.jsx';
import MyTasksPage from './components/mytask.jsx';
import Dashboard from './components/dashboard.jsx';
import AllProjects from './components/allprojects.jsx';
import ProjectManagementSystem from './components/projectupdates.jsx';
import AssignTeam from './components/AssignTeam.jsx';
import ProjectDetailsDialog from './components/viewproject.jsx';
import CreateIssuePage from './components/createissues.jsx';
import BasicBoard from './components/createboard.jsx';
import ManageTeam from './components/ManageTeam.jsx';
import TeamManagementApp from "./components/teamcreate.jsx"
import ViewContractEmployees from './components/ContractEmpList.jsx';
import ContractorDetailsForm from './components/Contractor.jsx';
import Backlogpage from "./components/backlogs.jsx"
import RoadmapPage from './components/roadmap.jsx';
import ProjectCalendar from './components/calender.jsx';

import ActiveSprints from './components/activesprint.jsx';
import CreateSprint from './components/createsprints.jsx';
// import ProjectDashboard from './components/ManageTeam.jsx';
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
  },
});


const App = () => {



  const[sidebaropen, setSidebarOpen]=useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column',  }}>
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Navbar />
    <Box sx={{ 
      display: 'flex', 
      flexGrow: 1, 
      overflow: 'hidden' 
    }}>
      <Sidebar open={sidebaropen} setOpen={setSidebarOpen}/>

      <Box component="main" sx={{
        flexGrow: 1,
        p: 3,
        // ml: '250px',
        // backgroundColor: '#f4f6f8',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: "margin-left 0.3s ease, width 0.3s ease",
        width: sidebaropen ? "calc(100% - 250px)" : "calc(100% - 72px)",
      }}>
        <Outlet />



      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerApproval />} />

          <Route path="/review" element={<PerformanceReviewsTab />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/improve" element={<ImprovementManagement />} />
          <Route path="/succession" element={<SuccessionPlan />} />
          <Route path="/offerapproval" element={<OfferApproval/>} />
          <Route path="/create-project" element={<CreateProject />} />
              <Route path="/active-projects" element={<ActiveProjects />} />
             <Route path='/pro' element={<AllProjects />} />
              <Route path='/createtask' element={<CreateIssuePage />} />
              <Route path='/tasks' element={<AllTasksPage />} />
             
              <Route path='/proupdates' element={<ProjectManagementSystem />} />
              <Route path="/assignteam" element={<AssignTeam/>}/>
              <Route path="/createteam" element={<TeamManagementApp/>}/>
              <Route path="/manageteam" element={<ManageTeam/>}/>
              <Route path='/viewproject' element={<ProjectDetailsDialog />} />
              <Route path='/createboard' element={<BasicBoard />} />
              <Route path="/project/:projectId/backlog" element={<Backlogpage />} />
              <Route path="/project/:projectId/roadmap" element={<RoadmapPage />} />
              <Route path='/project/:projectId/calendar' element={<ProjectCalendar /> } />
           <Route path='/sprintcreate' element={<CreateSprint />} />
              <Route path='/activesprint' element={<ActiveSprints />} />
              {/* <Route path="/project/:projectId/db" element={<ProjectDashboard />} /> */}

              <Route 
                path="/dash" 
                element={
                  <Dashboard 
                   
                  />
                } 
              />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["hr", "manager", "employee"]} />}>
          <Route path="/attendance" element={<Attendance />} />

        </Route>
        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route path="/manual-entry" element={<ManualAttendance />} />
          <Route path='/mytasks' element={<MyTasksPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["hr", "manager"]} />}>
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/upload-salary" element={<UploadSal />} />
       
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["employee", "manager"]} />}>
          <Route path="/performance" element={<Performance />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route path="/bonafied" element={<Bonafied />} />
          <Route path="/advancesalary" element={<AdvanceSalary />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/view" element={<EmployeeDashboard />} />

          <Route path="/viewreview" element={<EmployeeReviewsPage />} />
          <Route path="/viewfeedback" element={<ViewFeedbackPage />} />
          <Route path="/viewpip" element={<ViewImprovementPlans />} />
          <Route path="/viewsuccession" element={<EmployeeSuccessionPlan />} />
          <Route path="/navbar" element={<SharedNavbar />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/updatetraining" element={<EmployeeTrainingView />} />
          <Route path="/employee" element={<EmployeeProfile />} />
         
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["hr", "manager","employee"]} />}>
        <Route path="/refer" element={<Referral/>}/>

        </Route>


        <Route element={<ProtectedRoute allowedRoles={["hr", "manager",]} />}>
          <Route path="/addpersonal" element={<Addpersonal />} />
          <Route path="/viewpersonal" element={<Viewpersonal />} />
          <Route path="/addfinancial" element={<Addfinancial />} />
          <Route path="/viewfinancial" element={<Viewfinancial />} />
          <Route path="/addrole" element={<AddRoles />} />
          <Route path="/viewrole" element={<ViewRoles />} />
          <Route path="/training" element={<Training />} />
          <Route path="/trainings" element={<TrainingList />} />
          <Route path="/training/add" element={<Training />} />
          <Route path="/video" element={<TrainingVideoManagement />} />
          <Route path="/contract" element={<ContractorDetailsForm/>}/>
          <Route path='/contractlist' element={<ViewContractEmployees/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["hr"]} />}>
        <Route path="/sendoffer" element={<SendOffer/>}/>
        </Route>


        <Route element={<ProtectedRoute allowedRoles={["hr"]} />}>
          <Route path="/companydetails" element={<CompanyDetails />} />
          <Route path="/upload-salary" element={<UploadSal />} />
          <Route path="/view-document" element={<DocumentStatus />} />
          <Route path="/proofapproval" element={<ProofApproval/>} />
          <Route path="/payroll-calculation" element={<PayrollTax />} />
          <Route path="/generate-payslip" element={<GeneratePayslip />} />
          <Route path="/monthly-tax-all" element={<MonthlyTax />} />
          <Route path="/yearly-tax-all" element={<TotalTax />} />
          <Route path="/yearly-tax-specific" element={<YearlyTax />} />
          <Route path="/monthly-tax-specific" element={<MonthlyTaxSpecific />} />
          <Route path="/bonafiedlist" element={<BonafideRequestList />} />
          <Route path="/salaryrequest" element={<AdvanceSalaryRequestList />} />
          <Route path="/search" element={<SearchEmployee />} />
          <Route path="/form16-partA" element={<FormPartA />} />
          <Route path="/form16-partB" element={<FormPartB />} />
          <Route path="/viewform12bb" element={<ViewForm12BB/>}/>
          <Route path="/allowanceproofapproval" element={<AllowanceClaimApproval/>}/>
          <Route path="/view-lossproperty" element={<HRPropertyLossDashboard/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route path="/attendance" element={<Attendance />} />
          
          <Route path="/submit-document" element={<EmployeeUploadDoc />} />
          <Route path="/view-payslip" element={<Payslip />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/Onboarding List" element={<OnboardingList />} />
          <Route path="/certificate" element={<EmployeeCertificateView />} />
          <Route path="/projected-tax" element={<ProjectedTax />} />
          <Route path="/personal" element={<PersonalDetails/>}/>
          <Route path="/form16" element={<Form16 />} />
          <Route path="/view-ctc" element={<ViewCtc/>} />
          <Route path="/form12bb" element={<Form12BB/>}/>
          <Route path="/claims" element={<Claims/>}/>
          <Route path='/allowanceclaim' element={<AllowanceClaimSystem/>}/>
          
          {/* <Route path="/investmentdec" element={<InvestmentDeclarationForm/>}/> */}
          <Route path="/investmentdec" element={<TaxFormWithTabs/>}/>
          <Route path="/lossproperty" element={<PropertyLossForm/>}/>
          <Route path="/investmentproof" element={<InvestmentProofSubmission/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["manager"]}/>}>
        <Route path="/viewclaims" element={<ViewClaims/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["hr"]} />}>
          <Route path="/job-posting" element={<JobPosting />} />
          <Route path="/candidates" element={<Tracking />} />
          <Route path="/interview-scheduling" element={<Interview />} />
          <Route path="/offer" element={<OfferForm />} />
          <Route path="/onboarding" element={<OnboardingForm />} />
          <Route path="/jobview" element={<Jobview />} />
          <Route path="/statusupdate" element={<InterviewStatusUpdate />} />
          <Route path="/status" element={<StatusPage />} />

          <Route path="/OnboardingList" element={<OnboardingList />} />


          <Route path="/job-posting/:id" element={<JobPosting />} />
          <Route path="/details" element={<HRTrainingDetail />} />
          <Route path="/test" element={<HRTestManagement />} />
        </Route>


      </Routes>
      </Box>
      </Box>
    </ThemeProvider>
    </Box>
  );
};

export default App;
