import React, { useState } from 'react';
import { useParams, useNavigate, } from 'react-router-dom';
import { message, Spin, Result, Button, Modal, Progress, Space, Alert } from 'antd';
import { LoadingOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { QuizSession } from '../../components/quiz/quiz_session';
import { quizAPI } from '../../services/quiz_services/api';
import { useQuizSession } from '../../hooks/quiz/quiz_session';
import { QuestionResponse } from '../../models/quiz_question_response';

const QuizSessionContainer: React.FC = () => {
    const { attempt_id } = useParams<{ attempt_id: string }>();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);

    const {
        session,
        loading,
        error,
    } = useQuizSession(attempt_id!);

    // Custom loading spinner
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const handleQuizComplete = async (responses: QuestionResponse[]) => {
        setSubmitting(true);

        try {

            const progressInterval = setInterval(() => {
                setSubmitProgress(prev => Math.min(prev + 10, 90));
            }, 300);

            const apiResponse = await quizAPI.submitQuiz(attempt_id!, responses);

            clearInterval(progressInterval);
            setSubmitProgress(100);

            // Check success at the top level of the response
            if (apiResponse.success === true) {
                message.success({
                    content: 'Quiz submitted successfully!',
                    duration: 3,
                    className: 'custom-success-message'
                });

                navigate(`/quiz/result/${attempt_id}`, {
                    state: {
                        fromSession: true,
                        score: apiResponse.data.score,
                        detailedResponses: apiResponse.data.detailedResponses
                    }
                });
            } else {
                throw new Error('Quiz submission failed');
            }
        } catch (error) {
            message.error({
                content: 'Failed to submit quiz. Please try again.',
                duration: 5,
                className: 'custom-error-message'
            });
            console.error('Quiz submission error:', error);
        } finally {
            setSubmitting(false);
            setSubmitProgress(0);
        }
    };


    const handleExitQuiz = () => {
        Modal.confirm({
            title: 'Exit Quiz',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Are you sure you want to exit?</p>
                    <Alert
                        message="Warning"
                        description="Your progress will be lost and cannot be recovered."
                        type="warning"
                        showIcon
                        className="mt-4"
                    />
                </div>
            ),
            okText: 'Yes, Exit Quiz',
            cancelText: 'Continue Quiz',
            okButtonProps: { danger: true },
            onOk: () => {
                message.info('Exiting quiz...');
                navigate('/quizzes/available', { replace: true });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <Space direction="vertical" align="center">
                    <Spin indicator={antIcon} size="large" />
                    <div className="mt-4 text-gray-600">
                        Loading quiz session...
                    </div>
                    <div className="text-sm text-gray-400">
                        <ClockCircleOutlined /> Please wait while we prepare your quiz
                    </div>
                </Space>
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
                        size="large"
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
                        size="large"
                    >
                        Go to Quiz List
                    </Button>
                ]}
            />
        );
    }

    return (
        <div className="quiz-session-container p-4">
            {submitting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <Progress
                            percent={submitProgress}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <p className="text-center mt-4">Submitting your quiz...</p>
                    </div>
                </div>
            )}

            <Alert
                message="Quiz in Progress"
                description="Take your time and read each question carefully. Good luck!"
                type="info"
                showIcon
                className="mb-4"
            />

            <QuizSession
                attempt_id={attempt_id!}
                questions={session.questions}
                onQuizComplete={handleQuizComplete}
                timeLimit={30}
            />

            <div className="fixed bottom-4 right-4">
                <Button
                    danger
                    size="large"
                    icon={<ExclamationCircleOutlined />}
                    onClick={handleExitQuiz}
                    className="shadow-lg"
                >
                    Exit Quiz
                </Button>
            </div>
        </div>
    );
};

export default QuizSessionContainer;