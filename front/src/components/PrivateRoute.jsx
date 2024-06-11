import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Add a loading indicator
  }

  if (!currentUser) {
    // If user is not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
