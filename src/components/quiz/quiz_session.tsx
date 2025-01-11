import React, { useState, useEffect } from 'react';
import { Modal, message, Row, Col } from 'antd';
import { QuestionCard } from './question_card';
import { Question } from '../../models/quiz_question';

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

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || !currentQuestion) return;

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
                const nextIndex = session.current_question_index + 1;
                setSession({
                    ...session,
                    current_question_index: nextIndex,
                });
                setCurrentQuestion(session.questions[nextIndex]);
                setSelectedAnswer(null);
                setRemainingTime(session.questions[nextIndex].time_estimate);
            } else {
                onQuizComplete(updatedResponses);
            }
        } catch (error) {
            message.error(`Failed to submit answer: ${error}`);
        }
    };

    if (!session || !currentQuestion) return null;

    return (
        <div className="quiz-session">
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
                    />
                </Col>
            </Row>

            <Modal
                title="Hint"
                open={showHint}
                onOk={() => setShowHint(false)}
                onCancel={() => setShowHint(false)}
            >
                <p>{currentQuestion.hint}</p>
            </Modal>
        </div>
    );
};