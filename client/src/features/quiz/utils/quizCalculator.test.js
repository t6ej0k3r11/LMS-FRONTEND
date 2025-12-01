import {
  calculateQuestionScore,
  calculateQuizScore,
  formatTimeSpent,
  isQuizPassed,
} from './quizCalculator';

describe('quizCalculator', () => {
  describe('calculateQuestionScore', () => {
    it('should correctly score multiple-choice questions', () => {
      const question = {
        type: 'multiple-choice',
        correctAnswer: 'optionA',
        points: 2,
      };

      const result = calculateQuestionScore(question, 'optionA');
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(2);
    });

    it('should handle incorrect multiple-choice answers', () => {
      const question = {
        type: 'multiple-choice',
        correctAnswer: 'optionA',
        points: 2,
      };

      const result = calculateQuestionScore(question, 'optionB');
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
    });

    it('should correctly score true-false questions', () => {
      const question = {
        type: 'true-false',
        correctAnswer: 'true',
        points: 1,
      };

      const result = calculateQuestionScore(question, 'true');
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(1);
    });

    it('should handle multiple-select questions with partial credit', () => {
      const question = {
        type: 'multiple-select',
        correctAnswer: ['optionA', 'optionB', 'optionC'],
        options: ['optionA', 'optionB', 'optionC', 'optionD'],
        points: 3,
      };

      // User selects 2 out of 3 correct answers
      const result = calculateQuestionScore(question, ['optionA', 'optionB']);
      expect(result.isCorrect).toBe(false); // Not fully correct
      expect(result.pointsEarned).toBe(2); // 2/3 * 3 = 2
      expect(result.partialCredit).toBe(2/3);
    });

    it('should mark text questions as needing review', () => {
      const question = {
        type: 'broad-text',
        points: 5,
      };

      const result = calculateQuestionScore(question, 'Some answer');
      expect(result.isCorrect).toBe(null);
      expect(result.pointsEarned).toBe(0);
      expect(result.needsReview).toBe(true);
    });
  });

  describe('calculateQuizScore', () => {
    it('should calculate overall quiz score', () => {
      const questions = [
        {
          _id: 'q1',
          type: 'multiple-choice',
          correctAnswer: 'A',
          points: 2,
        },
        {
          _id: 'q2',
          type: 'multiple-choice',
          correctAnswer: 'B',
          points: 2,
        },
        {
          _id: 'q3',
          type: 'broad-text',
          points: 5,
        },
      ];

      const answers = {
        q1: 'A', // Correct
        q2: 'C', // Incorrect
        q3: 'Some text', // Needs review
      };

      const result = calculateQuizScore(questions, answers);

      expect(result.scorePercentage).toBe(50); // 2/4 * 100 (only auto-gradable questions)
      expect(result.totalPointsEarned).toBe(2);
      expect(result.totalPossiblePoints).toBe(9);
      expect(result.hasUnreviewedQuestions).toBe(true);
    });
  });

  describe('formatTimeSpent', () => {
    it('should format seconds correctly', () => {
      expect(formatTimeSpent(30)).toBe('30s');
      expect(formatTimeSpent(90)).toBe('1m 30s');
      expect(formatTimeSpent(3660)).toBe('1h 1m');
    });
  });

  describe('isQuizPassed', () => {
    it('should determine if quiz is passed', () => {
      expect(isQuizPassed(85, 80, false)).toBe(true);
      expect(isQuizPassed(75, 80, false)).toBe(false);
      expect(isQuizPassed(85, 80, true)).toBe(false); // Has unreviewed questions
    });
  });
});