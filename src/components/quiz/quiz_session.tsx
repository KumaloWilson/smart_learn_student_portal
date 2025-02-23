import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../../models/quiz_question';
import { QuestionCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { QuestionResponse } from '../../models/quiz_question_response';
import { v4 as uuidv4 } from 'uuid';
import { message, Alert, Space, Row, Col, Modal, Button } from 'antd';
import { QuestionCard } from './question_card';

interface QuizSessionProps {
    attempt_id: string;
    questions?: Question[];
    timeLimit: number;
    onQuizComplete: (responses: QuestionResponse[]) => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
    attempt_id,
    questions: initialQuestions = [],
    timeLimit,
    onQuizComplete,
}) => {
    // State management
    const [session, setSession] = useState({
        questions: initialQuestions,
        currentIndex: 0,
    });
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
        initialQuestions[0] || null
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [quizTimeRemaining, setQuizTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [timeWarning, setTimeWarning] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Refs for time tracking
    const questionStartTime = useRef<number>(Date.now());
    const questionTimeSpent = useRef<number>(0);

    // Initialize quiz
    useEffect(() => {
        if (initialQuestions.length > 0) {
            setSession({
                questions: initialQuestions,
                currentIndex: 0,
            });
            setCurrentQuestion(initialQuestions[0]);
            questionStartTime.current = Date.now();
        }
    }, [initialQuestions]);

    // Quiz timer
    useEffect(() => {
        const timer = setInterval(() => {
            setQuizTimeRemaining(prev => {
                const newTime = prev - 1;

                // Update question time spent
                questionTimeSpent.current = (Date.now() - questionStartTime.current) / 1000;

                // Time warnings
                if (newTime <= 60 && !timeWarning) {
                    setTimeWarning(true);
                    message.warning('Less than 1 minute remaining in the quiz!');
                }

                // Auto-submit when time is up
                if (newTime <= 0) {
                    clearInterval(timer);
                    handleQuizTimeUp();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleQuizTimeUp = useCallback(async () => {
        message.error('Quiz time is up! Submitting your answers...');

        // Submit current question if answer selected
        if (selectedAnswer && currentQuestion) {
            const response = createQuestionResponse(selectedAnswer);
            const updatedResponses = [...responses, response];

            try {
                await onQuizComplete(updatedResponses);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
                setSubmissionError(errorMessage);
                message.error(errorMessage);
            }
        } else {
            // Submit quiz with current responses
            try {
                await onQuizComplete(responses);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
                setSubmissionError(errorMessage);
                message.error(errorMessage);
            }
        }
    }, [selectedAnswer, currentQuestion, responses, onQuizComplete]);

    const createQuestionResponse = (answer: string): QuestionResponse => {
        if (!currentQuestion) throw new Error('No current question available');

        return {
            response_id: uuidv4(),
            attempt_id,
            question_id: currentQuestion.question_id,
            student_answer: answer,
            is_correct: answer === currentQuestion.correct_answer,
            time_taken: Math.floor(questionTimeSpent.current),
            points_earned: answer === currentQuestion.correct_answer ? currentQuestion.points : 0,
            feedback: answer === currentQuestion.correct_answer
                ? 'Correct!'
                : `Incorrect. The correct answer is "${currentQuestion.correct_answer}"`,
        };
    };

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setSubmissionError(null);
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion || !selectedAnswer) return;

        setIsSubmitting(true);
        try {
            const response = createQuestionResponse(selectedAnswer);
            const updatedResponses = [...responses, response];
            setResponses(updatedResponses);

            if (session.currentIndex < session.questions.length - 1) {
                // Move to next question
                const nextIndex = session.currentIndex + 1;
                setSession(prev => ({
                    ...prev,
                    currentIndex: nextIndex,
                }));
                setCurrentQuestion(session.questions[nextIndex]);
                setSelectedAnswer(null);
                questionStartTime.current = Date.now(); // Reset question timer
                questionTimeSpent.current = 0;
            } else {
                // Quiz complete
                await onQuizComplete(updatedResponses);
            }
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

                <Row justify="center">
                    <Col xs={24} sm={20} md={16}>
                        <QuestionCard
                            question={currentQuestion}
                            currentIndex={session.currentIndex}
                            totalQuestions={session.questions.length}
                            quizTimeRemaining={quizTimeRemaining}
                            questionTimeSpent={questionTimeSpent.current}
                            selectedAnswer={selectedAnswer}
                            onSelectAnswer={handleSelectAnswer}
                            onSubmit={handleSubmitAnswer}
                            onShowHint={() => setShowHint(true)}
                            isSubmitting={isSubmitting}
                        />
                    </Col>
                </Row>
            </Space>

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
                    description={"currentQuestion.hint"}
                    type="info"
                    showIcon
                />
            </Modal>

            {timeWarning && quizTimeRemaining > 0 && (
                <Alert
                    message="Time Warning"
                    description={`Only ${Math.floor(quizTimeRemaining / 60)}:${(quizTimeRemaining % 60).toString().padStart(2, '0')} remaining!`}
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
