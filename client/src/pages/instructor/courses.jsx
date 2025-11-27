import { useContext, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstructorContext } from "@/context/instructor-context";
import { useNavigate } from "react-router-dom";
import { fetchInstructorCourseListService } from "@/services";
import { Plus, Search, Filter, BookOpen, Users, DollarSign, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

function InstructorCoursesPage() {
  const navigate = useNavigate();
  const { instructorCoursesList, setCurrentEditedCourseId, setCourseLandingFormData, setCourseCurriculumFormData, setInstructorCoursesList } = useContext(InstructorContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchCourses = async () => {
      console.log("InstructorCoursesPage: Fetching courses...");
      const response = await fetchInstructorCourseListService();
      console.log("InstructorCoursesPage: Courses response =", response);
      console.log("InstructorCoursesPage: Response success =", response?.success);
      console.log("InstructorCoursesPage: Response data =", response?.data);
      if (response?.success) {
        console.log("InstructorCoursesPage: Setting courses list =", response?.data);
        console.log("InstructorCoursesPage: Courses count =", response?.data?.length);
        setInstructorCoursesList(response?.data);
      } else {
        console.log("InstructorCoursesPage: Failed to fetch courses");
        console.log("InstructorCoursesPage: Response message =", response?.message);
      }
    };

    fetchCourses();
  }, [setInstructorCoursesList]);

  const filteredAndSortedCourses = useMemo(() => {
    let filtered = instructorCoursesList || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(course => {
        if (statusFilter === "draft") return course.status === "draft";
        if (statusFilter === "pending") return course.approvalStatus === "pending";
        if (statusFilter === "approved") return course.approvalStatus === "approved";
        if (statusFilter === "rejected") return course.approvalStatus === "rejected";
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "students":
          return (b.students?.length || 0) - (a.students?.length || 0);
        case "revenue":
          return (b.students?.length || 0) * (b.pricing || 0) - (a.students?.length || 0) * (a.pricing || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [instructorCoursesList, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (course) => {
    const { status, approvalStatus } = course;

    if (approvalStatus === "approved") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-bangladesh-green-light text-bangladesh-green text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          Published
        </div>
      );
    } else if (approvalStatus === "rejected") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-bangladesh-red-light text-bangladesh-red text-xs font-medium">
          <XCircle className="h-3 w-3" />
          Rejected
        </div>
      );
    } else if (approvalStatus === "pending") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
          <Clock className="h-3 w-3" />
          Pending Review
        </div>
      );
    } else if (status === "draft") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
          <BookOpen className="h-3 w-3" />
          Draft
        </div>
      );
    }
    return null;
  };

  const handleCreateCourse = () => {
    setCurrentEditedCourseId(null);
    setCourseLandingFormData({
      title: "",
      description: "",
      category: "",
      level: "",
      pricing: "",
      image: null,
    });
    setCourseCurriculumFormData([]);
    navigate("/instructor/create-new-course");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Manage and track your course portfolio</p>
        </div>
        <Button
          onClick={handleCreateCourse}
          className="bg-gradient-green hover:shadow-lg hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-2xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 rounded-2xl border-white/60 bg-white/80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-2xl border-white/60 bg-white/80">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 rounded-2xl border-white/60 bg-white/80">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="students">Most Students</SelectItem>
                <SelectItem value="revenue">Highest Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredAndSortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourses.map((course) => (
            <Card
              key={course._id}
              className="rounded-3xl border border-white/60 bg-white/90 shadow-lg hover:shadow-[0_25px_65px_rgba(10,143,99,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-bangladesh-green transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.description || "No description available"}
                    </p>
                  </div>
                  {getStatusBadge(course)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-bangladesh-green" />
                    <span className="text-muted-foreground">{course.students?.length || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-bangladesh-red" />
                    <span className="text-muted-foreground">৳{course.pricing || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {course.students?.reduce((acc, student) => acc + (student.rewatchCount || 0), 0) || 0} total views
                  </span>
                </div>
                <div className="pt-2 border-t border-white/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-semibold text-bangladesh-green">
                      ৳{(course.students?.length || 0) * (course.pricing || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first course to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button
                onClick={handleCreateCourse}
                className="bg-gradient-green hover:shadow-lg hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-2xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Course
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default InstructorCoursesPage;