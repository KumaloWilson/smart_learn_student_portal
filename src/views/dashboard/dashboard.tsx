import {
    Card,
    Row,
    Col,
    Calendar,
    List,
    Progress,
    Statistic,
    Alert,
    Typography,
    Space,
    Badge
} from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined, TrophyOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const Dashboard = () => {
    // Mock data - in a real app, this would come from your backend
    const upcomingAssignments = [
        { title: 'Database Systems Project', dueDate: '2025-01-20', course: 'CS301', status: 'pending' },
        { title: 'Physics Lab Report', dueDate: '2025-01-22', course: 'PHY201', status: 'pending' },
        { title: 'Literature Review', dueDate: '2025-01-25', course: 'ENG202', status: 'pending' }
    ];

    const recentAnnouncements = [
        { title: 'Midterm Schedule Posted', date: '2025-01-16', type: 'info' },
        { title: 'Campus Career Fair Next Week', date: '2025-01-15', type: 'success' },
        { title: 'Library Hours Extended', date: '2025-01-14', type: 'info' }
    ];

    const courseProgress = [
        { course: 'Computer Science', progress: 75 },
        { course: 'Mathematics', progress: 60 },
        { course: 'Physics', progress: 85 },
        { course: 'English', progress: 90 }
    ];

    return (
        <Space direction="vertical" size="large" className="w-full">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message="Welcome back, John Doe!"
                        description="You have 3 assignments due this week and 2 upcoming quizzes."
                        type="info"
                        showIcon
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Course Attendance"
                            value={92}
                            suffix="%"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completed Assignments"
                            value={15}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Current GPA"
                            value={3.8}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Enrolled Courses"
                            value={6}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Upcoming Assignments">
                        <List
                            itemLayout="horizontal"
                            dataSource={upcomingAssignments}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<WarningOutlined style={{ color: '#faad14' }} />}
                                        title={item.title}
                                        description={`Due: ${item.dueDate} | Course: ${item.course}`}
                                    />
                                    <Badge status="warning" text="Due Soon" />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Course Progress">
                        <List
                            dataSource={courseProgress}
                            renderItem={item => (
                                <List.Item>
                                    <div className="w-full">
                                        <Text>{item.course}</Text>
                                        <Progress percent={item.progress} size="small" />
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Calendar">
                        <Calendar fullscreen={false} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Recent Announcements">
                        <List
                            itemLayout="horizontal"
                            dataSource={recentAnnouncements}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.title}
                                        description={item.date}
                                    />
                                    <Badge
                                        status={item.type === 'success' ? 'success' : 'processing'}
                                        text={item.type === 'success' ? 'New' : 'Important'}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
};

export default Dashboard;