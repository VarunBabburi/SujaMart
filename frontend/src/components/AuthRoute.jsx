import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token already exists in localStorage, skip login and redirect to products
  if (token) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default AuthRoute;