import { useCallback, useEffect, useContext, useMemo } from "react";
import PropTypes from 'prop-types';
import { StudentContext } from "@/context/student-context";
import { markLectureAsViewedService } from "@/services";

QuizPlayerFixed2.propTypes = {
  initialLecture: PropTypes.shape({
    _id: PropTypes.string,
    progressValue: PropTypes.number,
    videoUrl: PropTypes.string
  }),
  onProgressChange: PropTypes.func
};

QuizPlayerFixed2.defaultProps = {
  initialLecture: {},
  onProgressChange: () => {}
};

function QuizPlayerFixed2({ initialLecture, onProgressChange }) {
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress, auth } = useContext(StudentContext);

  // Wrap objects and functions in appropriate hooks to prevent unnecessary re-renders
  const currentLecture = useMemo(() => initialLecture || {}, [initialLecture]);
  const setLectureProgress = useCallback((value) => {
    onProgressChange?.(value);
  }, [onProgressChange]);
  
  // Wrap lectureProgress in useMemo to prevent unnecessary re-renders
  const lectureProgress = useMemo(() => ({}), []);

  const updateCourseProgress = useCallback(async (isRewatch = false) => {
    if (currentLecture) {
      console.log(isRewatch ? "Marking lecture as rewatch:" : "Marking lecture as viewed:", currentLecture._id);
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id,
        isRewatch
      );

      console.log("Mark lecture response:", response);
      if (response?.success) {
        // Don't call fetchCurrentCourseProgress() here
        // Instead, update local state directly
        if (!isRewatch) {
          setStudentCurrentCourseProgress(prev => ({
            ...prev,
            progress: prev.progress.map(p => 
              p.lectureId === currentLecture._id 
                ? { ...p, viewed: true }
                : p
            )
          }));
        }
        // Update local progress state
        setLectureProgress(prev => ({
          ...prev,
          [currentLecture._id]: 1
        }));
      }
    }
  }, [
    currentLecture, 
    auth?.user?._id, 
    studentCurrentCourseProgress?.courseDetails?._id,
    setStudentCurrentCourseProgress,
    setLectureProgress
  ]);

  useEffect(() => {
    // Update progress in real-time, but only mark as viewed when completed
    if (currentLecture?.progressValue === 1 && 
        !lectureProgress[currentLecture._id] && 
        !studentCurrentCourseProgress?.progress?.find(p => p.lectureId === currentLecture._id)?.viewed) {
      const isCompleted = studentCurrentCourseProgress?.completed;
      updateCourseProgress(isCompleted);
    }
  }, [currentLecture?.progressValue, currentLecture?._id, updateCourseProgress, studentCurrentCourseProgress, lectureProgress]);

  return null; // Placeholder return
}

export default QuizPlayerFixed2;