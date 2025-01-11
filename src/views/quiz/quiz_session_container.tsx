import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message, Spin, Result, Button, Modal } from 'antd';
import { QuizSession } from '../../components/quiz/quiz_session';
import { apiService } from '../../services/quiz_services/api';
import { useQuizSession } from '../../hooks/quiz/quiz_session';

interface LocationState {
    fromQuizList?: boolean;
}

const QuizSessionContainer: React.FC = () => {
    const { attempt_id } = useParams<{ attempt_id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState;

    const {
        session,
        loading,
        error,
        resetSession
    } = useQuizSession(attempt_id!);

    useEffect(() => {
        // Ensure the session is accessed properly through the quiz list
        if (!locationState?.fromQuizList && !session) {
            navigate('/quizzes/available', {
                replace: true,
                state: { error: 'Please start the quiz from the quiz list' }
            });
        }

        // Cleanup function to reset session when unmounting
        return () => {
            resetSession();
        };
    }, [locationState, session, navigate, resetSession]);

    const handleQuizComplete = async (responses: unknown[]) => {
        try {
            const result = await apiService.submitQuiz(attempt_id!, responses);

            if (result.data.status === 'completed') {
                message.success('Quiz submitted successfully!');
                navigate(`/quiz/result/${attempt_id}`, {
                    state: { fromSession: true }
                });
            } else {
                throw new Error('Quiz submission failed');
            }
        } catch (error) {
            message.error('Failed to submit quiz. Please try again.');
            console.error('Quiz submission error:', error);
        }
    };

    const handleSubmitResponse = async (responseData: {
        attempt_id: string;
        question_id: string;
        student_answer: string;
        time_taken: number;
    }) => {
        try {
            const response = await apiService.submitResponse(responseData);

            if (response.data.status === 'error') {
                throw new Error(response.data.message);
            }

            message.success('Answer submitted successfully');
            return response.data;
        } catch (error) {
            message.error('Failed to submit answer. Please try again.');
            console.error('Response submission error:', error);
            throw error;
        }
    };

    const handleExitQuiz = () => {
        Modal.confirm({
            title: 'Exit Quiz',
            content: 'Are you sure you want to exit? Your progress will be lost.',
            onOk: () => {
                navigate('/quizzes/available', { replace: true });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Loading quiz session..." />
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Failed to load quiz"
                subTitle={error}
                extra={[
                    <Button
                        type="primary"
                        key="back"
                        onClick={() => navigate('/quizzes/available')}
                    >
                        Back to Quiz List
                    </Button>
                ]}
            />
        );
    }

    if (!session) {
        return (
            <Result
                status="warning"
                title="No Quiz Session Found"
                subTitle="Please start a new quiz from the quiz list"
                extra={[
                    <Button
                        type="primary"
                        key="back"
                        onClick={() => navigate('/quizzes/available')}
                    >
                        Go to Quiz List
                    </Button>
                ]}
            />
        );
    }

    return (
        <div className="quiz-session-container">
            <QuizSession
                attempt_id={attempt_id!}
                initialQuestions={session.questions}
                onQuizComplete={handleQuizComplete}
                onSubmitResponse={handleSubmitResponse}
            />
            <Button
                danger
                className="mt-4"
                onClick={handleExitQuiz}
            >
                Exit Quiz
            </Button>
        </div>
    );
};

export default QuizSessionContainer;