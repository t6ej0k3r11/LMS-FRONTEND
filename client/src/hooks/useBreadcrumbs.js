import { useLocation } from "react-router-dom";
import { useMemo } from "react";

// Mapping for human-readable labels
const pathLabelMap = {
  dashboard: "Dashboard",
  courses: "All Courses", // Changed from "My Courses" to "All Courses" as per requirements
  "course/details": "Course Details",
  "course-progress": "Lecture",
  "quiz-player": "Quiz",
  settings: "Settings",
  chat: "Messages",
  notifications: "Notifications",
  "student-courses": "My Courses",
  // Add more mappings as needed
};

const formatBreadcrumbLabel = (segment) => {
  // Handle dynamic segments like :id
  if (segment.startsWith(":")) return null; // Skip dynamic params

  // Check for exact matches
  if (pathLabelMap[segment]) return pathLabelMap[segment];

  // Handle nested paths
  for (const [key, label] of Object.entries(pathLabelMap)) {
    if (segment.startsWith(key)) return label;
  }

  // Fallback: capitalize and replace hyphens
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const useBreadcrumbs = (overrides = {}) => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Special case: /home route should have no breadcrumbs
    if (location.pathname === "/" || location.pathname === "/home") {
      return [];
    }

    const items = [];

    // Always start with Home for student routes (except home page)
    items.push({
      label: "Home",
      href: "/",
    });

    // Handle specific routes according to requirements
    if (location.pathname === "/dashboard") {
      // /dashboard -> Home > Dashboard
      items.push({
        label: "Dashboard",
      });
      return items;
    }

    if (location.pathname === "/courses") {
      // /courses -> Home > All Courses
      items.push({
        label: "All Courses",
      });
      return items;
    }

    if (location.pathname === "/student-courses") {
      // /student-courses -> Home > Dashboard > My Courses
      items.push({
        label: "Dashboard",
        href: "/dashboard",
      });
      items.push({
        label: "My Courses",
      });
      return items;
    }

    // For other routes, use default logic but skip dynamic segments
    items.push({
      label: "Dashboard",
      href: "/dashboard",
    });

    // Special handling for course-related routes
    if (pathSegments[0] === "course" && pathSegments[1] === "details") {
      items.push({
        label: "My Courses",
        href: "/course",
      });
      items.push({
        label: "Course Details",
      });
      return items;
    }

    // Process segments but skip dynamic ones and handle special cases
    const processedSegments = [];
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];

      // Skip dynamic segments (starting with : or numeric IDs)
      if (segment.startsWith(":") || /^\d+$/.test(segment)) continue;

      processedSegments.push(segment);
    }

    // Build breadcrumbs from processed segments
    let tempPath = "";
    for (let i = 0; i < processedSegments.length; i++) {
      const segment = processedSegments[i];
      tempPath += `/${segment}`;

      const label = overrides[segment] || formatBreadcrumbLabel(segment);

      if (label) {
        // Check if this segment should be hidden
        if (overrides.hide?.includes(segment)) continue;

        items.push({
          label,
          href: i === processedSegments.length - 1 ? undefined : tempPath, // Last item has no href
        });
      }
    }

    return items;
  }, [location.pathname, overrides]);

  return breadcrumbs;
};

export { useBreadcrumbs, formatBreadcrumbLabel };