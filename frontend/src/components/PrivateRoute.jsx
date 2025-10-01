//src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children, roles }) {
  var token = localStorage.getItem("token");
  var role = localStorage.getItem("role");

  if(token == null){
    token = sessionStorage.getItem("token")
    role = sessionStorage.getItem("role")
  }
  const location = useLocation();

  // 1. If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If specific roles are required, check user role
  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Otherwise, allow access
  return children;
}
// src/components/PrivateRoute.jsx
// src/components/PrivateRoute.jsx
// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { getToken, getRole } from "../utils/auth";

// export default function PrivateRoute({ children, roles }) {
//   const token = getToken();
//   const role = getRole();
//   const location = useLocation();

//   // Not authenticated
//   if (!token) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If route specifies allowed roles and user role isn't allowed
//   if (roles && !roles.includes(role)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }
