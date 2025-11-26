import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService, checkAuthService } from "@/services";
import WaitingForApproval from "./waiting-for-approval";
import { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [instructorStatus, setInstructorStatus] = useState(null);
  const { auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

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
    const tab = searchParams.get("tab");
    if (tab && (tab === "dashboard" || tab === "courses")) {
      setActiveTab(tab);
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tab);
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    if (instructorStatus === "approved" && !instructorCoursesList) {
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
  }, [instructorStatus, setInstructorCoursesList, instructorCoursesList]);

  // Check if instructor is approved
  if (instructorStatus !== null && auth.user?.role === 'instructor' && instructorStatus !== 'approved') {
    return <WaitingForApproval status={instructorStatus} />;
  }

  console.log(instructorCoursesList, "instructorCoursesList");

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Instructor Dashboard</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Manage your cohorts, review course performance, and jump into quiz management – all in a single Bangladesh-inspired workspace.
        </p>
      </div>

      {/* Dashboard Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <InstructorDashboard listOfCourses={instructorCoursesList} />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <InstructorCourses listOfCourses={instructorCoursesList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InstructorDashboardpage;
