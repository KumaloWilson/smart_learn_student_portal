import React, { useState } from 'react';
import { Card, Tag, Space, Button, Spin } from 'antd';
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Quiz } from '../../models/quiz';

interface QuizCardProps {
    quiz: Quiz;
    onStart: (quiz: Quiz) => Promise<void>; // Ensure async handling
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            await onStart(quiz);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={quiz.topic} className="quiz-card">
            {quiz.subtopic && <p>{quiz.subtopic}</p>}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                    <Tag color="blue">{quiz.topic}</Tag>
                    {quiz.subtopic && <Tag color="cyan">{quiz.subtopic}</Tag>}
                    <Tag color={quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'orange' : 'red'}>
                        {quiz.difficulty}
                    </Tag>
                </Space>
                <Space>
                    <ClockCircleOutlined /> {quiz.time_limit || 30} minutes
                    <QuestionCircleOutlined /> {quiz.total_questions} questions
                </Space>
                <Button type="primary" onClick={handleStart} disabled={loading}>
                    {loading ? <Spin size="small" /> : 'Start Quiz'}
                </Button>
            </Space>
        </Card>
    );
};
