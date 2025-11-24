import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import PropTypes from "prop-types";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();

  if (!authenticated && !location.pathname.includes("/auth")) {
    return <Navigate to="/auth" />;
  }

  if (
    authenticated &&
    user?.role !== "instructor" &&
    user?.role !== "admin" &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("admin") ||
      location.pathname.includes("/auth"))
  ) {
    return <Navigate to="/home" />;
  }

  if (
    authenticated &&
    user?.role === "instructor" &&
    !location.pathname.includes("instructor") &&
    !location.pathname.includes("admin")
  ) {
    return <Navigate to="/instructor" />;
  }

  if (
    authenticated &&
    user?.role === "admin" &&
    !location.pathname.includes("admin") &&
    !location.pathname.includes("instructor")
  ) {
    return <Navigate to="/admin" />;
  }

  return <Fragment>{element}</Fragment>;
}

RouteGuard.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    role: PropTypes.string.isRequired
  }),
  element: PropTypes.node.isRequired
};

export default RouteGuard;
