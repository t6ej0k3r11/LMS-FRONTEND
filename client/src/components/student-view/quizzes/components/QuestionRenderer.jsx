import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import PropTypes from 'prop-types';

function QuestionRenderer({ question, answer, onAnswerChange, disabled, isReviewMode = false, correctAnswer, explanation }) {
  if (!question) return null;

  if (question.type === 'multiple-choice') {
    return (
      <RadioGroup
        value={answer}
        onValueChange={(value) => onAnswerChange(question._id, value)}
        disabled={disabled}
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  } else if (question.type === 'multiple-select') {
    return (
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`option-${index}`}
              checked={answer?.includes(option) || false}
              onCheckedChange={(checked) => {
                const current = answer || [];
                if (checked) {
                  onAnswerChange(question._id, [...current, option]);
                } else {
                  onAnswerChange(question._id, current.filter(a => a !== option));
                }
              }}
              disabled={disabled}
            />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </div>
    );
  } else if (question.type === 'true-false') {
    return (
      <RadioGroup
        value={answer}
        onValueChange={(value) => onAnswerChange(question._id, value)}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true">True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false">False</Label>
        </div>
      </RadioGroup>
    );
  } else if (question.type === 'broad-text') {
    return (
      <div className="space-y-2">
        <Label htmlFor={`broad-text-${question._id}`}>Your Answer</Label>
        <Textarea
          id={`broad-text-${question._id}`}
          value={answer || ''}
          onChange={(e) => onAnswerChange(question._id, e.target.value)}
          placeholder="Write your detailed answer here..."
          rows={6}
          className="w-full"
          disabled={disabled}
        />
        <div className="text-sm text-gray-600">
          This question requires manual review by your instructor.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Question Options */}
      <div>
        {question.type === 'multiple-choice' && (
          <RadioGroup value={answer} disabled={true}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} disabled />
                <Label htmlFor={`option-${index}`}>{option}</Label>
                {isReviewMode && correctAnswer === option && (
                  <Badge variant="default" className="ml-2 bg-green-600">Correct Answer</Badge>
                )}
                {isReviewMode && answer === option && answer !== correctAnswer && (
                  <Badge variant="destructive" className="ml-2">Your Answer</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'multiple-select' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={answer?.includes(option) || false}
                  disabled
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
                {isReviewMode && correctAnswer?.includes(option) && (
                  <Badge variant="default" className="ml-2 bg-green-600">Correct</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {question.type === 'true-false' && (
          <RadioGroup value={answer} disabled={true}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" disabled />
              <Label htmlFor="true">True</Label>
              {isReviewMode && correctAnswer === "true" && (
                <Badge variant="default" className="ml-2 bg-green-600">Correct Answer</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" disabled />
              <Label htmlFor="false">False</Label>
              {isReviewMode && correctAnswer === "false" && (
                <Badge variant="default" className="ml-2 bg-green-600">Correct Answer</Badge>
              )}
            </div>
          </RadioGroup>
        )}

        {question.type === 'broad-text' && (
          <div className="space-y-2">
            <Label>Your Answer</Label>
            <Textarea
              value={answer || ''}
              disabled
              rows={6}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Review Mode: Show Explanation */}
      {isReviewMode && explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
          <p className="text-blue-800">{explanation}</p>
        </div>
      )}
    </div>
  );
}

QuestionRenderer.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    options: PropTypes.array,
  }),
  answer: PropTypes.any,
  onAnswerChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isReviewMode: PropTypes.bool,
  correctAnswer: PropTypes.any,
  explanation: PropTypes.string,
};

export default QuestionRenderer;