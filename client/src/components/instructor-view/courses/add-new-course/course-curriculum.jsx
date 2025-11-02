import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload, FileQuestion } from "lucide-react";
import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);
  const navigate = useNavigate();

  function handleNewLecture() {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];

    console.log("DEBUG: Starting single video upload");
    console.log("DEBUG: Selected file:", {
      name: selectedFile?.name,
      size: selectedFile?.size,
      type: selectedFile?.type,
      sizeMB: selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : null
    });

    if (selectedFile) {
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      console.log("DEBUG: Client-side validation - maxSize:", maxSize, "fileSize:", selectedFile.size);
      if (selectedFile.size > maxSize) {
        console.log("DEBUG: File size validation failed on client");
        alert("File size exceeds 100MB limit. Please choose a smaller file.");
        return;
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      console.log("DEBUG: Client-side validation - allowedTypes:", allowedTypes, "fileType:", selectedFile.type);
      if (!allowedTypes.includes(selectedFile.type)) {
        console.log("DEBUG: File type validation failed on client");
        alert("Please select a valid video file (MP4, WebM, or OGV).");
        return;
      }

      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);
      console.log("DEBUG: FormData created with file");

      try {
        console.log("DEBUG: Calling mediaUploadService");
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          videoFormData,
          setMediaUploadProgressPercentage
        );
        console.log("DEBUG: mediaUploadService response:", response);

        if (response.success) {
          console.log("DEBUG: Upload successful, updating form data");
          let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
          cpyCourseCurriculumFormData[currentIndex] = {
            ...cpyCourseCurriculumFormData[currentIndex],
            videoUrl: response?.data?.url,
            public_id: response?.data?.public_id,
          };
          setCourseCurriculumFormData(cpyCourseCurriculumFormData);
          setMediaUploadProgress(false);
        } else {
          console.log("DEBUG: Upload failed - response.success is false");
          console.log("DEBUG: Response details:", response);
          alert("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("DEBUG: Error uploading video:", error);
        console.error("DEBUG: Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        alert("Failed to upload video. Please check your connection and try again.");
        setMediaUploadProgress(false);
      }
    } else {
      console.log("DEBUG: No file selected");
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    if (deleteCurrentMediaResponse?.success) {
      cpyCourseCurriculumFormData[currentIndex] = {
        ...cpyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  function isCourseCurriculumFormDataValid() {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  }

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      return Object.entries(obj).every(([, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);

    // Validate files
    const maxSize = 100 * 1024 * 1024; // 100MB per file
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    for (const file of selectedFiles) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 100MB limit. Please choose smaller files.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported video format. Please use MP4, WebM, or OGV.`);
        return;
      }
    }

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      console.log(response, "bulk");
      if (response?.success) {
        let cpyCourseCurriculumFormdata =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        cpyCourseCurriculumFormdata = [
          ...cpyCourseCurriculumFormdata,
          ...(response?.data?.map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${
              cpyCourseCurriculumFormdata.length + (index + 1)
            }`,
            freePreview: false,
          })) || []),
        ];
        setCourseCurriculumFormData(cpyCourseCurriculumFormdata);
        setMediaUploadProgress(false);
      } else {
        alert("Bulk upload failed. Please try again.");
        setMediaUploadProgress(false);
      }
    } catch (e) {
      console.error("Error in bulk upload:", e);
      alert("Failed to upload videos. Please check your connection and try again.");
      setMediaUploadProgress(false);
    }
  }

  async function handleDeleteLecture(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentSelectedVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const response = await mediaDeleteService(getCurrentSelectedVideoPublicId);

    if (response?.success) {
      cpyCourseCurriculumFormData = cpyCourseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );

      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Create Course Curriculum</CardTitle>
        <div>
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer"
            onClick={handleOpenBulkUploadDialog}
          >
            <Upload className="w-4 h-5 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
          onClick={handleNewLecture}
        >
          Add Lecture
        </Button>
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div key={index} className="border p-5 rounded-md">
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="max-w-96"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                  />
                  <Label htmlFor={`freePreview-${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-6">
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex gap-3">
                        <VideoPlayer
                          url={courseCurriculumFormData[index]?.videoUrl}
                          width="450px"
                          height="200px"
                        />
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleReplaceVideo(index)}>
                            Replace Video
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Navigate to quiz creation for this specific lecture
                              const courseId = window.location.pathname.split('/')[3]; // Extract courseId from URL
                              navigate(`/instructor/create-quiz/${courseId}?lectureId=${courseCurriculumFormData[index]._id || 'new'}`);
                            }}
                          >
                            <FileQuestion className="w-4 h-4 mr-2" />
                            Add Quiz
                          </Button>
                          <Button
                            onClick={() => handleDeleteLecture(index)}
                            className="bg-red-900"
                          >
                            Delete Lecture
                          </Button>
                        </div>
                      </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`video-upload-${index}`}>Upload Video</Label>
                    <Input
                      id={`video-upload-${index}`}
                      type="file"
                      accept="video/*"
                      onChange={(event) =>
                        handleSingleLectureUpload(event, index)
                      }
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      Supported formats: MP4, WebM, OGV. Maximum file size: 100MB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
