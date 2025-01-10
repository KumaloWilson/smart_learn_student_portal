

// src/components/QuestionCard.tsx
import React from 'react';
import { Card, Radio, Space, Button, Progress } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface QuestionCardProps {
    question: Question;
    currentIndex: number;
    totalQuestions: number;
    remainingTime: number;
    selectedAnswer: string | null;
    onSelectAnswer: (answer: string) => void;
    onSubmit: () => void;
    onShowHint: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    currentIndex,
    totalQuestions,
    remainingTime,
    selectedAnswer,
    onSelectAnswer,
    onSubmit,
    onShowHint
}) => (
    <Card title={`Question ${currentIndex + 1} of ${totalQuestions}`}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Progress percent={(currentIndex / totalQuestions) * 100} />
            <div className="timer">
                Time Remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="question-text">{question.text}</div>
            <Radio.Group onChange={(e) => onSelectAnswer(e.target.value)} value={selectedAnswer}>
                <Space direction="vertical">
                    {question.options.map((option, index) => (
                        <Radio key={index} value={option.charAt(0)}>
                            {option}
                        </Radio>
                    ))}
                </Space>
            </Radio.Group>
            <Space>
                <Button
                    icon={<QuestionCircleOutlined />}
                    onClick={onShowHint}
                >
                    Show Hint
                </Button>
                <Button
                    type="primary"
                    onClick={onSubmit}
                    disabled={!selectedAnswer}
                >
                    Submit Answer
                </Button>
            </Space>
        </Space>
    </Card>
);
