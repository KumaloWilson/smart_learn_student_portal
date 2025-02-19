
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { quizAPI } from '../../services/quiz_services/api';
import { Quiz } from '../../models/quiz';

interface UseQuizzesResult {
    quizzes: Quiz[];
    isLoading: boolean;
    error: string | null;
    createCustomQuiz: (values: Partial<Quiz>) => Promise<Quiz>
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

    const createCustomQuiz = async (values: Partial<Quiz>) => {
        try {
            const requestBody = {
                ...values,
                created_by: studentId,
                status: 'active',
                creator_role: 'student',
                learning_objectives: values.learning_objectives || [
                    `Understand ${values.topic} concepts`,
                    `Master ${values.topic} fundamentals`
                ],
                tags: [
                    values.topic?.toLowerCase(),
                    values.difficulty,
                    values.subtopic?.toLowerCase()
                ].filter(Boolean)
            };

            const response = await quizAPI.createQuiz(requestBody);


            if (response.success) {
                message.success('Quiz created successfully');

                // Refresh quizzes and return the created quiz
                await loadQuizzes();
                return response.data;  // Return the created quiz object
            }
            throw new Error('Quiz creation failed');
        } catch (error) {
            message.error('Failed to create quiz');
            throw error;
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
        refreshQuizzes,
        createCustomQuiz,
        getQuizzesByCourse
    };
};