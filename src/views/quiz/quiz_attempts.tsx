import { Tabs, Spin, Empty, Alert } from 'antd';
import { CourseStatsCard } from '../../components/quiz/course_stat_card';
import { AttemptsTable } from '../../components/quiz/quiz_attempts_table';
import { useQuizAttempts, useQuizAttemptStats } from '../../hooks/quiz/use_quiz_attempts';

const { TabPane } = Tabs;

interface StudentAttemptsProps {
    studentId: string;
}

const QuizAttempts: React.FC<StudentAttemptsProps> = ({ studentId }) => {
    const {
        data: attempts,
        isLoading: attemptsLoading,
        error: attemptsError
    } = useQuizAttempts(studentId);

    const {
        data: stats,
        isLoading: statsLoading,
        error: statsError
    } = useQuizAttemptStats(studentId);

    if (attemptsLoading || statsLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (attemptsError || statsError) {
        return (
            <Alert
                message="Error"
                description="Failed to load quiz attempts. Please try again later."
                type="error"
                showIcon
            />
        );
    }

    if (!attempts?.length) {
        return (
            <Empty
                description="No quiz attempts found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }


    return (
        <div className="space-y-6">
            <Tabs defaultActiveKey="overview">
                <TabPane tab="Overview" key="overview">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {stats?.map((courseStat) => (
                                <CourseStatsCard
                                    key={courseStat.course_id}
                                    stats={courseStat}
                                />
                            ))}
                        </div>
                    </div>
                </TabPane>
                <TabPane tab="All Attempts" key="attempts">
                    <AttemptsTable attempts={attempts} />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default QuizAttempts;