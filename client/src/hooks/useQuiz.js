import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  getQuizForTakingService,
  startQuizAttemptService,
  submitQuizAttemptService,
  finalizeQuizAttemptService,
  submitQuestionAnswerService,
} from "@/services";

export function useQuiz(quizId, validation) {
  const navigate = useNavigate();

  // State
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeAttemptInfo, setResumeAttemptInfo] = useState(null);

  // Fetch quiz data
  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getQuizForTakingService(quizId);
      if (response?.success) {
        const quizData = response.data.quiz;
        setQuiz(quizData);

        // Check if quiz has questions
        if (!quizData.questions || quizData.questions.length === 0) {
          alert("This quiz has no questions. Please contact your instructor.");
          navigate(-1);
          return;
        }

        // Use validation data to determine attempt state
        const existingAttempts = response.data.attempts || [];
        const resumeAttemptId = validation?.data?.resumeAttemptId;

        if (resumeAttemptId) {
          setAttemptId(resumeAttemptId);
          setIsResuming(true);
          const resumedAttempt = existingAttempts.find(
            (attempt) => attempt._id === resumeAttemptId
          );
          setResumeAttemptInfo(resumedAttempt || null);
        } else {
          setIsResuming(false);
          setResumeAttemptInfo(null);

          // Start new attempt
          const attemptResponse = await startQuizAttemptService(quizId);
          if (attemptResponse?.success) {
            setAttemptId(attemptResponse.data.attemptId);
          } else {
            console.error("Failed to start attempt:", attemptResponse);
            alert("Failed to start quiz attempt. Please try again.");
            navigate(-1);
          }
        }
      } else {
        console.error("Failed to load quiz:", response);
        alert("Failed to load quiz. Please try again.");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("An error occurred while loading the quiz.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [quizId, validation, navigate]);

  // Submit answer for instant feedback
  const submitAnswer = useCallback(async (questionId, answer) => {
    if (!attemptId) return null;

    try {
      const response = await submitQuestionAnswerService(quizId, attemptId, questionId, answer);
      if (response?.success) {
        return response.data;
      } else {
        alert("Failed to submit answer. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("An error occurred while submitting your answer.");
      return null;
    }
  }, [quizId, attemptId]);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (!attemptId) return false;

    try {
      setSubmitting(true);

      // Convert answers object to array format expected by backend
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await submitQuizAttemptService(quizId, attemptId, answersArray);
      if (response?.success) {
        toast({
          title: "Success",
          description: "Quiz submitted successfully!",
          variant: "default",
        });
        return true;
      } else {
        console.error("Quiz submission failed:", response);
        toast({
          title: "Error",
          description: "Failed to submit quiz. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the quiz. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [quizId, attemptId, answers]);

  // Finalize quiz (for instant feedback mode)
  const finalizeQuiz = useCallback(async () => {
    if (!attemptId) return false;

    try {
      setSubmitting(true);

      const response = await finalizeQuizAttemptService(quizId, attemptId);
      if (response?.success) {
        toast({
          title: "Success",
          description: "Quiz finalized successfully!",
          variant: "default",
        });
        return true;
      } else {
        console.error("Quiz finalization failed:", response);
        toast({
          title: "Error",
          description: "Failed to finalize quiz. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error finalizing quiz:", error);
      toast({
        title: "Error",
        description: "An error occurred while finalizing the quiz. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [quizId, attemptId]);

  // Initialize quiz data
  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Load resumed answers
  useEffect(() => {
    if (isResuming && resumeAttemptInfo && resumeAttemptInfo.answers) {
      const ans = resumeAttemptInfo.answers.reduce((acc, a) => {
        acc[a.questionId] = a.answer;
        return acc;
      }, {});
      setAnswers(ans);
    }
  }, [isResuming, resumeAttemptInfo]);

  return {
    quiz,
    attemptId,
    answers,
    loading,
    submitting,
    isResuming,
    resumeAttemptInfo,
    submitAnswer,
    submitQuiz,
    finalizeQuiz,
  };
}