import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import DoctorSignup from "./pages/auth/DoctorSignup.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import EmailVerified from "./pages/auth/EmailVerified.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import HomePage from "./pages/HomePage.jsx";
import BrowseDoctors from "./pages/doctor/BrowseDoctors.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                element={<HomePage />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/doctor-signup"   element={<DoctorSignup />} />
      <Route path="/verify-email"    element={<VerifyEmail />} />
      <Route path="/email-verified"  element={<EmailVerified />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/browse-doctors"  element={<BrowseDoctors />} />
      <Route path="/doctors/:id"     element={<DoctorProfile />} />

      {/* Protected — role-based */}
      <Route path="/admin"   element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/doctor"  element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;