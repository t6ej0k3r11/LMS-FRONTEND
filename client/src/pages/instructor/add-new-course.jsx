import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/services";
import { useContext, useEffect } from "react";
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
  } = useContext(InstructorContext);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();

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

    for (const key in courseLandingFormData) {
      if (isEmpty(courseLandingFormData[key])) {
        console.log(`Landing form validation failed: ${key} is empty`);
        return false;
      }
    }

    let hasFreePreview = false;

    for (const item of courseCurriculumFormData) {
      if (
        isEmpty(item.title) ||
        isEmpty(item.videoUrl) ||
        isEmpty(item.public_id)
      ) {
        console.log(`Curriculum validation failed: missing required field in item`, item);
        return false;
      }

      if (item.freePreview) {
        hasFreePreview = true; //found at least one free preview
      }
    }

    if (!hasFreePreview) {
      console.log("Validation failed: no free preview found");
      return false;
    }

    console.log("Form validation passed!");
    return true;
  }

  async function handleCreateCourse(action = "draft") {
    const courseFinalFormData = {
      instructorId: auth?.user?._id,
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      students: [],
      curriculum: courseCurriculumFormData,
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-extrabold mb-5">Create a new course</h1>
        <div className="flex gap-3">
          <Button
            disabled={!validateFormData()}
            variant="outline"
            className="text-sm tracking-wider font-bold px-6"
            onClick={() => handleCreateCourse("draft")}
          >
            Save as Draft
          </Button>
          <Button
            disabled={!validateFormData()}
            className="text-sm tracking-wider font-bold px-6"
            onClick={() => handleCreateCourse("publish")}
          >
            Submit for Review
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <div className="container mx-auto p-4">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum">
                <CourseCurriculum />
              </TabsContent>
              <TabsContent value="course-landing-page">
                <CourseLanding />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettings />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddNewCoursePage;
