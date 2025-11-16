import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { BarChart, Book, LogOut, FileQuestion, GraduationCap } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [setInstructorCoursesList]);

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

  return (
    <div className="flex h-full min-h-screen gradient-bg">
      <aside className="w-48 sm:w-56 lg:w-64 glass-effect shadow-xl hidden lg:block border-r border-white/20">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3 hero-text" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold hero-text">Instructor Panel</h2>
          </div>
          <nav className="space-y-2 sm:space-y-3">
            {menuItems.map((menuItem) => (
              <Button
                className={`w-full justify-start transition-all duration-300 text-xs sm:text-sm lg:text-base hover:scale-105 ${
                  activeTab === menuItem.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-white/10 text-gray-700 hover:text-blue-600'
                }`}
                key={menuItem.value}
                variant="ghost"
                size="sm"
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : menuItem.onClick
                    ? menuItem.onClick
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 lg:mr-3 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold hero-text mb-2">Dashboard</h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage your courses and track student progress</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value} className="mt-3 sm:mt-4 lg:mt-6">
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
