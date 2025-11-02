import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { BookOpen, LogOut } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuizList from "@/components/instructor-view/quizzes/QuizList";

function QuizManagementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);
  const [activeTab, setActiveTab] = useState("quizzes");

  const isGeneralView = !courseId;
  const currentCourse = isGeneralView ? null : instructorCoursesList.find(course => course._id === courseId);

  useEffect(() => {
    const fetchAllCourses = async () => {
      const response = await fetchInstructorCourseListService();
      if (response?.success) setInstructorCoursesList(response?.data);
    };
    fetchAllCourses();
  }, [setInstructorCoursesList]);

  const handleLogout = () => {
    resetCredentials();
    sessionStorage.clear();
  };

  const menuItems = [
    {
      icon: BookOpen,
      label: "Quizzes",
      value: "quizzes",
      component: <QuizList courseId={courseId} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  if (isGeneralView) {
    // Show course selection screen
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Select Course for Quiz Management</h1>
                <p className="text-gray-600 mt-2">Choose a course to create or manage quizzes</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/instructor")}>
                Back to Dashboard
              </Button>
            </div>

            {instructorCoursesList && instructorCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructorCoursesList.map((course) => (
                  <div key={course._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        {course.students?.length || 0} students
                      </span>
                      <span className="text-sm text-gray-500">
                        ${course.pricing}
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/instructor/quiz-management/${course._id}`)}
                      className="w-full"
                    >
                      Manage Quizzes
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No Courses Found</h3>
                <p className="text-gray-600 mb-6">You need to create a course first before you can manage quizzes.</p>
                <Button onClick={() => navigate("/instructor/create-new-course")}>
                  Create Your First Course
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="flex h-full min-h-screen bg-gray-100">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Button onClick={() => navigate("/instructor")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Quiz Management</h2>
          {!isGeneralView && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-700">Course:</h3>
              <p className="text-sm text-gray-600">{currentCourse.title}</p>
            </div>
          )}
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start mb-2"
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Quiz Management</h1>
              {!isGeneralView && (
                <p className="text-gray-600 mt-2">{currentCourse.title}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/instructor")}
            >
              Back to Dashboard
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default QuizManagementPage;