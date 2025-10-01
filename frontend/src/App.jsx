import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import TopBar from "./components/TopBar";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails"; // ✅ New import
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Finance from "./pages/Finance";
import Communication from "./pages/Communication";
import PrivateRoute from "./components/PrivateRoute";
// import { ToastContainer , toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

console.log("✅ App.jsx file loaded");

function App() {
  return (
    <Router>
      <CssBaseline />
      <TopBar />
      <Container sx={{ mt: 3 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            }
          />

          {/* ✅ Student details route */}
          <Route
            path="/students/:id"
            element={
              <PrivateRoute>
                <StudentDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <PrivateRoute>
                <Teachers />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />

          <Route
            path="/finance"
            element={
              <PrivateRoute>
                <Finance />
              </PrivateRoute>
            }
          />

          <Route
            path="/communication"
            element={
              <PrivateRoute>
                <Communication />
              </PrivateRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Container>
      {/* <ToastContainer position="top-right" /> */}
    </Router>
  );
}

export default App;



