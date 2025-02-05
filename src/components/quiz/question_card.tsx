// src/components/quiz/QuestionCard.tsx
import React from 'react';
import { Card, Radio, Space, Button, Progress, Typography, Tooltip } from 'antd';
import { QuestionCircleOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Question } from '../../models/quiz_question';

const { Text, Paragraph } = Typography;

interface QuestionCardProps {
    question: Question;
    currentIndex: number;
    totalQuestions: number;
    quizTimeRemaining: number;
    questionTimeSpent: number;
    selectedAnswer: string | null;
    isSubmitting: boolean;
    onSelectAnswer: (answer: string) => void;
    onSubmit: () => void;
    onShowHint: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    currentIndex,
    totalQuestions,
    quizTimeRemaining,
    questionTimeSpent,
    selectedAnswer,
    isSubmitting,
    onSelectAnswer,
    onSubmit,
    onShowHint
}) => {
    const minutes = Math.floor(quizTimeRemaining / 60);
    const seconds = quizTimeRemaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const progressPercent = (currentIndex / totalQuestions) * 100;

    return (
        <Card
            title={
                <Space size="middle" align="center">
                    <Text strong>{`Question ${currentIndex + 1} of ${totalQuestions}`}</Text>
                    <Progress
                        type="circle"
                        percent={progressPercent}
                        width={30}
                        format={() => `${currentIndex + 1}/${totalQuestions}`}
                    />
                </Space>
            }
            className="shadow-md"
        >
            <Space direction="vertical" size="large" className="w-full">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 w-full">
                        <Progress
                            percent={progressPercent}
                            size="small"
                            status="active"
                            className="w-2/3"
                        />
                        <Tooltip title="Quiz time remaining">
                            <Text
                                className={`timer text-lg ${quizTimeRemaining <= 60 ? 'text-red-500' : ''}`}
                                strong
                            >
                                {timeString}
                            </Text>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <Tooltip title="Time spent on this question">
                        <Text className="text-gray-600">
                            Time spent: {Math.floor(questionTimeSpent)} seconds
                        </Text>
                    </Tooltip>
                </div>

                <Paragraph className="question-text text-lg">
                    {question.text}
                </Paragraph>

                <Radio.Group
                    onChange={(e) => onSelectAnswer(e.target.value)}
                    value={selectedAnswer}
                    disabled={isSubmitting}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full">
                        {question.options.map((option, index) => (
                            <Radio
                                key={index}
                                value={option.charAt(0)}
                                className="p-2 w-full hover:bg-gray-50 rounded"
                            >
                                <Text className="text-base">{option}</Text>
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>

                <div className="flex justify-between items-center">
                    <Tooltip title="Get a hint for this question">
                        <Button
                            icon={<QuestionCircleOutlined />}
                            onClick={onShowHint}
                            disabled={isSubmitting}
                            className="hover:border-blue-400"
                        >
                            Show Hint
                        </Button>
                    </Tooltip>

                    <Button
                        type="primary"
                        onClick={onSubmit}
                        disabled={!selectedAnswer || isSubmitting}
                        icon={isSubmitting ? <LoadingOutlined /> : <CheckCircleOutlined />}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                </div>
            </Space>
        </Card>
    );
};
