import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import StudentPageLayout from "@/layouts/StudentPageLayout";

function StudentViewCommonLayout() {
  const location = useLocation();

  console.log("🔍 DEBUG: StudentViewCommonLayout rendering for path:", location.pathname);

  const hideHeader = location.pathname.includes("course-progress");

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_50%)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-10 w-72 h-72 rounded-full blur-3xl opacity-40 animate-float" style={{ background: "linear-gradient(135deg, hsla(var(--brand-red)/0.3), hsla(var(--brand-gold)/0.4))" }} />
        <div className="absolute top-24 left-[-60px] w-60 h-60 rounded-full blur-3xl opacity-35 animate-float" style={{ background: "linear-gradient(155deg, hsla(var(--brand-green)/0.45), hsla(var(--brand-green-bright)/0.25))" }} />
      </div>

      {!hideHeader && <StudentViewCommonHeader />}

      <StudentPageLayout>
        <section className="mx-auto max-w-7xl w-full">
          <Outlet />
        </section>
      </StudentPageLayout>
    </div>
  );
}

export default StudentViewCommonLayout;
