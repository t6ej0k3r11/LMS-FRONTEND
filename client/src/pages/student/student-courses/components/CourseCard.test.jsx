import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from './CourseCard';

// Mock the required modules
jest.mock('@/services', () => ({
  checkCoursePurchaseInfoService: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/context/auth-context', () => ({
  AuthContext: {
    Consumer: ({ children }) => children({ user: { _id: 'user123' } }),
    Provider: ({ children }) => children,
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const mockCourse = {
  courseId: 'course123',
  title: 'Test Course',
  instructorName: 'Test Instructor',
  courseImage: '/test-image.jpg',
};

const mockProgress = {
  progress: [{ lectureId: 'lec1', viewed: true }, { lectureId: 'lec2', viewed: false }],
  courseDetails: {
    curriculum: [
      { _id: 'lec1', title: 'Lecture 1' },
      { _id: 'lec2', title: 'Lecture 2' },
    ],
  },
  quizzesProgress: [],
};

const mockQuizzes = [
  { _id: 'quiz1', lectureId: null }, // Final quiz
];

const defaultProps = {
  course: mockCourse,
  progress: mockProgress,
  quizzes: mockQuizzes,
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CourseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders course information correctly', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('by Test Instructor')).toBeInTheDocument();
    expect(screen.getByText('Lectures: 1/2')).toBeInTheDocument();
    expect(screen.getByText('Quizzes: 0/1 completed')).toBeInTheDocument();
  });

  it('displays progress badge with correct percentage', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    expect(screen.getByText('50% Complete')).toBeInTheDocument();
    expect(screen.getByText('1/2 lectures')).toBeInTheDocument();
  });

  it('shows certificate badge when eligible', () => {
    const completedProgress = {
      ...mockProgress,
      progress: [
        { lectureId: 'lec1', viewed: true },
        { lectureId: 'lec2', viewed: true },
      ],
    };

    const completedQuizzes = [
      { _id: 'quiz1', lectureId: null, completed: true },
    ];

    renderWithRouter(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={completedQuizzes}
      />
    );

    expect(screen.getByText('Certificate Ready')).toBeInTheDocument();
  });

  it('shows completed status for finished courses', () => {
    const completedProgress = {
      ...mockProgress,
      progress: [
        { lectureId: 'lec1', viewed: true },
        { lectureId: 'lec2', viewed: true },
      ],
    };

    renderWithRouter(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={mockQuizzes}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays final quiz status', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    expect(screen.getByText('Final Quiz: 0/1')).toBeInTheDocument();
  });

  it('shows continue button for incomplete courses', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows review button for completed courses', () => {
    const completedProgress = {
      ...mockProgress,
      progress: [
        { lectureId: 'lec1', viewed: true },
        { lectureId: 'lec2', viewed: true },
      ],
    };

    renderWithRouter(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={mockQuizzes}
      />
    );

    expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
  });

  it('shows certificate button for completed courses with final quiz passed', () => {
    const completedProgress = {
      ...mockProgress,
      progress: [
        { lectureId: 'lec1', viewed: true },
        { lectureId: 'lec2', viewed: true },
      ],
    };

    const completedQuizzes = [
      { _id: 'quiz1', lectureId: null, completed: true },
    ];

    renderWithRouter(
      <CourseCard
        course={mockCourse}
        progress={completedProgress}
        quizzes={completedQuizzes}
      />
    );

    expect(screen.getByRole('button', { name: /certificate/i })).toBeInTheDocument();
  });

  it('handles course navigation on continue click', async () => {
    const { checkCoursePurchaseInfoService } = jest.requireMock('@/services');
    checkCoursePurchaseInfoService.mockResolvedValue({
      success: true,
      data: { enrolled: true },
    });

    renderWithRouter(<CourseCard {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/course-progress/course123');
    });
  });

  it('handles course navigation to details when not enrolled', async () => {
    const { checkCoursePurchaseInfoService } = jest.requireMock('@/services');
    checkCoursePurchaseInfoService.mockResolvedValue({
      success: true,
      data: { enrolled: false },
    });

    renderWithRouter(<CourseCard {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/course/details/course123');
    });
  });

  it('displays course image with error fallback', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    const img = screen.getByAltText('Course thumbnail for Test Course');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<CourseCard {...defaultProps} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-labelledby', 'course-title-course123');
    expect(card).toHaveAttribute('aria-describedby', 'course-status-course123');
  });
});