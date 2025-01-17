import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Empty, Button, Form, Modal, Select, InputNumber, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { QuizCard } from '../../components/quiz/quiz_card';
import { quizAPI } from '../../services/quiz_services/api';
import { Quiz } from '../../models/quiz';
import { v4 as uuidv4 } from 'uuid';

const { Title } = Typography;
const { Option } = Select;

interface QuizListProps {
    filterType?: 'attempts' | 'completed';
    onQuizStart?: (attempt_id: string) => void;
    studentId: string;
}

interface CustomQuizForm {
    topic: string;
    subtopic?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    total_questions: number;
    learning_objectives?: string[];
}

export const QuizList: React.FC<QuizListProps> = ({
    filterType,
    onQuizStart,
    studentId
}) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
    const [form] = Form.useForm();

    // Loading indicator configuration
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    useEffect(() => {
        loadQuizzes();
    }, [filterType]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizAPI.getQuizzes();
            setQuizzes(data);
        } catch (error) {
            message.error('Failed to load quizzes. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!onQuizStart) return;

        try {
            const response = await quizAPI.startQuiz({});
            onQuizStart(response.data.quizSession.attempt_id);
        } catch (error) {
            message.error('Failed to start quiz. Please try again.');
            console.error(error);
        }
    };

    const handleCreateCustomQuiz = async (values: CustomQuizForm) => {
        setIsCreatingQuiz(true);
        try {
            const requestBody = {
                student_id: studentId,
                quiz: {
                    quiz_id: uuidv4(),
                    course_id: 'custom-course',
                    topic: values.topic,
                    subtopic: values.subtopic,
                    difficulty: values.difficulty,
                    created_by: 'system',
                    total_questions: values.total_questions,
                    time_limit: 30,
                    passing_score: 70,
                    status: 'active',
                    learning_objectives: values.learning_objectives || [
                        `Understand ${values.topic} concepts`,
                        `Master ${values.topic} fundamentals`
                    ],
                    tags: [values.topic.toLowerCase(), values.difficulty, values.subtopic?.toLowerCase()].filter(Boolean)
                }
            };

            const data = await quizAPI.startQuiz(requestBody);

            if (data.attempt && onQuizStart) {
                message.success('Quiz created successfully!');
                onQuizStart(data.attempt.quizSession.attempt_id);
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to create custom quiz. Please try again.');
            console.error('Failed to create custom quiz:', error);
        } finally {
            setIsCreatingQuiz(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin indicator={antIcon} tip="Loading quizzes..." />
                </div>
            );
        }

        if (!quizzes.length) {
            return (
                <div className="text-center" style={{ padding: '40px 0' }}>
                    <Empty
                        description={
                            filterType === 'attempts' ? 'No quiz attempts yet' :
                                filterType === 'completed' ? 'No completed quizzes' :
                                    'No mandatory quizzes available'
                        }
                    />
                    {!filterType && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="mt-4"
                            size="large"
                        >
                            Create Custom Quiz
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <Row gutter={[16, 16]}>
                {!filterType && (
                    <Col span={24}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="mb-4"
                            size="large"
                        >
                            Create Custom Quiz
                        </Button>
                    </Col>
                )}
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
        );
    };

    return (
        <div className="quiz-list">
            <Title level={2}>
                {filterType === 'attempts' ? 'My Quiz Attempts' :
                    filterType === 'completed' ? 'Completed Quizzes' :
                        'Available Quizzes'}
            </Title>
            {renderContent()}

            <Modal
                title="Create Custom Quiz"
                open={isModalVisible}
                onCancel={() => {
                    if (!isCreatingQuiz) {
                        setIsModalVisible(false);
                        form.resetFields();
                    }
                }}
                footer={null}
                maskClosable={!isCreatingQuiz}
                closable={!isCreatingQuiz}
            >
                <Form
                    form={form}
                    onFinish={handleCreateCustomQuiz}
                    layout="vertical"
                    disabled={isCreatingQuiz}
                >
                    <Form.Item
                        name="topic"
                        label="Topic"
                        rules={[{ required: true, message: 'Please enter a topic' }]}
                    >
                        <Select
                            placeholder="Select topic"
                            showSearch
                            optionFilterProp="children"
                        >
                            <Option value="Mathematics">Mathematics</Option>
                            <Option value="Science">Science</Option>
                            <Option value="History">History</Option>
                            <Option value="Literature">Literature</Option>
                            <Option value="Programming">Programming</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="subtopic"
                        label="Subtopic (Optional)"
                    >
                        <Select
                            placeholder="Select subtopic"
                            showSearch
                            optionFilterProp="children"
                            allowClear
                        >
                            <Option value="Variables">Variables</Option>
                            <Option value="Functions">Functions</Option>
                            <Option value="Algorithms">Algorithms</Option>
                            <Option value="Data Structures">Data Structures</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="difficulty"
                        label="Difficulty Level"
                        rules={[{ required: true, message: 'Please select difficulty' }]}
                    >
                        <Select placeholder="Select difficulty">
                            <Option value="easy">Easy</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="hard">Hard</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="total_questions"
                        label="Number of Questions"
                        rules={[{ required: true, message: 'Please enter number of questions' }]}
                    >
                        <InputNumber min={1} max={50} />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={isCreatingQuiz}
                            disabled={isCreatingQuiz}
                        >
                            {isCreatingQuiz ? 'Creating Quiz...' : 'Create Quiz'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizList;