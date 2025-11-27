import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, BookOpen } from "lucide-react";
import { fetchInstructorCourseListService } from "@/services";

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);
  const [hasPrerequisites, setHasPrerequisites] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  useEffect(() => {
    // Prerequisites in form data are stored as array of IDs
    const prereqIds = courseLandingFormData.prerequisites || [];
    setHasPrerequisites(prereqIds.length > 0);

    // Fetch course details for display
    const fetchPrerequisiteTitles = async () => {
      if (prereqIds.length > 0) {
        try {
          // For each prerequisite ID, we need to get the course title
          // Since we don't have a single API to get multiple courses by IDs,
          // we'll use the available courses list or fetch individually
          const updatedPrerequisites = prereqIds.map(id => {
            const course = availableCourses.find(c => c._id === id);
            return course ? { _id: id, title: course.title } : { _id: id, title: 'Unknown Course' };
          });
          setSelectedPrerequisites(updatedPrerequisites);
        } catch (error) {
          console.error('Error fetching prerequisite titles:', error);
          setSelectedPrerequisites(prereqIds.map(id => ({ _id: id, title: 'Error loading title' })));
        }
      } else {
        setSelectedPrerequisites([]);
      }
    };

    fetchPrerequisiteTitles();
  }, [courseLandingFormData.prerequisites, availableCourses]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetchInstructorCourseListService();
        if (response?.success) {
          // Filter out courses that are not approved/published and exclude current course if editing
          const filteredCourses = response.data.filter(course =>
            course.approvalStatus === 'approved' &&
            course.status === 'published' &&
            course._id !== courseLandingFormData._id
          );
          setAvailableCourses(filteredCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (hasPrerequisites) {
      fetchCourses();
    }
  }, [hasPrerequisites, courseLandingFormData._id]);

  const handlePrerequisiteToggle = (checked) => {
    setHasPrerequisites(checked);
    if (!checked) {
      setSelectedPrerequisites([]);
      setCourseLandingFormData(prev => ({
        ...prev,
        prerequisites: []
      }));
    }
  };

  const handleAddPrerequisite = (courseId) => {
    const currentPrereqIds = courseLandingFormData.prerequisites || [];
    if (!currentPrereqIds.includes(courseId) && currentPrereqIds.length < 5) {
      const newPrereqIds = [...currentPrereqIds, courseId];
      setCourseLandingFormData(prev => ({
        ...prev,
        prerequisites: newPrereqIds
      }));
    }
  };

  const handleRemovePrerequisite = (courseId) => {
    const currentPrereqIds = courseLandingFormData.prerequisites || [];
    const newPrereqIds = currentPrereqIds.filter(id => id !== courseId);
    setCourseLandingFormData(prev => ({
      ...prev,
      prerequisites: newPrereqIds
    }));
  };

  return (
    <div className="space-y-8">
      {/* Course Basic Info */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 to-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#F42A41] to-[#006A4E] rounded-t-3xl">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <FormControls
            formControls={courseLandingPageFormControls}
            formData={courseLandingFormData}
            setFormData={setCourseLandingFormData}
          />
        </CardContent>
      </Card>

      {/* Prerequisite Courses Section */}
      <Card className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 to-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#006A4E] to-[#F42A41] rounded-t-3xl">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Prerequisite Course Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="prerequisites-toggle"
                checked={hasPrerequisites}
                onCheckedChange={handlePrerequisiteToggle}
                className="data-[state=checked]:bg-[#006A4E]"
              />
              <Label htmlFor="prerequisites-toggle" className="text-lg font-medium text-foreground">
                Does this course require prerequisites?
              </Label>
            </div>

            {hasPrerequisites && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Select prerequisite courses (0-5 courses)
                  </Label>
                  <Select onValueChange={handleAddPrerequisite}>
                    <SelectTrigger className="rounded-2xl border-white/60 bg-white/70 hover:bg-white/90 transition-all duration-300">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses
                        .filter(course => !(courseLandingFormData.prerequisites || []).includes(course._id))
                        .map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPrerequisites.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Selected Prerequisites:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrerequisites.map(prereq => (
                        <Badge
                          key={prereq._id}
                          variant="secondary"
                          className="rounded-full px-4 py-2 bg-gradient-to-r from-[#006A4E]/10 to-[#F42A41]/10 text-foreground border border-white/40 hover:scale-105 transition-all duration-300"
                        >
                          <span className="mr-2">{prereq.title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePrerequisite(prereq._id)}
                            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
                  <p className="font-medium text-amber-800 mb-1">Note:</p>
                  <p>Students must complete all selected prerequisite courses before they can enroll in this course.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseLanding;
