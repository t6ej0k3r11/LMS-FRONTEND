import axiosInstance from "@/api/axiosInstance";

console.log("🔍 DEBUG: services/index.js loaded");

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", formData);

  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);

  // Show success toast for login
  if (data.success) {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Login Successful",
      description: "Welcome back!",
      variant: "default",
    });
  }

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");
  return data;
}

export async function refreshTokenService() {
  // Note: Refresh token is handled via httpOnly cookies, not localStorage
  const { data } = await axiosInstance.post("/auth/refresh-token");
  return data;
}

export async function logoutService() {
  const { data } = await axiosInstance.post("/auth/logout");

  // Show success toast for logout
  if (data.success) {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
  }

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
    const instance = axiosInstance;
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
  const instance = axiosInstance;

  const { data } = await instance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const instance = axiosInstance;

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

export async function fetchEnrolledStudentsService() {
  const instance = axiosInstance;

  try {
    const { data } = await instance.get(`/instructor/course/get/students`);
    return data;
  } catch (error) {
    if (error.response?.status === 403) {
      return { restricted: true };
    }
    throw error;
  }
}

export async function addNewCourseService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/instructor/course/add`, formData);

  // Show success toast for course creation
  if (data.success) {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Course Created",
      description: "Your course has been created successfully!",
      variant: "default",
    });
  }

  return data;
}

export async function createCourseDraftService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/instructor/course/draft`, formData);

  return data;
}

export async function publishCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(
    `/instructor/course/${courseId}/publish`
  );

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/instructor/course/get/details/${id}`);

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const instance = axiosInstance;

  const { data } = await instance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const instance = axiosInstance;

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
  const instance = axiosInstance;

  const { data } = await instance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createPaymentService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/api/orders/create`, formData);

  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });

  // Show success toast for enrollment
  if (data.success) {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Enrollment Successful",
      description: "You have been enrolled in the course!",
      variant: "default",
    });
  }

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `/student/course-progress/get/${courseId}`
  );

  return data;
}

export async function getUserCourseProgressService(courseId) {
  const instance = axiosInstance;

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
  const instance = axiosInstance;

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
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/student/course-progress/update-lecture-progress`,
    {
      courseId,
      lectureId,
      status,
    }
  );

  // Show success toast for lecture completion
  if (data.success && status === "completed") {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Lecture Completed",
      description: "Great job! You've completed this lecture.",
      variant: "default",
    });
  }

  return data;
}

export async function resetCourseProgressService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/student/course-progress/reset-progress`,
    {
      courseId,
    }
  );

  return data;
}

export async function createQuizService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post("/instructor/quiz/create", formData);

  return data;
}

export async function getQuizzesByCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/instructor/quiz/course/${courseId}`);

  return data;
}

export async function getQuizByIdService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/instructor/quiz/${quizId}`);

  return data;
}

export async function updateQuizService(quizId, formData) {
  const instance = axiosInstance;

  const { data } = await instance.put(`/instructor/quiz/${quizId}`, formData);

  return data;
}

export async function deleteQuizService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(`/instructor/quiz/${quizId}`);

  return data;
}

export async function deleteCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(
    `/instructor/course/delete/${courseId}`
  );

  return data;
}

export async function getQuizResultsService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/student/quiz/${quizId}/results`);

  return data;
}

export async function getStudentQuizzesByCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/student/quiz/course/${courseId}`);

  return data;
}

export async function getQuizForTakingService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/student/quiz/${quizId}`);

  return data;
}

export async function validateQuizAccessService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/student/quiz/${quizId}/validate`);

  return data;
}

export async function startQuizAttemptService(quizId) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/student/quiz/${quizId}/attempt`);

  return data;
}

export async function submitQuizAttemptService(quizId, attemptId, answers) {
  const instance = axiosInstance;

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
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/student/quiz/${quizId}/attempt/${attemptId}/question/${questionId}`,
    { answer }
  );

  return data;
}

export async function finalizeQuizAttemptService(quizId, attemptId) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/student/quiz/${quizId}/attempt/${attemptId}/finalize`
  );

  // Show success toast for quiz submission
  if (data.success) {
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "Quiz Submitted",
      description: "Your quiz has been submitted successfully!",
      variant: "default",
    });
  }

  return data;
}

// Admin services
export async function getAllUsersService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/users?${queryString}`);

  return data;
}

export async function updateUserService(userId, userData) {
  const instance = axiosInstance;

  const { data } = await instance.put(`/admin/users/${userId}`, userData);

  return data;
}

export async function deleteUserService(userId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(`/admin/users/${userId}`);

  return data;
}

export async function deactivateUserService(userId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(`/admin/users/${userId}/deactivate`);

  return data;
}

export async function reactivateUserService(userId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(`/admin/users/${userId}/reactivate`);

  return data;
}

// Admin dashboard services
export async function getAdminStatsService() {
  const instance = axiosInstance;

  const { data } = await instance.get(`/admin/stats`);

  return data;
}

export async function getRecentActivitiesService(limit = 10) {
  const instance = axiosInstance;

  const { data } = await instance.get(`/admin/activities?limit=${limit}`);

  return data;
}

// Admin course services
export async function getPendingCoursesService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/courses/pending?${queryString}`);

  return data;
}

export async function reviewCourseService(courseId, reviewData) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/admin/courses/${courseId}/review`,
    reviewData
  );

  return data;
}

export async function approveCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(`/admin/courses/${courseId}/approve`);

  return data;
}

export async function rejectCourseService(courseId, rejectionReason) {
  const instance = axiosInstance;

  const { data } = await instance.patch(`/admin/courses/${courseId}/reject`, {
    rejectionReason,
  });

  return data;
}

// Admin course management services
export async function getAllCoursesService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/courses?${queryString}`);

  return data;
}

export async function updateCourseStatusService(courseId, statusData) {
  const instance = axiosInstance;

  const { data } = await instance.put(
    `/admin/courses/${courseId}/status`,
    statusData
  );

  return data;
}

export async function deleteAdminCourseService(courseId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(`/admin/courses/${courseId}`);

  return data;
}

// Service objects for easier importing
export const authService = {
  register: registerService,
  login: loginService,
  checkAuth: checkAuthService,
  refreshToken: refreshTokenService,
  logout: logoutService,
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
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(
    `/admin/instructors/pending?${queryString}`
  );

  return data;
}

export async function approveInstructorService(instructorId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(
    `/admin/instructors/${instructorId}/approve`
  );

  return data;
}

export async function rejectInstructorService(instructorId, reason) {
  const instance = axiosInstance;

  const { data } = await instance.patch(
    `/admin/instructors/${instructorId}/reject`,
    { reason }
  );

  return data;
}

// Question Bank services
export async function createQuestionService(questionData) {
  const instance = axiosInstance;

  const { data } = await instance.post(`/admin/questions`, questionData);

  return data;
}

export async function getAllQuestionsService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/admin/questions?${queryString}`);

  return data;
}

export async function updateQuestionService(questionId, questionData) {
  const instance = axiosInstance;

  const { data } = await instance.patch(
    `/admin/questions/${questionId}`,
    questionData
  );

  return data;
}

export async function deleteQuestionService(questionId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(`/admin/questions/${questionId}`);

  return data;
}

export async function getQuestionsForInstructorsService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(
    `/instructor/quiz/questions/for-instructors?${queryString}`
  );

  return data;
}

// Notification services
export async function getUserNotificationsService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(`/notifications?${queryString}`);

  return data;
}

export async function getUnreadNotificationCountService() {
  const instance = axiosInstance;

  const { data } = await instance.get("/notifications/unread-count");

  return data;
}

export async function markNotificationAsReadService(notificationId) {
  const instance = axiosInstance;

  const { data } = await instance.patch(
    `/notifications/${notificationId}/read`
  );

  return data;
}

export async function markAllNotificationsAsReadService() {
  const instance = axiosInstance;

  const { data } = await instance.patch("/notifications/mark-all-read");

  return data;
}

export async function deleteNotificationService(notificationId) {
  const instance = axiosInstance;

  const { data } = await instance.delete(`/notifications/${notificationId}`);

  return data;
}

// Message services
export async function getChatPartnersService() {
  const instance = axiosInstance;

  const { data } = await instance.get("/messages/list");

  return data;
}

export async function getChatHistoryService(
  userId,
  receiverId,
  courseId,
  page = 1,
  limit = 50
) {
  let url = `/messages/history/${userId}/${receiverId}`;
  const params = new URLSearchParams();

  // Only add courseId if it exists and is not null/"null"
  if (courseId && courseId !== "null" && courseId !== null) {
    params.append("courseId", courseId);
  }

  // Always add page and limit
  params.append("page", page);
  params.append("limit", limit);

  url += `?${params.toString()}`;

  const { data } = await axiosInstance.get(url);

  return data;
}

export async function sendMessageService(messageData) {
  const instance = axiosInstance;

  const { data } = await instance.post("/messages/send", messageData);

  return data;
}

export async function markMessagesAsSeenService(senderId, courseId) {
  const instance = axiosInstance;

  const { data } = await instance.post("/messages/mark-seen", {
    senderId,
    courseId,
  });

  return data;
}

// Profile services
export async function getProfileService() {
  const instance = axiosInstance;

  const { data } = await instance.get("/profile");

  return data;
}

export async function updateProfileService(profileData) {
  const instance = axiosInstance;

  const { data } = await instance.put("/profile", profileData);

  return data;
}

export async function updateNotificationPreferencesService(preferences) {
  const instance = axiosInstance;

  const { data } = await instance.put("/profile/notifications", {
    preferences,
  });

  return data;
}

export async function changePasswordService(passwordData) {
  const instance = axiosInstance;

  const { data } = await instance.put("/profile/password", passwordData);

  return data;
}

export async function deleteAccountService() {
  const instance = axiosInstance;

  const { data } = await instance.delete("/profile/account");

  return data;
}

export async function uploadAvatarService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post("/profile/avatar", formData);

  return data;
}

// Payment services
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

export async function initOnlinePaymentService(paymentData) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    PAYMENT_CONFIG.ROUTES.INIT_ONLINE,
    paymentData
  );

  return data;
}

export async function submitOfflinePaymentService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    PAYMENT_CONFIG.ROUTES.OFFLINE_SUBMIT,
    formData
  );

  return data;
}

export async function getStudentPaymentsService() {
  const instance = axiosInstance;

  const { data } = await instance.get(PAYMENT_CONFIG.ROUTES.MY_PAYMENTS);

  return data;
}

export async function getPaymentDetailsService(paymentId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `${PAYMENT_CONFIG.ROUTES.PAYMENT_DETAILS}/${paymentId}`
  );

  return data;
}

// Admin payment services
export async function getAllPaymentsService(queryParams = {}) {
  const instance = axiosInstance;

  const queryString = new URLSearchParams(queryParams).toString();
  const { data } = await instance.get(
    `${PAYMENT_CONFIG.ROUTES.ADMIN_PAYMENTS}?${queryString}`
  );

  return data;
}

export async function updatePaymentStatusService(paymentId, statusData) {
  const instance = axiosInstance;

  const { data } = await instance.put(
    `${PAYMENT_CONFIG.ROUTES.ADMIN_UPDATE_STATUS}/${paymentId}`,
    statusData
  );

  return data;
}

export async function addPaymentNoteService(paymentId, noteData) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    `/admin/payment/${paymentId}/note`,
    noteData
  );

  return data;
}

export async function getAdminPaymentDetailsService(paymentId) {
  const instance = axiosInstance;

  const { data } = await instance.get(
    `${PAYMENT_CONFIG.ROUTES.ADMIN_PAYMENT_BY_ID}/${paymentId}`
  );

  return data;
}

export const paymentService = {
  initOnlinePayment: initOnlinePaymentService,
  submitOfflinePayment: submitOfflinePaymentService,
  getStudentPayments: getStudentPaymentsService,
  getPaymentDetails: getPaymentDetailsService,
  getAllPayments: getAllPaymentsService,
  updatePaymentStatus: updatePaymentStatusService,
  addPaymentNote: addPaymentNoteService,
  getAdminPaymentDetails: getAdminPaymentDetailsService,
};

// Settings services
export async function getUserSettingsService() {
  const instance = axiosInstance;

  const { data } = await instance.get("/api/settings/me");

  return data;
}

export async function updateUserSettingsService(settingsData) {
  const instance = axiosInstance;

  const { data } = await instance.put("/api/settings/update", settingsData);

  return data;
}

export async function uploadProfilePictureService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post(
    "/api/settings/upload-profile",
    formData
  );

  return data;
}

export async function uploadCoverImageService(formData) {
  const instance = axiosInstance;

  const { data } = await instance.post("/api/settings/upload-cover", formData);

  return data;
}
