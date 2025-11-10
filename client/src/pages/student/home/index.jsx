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
    <div className="min-h-screen">
      {/* 🏠 Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between py-12 px-4 lg:px-8">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 hero-text">Learning that gets you</h1>
          <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed">
            Skills for your present and your future. Get started with us!
          </p>
          <Button size="lg" className="btn-primary text-lg px-8 py-3">
            Explore Courses
          </Button>
        </div>

        <div className="lg:w-1/2 mb-8 lg:mb-0 flex justify-center">
          <img
            src={banner}
            alt="Learning banner"
            width={600}
            height={400}
            className="w-full h-auto rounded-2xl shadow-2xl object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>

      {/* 📚 Course Categories */}
      <section className="py-12 px-4 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center hero-text">Course Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {courseCategories.map((categoryItem) => (
              <Button
                key={categoryItem.id}
                variant="outline"
                className="justify-start hover:bg-white hover:shadow-lg transition-all duration-300 h-16 text-lg font-medium border-2 border-gray-200 hover:border-blue-300"
                onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
              >
                {categoryItem.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Featured Courses */}
      <section className="py-16 px-4 lg:px-8" aria-labelledby="featured-courses-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="featured-courses-heading" className="text-3xl font-bold mb-8 text-center hero-text">Featured Courses</h2>
          <div className="responsive-grid">
            {studentViewCoursesList?.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <div
                  key={courseItem._id}
                  onClick={() => handleCourseNavigate(courseItem._id)}
                  className="course-card cursor-pointer overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={courseItem.image}
                      alt={courseItem.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/banner-img.png'; // Fallback to banner image
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg leading-tight">
                      {courseItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      {courseItem.instructorName}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl text-blue-600">
                        ${courseItem.pricing}
                      </p>
                      <Button size="sm" className="btn-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h1 className="text-2xl text-gray-500 font-medium">No Courses Found</h1>
                <p className="text-gray-400 mt-2">Check back later for new courses!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
