import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getQuestionsForInstructorsService } from "@/services";

function QuestionBankModal({ open, onOpenChange, onSelectQuestion }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState(["all"]);
  const { toast } = useToast();

  const fetchQuestions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getQuestionsForInstructorsService(params);
      setQuestions(response.data.questions);

      // Extract unique subjects
      const uniqueSubjects = [...new Set(response.data.questions.map(q => q.subject))];
      setSubjects(["all", ...uniqueSubjects]);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch questions when modal opens or filters change
  useEffect(() => {
    if (open) {
      fetchQuestions({
        subject: subjectFilter,
        difficulty: difficultyFilter,
        search: searchTerm,
      });
    }
  }, [open, subjectFilter, difficultyFilter, searchTerm, fetchQuestions]);

  const difficulties = ["all", "easy", "medium", "hard"];

  const handleSelectQuestion = (question) => {
    // Transform question to match the expected format for quiz creation
    const quizQuestion = {
      mode: "bank",
      bankQuestionId: question._id,
      question: question.questionText, // Include question text for display
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer,
      points: 1, // Default points, can be adjusted in quiz form
      subject: question.subject,
      difficulty: question.difficulty,
      tags: question.tags,
      explanation: question.explanation,
    };
    onSelectQuestion(quizQuestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Question Bank</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search question or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject === "all" ? "All Subjects" : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Difficulties" : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No questions match your filter. Try adjusting your search.
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question._id}
                  className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{question.subject}</p>
                    <Badge variant="outline">{question.difficulty}</Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{question.questionText}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {question.options.length > 0 && (
                    <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground">
                      {question.options.map((option, index) => (
                        <li key={`${question._id}-option-${index}`}>{option}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Created by: <span className="font-semibold text-foreground">{question.createdBy?.userName || "Admin"}</span>
                    </p>
                    <Button size="sm" onClick={() => handleSelectQuestion(question)}>
                      Add to Quiz
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

QuestionBankModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSelectQuestion: PropTypes.func.isRequired,
};

export default QuestionBankModal;
