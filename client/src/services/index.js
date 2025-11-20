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

  try {
    const { data } = await instance.get(`/instructor/course/get`);
    return data;
  } catch (error) {
    if (error.response?.status === 403) {
      return { restricted: true };
    }
    throw error;
  }
}

export async function addNewCourseService(formData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/instructor/course/add`, formData);

  return data;
}

export async function createCourseDraftService(formData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/instructor/course/draft`, formData);

  return data;
}

export async function publishCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(
    `/instructor/course/${courseId}/publish`
  );

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

  const { data } = await instance.post(`/api/orders/create`, formData);

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

export async function getCurrentCourseProgressService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/course-progress/get/${courseId}`
  );

  return data;
}

export async function getUserCourseProgressService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(
    `/student/course-progress/progress/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(
  courseId,
  lectureId,
  isRewatch = false
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      courseId,
      lectureId,
      isRewatch,
    }
  );

  return data;
}

export async function updateLectureProgressService(
  courseId,
  lectureId,
  status = "completed"
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/update-lecture-progress`,
    {
      courseId,
      lectureId,
      status,
    }
  );

  return data;
}

export async function resetCourseProgressService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/course-progress/reset-progress`,
    {
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

  const { data } = await instance.get(`/student/quiz/${quizId}/results`);

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

export async function validateQuizAccessService(quizId) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/student/quiz/${quizId}/validate`);

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

export async function submitQuestionAnswerService(
  quizId,
  attemptId,
  questionId,
  answer
) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/quiz/${quizId}/attempt/${attemptId}/question/${questionId}`,
    { answer }
  );

  return data;
}

export async function finalizeQuizAttemptService(quizId, attemptId) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/student/quiz/${quizId}/attempt/${attemptId}/finalize`
  );

  return data;
}

// Admin services
export async function getAllUsersService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/users?${queryString}`);

  return data;
}

export async function updateUserService(userId, userData) {
  const instance = await axiosInstance();

  const { data } = await instance.put(`/admin/users/${userId}`, userData);

  return data;
}

export async function deleteUserService(userId) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(`/admin/users/${userId}`);

  return data;
}

export async function deactivateUserService(userId) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(`/admin/users/${userId}/deactivate`);

  return data;
}

export async function reactivateUserService(userId) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(`/admin/users/${userId}/reactivate`);

  return data;
}

// Admin dashboard services
export async function getAdminStatsService() {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/admin/stats`);

  return data;
}

export async function getRecentActivitiesService(limit = 10) {
  const instance = await axiosInstance();

  const { data } = await instance.get(`/admin/activities?limit=${limit}`);

  return data;
}

// Admin course services
export async function getPendingCoursesService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/courses/pending?${queryString}`);

  return data;
}

export async function reviewCourseService(courseId, reviewData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(
    `/admin/courses/${courseId}/review`,
    reviewData
  );

  return data;
}

export async function approveCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(`/admin/courses/${courseId}/approve`);

  return data;
}

export async function rejectCourseService(courseId, rejectionReason) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(`/admin/courses/${courseId}/reject`, {
    rejectionReason,
  });

  return data;
}

// Admin course management services
export async function getAllCoursesService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/courses?${queryString}`);

  return data;
}

export async function updateCourseStatusService(courseId, statusData) {
  const instance = await axiosInstance();

  const { data } = await instance.put(
    `/admin/courses/${courseId}/status`,
    statusData
  );

  return data;
}

export async function deleteAdminCourseService(courseId) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(`/admin/courses/${courseId}`);

  return data;
}

// Service objects for easier importing
export const authService = {
  register: registerService,
  login: loginService,
  checkAuth: checkAuthService,
  refreshToken: refreshTokenService,
};

export const courseService = {
  enrollInCourse: createPaymentService,
  getCourses: fetchStudentViewCourseListService,
  getCourseDetails: fetchStudentViewCourseDetailsService,
  checkPurchaseInfo: checkCoursePurchaseInfoService,
  getBoughtCourses: fetchStudentBoughtCoursesService,
  getCurrentProgress: getCurrentCourseProgressService,
  getUserProgress: getUserCourseProgressService,
  markLectureViewed: markLectureAsViewedService,
  updateLectureProgress: updateLectureProgressService,
  resetProgress: resetCourseProgressService,
};

export const quizService = {
  getQuizzesByCourse: getStudentQuizzesByCourseService,
  getQuizForTaking: getQuizForTakingService,
  validateQuizAccess: validateQuizAccessService,
  startQuizAttempt: startQuizAttemptService,
  submitQuizAttempt: submitQuizAttemptService,
  submitQuestionAnswer: submitQuestionAnswerService,
  finalizeQuizAttempt: finalizeQuizAttemptService,
  getQuizResults: getQuizResultsService,
};

// Admin instructor services
export async function getPendingInstructorsService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(
    `/admin/instructors/pending?${queryString}`
  );

  return data;
}

export async function approveInstructorService(instructorId) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(
    `/admin/instructors/${instructorId}/approve`
  );

  return data;
}

export async function rejectInstructorService(instructorId, reason) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(
    `/admin/instructors/${instructorId}/reject`,
    { reason }
  );

  return data;
}

// Question Bank services
export async function createQuestionService(questionData) {
  const instance = await axiosInstance();

  const { data } = await instance.post(`/admin/questions`, questionData);

  return data;
}

export async function getAllQuestionsService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/questions?${queryString}`);

  return data;
}

export async function updateQuestionService(questionId, questionData) {
  const instance = await axiosInstance();

  const { data } = await instance.patch(
    `/admin/questions/${questionId}`,
    questionData
  );

  return data;
}

export async function deleteQuestionService(questionId) {
  const instance = await axiosInstance();

  const { data } = await instance.delete(`/admin/questions/${questionId}`);

  return data;
}

export async function getQuestionsForInstructorsService(queryParams = {}) {
  const instance = await axiosInstance();

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(
    `/instructor/quiz/questions/for-instructors?${queryString}`
  );

  return data;
}
