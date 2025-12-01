import {
  getAttemptKey,
  saveAttemptSnapshot,
  loadAttemptSnapshot,
  deleteAttemptSnapshot,
  hasAttemptSnapshot,
} from './attemptStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('attemptStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAttemptKey', () => {
    it('should generate correct key format', () => {
      const key = getAttemptKey('user123', 'quiz456');
      expect(key).toBe('quiz-attempt-user123-quiz456');
    });
  });

  describe('saveAttemptSnapshot', () => {
    it('should save snapshot to localStorage', () => {
      const snapshot = {
        userId: 'user123',
        quizId: 'quiz456',
        answers: { q1: 'answer1' },
      };

      saveAttemptSnapshot(snapshot);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'quiz-attempt-user123-quiz456',
        expect.any(String)
      );
    });
  });

  describe('loadAttemptSnapshot', () => {
    it('should load snapshot from localStorage', () => {
      const mockData = { userId: 'user123', quizId: 'quiz456' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = loadAttemptSnapshot('user123', 'quiz456');

      expect(result).toEqual(mockData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('quiz-attempt-user123-quiz456');
    });

    it('should return null if no snapshot exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadAttemptSnapshot('user123', 'quiz456');

      expect(result).toBeNull();
    });
  });

  describe('deleteAttemptSnapshot', () => {
    it('should delete snapshot from localStorage', () => {
      deleteAttemptSnapshot('user123', 'quiz456');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('quiz-attempt-user123-quiz456');
    });
  });

  describe('hasAttemptSnapshot', () => {
    it('should return true if snapshot exists', () => {
      localStorageMock.getItem.mockReturnValue('{"userId":"user123"}');

      const result = hasAttemptSnapshot('user123', 'quiz456');

      expect(result).toBe(true);
    });

    it('should return false if snapshot does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = hasAttemptSnapshot('user123', 'quiz456');

      expect(result).toBe(false);
    });
  });
});