import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Clock, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

export const ModeChooser = ({
  quiz,
  onModeSelect,
  className = ''
}) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'exam',
      title: 'Exam Mode',
      description: 'Timed assessment with answers hidden until submission',
      icon: Clock,
      features: [
        'Timed quiz (if configured)',
        'Answers hidden until submission',
        'Final results after completion',
        'Cannot change answers after submit'
      ],
      color: 'blue',
      variant: 'default'
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Learn with instant feedback and explanations',
      icon: BookOpen,
      features: [
        'Instant feedback after each question',
        'Explanations provided',
        'Can retry questions',
        'No time pressure'
      ],
      color: 'green',
      variant: 'secondary'
    }
  ];

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    onModeSelect(modeId);
  };

  const getQuizInfo = () => {
    if (!quiz) return null;

    const info = [];
    if (quiz.timeLimit) {
      info.push(`${quiz.timeLimit} minutes`);
    }
    if (quiz.questions?.length) {
      info.push(`${quiz.questions.length} questions`);
    }
    if (quiz.passingScore) {
      info.push(`${quiz.passingScore}% passing score`);
    }

    return info;
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Quiz Mode
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {quiz?.title || 'Quiz'}
        </p>

        {quiz && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {getQuizInfo()?.map((info, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {info}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? `ring-2 ring-${mode.color}-500 shadow-lg`
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${mode.color}-100`}>
                    <Icon className={`h-6 w-6 text-${mode.color}-600`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{mode.title}</CardTitle>
                    <CardDescription className="text-base">
                      {mode.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMode && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Ready to start?</span>
            </div>
            <p className="text-blue-700 text-sm">
              You selected <strong>{modes.find(m => m.id === selectedMode)?.title}</strong>.
              Make sure you are in a quiet environment and have enough time to complete the quiz.
            </p>
          </div>

          <Button
            onClick={() => handleModeSelect(selectedMode)}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Start Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

ModeChooser.propTypes = {
  quiz: PropTypes.object,
  onModeSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};