import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";

function StudentViewCommonLayout() {
  const location = useLocation();
  
  console.log("🔍 DEBUG: StudentViewCommonLayout rendering for path:", location.pathname);
  
  return (
    <div className="min-h-screen gradient-bg">
      {!location.pathname.includes("course-progress") ? (
        <StudentViewCommonHeader />
      ) : null}

      <main className="animate-fade-in">
        {/* Debug info - hidden in production */}
        {import.meta.env.DEV && (
          <div style={{ display: 'none' }}>
            Current path: {location.pathname}
            Layout mounted
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default StudentViewCommonLayout;
