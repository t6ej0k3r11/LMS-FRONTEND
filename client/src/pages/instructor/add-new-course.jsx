import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, ArrowLeft, BookOpen, FileText, Settings } from "lucide-react";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  createCourseDraftService,
  publishCourseService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
  fetchInstructorCourseListService,
} from "@/services";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

function AddNewCoursePage() {
  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    currentEditedCourseId,
    setCurrentEditedCourseId,
    setInstructorCoursesList,
  } = useContext(InstructorContext);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: "Course Details", icon: BookOpen, component: CourseLanding },
    { id: 2, title: "Curriculum", icon: FileText, component: CourseCurriculum },
    { id: 3, title: "Settings", icon: Settings, component: CourseSettings },
  ];

  console.log(params);

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === "" || value === null || value === undefined;
  }

  function validateFormData() {
    console.log("Validating form data...");
    console.log("Landing form data:", courseLandingFormData);
    console.log("Curriculum form data:", courseCurriculumFormData);

    const missingFields = [];

    // Check required landing page fields (exclude prerequisites as it's optional)
    const requiredLandingFields = ['title', 'category', 'level', 'primaryLanguage', 'courseType', 'subtitle', 'description', 'pricing', 'objectives', 'welcomeMessage'];
    for (const key of requiredLandingFields) {
      if (isEmpty(courseLandingFormData[key])) {
        missingFields.push(key);
      }
    }

    // Check curriculum
    if (!courseCurriculumFormData || courseCurriculumFormData.length === 0) {
      missingFields.push('curriculum (at least one lesson)');
    } else {
      let hasFreePreview = false;

      for (let i = 0; i < courseCurriculumFormData.length; i++) {
        const item = courseCurriculumFormData[i];
        if (isEmpty(item.title)) {
          missingFields.push(`Lesson ${i + 1} title`);
        }
        if (isEmpty(item.videoUrl)) {
          missingFields.push(`Lesson ${i + 1} video URL`);
        }
        if (isEmpty(item.public_id)) {
          missingFields.push(`Lesson ${i + 1} video file`);
        }

        if (item.freePreview) {
          hasFreePreview = true;
        }
      }

      if (!hasFreePreview) {
        missingFields.push('at least one free preview lesson');
      }
    }

    if (missingFields.length > 0) {
      console.log("Validation failed. Missing fields:", missingFields);
      return { isValid: false, missingFields };
    }

    console.log("Form validation passed!");
    return { isValid: true, missingFields: [] };
  }

  async function handleCreateCourse(action = "draft") {
    // Validate form data before submission
    const validation = validateFormData();
    if (!validation.isValid) {
      toast({
        title: "Cannot Submit Course",
        description: `Please complete the following required fields: ${validation.missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const courseFinalFormData = {
      instructorId: auth?.user?._id,
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      students: [],
      curriculum: courseCurriculumFormData,
      prerequisites: courseLandingFormData.prerequisites || [],
      status: action === "publish" && currentEditedCourseId === null ? "published" : "draft",
    };

    let response;
    try {
      if (currentEditedCourseId !== null) {
        // For editing existing courses
        response = await updateCourseByIdService(
          currentEditedCourseId,
          courseFinalFormData
        );
      } else {
        // For new courses
        if (action === "publish") {
          // First create as draft, then publish
          const draftResponse = await createCourseDraftService(courseFinalFormData);
          if (draftResponse?.success) {
            response = await publishCourseService(draftResponse.data._id);
          } else {
            response = draftResponse;
          }
        } else {
          response = await createCourseDraftService(courseFinalFormData);
        }
      }

      if (response?.success) {
        // Refresh the courses list in context
        const coursesResponse = await fetchInstructorCourseListService();
        if (coursesResponse?.success) {
          setInstructorCoursesList(coursesResponse.data);
        }

        const actionText = currentEditedCourseId !== null ? "updated" : (action === "publish" ? "published" : "saved as draft");
        toast({
          title: "Success",
          description: `Course ${actionText} successfully!`,
          variant: "default",
        });
        setCourseLandingFormData(courseLandingInitialFormData);
        setCourseCurriculumFormData(courseCurriculumInitialFormData);
        navigate(-1);
        setCurrentEditedCourseId(null);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to create/update course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Course creation/update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create/update course",
        variant: "destructive",
      });
    }

    console.log(courseFinalFormData, "courseFinalFormData");
  }

  useEffect(() => {
    const fetchCurrentCourseDetails = async () => {
      const response = await fetchInstructorCourseDetailsService(
        currentEditedCourseId
      );

      if (response?.success) {
        const setCourseFormData = Object.keys(
          courseLandingInitialFormData
        ).reduce((acc, key) => {
          acc[key] = response?.data[key] || courseLandingInitialFormData[key];

          return acc;
        }, {});

        console.log(setCourseFormData, response?.data, "setCourseFormData");
        setCourseLandingFormData(setCourseFormData);
        setCourseCurriculumFormData(response?.data?.curriculum);
      }

      console.log(response, "response");
    };

    if (currentEditedCourseId !== null) fetchCurrentCourseDetails();
  }, [currentEditedCourseId, setCourseLandingFormData, setCourseCurriculumFormData]);

  useEffect(() => {
    if (params?.courseId) setCurrentEditedCourseId(params?.courseId);
  }, [params?.courseId, setCurrentEditedCourseId]);

  console.log(params, currentEditedCourseId, "params");

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {currentEditedCourseId ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="text-muted-foreground">
          Build an engaging course for your students
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep > step.id
                    ? "bg-gradient-green text-white"
                    : currentStep === step.id
                    ? "bg-bangladesh-green text-white animate-pulse"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                    currentStep > step.id ? "bg-bangladesh-green" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="rounded-3xl border border-white/60 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1]?.icon, {
              className: "h-5 w-5 text-bangladesh-green"
            })}
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && <CurrentStepComponent />}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="rounded-2xl border-white/60 hover:bg-white/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleCreateCourse("draft")}
            className="rounded-2xl border-white/60 hover:bg-white/80"
          >
            Save as Draft
          </Button>
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              className="bg-gradient-green hover:shadow-lg hover:scale-105 transition-all duration-300 text-white rounded-2xl"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              disabled={!validateFormData().isValid}
              onClick={() => handleCreateCourse("publish")}
              className="bg-gradient-green hover:shadow-lg hover:scale-105 transition-all duration-300 text-white rounded-2xl disabled:opacity-50"
            >
              Submit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddNewCoursePage;
