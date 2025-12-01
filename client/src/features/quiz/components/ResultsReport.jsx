import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Trophy, RotateCcw, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

export const ResultsReport = ({
  quiz,
  results,
  onRetry,
  onReview,
  onExit,
  className = ''
}) => {
  const { score, passed, answers, attempts } = results || {};

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = () => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl mb-2">Quiz Completed!</CardTitle>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant={getScoreBadgeVariant()} className="text-lg px-4 py-2">
              Score: {score}%
            </Badge>
            <Badge variant={passed ? 'default' : 'destructive'}>
              {passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{answers?.length || 0}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{attempts?.length || 1}</div>
              <div className="text-sm text-gray-600">Attempts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor()}`}>{score}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={onRetry} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Retry Quiz</span>
            </Button>
            <Button onClick={onReview} variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Review Answers</span>
            </Button>
            <Button onClick={onExit} className="flex items-center space-x-2">
              <span>Exit Quiz</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ResultsReport.propTypes = {
  quiz: PropTypes.object,
  results: PropTypes.shape({
    score: PropTypes.number,
    passed: PropTypes.bool,
    answers: PropTypes.array,
    attempts: PropTypes.array,
  }),
  onRetry: PropTypes.func,
  onReview: PropTypes.func,
  onExit: PropTypes.func,
  className: PropTypes.string,
};