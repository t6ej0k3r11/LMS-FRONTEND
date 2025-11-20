import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import ForbiddenPage from "../pages/forbidden";

export default function ProtectedAdminRoute({ children }) {
  const { auth } = useContext(AuthContext);
  const { user, authenticate } = auth;

  if (!authenticate) {
    // Not logged in → redirect to login
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== "admin") {
    // Logged in but not admin → show forbidden
    return <ForbiddenPage message="You do not have permission to access this page." />;
  }

  // Admin user → render children
  return children;
}

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};