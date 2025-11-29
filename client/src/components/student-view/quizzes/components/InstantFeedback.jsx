import { Trophy, AlertTriangle } from "lucide-react";
import PropTypes from 'prop-types';

function InstantFeedback({ feedback, show, onNext }) {
  if (!show || !feedback) return null;

  return (
    <div className={`mt-4 p-4 rounded-lg border-2 ${
      feedback.isCorrect
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center space-x-2 mb-2">
        {feedback.isCorrect ? (
          <Trophy className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600" />
        )}
        <span className="font-semibold">
          {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <p><strong>Correct Answer:</strong> {feedback.correctAnswer}</p>
        {feedback.explanation && (
          <p><strong>Explanation:</strong> {feedback.explanation}</p>
        )}
        <p><strong>Points Earned:</strong> {feedback.pointsEarned}</p>
        <p><strong>Current Score:</strong> {feedback.currentScore}%</p>
        <p className="text-xs text-muted-foreground mt-2">
          Progress: {feedback.answeredQuestions} of {feedback.totalQuestions} questions answered
        </p>
      </div>
      {onNext && (
        <button
          onClick={onNext}
          className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Next Question
        </button>
      )}
    </div>
  );
}

InstantFeedback.propTypes = {
  feedback: PropTypes.shape({
    isCorrect: PropTypes.bool,
    correctAnswer: PropTypes.string,
    explanation: PropTypes.string,
    pointsEarned: PropTypes.number,
    currentScore: PropTypes.number,
    answeredQuestions: PropTypes.number,
    totalQuestions: PropTypes.number,
  }),
  show: PropTypes.bool,
  onNext: PropTypes.func,
};

export default InstantFeedback;