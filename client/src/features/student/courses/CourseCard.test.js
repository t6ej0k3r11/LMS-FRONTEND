import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

// Mock the progressCalculator
jest.mock('../utils/progressCalculator', () => ({
  progressCalculator: {
    calculateCourseProgress: jest.fn(() => 75),
  },
}));

describe('CourseCard', () => {
  const mockCourse = {
    courseId: 'course-123',
    title: 'Test Course',
    courseImage: 'test-image.jpg',
    instructorName: 'John Doe',
  };

  const mockProgress = {
    completed: false,
    progress: [{ viewed: true }, { viewed: false }],
    courseDetails: {
      curriculum: [
        { lectures: [{}, {}] },
        { lectures: [{}, {}] },
      ],
    },
    quizzesProgress: [],
  };

  const mockQuizzes = [
    { _id: 'quiz-1', lectureId: null },
    { _id: 'quiz-2', lectureId: 'lecture-1' },
  ];

  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders course information correctly', () => {
    render(
      <CourseCard
        course={mockCourse}
        progress={mockProgress}
        quizzes={mockQuizzes}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByText('Lectures: 1/4')).toBeInTheDocument();
    expect(screen.getByText('Quizzes: 0/2')).toBeInTheDocument();
  });

  it('shows certificate badge when course is completed', () => {
    const completedProgress = { ...mockProgress, completed: true };

    render(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={mockQuizzes}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Certificate')).toBeInTheDocument();
  });

  it('shows final quiz status', () => {
    render(
      <CourseCard
        course={mockCourse}
        progress={mockProgress}
        quizzes={mockQuizzes}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Final Quiz: 0/1')).toBeInTheDocument();
  });

  it('calls onNavigate when continue button is clicked', () => {
    render(
      <CourseCard
        course={mockCourse}
        progress={mockProgress}
        quizzes={mockQuizzes}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button', { name: /continue learning/i });
    button.click();

    expect(mockOnNavigate).toHaveBeenCalledWith('course-123');
  });

  it('shows review course button when completed', () => {
    const completedProgress = { ...mockProgress, completed: true };

    render(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={mockQuizzes}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByRole('button', { name: /review course/i })).toBeInTheDocument();
  });
});