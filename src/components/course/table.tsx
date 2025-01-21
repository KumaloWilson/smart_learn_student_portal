import { Course } from "../../models/course.ts";
import { StudentCourseEnrollment } from "../../models/course_enrollment.ts";
import React from "react";
import { Table, Tag } from "antd";

const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'green';
        case 'in-progress':
            return 'blue';
        case 'failed':
            return 'red';
        default:
            return 'gray';
    }
};

interface CourseTableProps {
    courses: (Course & StudentCourseEnrollment)[];
    loading: boolean;
}

export const CourseTable: React.FC<CourseTableProps> = ({ courses, loading }) => {
    const columns = [
        {
            title: 'Course Name',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: 'Course Code',
            dataIndex: 'course_code',
            key: 'course_code',
        },
        {
            title: 'Credits',
            dataIndex: 'credit_hours',
            key: 'credit_hours',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
        },
        {
            title: 'Attendance',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            render: (attendance: number) => `${attendance}%`,
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={courses}
            loading={loading}
            rowKey="enrollment_id"
            pagination={{ pageSize: 10 }}
        />
    );
};
