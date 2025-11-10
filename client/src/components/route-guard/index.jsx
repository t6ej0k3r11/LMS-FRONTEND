import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import PropTypes from "prop-types";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();

  console.log("🔍 DEBUG: RouteGuard check for:", location.pathname);
  console.log("🔍 DEBUG: Auth state:", { authenticated, userRole: user?.role });

  if (!authenticated && !location.pathname.includes("/auth")) {
    console.log("🔍 DEBUG: Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  if (
    authenticated &&
    user?.role !== "instructor" &&
    (location.pathname.includes("instructor") ||
      location.pathname.includes("/auth"))
  ) {
    console.log("🔍 DEBUG: Non-instructor accessing instructor route, redirecting to /home");
    return <Navigate to="/home" />;
  }

  if (
    authenticated &&
    user?.role === "instructor" &&
    !location.pathname.includes("instructor")
  ) {
    console.log("🔍 DEBUG: Instructor accessing student route, redirecting to /instructor");
    return <Navigate to="/instructor" />;
  }

  console.log("🔍 DEBUG: Route access granted for path:", location.pathname);
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
