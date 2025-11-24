import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import ChatPage from "@/pages/chat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService, checkAuthService } from "@/services";
import { BarChart, Book, LogOut, FileQuestion, AlignJustify, X, MessageCircle } from "lucide-react";
import logoImage from "@/assets/logo.jpg";
import WaitingForApproval from "./waiting-for-approval";
import NotificationDropdown from "@/components/common/notification-dropdown";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [instructorStatus, setInstructorStatus] = useState(null);
  const { resetCredentials, auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await checkAuthService();
        if (response.success) {
          setInstructorStatus(response.data.user.instructorStatus);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (instructorStatus === "approved") {
      const fetchAllCourses = async () => {
        console.log("InstructorDashboard: Fetching courses...");
        const response = await fetchInstructorCourseListService();
        console.log("InstructorDashboard: Courses response =", response);
        console.log("InstructorDashboard: Response success =", response?.success);
        console.log("InstructorDashboard: Response data =", response?.data);
        if (response?.success) {
          console.log("InstructorDashboard: Setting courses list =", response?.data);
          console.log("InstructorDashboard: Courses count =", response?.data?.length);
          setInstructorCoursesList(response?.data);
        } else {
          console.log("InstructorDashboard: Failed to fetch courses");
          console.log("InstructorDashboard: Response message =", response?.message);
        }
      };

      fetchAllCourses();
    }
  }, [instructorStatus, setInstructorCoursesList]);

  // Check if instructor is approved
  if (instructorStatus !== null && auth.user?.role === 'instructor' && instructorStatus !== 'approved') {
    return <WaitingForApproval status={instructorStatus} />;
  }

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: MessageCircle,
      label: "Messages",
      value: "messages",
      component: <ChatPage />,
    },
    {
      icon: FileQuestion,
      label: "Quizzes",
      value: "quizzes",
      component: null,
      onClick: () => navigate("/instructor/quiz-management"),
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  console.log(instructorCoursesList, "instructorCoursesList");

  const renderNav = (className = "") => (
    <nav className={`space-y-2 sm:space-y-3 ${className}`}>
      {menuItems.map((menuItem) => (
        <Button
          className={`w-full justify-start rounded-2xl transition-all duration-300 text-sm hover:scale-[1.01] ${
            activeTab === menuItem.value
              ? "bg-gradient-to-r from-[hsl(var(--brand-green))] to-[hsl(var(--brand-red))] text-white shadow-lg"
              : "bg-white/5 text-foreground hover:bg-white/20"
          }`}
          key={menuItem.value}
          variant="ghost"
          size="sm"
          onClick={() => {
            if (menuItem.value === "logout") {
              handleLogout();
            } else if (menuItem.onClick) {
              menuItem.onClick();
            } else {
              setActiveTab(menuItem.value);
            }
            setShowMobileNav(false);
          }}
        >
          <menuItem.icon className="mr-3 h-4 w-4" />
          {menuItem.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="relative flex h-full min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)]">
      <aside className="hidden lg:block w-64 glass-effect border-r border-white/20 px-6 py-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="DeshGory logo"
                className="h-12 w-12 rounded-2xl shadow-lg object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Instructor</p>
                <h2 className="text-2xl font-bold text-foreground">DeshGory</h2>
              </div>
            </div>
          </div>
          {renderNav()}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Instructor HQ</p>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Manage your cohorts, review course performance, and jump into quiz management – all in a single Bangladesh-inspired workspace.
              </p>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <NotificationDropdown />
              <Button variant="secondary" className="rounded-full" onClick={() => navigate("/instructor/create-new-course")}>
                New Course
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl border border-white/40" onClick={() => setShowMobileNav((prev) => !prev)}>
                {showMobileNav ? <X className="h-5 w-5" /> : <AlignJustify className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {showMobileNav && (
            <div className="mb-6 rounded-3xl border border-white/40 glass-effect p-4 animate-slide-up lg:hidden">
              {renderNav("space-y-3")}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value} className="mt-4">
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
