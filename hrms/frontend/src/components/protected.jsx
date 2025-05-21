


import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let userRole = "";
  try {
    const decoded = jwtDecode(token); 
    userRole = decoded.role.toLowerCase(); 
    console.log(userRole);
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); 
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    alert("Access Denied: You do not have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;