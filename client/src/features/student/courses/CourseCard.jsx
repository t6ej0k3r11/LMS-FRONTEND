import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Watch, BookOpen, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { progressCalculator } from '../utils/progressCalculator';
import { ProgressBadge } from './ProgressBadge';
import { CourseActions } from './CourseActions';
import PropTypes from 'prop-types';

export const CourseCard = ({ course, progress, quizzes, onNavigate }) => {
  const finalQuizzes = quizzes.filter(quiz => !quiz.lectureId);
  const completedFinalQuizzes = finalQuizzes.filter(quiz =>
    progress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
  ).length;

  const isCompleted = progress?.completed || progress?.isCompleted;
  const lecturesViewed = progress?.progress?.filter(p => p.viewed).length || 0;
  const totalLectures = progress?.courseDetails?.curriculum?.length || 0;

  // Calculate course progress percentage
  const courseProgressPercent = progressCalculator.calculateCourseProgress(
    progress,
    progress?.courseDetails?.curriculum
  );

  const handleNavigate = () => {
    onNavigate(course.courseId);
  };

  return (
    <Card className="flex flex-col card-hover shadow-sm border-0 bg-white fade-in-up">
      <CardContent className="p-0 flex-grow">
        <div className="relative">
          <img
            src={course?.courseImage}
            alt={course?.title}
            className="h-32 sm:h-40 lg:h-48 w-full object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
          />

          {/* Certificate badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                <Award className="h-3 w-3" />
                Certificate
              </Badge>
            </div>
          )}

          {/* Progress badge */}
          <div className="absolute bottom-2 left-2">
            <ProgressBadge progress={courseProgressPercent} />
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2">
            {course?.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            by {course?.instructorName}
          </p>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <Watch className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
                Lectures: {lecturesViewed}/{totalLectures}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
                Quizzes: {progress?.quizzesProgress?.filter(q => q.completed).length || 0}/{quizzes.length}
              </span>
            </div>

            {finalQuizzes.length > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                {completedFinalQuizzes === finalQuizzes.length ? (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                )}
                <span className={completedFinalQuizzes === finalQuizzes.length ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                  Final Quiz: {completedFinalQuizzes}/{finalQuizzes.length}
                </span>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-green-600 font-semibold bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Course Completed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 lg:p-6 pt-0">
        <CourseActions
          courseId={course.courseId}
          isCompleted={isCompleted}
          onNavigate={handleNavigate}
        />
      </CardFooter>
    </Card>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    courseImage: PropTypes.string,
    instructorName: PropTypes.string,
  }).isRequired,
  progress: PropTypes.object,
  quizzes: PropTypes.array,
  onNavigate: PropTypes.func.isRequired,
};