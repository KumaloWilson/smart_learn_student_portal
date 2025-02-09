import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Button } from 'antd';
import { virtualClassesAPI } from '../../services/virtual_classes/api';
import { useAuth } from '../../hooks/auth/auth';
import { VirtualClass } from '../../models/virtual_class';
import { StudentMeeting } from './jitsi_meeting';

export const LiveClass: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<VirtualClass | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [jitsiToken, setJitsiToken] = useState<string | null>(null);
    const { student } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const loadClassData = async () => {
            try {
                console.log('Loading class data for ID:', classId);

                if (!classId) {
                    throw new Error('Class ID is required');
                }

                const response = await virtualClassesAPI.getVirtualClassesByClassId(classId);
                console.log('API Response:', response);

                if (!response || !response.data) {
                    throw new Error('Invalid response from server');
                }

                const virtualClass = response.data;

                if (!virtualClass) {
                    throw new Error('Class not found');
                }

                // Check if class is active
                const now = new Date();
                const startTime = new Date(virtualClass.start_time);
                const endTime = new Date(virtualClass.end_time);

                console.log('Time checks:', {
                    now: now.toISOString(),
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString()
                });

                if (now < startTime) {
                    throw new Error(`Class will start at ${startTime.toLocaleString()}`);
                }

                if (now > endTime) {
                    throw new Error(`Class ended at ${endTime.toLocaleString()}`);
                }

                if (virtualClass.status === 'cancelled') {
                    throw new Error('Class has been cancelled');
                }

                // Only update state if component is still mounted
                if (isMounted) {
                    setClassData(virtualClass);
                    console.log('Class data set successfully');

                    // Generate Jitsi token
                    const tokenResponse = await virtualClassesAPI.generateJitsiToken(classId, {
                        user: {
                            name: `${student!.first_name} ${student!.last_name}`,
                            email: student?.email || '',
                            avatar: student?.photo_url || ''
                        }
                    });

                    if (tokenResponse?.success && tokenResponse?.data?.token) {
                        setJitsiToken(tokenResponse.data.token);
                    } else {
                        throw new Error('Failed to generate meeting token');
                    }

                    // Update class status to in-progress if needed
                    if (virtualClass.status === 'scheduled') {
                        console.log('Updating class status to in-progress');
                        await virtualClassesAPI.updateClassStatus(classId, 'in-progress');
                    }
                }
            } catch (err: any) {
                console.error('Error loading class:', err);
                if (isMounted) {
                    setError(err.message || 'An unexpected error occurred');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    console.log('Loading completed');
                }
            }
        };

        loadClassData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [classId, student]);

    const handleError = (error: Error) => {
        console.error('Jitsi meeting error:', error);
        setError(error.message);
        // Navigate back after a delay
        setTimeout(() => navigate('/virtual/classes'), 5000);
    };

    // Add a loading timeout
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                console.log('Loading timeout reached');
                setIsLoading(false);
                setError('Loading timeout reached. Please try again.');
            }
        }, 30000); // 30 second timeout

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="Loading virtual class..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button type="primary" onClick={() => navigate('/virtual/classes')}>
                        Back to Classes
                    </Button>
                }
            />
        );
    }

    if (!classData || !jitsiToken) {
        return (
            <Alert
                message="Error"
                description="Unable to initialize class"
                type="error"
                showIcon
                action={
                    <Button type="primary" onClick={() => navigate('/virtual/classes')}>
                        Back to Classes
                    </Button>
                }
            />
        );
    }

    return (
        <div className="h-screen">
            <StudentMeeting
                roomName={classData.meeting_link}
                studentEmail={student!.email!}
                studentName={`${student?.first_name} ${student?.last_name}`}
                jwt={jitsiToken}
                onError={handleError}
            />
        </div>
    );
};