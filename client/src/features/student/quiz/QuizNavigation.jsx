import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle, Circle, Flag } from 'lucide-react';
import PropTypes from 'prop-types';

export const QuizNavigation = ({
  questions = [],
  currentQuestionIndex = 0,
  answers = {},
  flaggedQuestions = [],
  onQuestionSelect,
  onToggleFlag,
  showProgress = true,
  className = ''
}) => {
  const getQuestionStatus = (index) => {
    const questionId = questions[index]?._id;
    const isAnswered = answers[questionId];
    const isFlagged = flaggedQuestions.includes(questionId);

    return {
      isAnswered,
      isFlagged,
    };
  };

  const getQuestionIcon = (index) => {
    const { isAnswered, isFlagged, isCurrent } = getQuestionStatus(index);

    if (isAnswered) {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (isFlagged) {
      return <Flag className="h-4 w-4" />;
    }
    return <Circle className="h-4 w-4" />;
  };

  const getQuestionColor = (index) => {
    const { isAnswered, isFlagged, isCurrent } = getQuestionStatus(index);

    if (isCurrent) return 'bg-blue-500 text-white border-blue-500';
    if (isAnswered) return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
    if (isFlagged) return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
  };

  const answeredCount = questions.filter((_, index) => {
    const questionId = questions[index]?._id;
    return answers[questionId];
  }).length;

  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Card className={`p-4 ${className}`}>
      {showProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Progress</h3>
            <Badge variant="outline">
              {answeredCount}/{questions.length} answered
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Questions</h3>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const { isAnswered, isFlagged } = getQuestionStatus(index);
            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={question._id || index}
                variant="outline"
                size="sm"
                onClick={() => onQuestionSelect(index)}
                className={`h-10 w-10 p-0 relative ${getQuestionColor(index)} ${
                  isCurrent ? 'ring-2 ring-blue-300' : ''
                }`}
                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
              >
                <span className="text-xs font-medium">{index + 1}</span>

                {/* Status indicator */}
                <div className="absolute -top-1 -right-1">
                  {getQuestionIcon(index)}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-gray-400" />
            <span>Not answered</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <Flag className="h-3 w-3 text-yellow-600" />
            <span>Flagged</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFlag(questions[currentQuestionIndex]?._id)}
            className="flex-1"
          >
            <Flag className="h-4 w-4 mr-2" />
            {flaggedQuestions.includes(questions[currentQuestionIndex]?._id) ? 'Unflag' : 'Flag'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

QuizNavigation.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })
  ),
  currentQuestionIndex: PropTypes.number,
  answers: PropTypes.object,
  flaggedQuestions: PropTypes.arrayOf(PropTypes.string),
  onQuestionSelect: PropTypes.func.isRequired,
  onToggleFlag: PropTypes.func,
  showProgress: PropTypes.bool,
  className: PropTypes.string,
};