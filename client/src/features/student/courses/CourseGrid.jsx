import { Button } from '../../../components/ui/button';
import { BookOpen, RefreshCw } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from '../components/Skeleton';
import PropTypes from 'prop-types';

export const CourseGrid = ({
  courses,
  courseProgress,
  courseQuizzes,
  loading,
  onRefresh,
  onNavigateToCourse,
  onBrowseCourses
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
        <p className="text-gray-600 mb-6">
          Start your learning journey by exploring our course catalog
        </p>
        <Button onClick={onBrowseCourses} className="btn-primary">
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            progress={courseProgress[course.courseId]}
            quizzes={courseQuizzes[course.courseId] || []}
            onNavigate={onNavigateToCourse}
          />
        ))}
      </div>
    </div>
  );
};

CourseGrid.propTypes = {
  courses: PropTypes.array.isRequired,
  courseProgress: PropTypes.object.isRequired,
  courseQuizzes: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onNavigateToCourse: PropTypes.func.isRequired,
  onBrowseCourses: PropTypes.func.isRequired,
};