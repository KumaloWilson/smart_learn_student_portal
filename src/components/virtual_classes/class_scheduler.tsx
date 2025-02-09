import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, message, Tooltip } from 'antd';
import { VideoCameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { virtualClassesAPI } from '../../services/virtual_classes/api';
import { VirtualClass } from '../../models/virtual_class';

interface ClassSchedulerProps {
    courseId: string | null;
}

export const ClassScheduler: React.FC<ClassSchedulerProps> = ({ courseId }) => {
    const [classes, setClasses] = useState<VirtualClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningClass, setJoiningClass] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadClasses();
        // Set up auto-refresh every minute
        const interval = setInterval(loadClasses, 60000);
        return () => clearInterval(interval);
    }, [courseId]);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const response = await virtualClassesAPI.getVirtualClassesByCourseId(courseId!);
            const classes = response.data;

            // Sort classes by start time
            classes.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

            setClasses(classes);
        } catch (error) {
            console.error('Failed to load classes:', error);
            message.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string, startTime: Date, endTime: Date) => {
        const now = new Date();

        if (status === 'cancelled') return 'red';
        if (status === 'completed') return 'gray';
        if (status === 'in-progress') return 'green';

        // For scheduled classes
        if (now < new Date(startTime)) return 'blue';
        if (now > new Date(endTime)) return 'gray';
        return 'green';
    };

    const getStatusText = (status: string, startTime: Date, endTime: Date) => {
        const now = new Date();

        if (status === 'cancelled') return 'Cancelled';
        if (status === 'completed') return 'Completed';
        if (status === 'in-progress') return 'In Progress';

        // For scheduled classes
        if (now < new Date(startTime)) return 'Scheduled';
        if (now > new Date(endTime)) return 'Ended';
        return 'Ready to Join';
    };

    const canJoinClass = (classItem: VirtualClass) => {
        const now = new Date();
        const startTime = new Date(classItem.start_time);
        const endTime = new Date(classItem.end_time);

        // Allow joining 5 minutes before start time
        startTime.setMinutes(startTime.getMinutes() - 5);

        return (
            classItem.status !== 'cancelled' &&
            classItem.status !== 'completed' &&
            now >= startTime &&
            now <= endTime
        );
    };

    const joinClass = async (classItem: VirtualClass) => {
        try {
            setJoiningClass(classItem.id);

            if (!canJoinClass(classItem)) {
                message.error('Class is not available for joining at this time');
                return;
            }

            // Navigate to live class
            navigate(`/virtual/live/${classItem.id}`);
        } catch (error) {
            console.error('Failed to join class:', error);
            message.error('Failed to join class');
        } finally {
            setJoiningClass(null);
        }
    };

    return (
        <List
            loading={loading}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            dataSource={classes}
            renderItem={classItem => (
                <List.Item>
                    <Card
                        title={classItem.title}
                        extra={
                            <Tag color={getStatusColor(classItem.status, classItem.start_time, classItem.end_time)}>
                                {getStatusText(classItem.status, classItem.start_time, classItem.end_time)}
                            </Tag>
                        }
                    >
                        <p>{classItem.description}</p>
                        <p>
                            <strong>Starts: </strong>
                            {new Date(classItem.start_time).toLocaleString()}
                        </p>
                        <p>
                            <strong>Ends: </strong>
                            {new Date(classItem.end_time).toLocaleString()}
                        </p>
                        <Tooltip title={
                            !canJoinClass(classItem)
                                ? "Class is not available for joining at this time"
                                : "Join virtual class"
                        }>
                            <Button
                                type="primary"
                                icon={joiningClass === classItem.id ? <LoadingOutlined /> : <VideoCameraOutlined />}
                                onClick={() => joinClass(classItem)}
                                disabled={!canJoinClass(classItem)}
                                loading={joiningClass === classItem.id}
                                block
                            >
                                Join Class
                            </Button>
                        </Tooltip>
                    </Card>
                </List.Item>
            )}
        />
    );
};