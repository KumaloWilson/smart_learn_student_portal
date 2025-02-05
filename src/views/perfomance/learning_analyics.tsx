import React, { useMemo } from 'react';
import { Tabs, Card, Progress, Alert, Tooltip } from 'antd';
import {
    LineChartOutlined,
    TrophyOutlined,
    BulbOutlined
} from '@ant-design/icons';

// Hooks
import { useAuth } from '../../hooks/auth/auth';
// Types
interface TopicPerformance {
    topic_id: string;
    topic_name: string;
    average_score: string;
    completion_rate: string;
    weak_subtopics: any[];
    strong_subtopics: any[];
    recommended_actions: string[];
}

const LearningAnalytics: React.FC = () => {
    const { student } = useAuth();
    const studentId = student?.student_id;

    const {
        data: currentCourses,
        isLoading: coursesLoading
    } = useCurrentCourses(studentId);

    const {
        data: analyticsData,
        isLoading: analyticsLoading
    } = useLearningAnalytics(studentId);

    // Organize analytics by course
    const courseAnalytics = useMemo(() => {
        if (!analyticsData?.data?.topic_performances || !currentCourses) return {};

        return currentCourses.reduce((acc, course) => {
            const courseTopics = analyticsData.data.topic_performances.filter(
                topic => topic.topic_name.includes(course.course_name)
            );

            acc[course.course_id] = {
                course: course,
                topics: courseTopics
            };

            return acc;
        }, {} as Record<string, { course: any, topics: TopicPerformance[] }>);
    }, [analyticsData, currentCourses]);

    const renderTopicPerformance = (topic: TopicPerformance) => (
        <Card
            key={topic.topic_id}
            title={topic.topic_name}
            extra={<TrophyOutlined />}
            className="mb-4"
        >
            <div className="flex justify-between items-center">
                <div className="w-full mr-4">
                    <Progress
                        percent={parseFloat(topic.average_score)}
                        status={parseFloat(topic.average_score) < 70 ? 'exception' : 'success'}
                        strokeColor={{
                            '0%': '#ff4d4f',
                            '100%': '#52c41a'
                        }}
                    />
                    <div className="text-sm text-gray-500 mt-2">
                        Completion Rate: {(parseFloat(topic.completion_rate) * 100).toFixed(2)}%
                    </div>
                </div>
                <Tooltip title="Performance Insights">
                    <div>
                        <BulbOutlined className="text-2xl text-blue-500" />
                    </div>
                </Tooltip>
            </div>

            {topic.recommended_actions.length > 0 && (
                <div className="mt-4">
                    <Alert
                        message="Recommended Actions"
                        description={
                            <ul className="list-disc pl-4">
                                {topic.recommended_actions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        }
                        type="info"
                        showIcon
                    />
                </div>
            )}
        </Card>
    );

    if (coursesLoading || analyticsLoading) {
        return <div>Loading analytics...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <LineChartOutlined className="mr-3" />
                Learning Analytics
            </h1>

            {Object.keys(courseAnalytics).length === 0 ? (
                <Alert
                    message="No Performance Data"
                    description="There are currently no performance analytics available."
                    type="warning"
                />
            ) : (
                <Tabs>
                    {Object.entries(courseAnalytics).map(([courseId, { course, topics }]) => (
                        <Tabs.TabPane tab={course.course_name} key={courseId}>
                            {topics.length === 0 ? (
                                <Alert
                                    message="No Topic Performance"
                                    description={`No performance data for ${course.course_name}`}
                                    type="info"
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {topics.map(renderTopicPerformance)}
                                </div>
                            )}
                        </Tabs.TabPane>
                    ))}
                </Tabs>
            )}
        </div>
    );
};

export default LearningAnalytics;