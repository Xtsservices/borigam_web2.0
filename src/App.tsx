import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EnquiryNow from "./components/enquiryNow.tsx";
import SignUpForm from "./auth/signup.tsx";
import Login from "./auth/login.tsx";
import HomePage from "./pages/homepage/homePage.tsx";
import ForgotPassword from "./auth/forgotPassword.tsx";
import Dashboard from "./pages/admin/dashboard/dashboard.tsx";
import ErrorHandling from "./pages/admin/dashboard/settingsErrorBoundry.tsx";
import StudyMaterial from "./pages/admin/studyMaterial.tsx";
import AddQuestions from "./pages/admin/dashboard/addQuestion.tsx";
import AddTest from "./pages/admin/dashboard/addTest.tsx";
import CollageStudents from "./pages/admin/noOfStudentsCollages.tsx";
import AllStudents from "./pages/admin/allStudents.tsx";
import OngoingTest from "./pages/admin/onGoingTests.tsx";
import VerifyTest from "./pages/admin/verifyTests.tsx";
import CollageList from "./pages/admin/noOfCollages.tsx";
import UnassignedStudents from "./pages/admin/unassignedStudents.tsx";
import CompletedTest from "./pages/admin/completedTest.tsx";
import StudentDashoard from "./pages/student/studentDashboard.tsx";
import StudentCompletedTest from "./pages/student/completedTests.tsx";
import CollegeDashboard from "./pages/college/collegeDashboard.tsx";
import TestScreen from "./pages/student/newtest.tsx";
import BatchStudents from "./pages/admin/dashboard/viewBatchStudents.tsx";
import AddTestCollege from './pages/college/addtestcollege';
import AddQuestionsCollege from './pages/college/addquestionscollege';
import StudentComponent from './pages/college/StudentComponent';
import TestResultsSection from './pages/college/TestResultsSection';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/enquirynow" element={<EnquiryNow />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/settingscreen" element={<ErrorHandling />} />
        <Route path="/study-material" element={<StudyMaterial />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/Addquestions" element={<AddQuestions />} />
        <Route path="/dashboard/Addtest" element={<AddTest />} />

        {/* Dashboard Pages */}

        <Route path="/dashboard/AllStudents" element={<AllStudents />} />
        <Route path="/dashboard/CollageList" element={<CollageList />} />
        <Route path="/dashboard/OngoingTest" element={<OngoingTest />} />
        <Route path="/dashboard/VerifyTest" element={<VerifyTest />} />
        <Route path="/dashboard/CollageStudents" element={<CollageStudents />} />
        <Route path="/dashboard/unassigned" element={<UnassignedStudents />} />
        <Route path="/dashboard/CompletedTest" element={<CompletedTest />} />
        <Route path="/dashboard/batch-students/:batchId" element={<BatchStudents />} />


        {/* Student */}

        <Route path="/student/dashboard" element={<StudentDashoard />} />
        <Route path="/student/TestScreen/:testId" element={<TestScreen />} />
        <Route path="/student/CompletedTest" element={<StudentCompletedTest />} />

        {/* Collage */}

        <Route path="/college/dashboard" element={<CollegeDashboard />} />
        <Route path="/college/addtestcollege" element={<AddTestCollege />} />
        <Route path="/college/addquestionscollege" element={<AddQuestionsCollege />} />

       {/* College Students and Test Results Pages */}
        <Route path="/college/students" element={<StudentComponent />} />
        <Route path="/college/test-results" element={<TestResultsSection />} />

      </Routes>
    </Router>
  );
};

export default App;