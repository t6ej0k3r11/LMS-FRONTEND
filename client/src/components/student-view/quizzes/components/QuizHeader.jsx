import { ListChecks, Trophy, TimerReset } from "lucide-react";
import PropTypes from 'prop-types';

function QuizHeader({ quiz, currentQuestionIndex, attemptId, isResuming, resumeAttemptInfo, ariaProps = {}, isReviewMode = false }) {
  const metaChips = [
    {
      label: `${quiz.questions.length} Questions`,
      icon: ListChecks,
    },
    {
      label: `${quiz.passingScore || 70}% Passing`,
      icon: Trophy,
    },
    {
      label: isReviewMode ? "Review Mode" : (quiz.quizType === "final" ? "Exam Mode" : "Practice Mode"),
      icon: TimerReset,
    },
  ];

  const attemptStatusMessage = isResuming ? "Resuming previous attempt" : null;

  return (
    <section
      className="glass-effect rounded-[30px] border border-white/50 p-5 sm:p-8 shadow-[0_25px_60px_rgba(12,49,36,0.18)]"
      role="banner"
      aria-labelledby={ariaProps.titleId}
      aria-describedby={ariaProps.progressId}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Quiz Session</p>
          <h1 id={ariaProps.titleId} className="mt-2 text-3xl font-bold text-foreground">{quiz.title}</h1>
          {attemptStatusMessage && (
            <p className="mt-3 text-sm text-muted-foreground">
              {attemptStatusMessage}
              {isResuming && resumeAttemptInfo && (
                <span className="block text-xs mt-1">
                  Started on {new Date(resumeAttemptInfo.startedAt).toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {metaChips.map(({ label, icon: Icon }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/60 bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Progress</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-4xl font-bold text-foreground">
              {currentQuestionIndex + 1}
              <span className="text-lg text-muted-foreground">/{quiz.questions.length}</span>
            </p>
          </div>
          <div
            className="mt-3 h-2 rounded-full bg-[hsla(var(--brand-green)/0.15)]"
            role="progressbar"
            aria-valuenow={currentQuestionIndex + 1}
            aria-valuemin={1}
            aria-valuemax={quiz.questions.length}
            aria-label={`Question progress: ${currentQuestionIndex + 1} of ${quiz.questions.length}`}
          >
            <div
              className="h-full rounded-full bg-[hsl(var(--brand-green))] transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
          <div id={ariaProps.progressId} className="sr-only">
            Quiz progress: Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Attempt Info</p>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p>Attempt ID: <span className="font-semibold text-foreground">{attemptId?.slice(-6) || "New"}</span></p>
            {isResuming && resumeAttemptInfo && (
              <p>Started: {new Date(resumeAttemptInfo.startedAt).toLocaleString()}</p>
            )}
            <p>Status: <span className="text-primary font-medium">{isResuming ? "Resuming" : "In progress"}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

QuizHeader.propTypes = {
  quiz: PropTypes.shape({
    title: PropTypes.string.isRequired,
    questions: PropTypes.array.isRequired,
    passingScore: PropTypes.number,
    quizType: PropTypes.string,
  }).isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  attemptId: PropTypes.string,
  isResuming: PropTypes.bool,
  resumeAttemptInfo: PropTypes.object,
  ariaProps: PropTypes.shape({
    titleId: PropTypes.string,
    progressId: PropTypes.string,
  }),
  isReviewMode: PropTypes.bool,
};

export default QuizHeader;