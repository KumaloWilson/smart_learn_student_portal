import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Table, Progress, Space, Button, Spin, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { quizAPI } from '../../services/quiz_services/api';
import { QuizResult } from '../../models/quiz_result';
import { QuestionResponse } from '../../models/quiz_question_response';

const { Title, Text } = Typography;

interface QuizResultProps {
    onBackToList: () => void;
}

const AttemptedQuizResults: React.FC<QuizResultProps> = ({ onBackToList }) => {
    const { attempt_id } = useParams();
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!attempt_id) return;

            setLoading(true);
            try {
                const response = await quizAPI.getAttemptResponses(attempt_id);

                if (response.data) {

                    console.table(response.data.responses)

                    const transformedResult: QuizResult = {
                        score: parseFloat(response.data.score) || 0,
                        statistics: {
                            total_questions: response.data.statistics?.[0]?.total_questions || 0,
                            correct_answers: parseInt(response.data.statistics?.[0]?.correct_answers?.toString() || '0'),
                            avg_time_per_question: response.data.statistics?.[0]?.avg_time_per_question || 0
                        },
                        responses: response.data.responses.map((resp: any) => ({
                            question_id: resp.question_id,
                            text: resp.text,
                            student_answer: resp.student_answer,
                            correct_answer: resp.correct_answer,
                            is_correct: resp.is_correct,
                            points_earned: parseFloat(resp.points_earned?.toString() || '0')
                        }))
                    };
                    setResult(transformedResult);
                }
            } catch (error) {
                console.error('Error loading quiz result:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attempt_id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!result || !attempt_id) {
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
            render: (record: QuestionResponse) => (
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
                    <Button type="primary" onClick={onBackToList}>
                        Back to Quiz List
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default AttemptedQuizResults;