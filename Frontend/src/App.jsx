import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import DoctorSignup from "./pages/auth/DoctorSignup.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<HomePage />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/signup"        element={<Signup />} />
      <Route path="/doctor-signup" element={<DoctorSignup />} />
      <Route path="/verify-email"  element={<VerifyEmail />} />

      {/* Protected — role-based */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <div>Admin Dashboard (coming soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role="doctor">
            <div>Doctor Dashboard (coming soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <div>Patient Dashboard (coming soon)</div>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;