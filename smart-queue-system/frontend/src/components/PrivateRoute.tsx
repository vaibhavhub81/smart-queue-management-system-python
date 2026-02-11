import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthTokens, getUserRole } from '../utils/auth';

interface PrivateRouteProps {
  children: React.ReactElement;
  roles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { accessToken } = getAuthTokens();
  const userRole = getUserRole();
  const location = useLocation();

  if (!accessToken) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole && !roles.includes(userRole)) {
    // Logged in but wrong role
    // Redirect to a 'not authorized' page or to a default page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Authorized
  return children;
};

export default PrivateRoute;
