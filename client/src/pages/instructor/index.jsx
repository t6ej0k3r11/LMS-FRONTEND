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
    <div className="flex h-full min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-lg hidden lg:block border-r border-gray-200">
        <div className="p-4 lg:p-6">
          <div className="flex items-center mb-6 lg:mb-8">
            <GraduationCap className="h-6 w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3 text-primary" />
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Instructor Panel</h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start transition-colors duration-200 text-sm lg:text-base"
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "default" : "ghost"}
                size="sm"
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : menuItem.onClick
                    ? menuItem.onClick
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage your courses and track student progress</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value} className="mt-4 lg:mt-6">
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
