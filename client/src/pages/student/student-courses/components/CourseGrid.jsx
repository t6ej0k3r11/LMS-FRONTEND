import CourseCard from "./CourseCard";
import LoadingGrid from "@/components/common/LoadingGrid";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

function CourseGrid({ courses, courseProgress, courseQuizzes, loading, error, onRetry }) {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingGrid count={8} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load courses"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No Courses Yet"
        message="Start your learning journey by exploring our course catalog"
        actionLabel="Browse Courses"
        onAction={() => navigate('/courses')}
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      {courses.map((course) => (
        <CourseCard
          key={course.courseId}
          course={course}
          progress={courseProgress[course.courseId]}
          quizzes={courseQuizzes[course.courseId] || []}
        />
      ))}
    </motion.div>
  );
}

CourseGrid.propTypes = {
  courses: PropTypes.array,
  courseProgress: PropTypes.object,
  courseQuizzes: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
};

export default CourseGrid;