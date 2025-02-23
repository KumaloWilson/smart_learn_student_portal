import { Card, Statistic, Row, Col, Progress } from 'antd';
import { CourseAttemptStats } from '../../models/course_attempt_stats';

export const CourseStatsCard: React.FC<{ stats: CourseAttemptStats }> = ({ stats }) => {
    const completionRate = (stats.completed_attempts / stats.total_attempts) * 100;

    return (
        <Card title={stats.course_name} className="mb-4">
            <Row gutter={16}>
                <Col span={6}>
                    <Statistic
                        title="Total Quizzes Attempted"
                        value={stats.total_quizzes_attempted}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Average Score"
                        value={stats.average_score}
                        suffix="%"
                        precision={1}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Completed Attempts"
                        value={stats.completed_attempts}
                    />
                </Col>
                <Col span={6}>
                    <Progress
                        type="circle"
                        percent={completionRate}
                        format={(percent) => `${percent?.toFixed(1)}% Completion`}
                    />
                </Col>
            </Row>
        </Card>
    );
};
