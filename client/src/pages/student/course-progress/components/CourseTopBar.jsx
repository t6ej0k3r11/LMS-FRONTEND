import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import PropTypes from "prop-types";

function CourseTopBar({
  courseTitle,
  overallProgress,
  completedLectures,
  totalLectures,
  onBack,
  onToggleSidebar
}) {
  CourseTopBar.propTypes = {
    courseTitle: PropTypes.string,
    overallProgress: PropTypes.number,
    completedLectures: PropTypes.number,
    totalLectures: PropTypes.number,
    onBack: PropTypes.func.isRequired,
    onToggleSidebar: PropTypes.func.isRequired
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and course title */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>

            <div className="h-6 w-px bg-gradient-to-b from-green-400 to-red-400"></div>

            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {courseTitle}
              </h1>
            </div>
          </div>

          {/* Right side - Progress and sidebar toggle */}
          <div className="flex items-center space-x-6">
            {/* Progress info */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
                  {overallProgress}%
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Lectures:</span>
                <span className="font-semibold text-gray-900">
                  {completedLectures}/{totalLectures}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="hidden lg:flex items-center space-x-3 min-w-48">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-green-400 to-red-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent min-w-12">
                {overallProgress}%
              </span>
            </div>

            {/* Sidebar toggle */}
            <Button
              onClick={onToggleSidebar}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-red-50 transition-all duration-200 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 via-green-400 to-red-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseTopBar;