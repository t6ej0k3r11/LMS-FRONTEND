import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import PropTypes from 'prop-types';

function QuestionNavigation({ questions, currentQuestionIndex, answers, onQuestionSelect }) {
  // Keyboard navigation for question selection
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle if no input/textarea is focused
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { key } = event;
      if (key >= '1' && key <= '9') {
        const questionIndex = parseInt(key) - 1;
        if (questionIndex < questions.length) {
          event.preventDefault();
          onQuestionSelect(questionIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, onQuestionSelect]);

  const answeredCount = Object.keys(answers).filter(key => answers[key]).length;
  const totalQuestions = questions.length;

  return (
    <Card className="border-white/50 bg-white/85" role="navigation" aria-label="Question navigation">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Question Navigation</CardTitle>
        <p className="text-sm text-muted-foreground">
          {answeredCount} of {totalQuestions} questions answered
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 sm:gap-2"
          role="tablist"
          aria-label="Question list"
        >
          {questions.map((_, index) => {
            const questionId = questions[index]._id;
            const isAnswered = answers[questionId];
            const isCurrent = index === currentQuestionIndex;
            return (
              <Button
                key={index}
                variant={isCurrent ? "default" : "ghost"}
                size="sm"
                onClick={() => onQuestionSelect(index)}
                className={`h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl text-xs sm:text-sm touch-manipulation transition-all duration-200 hover:scale-105 ${
                  isAnswered ? 'bg-[hsla(var(--brand-green)/0.15)] text-primary border border-[hsla(var(--brand-green)/0.3)]' : ''
                } ${isCurrent ? 'ring-2 ring-[hsl(var(--brand-green))] shadow-lg' : ''}`}
                aria-label={`Question ${index + 1}${isAnswered ? ' (answered)' : ' (unanswered)'}${isCurrent ? ' (current question)' : ''}`}
                aria-current={isCurrent ? 'page' : undefined}
                role="tab"
                tabIndex={isCurrent ? 0 : -1}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[hsla(var(--brand-green)/0.35)] mr-2"></span>
              Answered ({answeredCount})
            </div>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 mr-2"></span>
              Unanswered ({totalQuestions - answeredCount})
            </div>
          </div>
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <strong>Keyboard shortcuts:</strong> Press 1-9 to jump to questions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

QuestionNavigation.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
  })).isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  answers: PropTypes.object,
  onQuestionSelect: PropTypes.func.isRequired,
};

QuestionNavigation.defaultProps = {
  answers: {},
};

export default QuestionNavigation;