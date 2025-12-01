import { ContinueWatching } from './ContinueWatching';

export default {
  title: 'Student/ContinueWatching',
  component: ContinueWatching,
  parameters: {
    layout: 'padded',
  },
};

const mockContinueWatchingData = {
  courseId: 'course-123',
  courseTitle: 'Advanced React Development',
  lectureId: 'lecture-456',
  lectureTitle: 'Understanding React Hooks',
  progress: 65,
  timeRemaining: 450, // 7.5 minutes
};

export const Default = {
  args: {
    continueWatchingData: mockContinueWatchingData,
    loading: false,
  },
};

export const HighProgress = {
  args: {
    continueWatchingData: {
      ...mockContinueWatchingData,
      progress: 85,
      timeRemaining: 120,
    },
    loading: false,
  },
};

export const LowProgress = {
  args: {
    continueWatchingData: {
      ...mockContinueWatchingData,
      progress: 15,
      timeRemaining: 1200,
    },
    loading: false,
  },
};

export const Loading = {
  args: {
    continueWatchingData: null,
    loading: true,
  },
};

export const NoData = {
  args: {
    continueWatchingData: null,
    loading: false,
  },
};