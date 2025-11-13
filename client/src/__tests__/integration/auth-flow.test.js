import axios from "axios";
import { jest } from "@jest/globals";

// Mock axios
jest.mock("axios");

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Mock window.location
delete window.location;
window.location = { href: "", origin: "http://localhost:3000" };

// Import services after mocking
import { authService, courseService, quizService } from "../../services";

describe("Frontend Integration Tests: Auth Flow with API Mocking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
  });

  describe("Registration → Login → Course Enrollment → Quiz Submission Flow", () => {
    const mockTokens = {
      accessToken: "mock-access-token-123",
      refreshToken: "mock-refresh-token-456",
    };

    const mockUser = {
      _id: "user-123",
      userName: "teststudent",
      userEmail: "test@example.com",
      role: "student",
    };

    const mockCourse = {
      _id: "course-123",
      title: "Test Course",
      instructorId: "instructor-123",
      pricing: 99,
    };

    const mockQuiz = {
      _id: "quiz-123",
      title: "Test Quiz",
      questions: [
        {
          _id: "question-123",
          type: "multiple-choice",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          points: 2,
        },
      ],
    };

    const mockAttempt = {
      attemptId: "attempt-123",
    };

    const mockResults = {
      score: 100,
      passed: true,
      totalQuestions: 1,
      correctAnswers: 1,
    };

    test("Step 1: User Registration", async () => {
      const registrationData = {
        userName: "teststudent",
        userEmail: "test@example.com",
        password: "Test@123456",
        role: "student",
      };

      // Mock successful registration
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { user: mockUser },
        },
      });

      const result = await authService.register(registrationData);

      expect(axios.post).toHaveBeenCalledWith(
        "/auth/register",
        registrationData
      );
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
    });

    test("Step 2: User Login", async () => {
      const loginData = {
        userEmail: "test@example.com",
        password: "Test@123456",
      };

      // Mock successful login
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: mockTokens.accessToken,
            user: mockUser,
          },
        },
      });

      const result = await authService.login(loginData);

      expect(axios.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe(mockTokens.accessToken);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        mockTokens.accessToken
      );
    });

    test("Step 3: Course Enrollment", async () => {
      // Set up authenticated state
      mockSessionStorage.getItem.mockReturnValue(mockTokens.accessToken);

      const enrollmentData = {
        userId: mockUser._id,
        userName: mockUser.userName,
        userEmail: mockUser.userEmail,
        courseId: mockCourse._id,
        courseTitle: mockCourse.title,
        coursePricing: mockCourse.pricing,
        orderStatus: "confirmed",
        paymentMethod: "card",
        paymentStatus: "completed",
        paymentId: "test-payment-id",
        payerId: "test-payer-id",
        instructorId: mockCourse.instructorId,
        instructorName: "Test Instructor",
        courseImage: "test-image.jpg",
        orderDate: new Date(),
      };

      // Mock successful enrollment
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { order: { _id: "order-123" } },
        },
      });

      const result = await courseService.enrollInCourse(enrollmentData);

      expect(axios.post).toHaveBeenCalledWith(
        "/student/order/create",
        enrollmentData,
        {
          headers: { Authorization: `Bearer ${mockTokens.accessToken}` },
        }
      );
      expect(result.success).toBe(true);
    });

    test("Step 4: Fetch Available Quizzes", async () => {
      // Set up authenticated state
      mockSessionStorage.getItem.mockReturnValue(mockTokens.accessToken);

      // Mock successful quiz fetch
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockQuiz],
        },
      });

      const result = await quizService.getQuizzesByCourse(mockCourse._id);

      expect(axios.get).toHaveBeenCalledWith(
        `/student/quiz/course/${mockCourse._id}`,
        {
          headers: { Authorization: `Bearer ${mockTokens.accessToken}` },
        }
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockQuiz]);
    });

    test("Step 5: Start Quiz Attempt", async () => {
      // Set up authenticated state
      mockSessionStorage.getItem.mockReturnValue(mockTokens.accessToken);

      // Mock successful attempt start
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockAttempt,
        },
      });

      const result = await quizService.startQuizAttempt(mockQuiz._id);

      expect(axios.post).toHaveBeenCalledWith(
        `/student/quiz/${mockQuiz._id}/attempt`,
        {},
        {
          headers: { Authorization: `Bearer ${mockTokens.accessToken}` },
        }
      );
      expect(result.success).toBe(true);
      expect(result.data.attemptId).toBe(mockAttempt.attemptId);
    });

    test("Step 6: Submit Quiz Answers", async () => {
      // Set up authenticated state
      mockSessionStorage.getItem.mockReturnValue(mockTokens.accessToken);

      const answers = [
        {
          questionId: mockQuiz.questions[0]._id,
          answer: "1", // Correct answer (index 1 = '4')
        },
      ];

      // Mock successful submission
      axios.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: { submitted: true },
        },
      });

      const result = await quizService.submitQuizAttempt(
        mockQuiz._id,
        mockAttempt.attemptId,
        answers
      );

      expect(axios.put).toHaveBeenCalledWith(
        `/student/quiz/${mockQuiz._id}/attempt/${mockAttempt.attemptId}`,
        { answers },
        {
          headers: { Authorization: `Bearer ${mockTokens.accessToken}` },
        }
      );
      expect(result.success).toBe(true);
    });

    test("Step 7: Get Quiz Results", async () => {
      // Set up authenticated state
      mockSessionStorage.getItem.mockReturnValue(mockTokens.accessToken);

      // Mock successful results fetch
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockResults,
        },
      });

      const result = await quizService.getQuizResults(mockQuiz._id);

      expect(axios.get).toHaveBeenCalledWith(
        `/student/quiz/${mockQuiz._id}/results`,
        {
          headers: { Authorization: `Bearer ${mockTokens.accessToken}` },
        }
      );
      expect(result.success).toBe(true);
      expect(result.data.score).toBe(100);
      expect(result.data.passed).toBe(true);
    });

    test("Error Handling: Invalid Token", async () => {
      // Mock expired token scenario
      mockSessionStorage.getItem.mockReturnValue("invalid-token");

      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: "Invalid token" },
        },
      });

      // Mock failed token refresh
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: "Refresh token expired" },
        },
      });

      try {
        await quizService.getQuizResults(mockQuiz._id);
      } catch (error) {
        expect(error.response.status).toBe(401);
      }

      // Should redirect to login on auth failure
      expect(window.location.href).toBe("/auth");
    });

    test("Token Refresh Flow", async () => {
      // Set up expired access token
      mockSessionStorage.getItem.mockReturnValueOnce("expired-token");

      // Mock 401 error on initial request
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: "Token expired" },
        },
      });

      // Mock successful token refresh
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        },
      });

      // Mock successful retry with new token
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockResults,
        },
      });

      const result = await quizService.getQuizResults(mockQuiz._id);

      expect(axios.post).toHaveBeenCalledWith("/auth/refresh-token");
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token"
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token"
      );
      expect(result.success).toBe(true);
    });
  });
});
