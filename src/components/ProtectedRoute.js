import React from 'react';
import { Navigate } from 'react-router-dom';
import * as AppFunc from '../lib/AppFunctions';

const ProtectedRoute = ({ children, requiredAccess = null }) => {
  const isLoggedIn = localStorage.getItem("user") !== null;
  const needsPasswordReset = JSON.parse(localStorage.getItem("user"))?.needsPasswordReset || null;
  const activeUserRole = localStorage.getItem("user_role");

  // Check if user is logged in and doesn't need password reset
  if (!isLoggedIn || needsPasswordReset === 1) {
    return <Navigate to="/" replace />;
  }

  // If no specific access check is required, just render the component
  if (!requiredAccess) {
    return children;
  }

  // Check role-based access
  if (requiredAccess === 'workRequest' && !AppFunc.hasWorkRequestAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'offshoreLeadWorkRequest' && !AppFunc.hasOffshoreLeadWorkRequestAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  // Add more access checks as needed
  if (requiredAccess === 'employee' && !AppFunc.hasEmployeeAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'project' && !AppFunc.hasProjectAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'allocation' && !AppFunc.hasAllocationAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'utilization' && !AppFunc.hasUtilizationAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'user' && !AppFunc.hasUserAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'userRole' && !AppFunc.hasUserRoleAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'location' && !AppFunc.hasLocationAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'report' && !AppFunc.hasReportAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'category' && !AppFunc.hasCategoriesAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'hiring' && !AppFunc.hasHiringAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'lineOfBusiness' && !AppFunc.hasLineOfBusinessAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'serviceLine' && !AppFunc.hasServiceLineAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'capabilityArea' && !AppFunc.hasCapabilityAreaAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'client' && !AppFunc.hasClientAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredAccess === 'approveTimesheet' && !AppFunc.hasApproveTimesheetAccess(activeUserRole)) {
    return <Navigate to="/home" replace />;
  }

  // If all checks pass, render the component
  return children;
};

export default ProtectedRoute;
