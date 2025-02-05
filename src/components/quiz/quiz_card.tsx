// src/components/QuizCard.tsx
import React from 'react';
import { Card, Tag, Space, Button } from 'antd';
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Quiz } from '../../models/quiz';

interface QuizCardProps {
    quiz: Quiz;
    student_id: string;
    onStart: (student_id: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ student_id, quiz, onStart }) => (
    <Card title={quiz.subtopic} className="quiz-card">
        <p>{quiz.subtopic}</p>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
                <Tag color="blue">{quiz.topic}</Tag>
                <Tag color="cyan">{quiz.subtopic}</Tag>
                <Tag color={quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'orange' : 'red'}>
                    {quiz.difficulty}
                </Tag>
            </Space>
            <Space>
                <ClockCircleOutlined /> {quiz.time_limit} minutes
                <QuestionCircleOutlined /> {quiz.total_questions} questions
            </Space>
            <Button type="primary" onClick={() => onStart(student_id)}>
                Start Quiz
            </Button>
        </Space>
    </Card>
);