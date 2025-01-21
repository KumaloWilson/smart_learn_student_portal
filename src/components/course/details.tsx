import React from 'react';
import { Drawer, Descriptions, Tabs, List, Progress, Card, Tag, Typography, Button, Space, Statistic, Timeline } from 'antd';
import {
    BookOutlined,
    FileOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DownloadOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { StudentCourseEnrollment } from "../../models/course_enrollment.ts";
import { Course } from '../../models/course.ts';
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface CourseMaterial {
    id: string;
    title: string;
    type: string;
    uploadDate: string;
    size: string;
    downloadUrl: string;
}

interface CourseAssignment {
    id: string;
    title: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    grade?: number;
    totalPoints: number;
}

interface CourseDetailsDrawerProps {
    visible: boolean;
    onClose: () => void;
    courseDetails: (Course & StudentCourseEnrollment) | undefined;
    materials: CourseMaterial[];
    assignments: CourseAssignment[];
    loading: boolean;
}

export const CourseDetailsDrawer: React.FC<CourseDetailsDrawerProps> = ({
    visible,
    onClose,
    courseDetails,
    materials,
    assignments,
}) => {
    if (!courseDetails) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            enrolled: 'blue',
            completed: 'green',
            withdrawn: 'red',
            failed: 'red'
        };
        return colors[status] || 'default';
    };

    const getAssignmentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            submitted: 'blue',
            graded: 'green'
        };
        return colors[status] || 'default';
    };

    return (
        <Drawer
            title={
                <Space direction="vertical" size={0}>
                    <Title level={4}>{courseDetails.course_name}</Title>
                    <Text type="secondary">{courseDetails.course_code}</Text>
                </Space>
            }
            width={720}
            placement="right"
            onClose={onClose}
            visible={visible}
        >
            <Tabs defaultActiveKey="overview">
                <TabPane
                    tab={<span><BookOutlined />Overview</span>}
                    key="overview"
                >
                    <Space direction="vertical" className="w-full" size="large">
                        <Card>
                            <Descriptions column={2}>
                                <Descriptions.Item label="Status">
                                    <Tag color={getStatusColor(courseDetails.status)}>
                                        {courseDetails.status.toUpperCase()}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Credit Hours">
                                    {courseDetails.credit_hours}
                                </Descriptions.Item>
                                <Descriptions.Item label="Semester">
                                    {courseDetails.semester}
                                </Descriptions.Item>
                                <Descriptions.Item label="Academic Year">
                                    {courseDetails.academic_year}
                                </Descriptions.Item>
                                {courseDetails.grade && (
                                    <Descriptions.Item label="Grade">
                                        {courseDetails.grade}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        <Card title="Progress Overview">
                            <Space size="large">
                                <Statistic
                                    title="Attendance"
                                    value={courseDetails.attendance_percentage}
                                    suffix="%"
                                />
                                <Progress
                                    type="circle"
                                    percent={courseDetails.attendance_percentage}
                                    status={
                                        courseDetails.attendance_percentage >= 75
                                            ? 'success'
                                            : 'exception'
                                    }
                                />
                            </Space>
                        </Card>

                        {courseDetails.description && (
                            <Card title="Course Description">
                                <Text>{courseDetails.description}</Text>
                            </Card>
                        )}
                    </Space>
                </TabPane>

                <TabPane
                    tab={<span><FileOutlined />Materials</span>}
                    key="materials"
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={materials}
                        renderItem={material => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        onClick={() => window.open(material.downloadUrl)}
                                    >
                                        Download
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={material.title}
                                    description={
                                        <Space>
                                            <Tag>{material.type}</Tag>
                                            <Text type="secondary">{material.size}</Text>
                                            <Text type="secondary">
                                                Uploaded: {material.uploadDate}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </TabPane>

                <TabPane
                    tab={<span><CheckCircleOutlined />Assignments</span>}
                    key="assignments"
                >
                    <Timeline mode="left">
                        {assignments.map(assignment => (
                            <Timeline.Item
                                key={assignment.id}
                                dot={<CalendarOutlined />}
                            >
                                <Card>
                                    <Space direction="vertical">
                                        <Space className="w-full justify-between">
                                            <Title level={5}>{assignment.title}</Title>
                                            <Tag color={getAssignmentStatusColor(assignment.status)}>
                                                {assignment.status.toUpperCase()}
                                            </Tag>
                                        </Space>
                                        <Space>
                                            <ClockCircleOutlined />
                                            <Text>Due: {assignment.dueDate}</Text>
                                        </Space>
                                        {assignment.grade && (
                                            <Text strong>
                                                Grade: {assignment.grade}/{assignment.totalPoints}
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </TabPane>
            </Tabs>
        </Drawer>
    );
};