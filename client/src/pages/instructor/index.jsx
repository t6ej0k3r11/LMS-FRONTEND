import InstructorDashboard from "@/components/instructor-view/dashboard";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService, checkAuthService } from "@/services";
import WaitingForApproval from "./waiting-for-approval";
import { useContext, useEffect, useState } from "react";

function InstructorDashboardpage() {
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

    // Fetch courses if not already loaded
    if (!instructorCoursesList || instructorCoursesList.length === 0) {
      fetchAllCourses();
    }
  }, [setInstructorCoursesList, instructorCoursesList]);

  // Check if instructor is approved
  if (instructorStatus !== null && auth.user?.role === 'instructor' && instructorStatus !== 'approved') {
    return <WaitingForApproval status={instructorStatus} />;
  }

  console.log(instructorCoursesList, "instructorCoursesList");

  return (
    <div className="space-y-8">
      <InstructorDashboard listOfCourses={instructorCoursesList} />
    </div>
  );
}

export default InstructorDashboardpage;
