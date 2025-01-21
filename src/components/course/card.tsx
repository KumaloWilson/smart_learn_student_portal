import React from 'react';
import { Card, Tag, Space, Button, Typography, } from 'antd';
import { BookOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { StudentCourseEnrollment } from "../../models/course_enrollment.ts";
import { Course } from "../../models/course.ts";

const { Title } = Typography;

interface CourseCardProps {
    course: Course & StudentCourseEnrollment;
    onViewDetails: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetails }) => {
    console.log(course);
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            enrolled: 'blue',
            completed: 'green',
            withdrawn: 'red',
            failed: 'red'
        };
        return colors[status] || 'default';
    };

    return (
        <Card
            hoverable
            className="mb-4"
            actions={[
                <Button type="link" onClick={() => onViewDetails(course.course_id)}>
                    View Details
                </Button>
            ]}
        >
            <Space direction="vertical" className="w-full">
                <Space align="center" className="w-full justify-between">
                    <Title level={4}>{course.course_name}</Title>
                    <Tag color={getStatusColor(course.status)}>{course.status}</Tag>
                </Space>
                <Space className="w-full justify-between">
                    <span>
                        <BookOutlined /> {course.course_code}
                    </span>
                    <span>
                        <ClockCircleOutlined /> {course.credit_hours} Credits
                    </span>
                    {course.grade && (
                        <span>
                            <CheckCircleOutlined /> Grade: {course.grade}
                        </span>
                    )}
                </Space>
            </Space>
        </Card>
    );
};

