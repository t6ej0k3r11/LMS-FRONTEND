import { useContext, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstructorContext } from "@/context/instructor-context";
import { fetchEnrolledStudentsService } from "@/services";
import { toast } from "@/hooks/use-toast";
import { Search, Filter, Users, Mail, Calendar, BookOpen, DollarSign, Eye, User } from "lucide-react";

function InstructorStudentsPage() {
  const { instructorCoursesList } = useContext(InstructorContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetchEnrolledStudentsService();
        if (response?.success) {
          setEnrolledStudents(response.data);
        } else {
          toast({
            title: "Error",
            description: response?.message || "Failed to fetch enrolled students",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching enrolled students",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    let filtered = enrolledStudents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (courseFilter !== "all") {
      filtered = filtered.filter(student =>
        student.enrolledCourses.some(course => course.title === courseFilter)
      );
    }

    return filtered;
  }, [enrolledStudents, searchTerm, courseFilter]);

  const courseOptions = useMemo(() => {
    const courses = new Set();
    enrolledStudents.forEach(student => {
      student.enrolledCourses.forEach(course => courses.add(course.title));
    });
    return Array.from(courses);
  }, [enrolledStudents]);

  const totalRevenue = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      return acc + student.enrolledCourses.reduce((courseAcc, course) => {
        const courseData = instructorCoursesList.find(c => c.title === course.title);
        return courseAcc + (courseData?.pricing || 0);
      }, 0);
    }, 0);
  }, [filteredStudents, instructorCoursesList]);

  const totalViews = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      return acc + student.enrolledCourses.reduce((courseAcc, course) => {
        return courseAcc + (course.rewatchCount || 0);
      }, 0);
    }, 0);
  }, [filteredStudents]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Students</h1>
        <p className="text-muted-foreground">Track and manage your enrolled students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-bangladesh-green">{filteredStudents.length}</p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(227,38,54,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-bangladesh-red">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold text-bangladesh-green">{totalViews.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-gradient-green p-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(227,38,54,0.15)] transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Revenue</p>
                <p className="text-3xl font-bold text-bangladesh-red">
                  ${filteredStudents.length > 0 ? (totalRevenue / filteredStudents.length).toFixed(0) : 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-red p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 rounded-2xl border-white/60 bg-white/80"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-48 rounded-2xl border-white/60 bg-white/80">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseOptions.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bangladesh-green" />
            Enrolled Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bangladesh-green mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/60">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Courses</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/40 hover:bg-white/60 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-green flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {student.enrolledCourses.slice(0, 2).map((course, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-full bg-bangladesh-green-light text-bangladesh-green text-xs font-medium"
                            >
                              {course.title}
                            </span>
                          ))}
                          {student.enrolledCourses.length > 2 && (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                              +{student.enrolledCourses.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-bangladesh-green">
                          ${student.enrolledCourses.reduce((acc, course) => {
                            const courseData = instructorCoursesList.find(c => c.title === course.title);
                            return acc + (courseData?.pricing || 0);
                          }, 0)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-sm">
                            {new Date(student.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="rounded-2xl hover:bg-bangladesh-green-light hover:text-bangladesh-green"
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm || courseFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Students will appear here once they enroll in your courses"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Profile Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border border-white/60 bg-white/90">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-green flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedStudent?.name}</h2>
                <p className="text-muted-foreground">{selectedStudent?.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Student profile and enrollment details
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl border border-white/60 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-bangladesh-green mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{selectedStudent.enrolledCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Courses</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/60 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 text-bangladesh-red mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      ${selectedStudent.enrolledCourses.reduce((acc, course) => {
                        const courseData = instructorCoursesList.find(c => c.title === course.title);
                        return acc + (courseData?.pricing || 0);
                      }, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/60 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 text-bangladesh-green mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {selectedStudent.enrolledCourses.reduce((acc, course) => acc + (course.rewatchCount || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Enrolled Courses</h3>
                <div className="space-y-3">
                  {selectedStudent.enrolledCourses.map((course, idx) => (
                    <Card key={idx} className="rounded-2xl border border-white/60 bg-white/80">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.rewatchCount || 0} views • Joined {new Date(course.enrolledAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-bangladesh-green">
                              ${instructorCoursesList.find(c => c.title === course.title)?.pricing || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorStudentsPage;