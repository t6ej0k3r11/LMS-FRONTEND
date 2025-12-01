import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { CheckCircle, Circle, Flag, X } from 'lucide-react';
import PropTypes from 'prop-types';

export const QuestionSidebar = ({
  questions = [],
  currentQuestionIndex = 0,
  answers = {},
  flaggedQuestions = [],
  onQuestionSelect,
  onToggleFlag,
  isOpen = false,
  onClose,
  className = ''
}) => {
  const getQuestionStatus = (question, index) => {
    const questionId = question._id;
    const isAnswered = answers[questionId];
    const isFlagged = flaggedQuestions.includes(questionId);
    const isCurrent = index === currentQuestionIndex;

    return {
      isAnswered,
      isFlagged,
      isCurrent,
    };
  };

  const getQuestionIcon = (question, index) => {
    const { isAnswered, isFlagged } = getQuestionStatus(question, index);

    if (isAnswered) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (isFlagged) {
      return <Flag className="h-4 w-4 text-yellow-600" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getQuestionColor = (question, index) => {
    const { isAnswered, isFlagged, isCurrent } = getQuestionStatus(question, index);

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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Progress</span>
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

        {/* Questions List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((question, index) => {
                const { isAnswered, isFlagged, isCurrent } = getQuestionStatus(question, index);

                return (
                  <Button
                    key={question._id || index}
                    variant="outline"
                    size="sm"
                    onClick={() => onQuestionSelect(index)}
                    className={`h-12 w-12 p-0 relative ${getQuestionColor(question, index)} ${
                      isCurrent ? 'ring-2 ring-blue-300' : ''
                    }`}
                    title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>

                    {/* Status indicator */}
                    <div className="absolute -top-1 -right-1">
                      {getQuestionIcon(question, index)}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-gray-400" />
                <span>Not answered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-yellow-600" />
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer with quick actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFlag?.(questions[currentQuestionIndex]?._id)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Flag className="h-4 w-4" />
              <span>
                {flaggedQuestions.includes(questions[currentQuestionIndex]?._id) ? 'Unflag' : 'Flag'} Question
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

QuestionSidebar.propTypes = {
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
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showCorrect: PropTypes.bool,
  className: PropTypes.string,
};