import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  Play,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronRight,
  Clock,
  Trophy,
  Eye
} from "lucide-react";
import PropTypes from "prop-types";
import { isLectureCompleted } from "@/lib/progressUtils";

function CourseSidebar({
  curriculum = [],
  currentLecture,
  completedLessons = [],
  onLectureSelect,
  collapsed = false,
  courseQuizzes = [],
  completedQuizzes = [],
  courseId,
  realTimeProgress = {}
}) {
  CourseSidebar.propTypes = {
    curriculum: PropTypes.array,
    currentLecture: PropTypes.object,
    completedLessons: PropTypes.array,
    onLectureSelect: PropTypes.func.isRequired,
    collapsed: PropTypes.bool,
    courseQuizzes: PropTypes.array,
    completedQuizzes: PropTypes.array,
    courseId: PropTypes.string,
    realTimeProgress: PropTypes.object
  };

  const [expandedSections, setExpandedSections] = useState({});
  const [lectureProgress, setLectureProgress] = useState({});

  // Group curriculum by sections (if sections exist) or treat as single section
  const sections = curriculum.length > 0 ? [{
    title: "Course Content",
    lectures: curriculum
  }] : [];

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const formatDuration = (duration) => {
    if (!duration) return "5 min";
    // Assuming duration is in minutes
    return `${duration} min`;
  };

  if (collapsed) {
    return (
      <div className="fixed left-0 top-16 bottom-0 w-16 bg-white border-r border-gray-200 shadow-lg z-40">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {curriculum.map((lecture, index) => {
              const isCompleted = completedLessons.includes(lecture._id);
              const isCurrent = currentLecture?._id === lecture._id;

              return (
                <button
                  key={lecture._id}
                  onClick={() => onLectureSelect(lecture)}
                  className={`w-full p-2 rounded-lg transition-all duration-200 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-green-100 to-red-100 border-2 border-green-500 shadow-md'
                      : isCompleted
                        ? 'bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150'
                        : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                  }`}
                  title={lecture.title}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Play className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-xs text-center leading-tight font-medium">
                      {index + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-gray-200 shadow-xl z-40">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
          </div>

          <div className="space-y-2">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {section.title}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {section.lectures.length} lectures
                    </span>
                  </div>
                  {expandedSections[sectionIndex] ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {expandedSections[sectionIndex] && (
                  <div className="bg-white">
                    {section.lectures.map((lecture, lectureIndex) => {
                      const isCompleted = isLectureCompleted(lecture._id, [], realTimeProgress) ||
                                          completedLessons.includes(lecture._id) ||
                                          (lectureProgress[lecture._id]?.completed);
                      const isCurrent = currentLecture?._id === lecture._id;
                      const lectureQuizzes = courseQuizzes.filter(quiz => quiz.lectureId === lecture._id);
                      const progress = lectureProgress[lecture._id];
                      const progressValue = realTimeProgress[lecture._id] || progress?.progressValue || 0;
                      const hasProgress = progressValue > 0 && progressValue < 1;

                      return (
                        <div key={lecture._id}>
                          <button
                            onClick={() => onLectureSelect(lecture)}
                            className={`w-full flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-red-50 transition-colors duration-200 border-l-4 ${
                              isCurrent
                                ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-red-50'
                                : isCompleted
                                  ? 'border-l-green-500 bg-gradient-to-r from-green-25 to-green-50'
                                  : hasProgress
                                    ? 'border-l-blue-400 bg-gradient-to-r from-blue-25 to-blue-50'
                                    : 'border-l-transparent'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-100'
                                : isCurrent
                                  ? 'bg-green-500'
                                  : hasProgress
                                    ? 'bg-blue-100'
                                    : 'bg-gray-100'
                            }`}>
                              {isCompleted ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : hasProgress ? (
                                <Eye className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Play className="h-3 w-3 text-gray-600" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-sm font-medium truncate ${
                                  isCurrent ? 'text-green-700' : 'text-gray-900'
                                }`}>
                                  {lecture.title}
                                </span>
                                {isCurrent && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Play className="h-3 w-3" />
                                  <span>Lecture {lectureIndex + 1}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(lecture.duration)}</span>
                                </div>
                              </div>
                              {/* Progress bar for lectures with progress */}
                              {hasProgress && !isCompleted && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressValue * 100}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Show associated quizzes */}
                          {lectureQuizzes.map((quiz) => {
                            const isQuizCompleted = completedQuizzes.includes(quiz._id);
                            const isQuizValid = quiz.isValid !== false;

                            return (
                              <button
                                key={quiz._id}
                                onClick={() => isQuizValid && window.open(`/quiz-player/${quiz._id}`, '_blank')}
                                className={`w-full flex items-center space-x-3 p-3 ml-11 hover:bg-gray-50 transition-colors duration-200 border-l-2 ${
                                  isQuizValid
                                    ? 'border-l-blue-300 cursor-pointer'
                                    : 'border-l-gray-300 cursor-not-allowed'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                  isQuizCompleted && isQuizValid
                                    ? 'bg-green-100'
                                    : isQuizValid
                                      ? 'bg-blue-100'
                                      : 'bg-gray-100'
                                }`}>
                                  {isQuizCompleted && isQuizValid ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : isQuizValid ? (
                                    <BookOpen className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <Lock className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                  <span className={`text-xs font-medium truncate ${
                                    isQuizValid ? 'text-gray-700' : 'text-gray-400'
                                  }`}>
                                    Quiz: {quiz.title}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    {isQuizValid
                                      ? (isQuizCompleted ? 'Completed' : 'Available')
                                      : 'Quiz has issues'
                                    }
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Final quizzes section */}
            {courseQuizzes.filter(quiz => !quiz.lectureId).length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Final Assessments</span>
                  </div>
                </div>

                <div className="bg-white">
                  {courseQuizzes.filter(quiz => !quiz.lectureId).map((quiz) => {
                    const isQuizCompleted = completedQuizzes.includes(quiz._id);
                    const isQuizValid = quiz.isValid !== false;

                    return (
                      <button
                        key={quiz._id}
                        onClick={() => isQuizValid && window.open(`/quiz-player/${quiz._id}`, '_blank')}
                        className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors duration-200 border-l-4 ${
                          isQuizValid
                            ? 'cursor-pointer border-l-purple-500'
                            : 'cursor-not-allowed border-l-gray-300'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isQuizCompleted && isQuizValid
                            ? 'bg-green-100'
                            : isQuizValid
                              ? 'bg-purple-100'
                              : 'bg-gray-100'
                        }`}>
                          {isQuizCompleted && isQuizValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : isQuizValid ? (
                            <BookOpen className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <span className={`text-sm font-medium truncate ${
                            isQuizValid ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {quiz.title}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {isQuizValid
                              ? (isQuizCompleted ? 'Completed' : 'Final Quiz')
                              : 'Quiz has issues'
                            }
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default CourseSidebar;