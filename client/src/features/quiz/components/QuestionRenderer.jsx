import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import PropTypes from 'prop-types';

export const QuestionRenderer = ({
  question,
  answer,
  onAnswerChange,
  disabled = false,
  showCorrectAnswer = false,
  correctAnswer = null,
  explanation = null
}) => {
  if (!question) return null;

  const handleAnswerChange = (value) => {
    if (disabled) return;
    onAnswerChange(question._id, value);
  };

  const renderMultipleChoice = () => (
    <RadioGroup
      value={answer}
      onValueChange={handleAnswerChange}
      disabled={disabled}
      className="space-y-3"
    >
      {question.options.map((option, index) => {
        const isSelected = answer === option;
        const isCorrect = showCorrectAnswer && option === correctAnswer;
        const isIncorrect = showCorrectAnswer && isSelected && option !== correctAnswer;

        return (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              isCorrect ? 'bg-green-50 border-green-200' :
              isIncorrect ? 'bg-red-50 border-red-200' :
              isSelected ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <RadioGroupItem
              value={option}
              id={`option-${question._id}-${index}`}
              disabled={disabled}
            />
            <Label
              htmlFor={`option-${question._id}-${index}`}
              className="flex-1 cursor-pointer"
            >
              {option}
            </Label>
            {isCorrect && <span className="text-green-600 font-semibold">✓ Correct</span>}
            {isIncorrect && <span className="text-red-600 font-semibold">✗ Incorrect</span>}
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderMultipleSelect = () => (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = answer?.includes(option) || false;
        const isCorrect = showCorrectAnswer && correctAnswer?.includes(option);
        const isIncorrect = showCorrectAnswer && isSelected && !correctAnswer?.includes(option);

        return (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              isCorrect ? 'bg-green-50 border-green-200' :
              isIncorrect ? 'bg-red-50 border-red-200' :
              isSelected ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Checkbox
              id={`option-${question._id}-${index}`}
              checked={isSelected}
              onCheckedChange={(checked) => {
                const current = answer || [];
                if (checked) {
                  handleAnswerChange([...current, option]);
                } else {
                  handleAnswerChange(current.filter(a => a !== option));
                }
              }}
              disabled={disabled}
            />
            <Label
              htmlFor={`option-${question._id}-${index}`}
              className="flex-1 cursor-pointer"
            >
              {option}
            </Label>
            {isCorrect && <span className="text-green-600 font-semibold">✓ Correct</span>}
            {isIncorrect && <span className="text-red-600 font-semibold">✗ Incorrect</span>}
          </div>
        );
      })}
    </div>
  );

  const renderTrueFalse = () => (
    <RadioGroup
      value={answer}
      onValueChange={handleAnswerChange}
      disabled={disabled}
      className="space-y-3"
    >
      {[
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' }
      ].map(({ value, label }) => {
        const isSelected = answer === value;
        const isCorrect = showCorrectAnswer && value === correctAnswer;
        const isIncorrect = showCorrectAnswer && isSelected && value !== correctAnswer;

        return (
          <div
            key={value}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              isCorrect ? 'bg-green-50 border-green-200' :
              isIncorrect ? 'bg-red-50 border-red-200' :
              isSelected ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <RadioGroupItem
              value={value}
              id={`option-${question._id}-${value}`}
              disabled={disabled}
            />
            <Label
              htmlFor={`option-${question._id}-${value}`}
              className="flex-1 cursor-pointer"
            >
              {label}
            </Label>
            {isCorrect && <span className="text-green-600 font-semibold">✓ Correct</span>}
            {isIncorrect && <span className="text-red-600 font-semibold">✗ Incorrect</span>}
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderBroadText = () => (
    <div className="space-y-3">
      <Label htmlFor={`broad-text-${question._id}`} className="text-base font-medium">
        Your Answer
      </Label>
      <Textarea
        id={`broad-text-${question._id}`}
        value={answer || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder="Write your detailed answer here..."
        rows={6}
        className="w-full resize-none"
        disabled={disabled}
      />
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <strong>Note:</strong> This question requires manual review by your instructor.
        {showCorrectAnswer && correctAnswer && (
          <div className="mt-2">
            <strong>Sample Answer:</strong> {correctAnswer}
          </div>
        )}
      </div>
    </div>
  );

  const renderCodeSnippet = () => (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        Code Question
      </Label>
      {question.code && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{question.code}</pre>
        </div>
      )}
      <Textarea
        id={`code-${question._id}`}
        value={answer || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder="Write your code solution here..."
        rows={8}
        className="w-full resize-none font-mono"
        disabled={disabled}
      />
      {showCorrectAnswer && correctAnswer && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <strong className="text-green-800">Sample Solution:</strong>
          <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
            {correctAnswer}
          </pre>
        </div>
      )}
    </div>
  );

  const renderShortText = () => (
    <div className="space-y-3">
      <Label htmlFor={`short-text-${question._id}`} className="text-base font-medium">
        Your Answer
      </Label>
      <input
        id={`short-text-${question._id}`}
        type="text"
        value={answer || ''}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder="Enter your answer..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      />
      {showCorrectAnswer && correctAnswer && (
        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
          <strong>Correct Answer:</strong> {correctAnswer}
        </div>
      )}
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'multiple-select':
        return renderMultipleSelect();
      case 'true-false':
        return renderTrueFalse();
      case 'broad-text':
        return renderBroadText();
      case 'short-text':
        return renderShortText();
      case 'code-snippet':
        return renderCodeSnippet();
      default:
        return (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium text-gray-900 leading-relaxed">
        {question.question}
      </div>

      {question.points && (
        <div className="text-sm text-gray-600">
          Points: <span className="font-semibold">{question.points}</span>
        </div>
      )}

      <div className="space-y-2">
        {renderQuestionContent()}
      </div>

      {showCorrectAnswer && explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
          <p className="text-blue-700">{explanation}</p>
        </div>
      )}
    </div>
  );
};

QuestionRenderer.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['multiple-choice', 'multiple-select', 'true-false', 'short-text', 'broad-text', 'code-snippet']).isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    points: PropTypes.number,
    code: PropTypes.string,
  }).isRequired,
  answer: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onAnswerChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showCorrectAnswer: PropTypes.bool,
  correctAnswer: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  explanation: PropTypes.string,
  mode: PropTypes.oneOf(['exam', 'practice']),
};