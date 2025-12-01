// quizService.js - Frontend API wrapper for quiz-related operations
import axios from 'axios';

// Base API URL - adjust based on your setup
const API_BASE = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

/**
 * Fetch quiz definition
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data
 */
export const fetchQuiz = async (quizId) => {
  try {
    const response = await api.get(`/student/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    throw error;
  }
};

/**
 * Create or resume a quiz attempt
 * @param {Object} payload - Attempt creation payload
 * @returns {Promise<Object>} Attempt data
 */
export const createAttempt = async (payload) => {
  try {
    const response = await api.post('/quiz/attempts', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create attempt:', error);
    throw error;
  }
};

/**
 * Update partial attempt (save progress)
 * @param {string} attemptId - Attempt ID
 * @param {Object} payload - Update payload
 * @returns {Promise<Object>} Updated attempt data
 */
export const updateAttempt = async (attemptId, payload) => {
  try {
    const response = await api.put(`/quiz/attempts/${attemptId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update attempt:', error);
    throw error;
  }
};

/**
 * Fetch in-progress attempt
 * @param {string} attemptId - Attempt ID
 * @returns {Promise<Object>} Attempt data
 */
export const fetchAttempt = async (attemptId) => {
  try {
    const response = await api.get(`/quiz/attempts/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attempt:', error);
    throw error;
  }
};

/**
 * Submit quiz attempt
 * @param {string} attemptId - Attempt ID
 * @param {Object} payload - Submission payload
 * @returns {Promise<Object>} Submission result
 */
export const submitAttempt = async (attemptId, payload) => {
  try {
    const response = await api.post(`/quiz/attempts/${attemptId}/submit`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to submit attempt:', error);
    throw error;
  }
};

/**
 * Validate quiz access for student
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Access validation result
 */
export const validateQuizAccess = async (quizId) => {
  try {
    const response = await api.get(`/student/quiz/${quizId}/validate`);
    return response.data;
  } catch (error) {
    console.error('Failed to validate quiz access:', error);
    throw error;
  }
};

/**
 * Submit answer for individual question (practice mode)
 * @param {string} quizId - Quiz ID
 * @param {string} attemptId - Attempt ID
 * @param {string} questionId - Question ID
 * @param {string} answer - Answer value
 * @returns {Promise<Object>} Feedback result
 */
export const submitQuestionAnswer = async (quizId, attemptId, questionId, answer) => {
  try {
    const response = await api.post(`/student/quiz/${quizId}/attempt/${attemptId}/question/${questionId}`, {
      answer,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit question answer:', error);
    throw error;
  }
};

/**
 * Finalize practice mode attempt
 * @param {string} quizId - Quiz ID
 * @param {string} attemptId - Attempt ID
 * @returns {Promise<Object>} Finalization result
 */
export const finalizeAttempt = async (quizId, attemptId) => {
  try {
    const response = await api.post(`/quiz/attempts/${attemptId}/finalize`);
    return response.data;
  } catch (error) {
    console.error('Failed to finalize attempt:', error);
    throw error;
  }
};

/**
 * Get quiz results
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Results data
 */
export const getQuizResults = async (quizId) => {
  try {
    const response = await api.get(`/student/quiz/${quizId}/results`);
    return response.data;
  } catch (error) {
    console.error('Failed to get quiz results:', error);
    throw error;
  }
};

// Export default object for easier importing
export default {
  fetchQuiz,
  createAttempt,
  updateAttempt,
  fetchAttempt,
  submitAttempt,
  validateQuizAccess,
  submitQuestionAnswer,
  finalizeAttempt,
  getQuizResults,
};