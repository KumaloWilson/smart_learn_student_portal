// src/views/QuizList.tsx
import React from 'react';
import { Row, Col, Input, Select } from 'antd';
import { QuizCard } from '../components/QuizCard';
import { quizService } from '../services/api.service';

export const QuizList: React.FC = () => {
    const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const data = await quizService.getQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error('Failed to load quizzes:', error);
            } finally {
                setLoading(false);
            }
        };

        loadQuizzes();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Available Quizzes</h1>
                <div className="flex gap-4">
                    <Input.Search placeholder="Search quizzes..." className="w-64" />
                    <Select defaultValue="all" className="w-32">
                        <Select.Option value="all">All</Select.Option>
                        <Select.Option value="easy">Easy</Select.Option>
                        <Select.Option value="medium">Medium</Select.Option>
                        <Select.Option value="hard">Hard</Select.Option>
                    </Select>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {quizzes.map(quiz => (
                    <Col key={quiz.quiz_id} xs={24} sm={12} md={8} lg={6}>
                        <QuizCard quiz={quiz} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

// src/views/QuizAttempt.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { QuestionView } from '../components/QuestionView';
import { quizService } from '../services/api.service';

export const QuizAttempt: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null);
    const [attemptId, setAttemptId] = React.useState<string>('');
    const [questionIndex, setQuestionIndex] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState<number>(0);

    React.useEffect(() => {
        const startQuiz = async () => {
            try {
                const attempt = await quizService.startAttempt(quizId!);
                setAttemptId(attempt);
                // Load first question...
            } catch (error) {
                message.error('Failed to start quiz');
                navigate('/quizzes');
            }
        };

        startQuiz();
    }, [quizId]);

    const handleAnswer = async (answer: string) => {
        try {
            const result = await quizService.submitAnswer({
                attempt_id: attemptId,
                question_id: currentQuestion!.question_id,
                selected_answer: answer,
                time_taken: 0 // Calculate actual time
            });

            if (questionIndex === currentQuestion!.total_questions - 1) {
                await quizService.completeAttempt(attemptId);
                navigate(`/quiz-results/${attemptId}`);
            } else {
                setQuestionIndex(prev => prev + 1);
                // Load next question...
            }
        } catch (error) {
            message.error('Failed to submit answer');
        }
    };

    if (!currentQuestion) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <QuestionView
                question={currentQuestion}
                onSubmit={handleAnswer}
                timeLeft={timeLeft}
            />
        </div>
    );
};

// src/views/StudyDashboard.tsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ProgressChart } from '../components/ProgressChart';
import { quizService } from '../services/api.service';

export const StudyDashboard: React.FC = () => {
    const [analytics, setAnalytics] = React.useState<any>(null);
    const [studyPlan, setStudyPlan] = React.useState<any>(null);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [analyticsData, planData] = await Promise.all([
                    quizService.getTopicAnalytics('all'),
                    quizService.getStudyPlan()
                ]);
                setAnalytics(analyticsData);
                setStudyPlan(planData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };

        loadData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Study Dashboard</h1>

            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Overall Progress"
                            value={analytics?.average_score || 0}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Quizzes Completed"
                            value={analytics?.attempt_count || 0}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Study Time"
                            value={analytics?.total_time || 0}
                            suffix="hours"
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Progress Over Time">
                <ProgressChart data={analytics?.progress_data || []} />
            </Card>

            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card title="Recommended Topics">
                        {studyPlan?.topics.map((topic: any) => (
                            <div key={topic.topic} className="p-3 border-b">
                                <h4 className="font-medium">{topic.topic}</h4>
                                <p className="text-gray-600">
                                    Estimated time: {topic.estimated_time} minutes
                                </p>
                            </div>
                        ))}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Mastery Levels">
                        {analytics?.topic_mastery?.map((topic: any) => (
                            <div key={topic.topic} className="p-3 border-b">
                                <h4 className="font-medium">{topic.topic}</h4>
                                <p className="text-gray-600">Level: {topic.mastery_level}</p>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};