import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        }
      />
       <Route
        path="/doctor"
        element={
          <ProtectedRoute role="doctor">
            <div>Doctor Dashboard</div>
          </ProtectedRoute>
        }
      />

       <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <div>Patient Dashboard</div>
          </ProtectedRoute>
        }
       />

       
    </Routes>
  );
};