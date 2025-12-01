import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

export const FeedbackSystem = ({
  feedback,
  onContinue,
  autoAdvance = true,
  autoAdvanceDelay = 3000,
  showExplanation = true,
  className = ''
}) => {
  if (!feedback) return null;

  const {
    isCorrect,
    correctAnswer,
    explanation,
    pointsEarned,
    currentScore,
    answeredQuestions,
    totalQuestions,
    timeSpent,
    selectedAnswer
  } = feedback;

  const getFeedbackColor = () => {
    return isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  const getFeedbackIcon = () => {
    return isCorrect ? (
      <CheckCircle className="h-8 w-8 text-green-600" />
    ) : (
      <XCircle className="h-8 w-8 text-red-600" />
    );
  };

  const getFeedbackTitle = () => {
    return isCorrect ? 'Correct!' : 'Incorrect';
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Card className={`p-6 border-2 ${getFeedbackColor()} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getFeedbackIcon()}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {getFeedbackTitle()}
            </h3>

            {!isCorrect && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Your answer:</span> {selectedAnswer}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Correct answer:</span> {correctAnswer}
                </p>
              </div>
            )}
          </div>

          {showExplanation && explanation && (
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Explanation</h4>
              <p className="text-gray-700 leading-relaxed">{explanation}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {pointsEarned !== undefined && (
              <div className="text-center">
                <div className="font-semibold text-gray-900">{pointsEarned}</div>
                <div className="text-gray-600">Points Earned</div>
              </div>
            )}

            {currentScore !== undefined && (
              <div className="text-center">
                <div className="font-semibold text-gray-900">{currentScore}%</div>
                <div className="text-gray-600">Current Score</div>
              </div>
            )}

            {timeSpent !== undefined && (
              <div className="text-center">
                <div className="font-semibold text-gray-900">{formatTime(timeSpent)}</div>
                <div className="text-gray-600">Time Spent</div>
              </div>
            )}

            {answeredQuestions !== undefined && totalQuestions !== undefined && (
              <div className="text-center">
                <div className="font-semibold text-gray-900">{answeredQuestions}/{totalQuestions}</div>
                <div className="text-gray-600">Questions Done</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Progress: {answeredQuestions || 0} of {totalQuestions || 0} questions answered
            </div>

            <div className="flex items-center space-x-3">
              {autoAdvance && (
                <div className="text-sm text-gray-600">
                  Auto-advancing in {Math.ceil(autoAdvanceDelay / 1000)}s...
                </div>
              )}

              <Button
                onClick={onContinue}
                className="flex items-center space-x-2"
                disabled={!onContinue}
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

FeedbackSystem.propTypes = {
  feedback: PropTypes.shape({
    isCorrect: PropTypes.bool.isRequired,
    correctAnswer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    explanation: PropTypes.string,
    pointsEarned: PropTypes.number,
    currentScore: PropTypes.number,
    answeredQuestions: PropTypes.number,
    totalQuestions: PropTypes.number,
    timeSpent: PropTypes.number,
    selectedAnswer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  onContinue: PropTypes.func,
  autoAdvance: PropTypes.bool,
  autoAdvanceDelay: PropTypes.number,
  showExplanation: PropTypes.bool,
  className: PropTypes.string,
};