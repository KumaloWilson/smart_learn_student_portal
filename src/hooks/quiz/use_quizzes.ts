
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { quizAPI } from '../../services/quiz_services/api';
import { Quiz } from '../../models/quiz';
import { v4 as uuidv4 } from 'uuid';

interface UseQuizzesResult {
    quizzes: Quiz[];
    isLoading: boolean;
    error: string | null;
    createCustomQuiz: (quizData: Partial<Quiz>) => Promise<void>;
    refreshQuizzes: () => Promise<void>;
    getQuizzesByCourse: (courseId: string) => Quiz[];
}

export const useQuizzes = (studentId: string): UseQuizzesResult => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadQuizzes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch available quizzes from the API
            const response = await quizAPI.getQuizzes();

            if (!response.data) {
                throw new Error('No quiz data received');
            }

            // Filter and transform quizzes as needed
            const availableQuizzes = response.data.map((quiz: Quiz) => ({
                ...quiz,
                isCustom: false
            }));

            setQuizzes(availableQuizzes);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load quizzes';
            setError(errorMessage);
            message.error('Failed to load quizzes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    const createCustomQuiz = async (quizData: Partial<Quiz>) => {
        try {
            setIsLoading(true);

            const customQuizData = {
                quiz_id: uuidv4(),
                student_id: studentId,
                course_id: quizData.course_id || 'custom',
                created_by: studentId,
                status: 'active',
                isCustom: true,
                ...quizData
            };

            // Create the custom quiz
            const response = await quizAPI.createQuiz(customQuizData);

            if (!response.data) {
                throw new Error('Failed to create custom quiz');
            }

            // Start the quiz session
            const sessionResponse = await quizAPI.startQuiz({
                quiz_id: response.data.quiz_id,
                student_id: studentId
            });

            if (!sessionResponse.data) {
                throw new Error('Failed to start quiz session');
            }

            // Add the new quiz to the state
            setQuizzes(prev => [...prev, response.data]);

            return sessionResponse.data.attempt_id;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create custom quiz';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshQuizzes = async () => {
        await loadQuizzes();
    };

    const getQuizzesByCourse = useCallback((courseId: string) => {
        return quizzes.filter(quiz => quiz.course_id === courseId);
    }, [quizzes]);

    return {
        quizzes,
        isLoading,
        error,
        createCustomQuiz,
        refreshQuizzes,
        getQuizzesByCourse
    };
};