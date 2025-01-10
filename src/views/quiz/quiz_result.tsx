import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Progress, Space, Button, Spin, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiService } from '../../services/quiz_services/api';

const { Title, Text } = Typography;

interface Result {
    score: number;
    statistics: {
        total_questions: number;
        correct_answers: number;
        avg_time_per_question: number;
    };
    responses: {
        question_id: string;
        text: string;
        student_answer: string;
        correct_answer: string;
        is_correct: boolean;
        points_earned: number;
    }[];
}

interface QuizResultProps {
    attemptId: string;
    onBackToList: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ attemptId, onBackToList }) => {
    const [result, setResult] = useState<Result | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            setLoading(true);
            try {
                const response = await apiService.getAttemptResponses(attemptId);
                setResult(response.data);
            } catch (error) {
                console.error('Error loading quiz result:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!result) {
        return (
            <Card>
                <Text>No result data available</Text>
            </Card>
        );
    }

    const columns = [
        {
            title: 'Question',
            dataIndex: 'text',
            key: 'text',
            width: '40%',
        },
        {
            title: 'Your Answer',
            dataIndex: 'student_answer',
            key: 'student_answer',
            width: '20%',
        },
        {
            title: 'Correct Answer',
            dataIndex: 'correct_answer',
            key: 'correct_answer',
            width: '20%',
        },
        {
            title: 'Result',
            key: 'result',
            width: '20%',
            render: (record: Result['responses'][0]) => (
                <Space>
                    {record.is_correct ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                        <CloseCircleOutlined style={{ color: '#f5222d' }} />
                    )}
                    <Text>{record.points_earned} points</Text>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>Quiz Results</Title>

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card className="text-center">
                            <Progress
                                type="circle"
                                percent={result.score}
                                format={percent => `${percent}%`}
                                size={120}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={16}>
                        <Card>
                            <Space direction="vertical" size="middle">
                                <Text strong>Total Questions: {result.statistics.total_questions}</Text>
                                <Text strong>Correct Answers: {result.statistics.correct_answers}</Text>
                                <Text strong>
                                    Average Time per Question: {Math.round(result.statistics.avg_time_per_question)}s
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={result.responses}
                    rowKey="question_id"
                    pagination={false}
                    scroll={{ x: true }}
                />

                <div className="flex justify-end">
                    <Button
                        type="primary"
                        onClick={onBackToList}
                    >
                        Back to Quiz List
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default QuizResult;