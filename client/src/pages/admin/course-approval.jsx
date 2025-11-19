import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { CheckCircle, XCircle, Eye, BookOpen, User, Calendar } from "lucide-react";
import { getPendingCoursesService, reviewCourseService } from "../../services";

function CourseApproval() {
  const { toast } = useToast();
  const [pendingCourses, setPendingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null); // eslint-disable-line no-unused-vars
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);

  // Fetch pending courses from API
  useEffect(() => {
    const fetchPendingCourses = async () => {
      try {
        setFetchingCourses(true);
        const response = await getPendingCoursesService();
        if (response.success) {
          setPendingCourses(response.data.courses);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch pending courses",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching pending courses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pending courses",
          variant: "destructive",
        });
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchPendingCourses();
  }, [toast]);

  const handleApprove = async (courseId) => {
    setLoading(true);
    try {
      const response = await reviewCourseService(courseId, { action: "approve" });

      if (response.success) {
        // Update local state
        setPendingCourses(prev =>
          prev.filter(course => course._id !== courseId)
        );

        toast({
          title: "Course Approved",
          description: "The course has been approved. The instructor can now publish it.",
        });
      } else {
        throw new Error(response.message || "Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (courseId) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await reviewCourseService(courseId, {
        action: "reject",
        rejectionReason: rejectionReason.trim()
      });

      if (response.success) {
        // Update local state
        setPendingCourses(prev =>
          prev.filter(course => course._id !== courseId)
        );

        setRejectionReason("");
        setSelectedCourse(null);

        toast({
          title: "Course Rejected",
          description: "The course has been rejected and the instructor has been notified.",
        });
      } else {
        throw new Error(response.message || "Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Approval
          </h1>
          <p className="text-gray-600">
            Review and approve courses submitted by instructors before they go live.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">5</div>
              <p className="text-xs text-muted-foreground">
                Courses approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-xs text-muted-foreground">
                Courses rejected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          {fetchingCourses ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading pending courses...</p>
              </CardContent>
            </Card>
          ) : pendingCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Courses
                </h3>
                <p className="text-gray-500">
                  All courses have been reviewed. Check back later for new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {course.instructorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(course.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          Pending Approval
                        </Badge>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{course.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Instructor</h4>
                            <p className="text-sm text-gray-600">
                              {course.instructorName} ({course.instructorEmail})
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-gray-700">{course.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Category</h4>
                              <p className="text-sm text-gray-600">{course.category}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Level</h4>
                              <p className="text-sm text-gray-600">{course.level}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleApprove(course._id)}
                      disabled={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Course</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Please provide a reason for rejecting &quot;{course.title}&quot;.
                            This will be sent to the instructor.
                          </p>
                          <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                          />
                          <div className="flex gap-3 justify-end">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(course._id)}
                              disabled={loading || !rejectionReason.trim()}
                            >
                              Reject Course
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseApproval;