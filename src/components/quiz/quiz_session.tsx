import React, { useState, useEffect } from 'react';
import { Modal, message, Row, Col, Progress, Space, Alert, Button, Tooltip } from 'antd';
import { QuestionCard } from './question_card';
import { Question } from '../../models/quiz_question';
import { QuestionCircleOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface QuizSessionProps {
    attempt_id: string;
    initialQuestions?: Question[];
    onQuizComplete: (responses: unknown[]) => void;
    onSubmitResponse: (responseData: {
        attempt_id: string;
        question_id: string;
        student_answer: string;
        time_taken: number;
    }) => Promise<unknown>;
}

interface SessionState {
    questions: Question[];
    current_question_index: number;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
    attempt_id,
    initialQuestions = [],
    onQuizComplete,
    onSubmitResponse
}) => {
    const [session, setSession] = useState<SessionState>({
        questions: initialQuestions,
        current_question_index: 0
    });
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
        initialQuestions[0] || null
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(
        initialQuestions[0]?.time_estimate || 0
    );
    const [showHint, setShowHint] = useState(false);
    const [responses, setResponses] = useState<unknown[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeWarning, setTimeWarning] = useState(false);

    useEffect(() => {
        if (initialQuestions.length > 0) {
            setSession({
                questions: initialQuestions,
                current_question_index: 0
            });
            setCurrentQuestion(initialQuestions[0]);
            setRemainingTime(initialQuestions[0].time_estimate);
        }
    }, [initialQuestions]);

    // Timer effect
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                const newTime = prev - 1;
                if (newTime <= 30 && !timeWarning) {
                    setTimeWarning(true);
                    message.warning('Less than 30 seconds remaining!');
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime, timeWarning]);

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        message.success({
            content: 'Answer selected',
            duration: 1,
            className: 'custom-message'
        });
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || !currentQuestion) {
            message.warning('Please select an answer before proceeding');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await onSubmitResponse({
                attempt_id,
                question_id: currentQuestion.question_id,
                student_answer: selectedAnswer,
                time_taken: currentQuestion.time_estimate - remainingTime,
            });

            const updatedResponses = [...responses, response];
            setResponses(updatedResponses);

            if (session.current_question_index < session.questions.length - 1) {
                message.success({
                    content: 'Answer submitted successfully!',
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
                });

                const nextIndex = session.current_question_index + 1;
                setSession({
                    ...session,
                    current_question_index: nextIndex,
                });
                setCurrentQuestion(session.questions[nextIndex]);
                setSelectedAnswer(null);
                setRemainingTime(session.questions[nextIndex].time_estimate);
                setTimeWarning(false);
            } else {
                message.success('Quiz completed! Submitting your responses...');
                onQuizComplete(updatedResponses);
            }
        } catch (error) {
            message.error({
                content: `Failed to submit answer. Please try again. ${error}`,
                duration: 5
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session || !currentQuestion) {
        return (
            <div className="flex justify-center items-center h-64">
                <Space direction="vertical" align="center">
                    <Alert
                        message="No Questions Available"
                        description="Please try refreshing the page or contact support."
                        type="error"
                        showIcon
                    />
                </Space>
            </div>
        );
    }

    const progressPercent = (session.current_question_index / session.questions.length) * 100;
    const timePercent = (remainingTime / currentQuestion.time_estimate) * 100;

    return (
        <div className="quiz-session">
            <Space direction="vertical" size="large" className="w-full mb-4">
                <Alert
                    message={`Question ${session.current_question_index + 1} of ${session.questions.length}`}
                    type="info"
                    showIcon
                />

                <Row justify="space-between" align="middle">
                    <Col span={12}>
                        <Progress
                            percent={progressPercent}
                            format={() => `${session.current_question_index + 1}/${session.questions.length}`}
                            status="active"
                        />
                    </Col>
                    <Col span={12}>
                        <Tooltip title="Time remaining for this question">
                            <Progress
                                type="circle"
                                percent={timePercent}
                                format={() => `${remainingTime}s`}
                                width={60}
                                status={timeWarning ? "exception" : "normal"}
                            />
                        </Tooltip>
                    </Col>
                </Row>
            </Space>

            <Row justify="center">
                <Col xs={24} sm={20} md={16}>
                    <QuestionCard
                        question={currentQuestion}
                        currentIndex={session.current_question_index}
                        totalQuestions={session.questions.length}
                        selectedAnswer={selectedAnswer}
                        remainingTime={remainingTime}
                        onSelectAnswer={handleSelectAnswer}
                        onSubmit={handleSubmitAnswer}
                        onShowHint={() => setShowHint(true)}
                        isSubmitting={isSubmitting}
                    />
                </Col>
            </Row>

            <Modal
                title={
                    <Space>
                        <QuestionCircleOutlined />
                        Hint
                    </Space>
                }
                open={showHint}
                onOk={() => setShowHint(false)}
                onCancel={() => setShowHint(false)}
                maskClosable={false}
                centered
            >
                <Alert
                    message="Hint Available"
                    description={currentQuestion.hint}
                    type="info"
                    showIcon
                />
            </Modal>

            {timeWarning && remainingTime > 0 && (
                <Alert
                    message="Time Warning"
                    description={`Only ${remainingTime} seconds remaining!`}
                    type="warning"
                    showIcon
                    icon={<ClockCircleOutlined />}
                    className="fixed bottom-4 right-4 w-64 shadow-lg"
                    action={
                        <Button size="small" type="text" onClick={() => setTimeWarning(false)}>
                            Dismiss
                        </Button>
                    }
                />
            )}
        </div>
    );
};