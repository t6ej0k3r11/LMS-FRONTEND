import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit, FileQuestion } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCourseService, fetchInstructorCourseListService, publishCourseService } from "@/services";
import { toast } from "@/hooks/use-toast";

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    setInstructorCoursesList,
  } = useContext(InstructorContext);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingCourseId, setPublishingCourseId] = useState(null);

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteCourseService(courseToDelete._id);

      if (response?.success) {
        // Refresh the courses list
        const updatedResponse = await fetchInstructorCourseListService();
        if (updatedResponse?.success) {
          setInstructorCoursesList(updatedResponse.data);
        }

        toast({
          title: "Success",
          description: "Course deleted successfully",
        });

        setShowDeleteDialog(false);
        setCourseToDelete(null);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the course",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      setPublishingCourseId(courseId);
      const response = await publishCourseService(courseId);

      if (response?.success) {
        // Refresh the courses list
        const updatedResponse = await fetchInstructorCourseListService();
        if (updatedResponse?.success) {
          setInstructorCoursesList(updatedResponse.data);
        }

        toast({
          title: "Success",
          description: response?.message || "Course submitted for review successfully!",
        });
      } else {
        // Handle different error scenarios
        let errorMessage = response?.message || "Failed to submit course for review";

        if (errorMessage.includes("required fields")) {
          errorMessage = "Please ensure your course has a title, description, and at least one lesson.";
        } else if (errorMessage.includes("already submitted")) {
          errorMessage = "This course is already submitted for review.";
        }

        toast({
          title: "Cannot Publish Course",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      toast({
        title: "Error",
        description: "An error occurred while publishing the course",
        variant: "destructive",
      });
    } finally {
      setPublishingCourseId(null);
    }
  };

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const getStatusBadge = (course) => {
    const { status, approvalStatus } = course;

    // Check approvalStatus first as it's the source of truth for admin decisions
    if (approvalStatus === "approved") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Approved (Published)
        </span>
      );
    } else if (approvalStatus === "rejected") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          Rejected
        </span>
      );
    } else if (approvalStatus === "pending") {
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Submitted (Pending Review)
        </span>
      );
    } else if (status === "draft") {
      return (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
          Draft
        </span>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-[32px] border-white/50 bg-white/90 shadow-[0_30px_70px_rgba(5,41,30,0.12)]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold text-foreground">Instructor Courses</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage every cohort, enrollment count, and quiz from one curated view.
          </p>
        </div>
        <Button
          onClick={() => {
            setCurrentEditedCourseId(null);
            setCourseLandingFormData(courseLandingInitialFormData);
            setCourseCurriculumFormData(courseCurriculumInitialFormData);
            navigate("/instructor/create-new-course");
          }}
          className="btn-primary px-6 py-3"
        >
          Create New Course
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/70">
                <TableHead className="text-muted-foreground">Course</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Students</TableHead>
                <TableHead className="text-muted-foreground">Revenue</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfCourses && listOfCourses.length > 0
                ? listOfCourses.map((course) => (
                    <TableRow
                      key={course._id}
                      className="border-white/60 bg-white/70 transition-colors hover:bg-white"
                    >
                      <TableCell className="font-semibold text-foreground">
                        {course?.title}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(course)}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-[hsla(var(--brand-green)/0.15)] px-3 py-1 text-sm font-medium text-primary">
                          {course?.students?.length}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-[hsl(var(--brand-green))]">
                        ৳{course?.students?.length * course?.pricing}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {course?.status === "draft" && (
                            <Button
                              onClick={() => handlePublishCourse(course._id)}
                              disabled={publishingCourseId === course._id}
                              variant="ghost"
                              size="sm"
                              className="rounded-2xl bg-white/70 text-green-600 hover:text-green-700"
                            >
                              {publishingCourseId === course._id ? "Submitting..." : "Submit for Review"}
                            </Button>
                          )}
                          <Button
                            onClick={() => navigate(`/instructor/edit-course/${course?._id}`)}
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl bg-white/70 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => navigate(`/instructor/quiz-management/${course?._id}`)}
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl bg-white/70 text-muted-foreground hover:text-[hsl(var(--brand-red))]"
                          >
                            <FileQuestion className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(course)}
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl bg-white/70 text-[hsl(var(--brand-red))] hover:text-[hsl(var(--brand-red-deep))]"
                          >
                            <Delete className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No courses found. Create your first course to get started!
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the course &ldquo;{courseToDelete?.title}&rdquo;?
              This action cannot be undone and will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The course and all its content</li>
                <li>All associated quizzes and quiz attempts</li>
                <li>All student progress records</li>
                <li>All purchase records and revenue data</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

InstructorCourses.propTypes = {
  listOfCourses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      students: PropTypes.array,
      pricing: PropTypes.number,
      status: PropTypes.string,
      approvalStatus: PropTypes.string,
    })
  ).isRequired,
};

export default InstructorCourses;
