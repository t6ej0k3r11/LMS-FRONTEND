import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuiz } from '@/hooks/useQuiz';
import * as services from '@/services';

// Mock the services
jest.mock('@/services', () => ({
  getQuizForTakingService: jest.fn(),
  startQuizAttemptService: jest.fn(),
  submitQuizAttemptService: jest.fn(),
  finalizeQuizAttemptService: jest.fn(),
  submitQuestionAnswerService: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('useQuiz hook', () => {
  const mockQuizId = 'quiz123';
  const mockValidation = { data: { resumeAttemptId: null } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: {
        quiz: { _id: mockQuizId, title: 'Test Quiz', questions: [] },
        attempts: []
      }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: true,
      data: { attemptId: 'attempt123' }
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockValidation));

    expect(result.current.loading).toBe(true);
    expect(result.current.quiz).toBe(null);
    expect(result.current.attemptId).toBe(null);
  });

  it('should load quiz data successfully', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [
        { _id: 'q1', question: 'Question 1', type: 'multiple-choice', options: ['A', 'B'] }
      ]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: true,
      data: { attemptId: 'attempt123' }
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quiz).toEqual(mockQuiz);
    expect(result.current.attemptId).toBe('attempt123');
    expect(result.current.isResuming).toBe(false);
  });

  it('should handle quiz with no questions', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Empty Quiz',
      questions: []
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it('should resume existing attempt', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [{ _id: 'q1', question: 'Question 1' }]
    };

    const mockResumeValidation = {
      data: { resumeAttemptId: 'resume123' }
    };

    const mockAttempt = {
      _id: 'resume123',
      answers: [{ questionId: 'q1', answer: 'A' }]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [mockAttempt] }
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockResumeValidation));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isResuming).toBe(true);
    expect(result.current.attemptId).toBe('resume123');
    expect(result.current.resumeAttemptInfo).toEqual(mockAttempt);
    expect(result.current.answers).toEqual({ q1: 'A' });
  });

  it('should submit answer successfully', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [{ _id: 'q1', question: 'Question 1' }]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: true,
      data: { attemptId: 'attempt123' }
    });

    services.submitQuestionAnswerService.mockResolvedValue({
      success: true,
      data: { feedback: 'Correct!' }
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let feedback;
    await act(async () => {
      feedback = await result.current.submitAnswer('q1', 'A');
    });

    expect(feedback).toEqual({ feedback: 'Correct!' });
    expect(services.submitQuestionAnswerService).toHaveBeenCalledWith(
      mockQuizId, 'attempt123', 'q1', 'A'
    );
  });

  it('should submit quiz successfully', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [{ _id: 'q1', question: 'Question 1' }]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: true,
      data: { attemptId: 'attempt123' }
    });

    services.submitQuizAttemptService.mockResolvedValue({
      success: true
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Set some answers
    act(() => {
      result.current.answers.q1 = 'A';
    });

    let success;
    await act(async () => {
      success = await result.current.submitQuiz();
    });

    expect(success).toBe(true);
    expect(services.submitQuizAttemptService).toHaveBeenCalledWith(
      mockQuizId, 'attempt123', [{ questionId: 'q1', answer: 'A' }]
    );
  });

  it('should finalize quiz successfully', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [{ _id: 'q1', question: 'Question 1' }]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: true,
      data: { attemptId: 'attempt123' }
    });

    services.finalizeQuizAttemptService.mockResolvedValue({
      success: true
    });

    const { result } = renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success;
    await act(async () => {
      success = await result.current.finalizeQuiz();
    });

    expect(success).toBe(true);
    expect(services.finalizeQuizAttemptService).toHaveBeenCalledWith(
      mockQuizId, 'attempt123'
    );
  });

  it('should handle fetch quiz error', async () => {
    services.getQuizForTakingService.mockResolvedValue({
      success: false,
      message: 'Quiz not found'
    });

    renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it('should handle start attempt error', async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: 'Test Quiz',
      questions: [{ _id: 'q1', question: 'Question 1' }]
    };

    services.getQuizForTakingService.mockResolvedValue({
      success: true,
      data: { quiz: mockQuiz, attempts: [] }
    });

    services.startQuizAttemptService.mockResolvedValue({
      success: false,
      message: 'Failed to start attempt'
    });

    renderHook(() => useQuiz(mockQuizId, mockValidation));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});