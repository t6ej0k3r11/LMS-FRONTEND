import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { courseCategories } from "@/config";
import banner from "/banner-img.png";
import { StudentContext } from "@/context/student-context";
import { AuthContext } from "@/context/auth-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } = useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🧭 Navigate to Courses Page (by category)
  const handleNavigateToCoursesPage = (categoryId) => {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [categoryId],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  };

  // 📘 Handle course click (navigate based on purchase)
  const handleCourseNavigate = async (courseId) => {
    try {
      const response = await checkCoursePurchaseInfoService(courseId, auth?.user?._id);

      if (response?.success) {
        if (response.data.enrolled) {
          navigate(`/course-progress/${courseId}`);
        } else {
          navigate(`/course/details/${courseId}`);
        }
      } else {
        console.warn("Course navigation failed:", response?.message);
      }
    } catch (error) {
      console.error("Error navigating course:", error);
    }
  };

  // 📦 Fetch all available courses
  useEffect(() => {
    async function fetchAllStudentViewCourses() {
      try {
        const response = await fetchStudentViewCourseListService();
        if (response?.success) {
          setStudentViewCoursesList(response.data);
        } else {
          console.warn("Failed to fetch courses:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchAllStudentViewCourses();
  }, [setStudentViewCoursesList]);

  // =======================
  // 💻 JSX Rendering
  // =======================
  return (
    <div className="min-h-screen bg-white">
      {/* 🏠 Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between py-8 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl font-bold mb-4">Learning that gets you</h1>
          <p className="text-xl text-gray-700">
            Skills for your present and your future. Get started with us!
          </p>
        </div>

        <div className="lg:w-1/2 mb-8 lg:mb-0 flex justify-center">
          <img
            src={banner}
            alt="Learning banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
      </section>

      {/* 📚 Course Categories */}
      <section className="py-8 px-4 lg:px-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Course Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
              key={categoryItem.id}
              variant="outline"
              className="justify-start hover:bg-gray-200"
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
        </div>
      </section>

      {/* 🌟 Featured Courses */}
      <section className="py-12 px-4 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentViewCoursesList?.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem._id}
                onClick={() => handleCourseNavigate(courseItem._id)}
                className="border rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={courseItem.image}
                  alt={courseItem.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.src = '/banner-img.png'; // Fallback to banner image
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2 text-gray-800">
                    {courseItem.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {courseItem.instructorName}
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    ${courseItem.pricing}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-gray-500">No Courses Found</h1>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
