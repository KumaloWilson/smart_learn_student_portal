import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Empty } from 'antd';
import { QuizCard } from '../../components/quiz/card';
import { apiService } from '../../services/quiz_services/api';
import { Quiz } from '../../models/quiz';

const { Title } = Typography;

interface QuizListProps {
    filterType?: 'attempts' | 'completed';
    onQuizStart?: (attempt_id: string) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
    filterType,
    onQuizStart
}) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, [filterType]);

    const loadQuizzes = async () => {
        try {
            const response = await apiService.getQuizzes(filterType);
            setQuizzes(response.data);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = async (quiz_id: string) => {
        if (!onQuizStart) return;

        try {
            const response = await apiService.startQuiz(quiz_id);
            onQuizStart(response.data.quizSession.attempt_id);
        } catch (error) {
            console.log(error)
        }
    };

    if (loading) return <Spin size="large" />;

    if (!quizzes.length) {
        return (
            <Empty
                description={
                    filterType === 'attempts' ? 'No quiz attempts yet' :
                        filterType === 'completed' ? 'No completed quizzes' :
                            'No quizzes available'
                }
            />
        );
    }

    return (
        <div className="quiz-list">
            <Title level={2}>
                {filterType === 'attempts' ? 'My Quiz Attempts' :
                    filterType === 'completed' ? 'Completed Quizzes' :
                        'Available Quizzes'}
            </Title>
            <Row gutter={[16, 16]}>
                {quizzes.map(quiz => (
                    <Col xs={24} sm={12} md={8} key={quiz.quiz_id}>
                        <QuizCard
                            quiz={quiz}
                            onStart={handleStartQuiz}
                            showStartButton={!filterType}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    );
};