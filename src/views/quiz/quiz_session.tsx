import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Spin, message, Row, Col, Button } from 'antd';
import { QuestionCard } from '../../components/quiz/question_card';
import { apiService } from '../../services/quiz_services/api';
import { Question } from '../../models/quiz_question';

const QuizSession: React.FC = () => {
    const { attempt_id } = useParams<{ attempt_id: string }>();
    const navigate = useNavigate();

    interface QuizSessionData {
        questions: Question[];
        current_question_index: number;
    }

    const [session, setSession] = useState<QuizSessionData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [showHint, setShowHint] = useState(false);
    const [responses, setResponses] = useState<unknown[]>([]);

    useEffect(() => {
        loadQuizSession();

        return () => {
            // Cleanup logic if needed
        };
    }, [attempt_id]);

    const loadQuizSession = async () => {
        try {
            const response = await apiService.startQuiz(attempt_id!);
            setSession(response.data);
            setCurrentQuestion(response.data.questions[0]);
            setRemainingTime(response.data.questions[0].time_estimate);
        } catch (error) {
            message.error(`Failed to load quiz session ${error}}`);
        }
    };

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || !currentQuestion) return;

        try {
            const response = await apiService.submitResponse({
                attempt_id: attempt_id!,
                question_id: currentQuestion.question_id,
                student_answer: selectedAnswer,
                time_taken: currentQuestion.time_estimate - remainingTime,
            });

            setResponses([...responses, response.data]);

            if (session && session.current_question_index < session.questions.length - 1) {
                setSession({
                    ...session,
                    current_question_index: session.current_question_index + 1,
                });
                setCurrentQuestion(session.questions[session.current_question_index + 1]);
                setSelectedAnswer(null);
                setRemainingTime(session.questions[session.current_question_index + 1].time_estimate);
            } else {
                await handleQuizComplete();
            }
        } catch (error) {
            message.error(`Failed to submit ${error}}`);
        }
    };

    const handleQuizComplete = async () => {
        try {
            await apiService.submitQuiz(attempt_id!, responses);
            navigate(`/quiz/result/${attempt_id}`);
        } catch (error) {
            message.error(`Failed to submit quiz ${error}}`);
        }
    };

    const handleShowHint = () => {
        setShowHint(true);
    };

    if (!session || !currentQuestion) return <Spin size="large" />;

    return (
        <div>
            <Row>
                <Col span={24}>
                    <QuestionCard
                        question={currentQuestion}
                        currentIndex={session.current_question_index}
                        totalQuestions={session.questions.length}
                        remainingTime={remainingTime}
                        selectedAnswer={selectedAnswer}
                        onSelectAnswer={handleSelectAnswer}
                        onSubmit={handleSubmitAnswer}
                        onShowHint={handleShowHint}
                    />
                </Col>
            </Row>

            <Row justify="end" style={{ marginTop: 20 }}>
                <Col>
                    <Button type="primary" onClick={handleSubmitAnswer}>
                        Submit Answer
                    </Button>
                </Col>
            </Row>

            <Modal
                title="Hint"
                visible={showHint}
                onOk={() => setShowHint(false)}
                onCancel={() => setShowHint(false)}
            >
                <p>{currentQuestion.hint}</p>
            </Modal>
        </div>
    );
};

export default QuizSession;
