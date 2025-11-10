import axiosInstance from "@/api/axiosInstance";

console.log("🔍 DEBUG: services/index.js loaded");

export async function registerService(formData) {
  const instance = await axiosInstance();
  const { data } = await instance.post("/auth/register", formData);

  return data;
}

export async function loginService(formData) {
  const instance = await axiosInstance();
  const { data } = await instance.post("/auth/login", formData);

  return data;
}

export async function checkAuthService() {
  const instance = await axiosInstance();
  const { data } = await instance.get("/auth/check-auth");

  return data;
}

export async function refreshTokenService() {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const instance = await axiosInstance();
  const { data } = await instance.post("/auth/refresh-token", {
    refreshToken,
  });

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  console.log("DEBUG: mediaUploadService called");
  console.log("DEBUG: FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(
      `DEBUG: ${key}:`,
      value instanceof File
        ? `${value.name} (${value.size} bytes, ${value.type})`
        : value
    );
  }

  try {
    const instance = await axiosInstance();
    console.log(
      "DEBUG: Axios instance obtained, baseURL:",
      instance.defaults.baseURL
    );

    const { data } = await instance.post("/media/upload", formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`DEBUG: Upload progress: ${percentCompleted}%`);
        onProgressCallback(percentCompleted);
      },
    });

    console.log("DEBUG: mediaUploadService response:", data);
    return data;
  } catch (error) {
    console.error("DEBUG: mediaUploadService error:", error);
    console.error("DEBUG: Error response:", error.response);
    throw error;
  }
}

export async function mediaDeleteService(id) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/instructor/course/get`);

  return data;
}

export async function addNewCourseService(formData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/instructor/course/get/details/${id}`);

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const instance = await axiosInstance();

  const { data } = await instance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const instance = await axiosInstance();

  const { data } = await instance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createPaymentService(formData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/student/order/create`, formData);

  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(
  userId,
  courseId,
  lectureId,
  isRewatch = false
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
      isRewatch,
    }
  );

  return data;
}

export async function updateLectureProgressService(
  userId,
  courseId,
  lectureId,
  progressValue
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/update-lecture-progress`,
    {
      userId,
      courseId,
      lectureId,
      progressValue,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

export async function createQuizService(formData) {
  const instance = await axiosInstance();

  const { data } = await instance.post("/instructor/quiz/create", formData);

  return data;
}

export async function getQuizzesByCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/instructor/quiz/course/${courseId}`);

  return data;
}

export async function getQuizByIdService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/instructor/quiz/${quizId}`);

  return data;
}

export async function updateQuizService(quizId, formData) {
  const instance = await axiosInstance();

  const { data } = await instance.put(`/instructor/quiz/${quizId}`, formData);

  return data;
}

export async function deleteQuizService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(`/instructor/quiz/${quizId}`);

  return data;
}

export async function deleteCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(
    `/instructor/course/delete/${courseId}`
  );

  return data;
}

export async function getQuizResultsService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/instructor/quiz/${quizId}/results`);

  return data;
}

export async function getStudentQuizzesByCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/student/quiz/course/${courseId}`);

  return data;
}

export async function getQuizForTakingService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/student/quiz/${quizId}`);

  return data;
}

export async function startQuizAttemptService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/student/quiz/${quizId}/attempt`);

  return data;
}

export async function submitQuizAttemptService(quizId, attemptId, answers) {
  const instance = await axiosInstance();

  const { data } = await instance.put(
    `/student/quiz/${quizId}/attempt/${attemptId}`,
    { answers }
  );

  return data;
}
