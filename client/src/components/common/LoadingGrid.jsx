import CourseCardSkeleton from "./CourseCardSkeleton";
import PropTypes from 'prop-types';

function LoadingGrid({ count = 8, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}

LoadingGrid.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingGrid;