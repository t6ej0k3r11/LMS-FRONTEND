# Quiz Feature

A comprehensive, production-ready quiz system for the LMS with exam and practice modes, persistence, and analytics.

## Overview

The quiz feature provides a modular, accessible quiz experience with the following capabilities:

- **Two Modes**: Exam mode (timed, answers hidden until submission) and Practice mode (instant feedback)
- **Question Types**: Multiple choice, multiple select, true/false, short text, broad text, and code snippets
- **Persistence**: LocalStorage backup with server sync for incomplete attempts
- **Resume**: Ability to resume interrupted quiz attempts
- **Analytics**: Per-question timing and attempt tracking
- **Accessibility**: Full keyboard navigation and ARIA support
- **Responsive**: Mobile-friendly with collapsible sidebar

## Architecture

### Directory Structure

```
client/src/features/quiz/
├── components/
│   ├── QuizPlayer/           # Main orchestrator component
│   ├── ModeChooser.jsx       # Exam/Practice mode selector
│   ├── QuestionRenderer.jsx  # Question display and interaction
│   ├── Timer.jsx             # Timer with pause/resume
│   ├── NavigationBar.jsx     # Top progress and navigation
│   ├── QuestionSidebar.jsx   # Collapsible question list
│   ├── FeedbackSystem.jsx    # Instant feedback display
│   ├── ResultsReport.jsx     # Final results display
│   ├── RetryReviewControls.jsx # Retry/review actions
│   └── ResumeBanner.jsx      # Resume prompt for saved attempts
├── hooks/
│   ├── useQuizState.js       # Central state management
│   └── useTimer.js           # Timer logic
├── utils/
│   ├── attemptStorage.js     # localStorage helpers
│   └── quizCalculator.js     # Scoring and analytics
├── api/
│   └── quizService.js        # API wrapper
└── README.md
```

### Key Components

#### QuizPlayer (Main Orchestrator)
- Manages overall quiz flow and state
- Handles mode selection and initialization
- Coordinates between timer, navigation, and question display
- Manages persistence and resume functionality

#### useQuizState Hook
- Central state management for quiz data, answers, and analytics
- Handles persistence with auto-save every 5 seconds
- Manages question navigation and answer submission
- Coordinates with timer and feedback systems

#### QuestionRenderer
- Supports multiple question types with consistent UI
- Handles accessibility (ARIA labels, keyboard navigation)
- Shows correct/incorrect feedback in practice mode
- Supports code syntax highlighting for code questions

## Usage

### Basic Implementation

```jsx
import { QuizPlayer } from '@/features/quiz/components/QuizPlayer';

function QuizPage({ quizId, userId }) {
  const handleQuizComplete = (results) => {
    console.log('Quiz completed:', results);
    // Handle completion (navigation, notifications, etc.)
  };

  return (
    <QuizPlayer
      quizId={quizId}
      userId={userId}
      onComplete={handleQuizComplete}
    />
  );
}
```

### With Custom Quiz Data

```jsx
import { useQuizState } from '@/features/quiz/hooks/useQuizState';

function CustomQuizPlayer({ quizData, userId }) {
  const quizState = useQuizState({
    userId,
    initialQuizData: quizData,
    onQuizComplete: handleComplete,
  });

  // Render quiz UI using quizState
}
```

## API Integration

The quiz system integrates with the existing LMS backend through the `quizService.js` wrapper:

### Key Endpoints Used

- `GET /student/quiz/:quizId` - Fetch quiz data
- `POST /student/quiz/:quizId/attempt` - Start attempt
- `PUT /student/quiz/:quizId/attempt/:attemptId` - Submit answers
- `POST /student/quiz/:quizId/attempt/:attemptId/question/:questionId` - Submit individual answers (practice mode)

### Data Flow

1. **Load Quiz**: Fetch quiz definition with questions and settings
2. **Start Attempt**: Create server-side attempt record
3. **Answer Questions**: Submit answers individually (practice) or batch (exam)
4. **Complete Quiz**: Final submission with scoring
5. **Persist Progress**: Auto-save to localStorage with server sync

## Persistence Strategy

### localStorage Backup
- Key format: `quiz-attempt-{userId}-{quizId}`
- Stores complete attempt state including answers, timing, and analytics
- Auto-saves every 5 seconds and on visibility changes
- Survives page refreshes and browser crashes

### Server Sync
- Attempts are created server-side for tracking
- Progress can be synced to server for cross-device resume
- Final submissions always go through server for validation

### Resume Flow
1. Check for existing localStorage snapshot on load
2. Show resume banner if incomplete attempt found
3. Restore state from snapshot if user chooses to resume
4. Clear snapshot on successful completion

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Comprehensive screen reader support
- **Focus Management**: Proper focus indicators and trap management
- **Color Contrast**: WCAG compliant color schemes
- **Responsive Design**: Touch-friendly on mobile devices

### Keyboard Shortcuts

- `←/→` - Previous/Next question
- `F` - Flag/unflag current question
- `S` - Submit quiz (with confirmation)
- `Space` - Select option (radio buttons)
- `Enter` - Confirm selection

## Question Types

### Supported Types

1. **Multiple Choice** (`multiple-choice`)
   - Single selection from options
   - Radio button interface

2. **Multiple Select** (`multiple-select`)
   - Multiple selections allowed
   - Checkbox interface with partial scoring

3. **True/False** (`true-false`)
   - Boolean choice
   - Specialized UI for binary options

4. **Short Text** (`short-text`)
   - Brief text input
   - Manual review required

5. **Broad Text** (`broad-text`)
   - Long-form text input
   - Manual review required

6. **Code Snippet** (`code-snippet`)
   - Code input with syntax highlighting
   - Manual review required

### Scoring Rules

- **Multiple Choice/True-False**: 100% for correct, 0% for incorrect
- **Multiple Select**: Partial credit based on correct selections
- **Text/Code**: Manual review (0 until reviewed, then instructor determined)

## Analytics & Reporting

### Per-Question Analytics

- **Time Spent**: Seconds spent on each question
- **Attempts**: Number of answer changes
- **Correctness**: Correct/incorrect/manual review status
- **Chosen Options**: Track of all selected answers

### Quiz-Level Analytics

- **Total Score**: Percentage based on auto-gradable questions
- **Time Spent**: Total duration
- **Completion Status**: Complete/incomplete/abandoned
- **Question Progress**: Answered vs unanswered

### Export Options

- **JSON**: Complete analytics data
- **HTML/PDF**: Formatted report for sharing
- **CSV**: Summary data for analysis

## Error Handling

### Network Errors
- Graceful fallback to localStorage-only mode
- Retry mechanisms for failed submissions
- User-friendly error messages

### Data Validation
- Client-side validation for required fields
- Server-side validation for security
- Sanitization of user inputs

### Edge Cases
- Timer expiration during submission
- Browser crashes during quiz
- Network interruptions
- Invalid quiz data

## Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Components load on demand
- **Debounced Saves**: Auto-save throttled to prevent spam
- **Memory Management**: Cleanup of timers and event listeners
- **Bundle Splitting**: Feature loaded asynchronously

### Memory Usage

- Quiz state kept in memory during session
- localStorage used for persistence (5MB limit)
- Automatic cleanup of completed attempts

## Testing Strategy

### Unit Tests
- Utility functions (scoring, formatting)
- Hook logic (state management, timer)
- Component rendering and interactions

### Integration Tests
- Full quiz flow (start → answer → submit)
- Persistence and resume functionality
- API error handling

### E2E Tests
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: Screen reader compatible (NVDA, JAWS, VoiceOver)

## Future Enhancements

### Potential Features

- **Real-time Collaboration**: Multi-user quiz sessions
- **Advanced Question Types**: Drag-and-drop, drawing, audio
- **AI-Powered Feedback**: Automated explanations
- **Progress Tracking**: Detailed learning analytics
- **Offline Mode**: Complete PWA functionality
- **Custom Themes**: Quiz branding and customization

### Technical Improvements

- **WebRTC**: Real-time audio/video proctoring
- **Service Workers**: Background sync for offline attempts
- **WebAssembly**: Performance optimization for complex scoring
- **Machine Learning**: Adaptive question difficulty

## Migration Notes

### From Existing Quiz System

1. **Data Migration**: Export existing quiz data and transform to new format
2. **URL Updates**: Update routing to use new quiz player
3. **Feature Flags**: Gradual rollout with feature flags
4. **Backwards Compatibility**: Maintain old system during transition

### Backend Changes Required

The new quiz system requires the following backend modifications:

1. **Enhanced Quiz Model**: Add `instantFeedbackEnabled` and other new fields
2. **Attempt Persistence**: Server-side attempt storage with resume capability
3. **Individual Answer Submission**: New endpoint for practice mode feedback
4. **Analytics Storage**: Per-question timing and attempt tracking

See `backend-patches/` for detailed implementation patches.