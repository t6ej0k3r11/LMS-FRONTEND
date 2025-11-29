import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle } from "lucide-react";
import { checkCoursePurchaseInfoService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useContext, useCallback } from "react";
import { AuthContext } from "@/context/auth-context";
import { getCompletedLecturesCount, isCourseCompleted } from "@/lib/progressUtils";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import ProgressBadge from "./ProgressBadge";
import CourseActions from "./CourseActions";

function CourseCard({ course, progress, quizzes }) {
  const { toast } = useToast();
  const { auth } = useContext(AuthContext);

  const finalQuizzes = quizzes.filter(quiz => !quiz.lectureId);
  const completedFinalQuizzes = finalQuizzes.filter(quiz =>
    progress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
  ).length;

  const isCompleted = isCourseCompleted(
    progress?.progress,
    progress?.courseDetails?.curriculum,
    null, // currentLecture
    {} // realTimeProgress
  );

  const lecturesViewed = getCompletedLecturesCount(
    progress?.progress,
    null, // currentLecture
    {} // realTimeProgress
  );

  const totalLectures = progress?.courseDetails?.curriculum?.length || 0;

  const handleCourseNavigate = useCallback(async (courseId) => {
    try {
      const response = await checkCoursePurchaseInfoService(courseId, auth?.user?._id);

      if (response?.success) {
        if (response.data.enrolled) {
          // Navigate to course progress
          window.location.href = `/course-progress/${courseId}`;
        } else {
          // Navigate to course details
          window.location.href = `/course/details/${courseId}`;
        }
      } else {
        console.warn("Course navigation failed:", response?.message);
      }
    } catch (error) {
      console.error("Error navigating course:", error);
      toast({
        title: "Error",
        description: "Failed to navigate to course. Please try again.",
        variant: "destructive",
      });
    }
  }, [auth?.user?._id, toast]);


  // Check if certificate is eligible (course completed + final quiz passed)
  const isCertificateEligible = isCompleted && completedFinalQuizzes === finalQuizzes.length && finalQuizzes.length > 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="flex flex-col card-hover shadow-sm border-0 bg-white touch-manipulation rounded-lg overflow-hidden"
      role="article"
      aria-labelledby={`course-title-${course?.courseId}`}
      aria-describedby={`course-status-${course?.courseId}`}
    >
      <div className="p-0 flex-grow">
        <div className="relative">
          <img
            src={course?.courseImage}
            alt={`Course thumbnail for ${course?.title}`}
            className="h-32 sm:h-40 lg:h-48 w-full object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = "/banner-img.png";
            }}
          />
          {isCertificateEligible && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white">
              <Award className="w-3 h-3 mr-1" />
              Certificate Ready
            </Badge>
          )}
        </div>
        <div className="p-3 sm:p-4 lg:p-6">
          <h3
            id={`course-title-${course?.courseId}`}
            className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2"
          >
            {course?.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            by {course?.instructorName}
          </p>

          {/* Progress Badge */}
          <ProgressBadge
            totalLectures={totalLectures}
            completedLectures={lecturesViewed}
            isCompleted={isCompleted}
            size="small"
          />

          {/* Quiz Progress */}
          {quizzes.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Quizzes: {progress?.quizzesProgress?.filter(q => q.completed).length || 0}/{quizzes.length} completed
            </div>
          )}

          {/* Final Quiz Status */}
          {finalQuizzes.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mt-2">
              {completedFinalQuizzes === finalQuizzes.length ? (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" aria-hidden="true" />
              ) : (
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-yellow-500" aria-hidden="true" />
              )}
              <span
                className={completedFinalQuizzes === finalQuizzes.length ? 'text-green-600 font-medium' : 'text-yellow-600'}
                aria-label={`Final quiz: ${completedFinalQuizzes} of ${finalQuizzes.length} completed`}
              >
                Final Quiz: {completedFinalQuizzes}/{finalQuizzes.length}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-6 pt-0">
        <CourseActions
          courseId={course?.courseId}
          isCompleted={isCompleted}
          onContinue={() => handleCourseNavigate(course?.courseId)}
          onViewDetails={() => window.location.href = `/course/details/${course?.courseId}`}
        />
        <div id={`course-status-${course?.courseId}`} className="sr-only">
          Course status: {isCompleted ? 'completed' : 'in-progress'}.
          {lecturesViewed} of {totalLectures} lectures completed.
          {progress?.quizzesProgress?.filter(q => q.completed).length || 0} of {quizzes.length} quizzes completed.
          {isCompleted && 'Course is completed.'}
          {isCertificateEligible && 'Certificate is available.'}
        </div>
      </div>
    </motion.div>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    courseImage: PropTypes.string,
    title: PropTypes.string.isRequired,
    instructorName: PropTypes.string,
  }).isRequired,
  progress: PropTypes.object,
  quizzes: PropTypes.array,
};

export default CourseCard;