import { GraduationCap, TvMinimalPlay, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 glass-effect shadow-sm border-b border-gray-200 relative animate-fade-in" role="banner">
      <div className="flex items-center space-x-4 sm:space-x-6">
        <Link to="/home" className="flex items-center hover:text-primary transition-colors duration-200 nav-link accessible-focus rounded-lg p-2 -m-2" aria-label="Go to home page">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" aria-hidden="true" />
          <span className="font-bold text-lg sm:text-xl hero-text">
            LMS LEARN
          </span>
        </Link>
        <nav className="hidden lg:flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              location.pathname.includes("/courses")
                ? null
                : navigate("/courses");
            }}
            className="text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Explore Courses
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              location.pathname.includes("/student-courses")
                ? null
                : navigate("/student-courses");
            }}
            className="text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            My Courses
          </Button>
        </nav>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex gap-2 sm:gap-4 items-center">
          <div
            onClick={() => navigate("/student-courses")}
            className="flex cursor-pointer items-center gap-2 sm:gap-3 hover:text-primary transition-colors duration-200 nav-link"
          >
            <span className="font-semibold text-base sm:text-lg text-gray-700">
              My Courses
            </span>
            <TvMinimalPlay className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
