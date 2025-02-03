import { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../../services/quiz_services/api';
import { QuizSession } from "../../models/quiz_session.ts";

interface QuizSessionHook {
    session: QuizSession | null;
    loading: boolean;
    error: string | null;
    resetSession: () => void;
    updateSessionStatus: (status: QuizSession['status']) => void;
    refreshSession: () => Promise<void>;
    isSessionActive: boolean;
    timeRemaining: number | null;
}

export const useQuizSession = (attempt_id: string): QuizSessionHook => {
    const [session, setSession] = useState<QuizSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    const loadSession = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await quizAPI.getQuizSession(attempt_id);

            if (!response.data) {
                throw new Error('No session data received');
            }

            // Validate session data
            if (!response.data.questions || !Array.isArray(response.data.questions)) {
                throw new Error('Invalid session data format');
            }

            setSession(response.data);

            // Calculate remaining time if session has time limit
            if (response.data.end_time) {
                const endTime = new Date(response.data.end_time).getTime();
                const currentTime = new Date().getTime();
                setTimeRemaining(Math.max(0, endTime - currentTime));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz session';
            setError(errorMessage);
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, [attempt_id]);

    // Initial load
    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // Timer effect for time remaining
    useEffect(() => {
        if (!timeRemaining || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1000; // Decrease by 1 second
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Auto-submit when time expires
    useEffect(() => {
        if (timeRemaining === 0 && session?.status === 'active') {
            updateSessionStatus('expired');
            // You might want to add auto-submit logic here
        }
    }, [timeRemaining, session?.status]);

    const resetSession = useCallback(() => {
        setSession(null);
        setLoading(false);
        setError(null);
        setTimeRemaining(null);
    }, []);

    const updateSessionStatus = useCallback((status: QuizSession['status']) => {
        setSession(prev => prev ? { ...prev, status } : null);
    }, []);

    const refreshSession = useCallback(async () => {
        await loadSession();
    }, [loadSession]);

    const isSessionActive = session?.status === 'active' &&
        (!timeRemaining || timeRemaining > 0);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            resetSession();
        };
    }, [resetSession]);

    return {
        session,
        loading,
        error,
        resetSession,
        updateSessionStatus,
        refreshSession,
        isSessionActive,
        timeRemaining
    };
};

