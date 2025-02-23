import { Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { QuizAttemptSummary } from '../../models/quiz_attempt_summary';
import { AttemptStatusTag } from './attempt_status_tag';

const { Text } = Typography;

export const AttemptsTable: React.FC<{ attempts: QuizAttemptSummary[] }> = ({ attempts }) => {
    const columns = [
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: 'Topic',
            dataIndex: 'topic',
            key: 'topic',
            render: (text: string, record: QuizAttemptSummary) => (
                <div>
                    <Text strong>{text}</Text>
                    {record.subtopic && (
                        <div>
                            <Text type="secondary">{record.subtopic}</Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Started',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (text: string) => dayjs(text).format('MMM D, YYYY HH:mm'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <AttemptStatusTag status={status} />,
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score: unknown) => {
                const numericScore = Number(score);
                return !isNaN(numericScore) ? `${numericScore.toFixed(1)}%` : '-';
            },
        },
        {
            title: 'Difficulty',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (difficulty: string) => (
                <Tag color={
                    difficulty === 'easy' ? 'green' :
                        difficulty === 'medium' ? 'orange' : 'red'
                }>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Tag>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={attempts}
            rowKey="attempt_id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} attempts`
            }}
        />
    );
};