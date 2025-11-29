import { ContinueWatching } from './ContinueWatching';

export default {
  title: 'Student/ContinueWatching',
  component: ContinueWatching,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

const mockData = {
  courseId: 'course-123',
  lectureId: 'lecture-456',
  courseTitle: 'React Fundamentals',
  lectureTitle: 'Introduction to Components',
  progress: 0.75,
  remainingTime: 180, // 3 minutes
  thumbnail: '/banner-img.png',
};

export const Default = {
  args: mockData,
};

export const AlmostComplete = {
  args: {
    ...mockData,
    progress: 0.95,
    remainingTime: 30, // 30 seconds
  },
};

export const JustStarted = {
  args: {
    ...mockData,
    progress: 0.15,
    remainingTime: 480, // 8 minutes
  },
};

export const LongTitle = {
  args: {
    ...mockData,
    courseTitle: 'Advanced React Development with TypeScript and Modern Patterns',
    lectureTitle: 'Understanding Higher-Order Components and Render Props in Depth',
  },
};

export const NoThumbnail = {
  args: {
    ...mockData,
    thumbnail: null,
  },
};