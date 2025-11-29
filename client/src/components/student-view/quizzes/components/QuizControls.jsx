import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import PropTypes from 'prop-types';

function QuizControls({
  currentQuestionIndex,
  onPrevious,
  onNext,
  onSubmit,
  submitting,
  canSubmit,
  isLastQuestion,
  instantFeedbackEnabled
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <Button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        variant="secondary"
        className="w-full sm:w-auto rounded-2xl"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={submitting || !canSubmit}
          className="btn-primary w-full sm:w-auto"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Finalizing...' : (instantFeedbackEnabled ? 'Finalize Quiz' : 'Submit Quiz')}
        </Button>
      ) : (
        <Button onClick={onNext} className="w-full sm:w-auto rounded-2xl">
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

QuizControls.propTypes = {
  currentQuestionIndex: PropTypes.number.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  canSubmit: PropTypes.bool,
  isLastQuestion: PropTypes.bool,
  instantFeedbackEnabled: PropTypes.bool,
};

QuizControls.defaultProps = {
  submitting: false,
  canSubmit: false,
  isLastQuestion: false,
  instantFeedbackEnabled: false,
};

export default QuizControls;