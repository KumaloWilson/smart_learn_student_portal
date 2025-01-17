import React, { useState, useEffect } from 'react';
import { Modal, message, Row, Col, Progress, Space, Alert, Button, Tooltip } from 'antd';
import { QuestionCard } from '../../components/quiz/question_card';
import { Question } from '../../models/quiz_question';
import { QuestionCircleOutlined, ClockCircleOutlined, } from '@ant-design/icons';
import { QuestionResponse } from '../../models/quiz_question_response';
import { v4 as uuidv4 } from 'uuid';

interface QuizSessionProps {
    attempt_id: string;
    questions?: Question[];
    onQuizComplete: (responses: QuestionResponse[]) => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
    attempt_id,
    questions: initialQuestions = [],
    onQuizComplete,
}) => {
    const [session, setSession] = useState({
        questions: initialQuestions,
        current_question_index: 0,
    });
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
        initialQuestions[0] || null
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(
        initialQuestions[0]?.time_estimate || 0
    );
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [timeWarning, setTimeWarning] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (initialQuestions.length > 0) {
            setSession({
                questions: initialQuestions,
                current_question_index: 0,
            });
            setCurrentQuestion(initialQuestions[0]);
            setRemainingTime(initialQuestions[0].time_estimate);
        }
    }, [initialQuestions]);

    useEffect(() => {
        if (remainingTime <= 0) {
            handleTimeExpired();
            return;
        }

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
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

    const handleTimeExpired = () => {
        message.error('Time expired for this question!');
        if (selectedAnswer) {
            handleSubmitAnswer();
        } else {
            // Auto-submit with no answer if time expires
            const response: QuestionResponse = createQuestionResponse(null);
            handleResponseSubmission(response);
        }
    };

    const validateResponses = (responses: QuestionResponse[]): boolean => {
        // Check for duplicates
        const questionIds = new Set();
        for (const response of responses) {
            if (questionIds.has(response.question_id)) {
                console.error('Duplicate response found for question:', response.question_id);
                return false;
            }
            questionIds.add(response.question_id);
        }

        // Validate each response
        for (const response of responses) {
            if (!response.question_id || !response.attempt_id) {
                console.error('Invalid response data:', response);
                return false;
            }
        }

        return true;
    };


    const createQuestionResponse = (answer: string | null): QuestionResponse => {
        if (!currentQuestion) throw new Error('No current question available');

        // Calculate time taken, ensuring it's a valid number
        //const timeTaken = Math.max(0, currentQuestion.time_estimate - remainingTime);

        return {
            response_id: uuidv4(),
            attempt_id,
            question_id: currentQuestion.question_id,
            student_answer: answer || '',
            is_correct: answer === currentQuestion.correct_answer,
            time_taken: 10, //timeTaken, // This will now be a valid number
            points_earned: answer === currentQuestion.correct_answer ? currentQuestion.points : 0,
            feedback: answer === currentQuestion.correct_answer
                ? 'Correct!'
                : `Incorrect. The correct answer is "${currentQuestion.correct_answer}"`,
        };
    };

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setSubmissionError(null);
        message.success({
            content: 'Answer selected',
            duration: 1,
        });
    };

    const handleResponseSubmission = async (response: QuestionResponse) => {
        // Check if we already have a response for this question
        const existingResponseIndex = responses.findIndex(r => r.question_id === response.question_id);
        let updatedResponses: QuestionResponse[];

        if (existingResponseIndex !== -1) {
            // Update existing response
            updatedResponses = [...responses];
            updatedResponses[existingResponseIndex] = response;
        } else {
            // Add new response
            updatedResponses = [...responses, response];
        }

        setResponses(updatedResponses);

        if (session.current_question_index < session.questions.length - 1) {
            // Move to next question
            const nextIndex = session.current_question_index + 1;
            setSession(prev => ({
                ...prev,
                current_question_index: nextIndex,
            }));
            setCurrentQuestion(session.questions[nextIndex]);
            setSelectedAnswer(null);
            setRemainingTime(session.questions[nextIndex].time_estimate);
            setTimeWarning(false);
        } else {
            // Validate all responses before final submission
            if (!validateResponses(updatedResponses)) {
                setSubmissionError('Invalid or duplicate responses detected');
                message.error('Failed to submit quiz due to invalid responses');
                return;
            }

            try {
                await onQuizComplete(updatedResponses);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
                setSubmissionError(errorMessage);
                message.error(errorMessage);
            }
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion) return;

        if (!selectedAnswer) {
            message.warning('Please select an answer before proceeding');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = createQuestionResponse(selectedAnswer);
            await handleResponseSubmission(response);
        } catch (error) {
            setSubmissionError(error instanceof Error ? error.message : 'Failed to submit answer');
            message.error('Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session || !currentQuestion) {
        return (
            <Alert
                message="No Questions Available"
                description="Please try refreshing the page or contact support."
                type="error"
                showIcon
            />
        );
    }

    const progressPercent = (session.current_question_index / session.questions.length) * 100;
    const timePercent = (remainingTime / currentQuestion.time_estimate) * 100;

    return (
        <div className="quiz-session">
            <Space direction="vertical" size="large" className="w-full mb-4">
                {submissionError && (
                    <Alert
                        message="Submission Error"
                        description={submissionError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setSubmissionError(null)}
                    />
                )}

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
                                status={timeWarning ? 'exception' : 'normal'}
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
                title={<Space><QuestionCircleOutlined />Hint</Space>}
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

export default QuizSession;