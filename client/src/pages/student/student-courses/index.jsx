import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService, getCurrentCourseProgressService, getStudentQuizzesByCourseService } from "@/services";
import { Watch, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const [courseProgress, setCourseProgress] = useState({});
  const [courseQuizzes, setCourseQuizzes] = useState({});

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);

      // Fetch progress and quizzes for each course
      const progressPromises = response.data.map(async (course) => {
        const progressResponse = await getCurrentCourseProgressService(auth?.user?._id, course.courseId);
        const quizzesResponse = await getStudentQuizzesByCourseService(course.courseId);
        return {
          courseId: course.courseId,
          progress: progressResponse?.success ? progressResponse.data : null,
          quizzes: quizzesResponse?.success ? quizzesResponse.data : []
        };
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      const quizzesMap = {};
      progressResults.forEach(result => {
        progressMap[result.courseId] = result.progress;
        quizzesMap[result.courseId] = result.quizzes;
      });

      setCourseProgress(progressMap);
      setCourseQuizzes(quizzesMap);
    }
    console.log(response);
  }
  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => {
            const progress = courseProgress[course.courseId];
            const quizzes = courseQuizzes[course.courseId] || [];
            const finalQuizzes = quizzes.filter(quiz => !quiz.lectureId);
            const completedFinalQuizzes = finalQuizzes.filter(quiz =>
              progress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
            ).length;

            const isCompleted = progress?.completed;
            const lecturesViewed = progress?.progress?.filter(p => p.viewed).length || 0;
            const totalLectures = progress?.courseDetails?.curriculum?.length || 0;

            return (
              <Card key={course.id} className="flex flex-col">
                <CardContent className="p-4 flex-grow">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="h-52 w-full object-cover rounded-md mb-4"
                  />
                  <h3 className="font-bold mb-1">{course?.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {course?.instructorName}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                    <span>Lectures: {lecturesViewed}/{totalLectures}</span>
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Quizzes: {progress?.quizzesProgress?.filter(q => q.completed).length || 0}/{quizzes.length}
                    </span>
                  </div>
                  {finalQuizzes.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs mb-2">
                      {completedFinalQuizzes === finalQuizzes.length ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={completedFinalQuizzes === finalQuizzes.length ? 'text-green-600' : 'text-yellow-600'}>
                        Final Quiz: {completedFinalQuizzes}/{finalQuizzes.length}
                      </span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-xs text-green-600 font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      <span>Course Completed</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() =>
                      navigate(`/course-progress/${course?.courseId}`)
                    }
                    className="flex-1"
                  >
                    <Watch className="mr-2 h-4 w-4" />
                    {isCompleted ? 'Review Course' : 'Continue Watching'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <h1 className="text-3xl font-bold">No Courses found</h1>
        )}
      </div>
    </div>
  );
}

export default StudentCoursesPage;
