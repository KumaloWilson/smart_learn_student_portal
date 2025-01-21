import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, Space, Spin, Empty, Button, message, Table } from 'antd';
import { useAuth } from '../../hooks/auth/auth';
import {
    useCourseAssignments,
    useCourseHistory,
    useCourseMaterials,
    useCurrentCourses,
    useSemesterGPA,
    useAvailableCourses
} from "../../hooks/course/hook.ts";
import { GpaCard } from '../../components/course/gpa_card.tsx';
import { CourseCard } from "../../components/course/card.tsx";
import { CourseTable } from "../../components/course/table.tsx";
import { CourseDetailsDrawer } from "../../components/course/details.tsx";
import { v4 as uuidv4 } from 'uuid';
import { courseAPI } from '../../services/course_service/api.ts';
import { StudentCourseEnrollment } from '../../models/course_enrollment';
import { Course } from '../../models/course';

const { TabPane } = Tabs;

export const CourseDashboard: React.FC = () => {
    const { student } = useAuth();
    const studentId = student?.student_id;
    const [activeTab, setActiveTab] = useState('current');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<(StudentCourseEnrollment & Course) | undefined>(undefined);
    const [enrolling, setEnrolling] = useState(false);

    const {
        data: currentCourses,
        isLoading: currentCoursesLoading
    } = useCurrentCourses(studentId!);

    const {
        data: availableCourses,
        isLoading: availableCoursesLoading
    } = useAvailableCourses(student?.current_program_id ?? '', student?.academic_record?.level ?? '');

    const {
        data: courseHistory,
        isLoading: historyLoading
    } = useCourseHistory(studentId!);

    const {
        data: gpaData,
        isLoading: gpaLoading
    } = useSemesterGPA(studentId!, student!.academic_record!.academic_year, student!.academic_record!.semester);


    const {
        data: courseMaterials,
        isLoading: materialsLoading
    } = useCourseMaterials(selectedCourse?.course_id ?? '');

    const {
        data: courseAssignments,
        isLoading: assignmentsLoading
    } = useCourseAssignments(selectedCourse?.course_id ?? '');


    // Create a set of enrolled course IDs
    const enrolledCourseIds = useMemo(() => {
        const currentIds = new Set(currentCourses?.map(course => course.course_id) || []);
        const historyIds = new Set(courseHistory?.map(course => course.course_id) || []);
        return new Set([...currentIds, ...historyIds]);
    }, [currentCourses, courseHistory]);

    const handleBulkEnroll = async () => {
        if (!studentId || selectedCourses.length === 0) return;

        setEnrolling(true);
        try {
            // Format the date to match MySQL datetime format
            const now = new Date();
            const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

            const enrollments: StudentCourseEnrollment[] = selectedCourses.map(courseId => ({
                enrollment_id: uuidv4(),
                student_id: studentId,
                course_id: courseId,
                academic_year: student!.academic_record!.academic_year,
                semester: student!.academic_record!.semester,
                status: 'enrolled',
                enrollment_date: formattedDate,
                is_retake: false,
            }));

            await courseAPI.bulkEnrollInCourses(enrollments);
            message.success('Successfully enrolled in selected courses');
            setSelectedCourses([]);
            setActiveTab('current');
        } catch (error: any) {
            if (error.response?.data?.message?.includes('already enrolled')) {
                message.error('Some courses could not be enrolled: Already enrolled in one or more selected courses');
            } else {
                message.error('Failed to enroll in courses: ' + (error.response?.data?.message || 'Unknown error'));
            }
        } finally {
            setEnrolling(false);
        }
    };


    const availableCoursesColumns = [
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
            title: 'Level',
            dataIndex: 'course_level',
            key: 'course_level',
        },
        {
            title: 'Prerequisites',
            dataIndex: 'prerequisites',
            key: 'prerequisites',
        }
    ];

    // Effect to auto-navigate to available courses if no current courses
    useEffect(() => {
        if (!currentCoursesLoading && (!currentCourses || currentCourses.length === 0)) {
            setActiveTab('available');
            message.info('You have no enrolled courses. Please select courses to enroll.');
        }
    }, [currentCourses, currentCoursesLoading]);

    const handleViewDetails = (course: (StudentCourseEnrollment & Course)) => {
        setSelectedCourse(course);
    };

    const handleCloseDetails = () => {
        setSelectedCourse(undefined);
    };

    if (currentCoursesLoading || historyLoading || gpaLoading || availableCoursesLoading) {
        return <Spin size="large" />;
    }

    return (
        <div className="space-y-6">
            <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center">
                    <GpaCard
                        gpa={gpaData?.gpa || 0}
                        totalCredits={gpaData?.totalCredits || 0}
                        loading={gpaLoading}
                    />
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Current Courses" key="current">
                        {currentCourses?.length ? (
                            <Space direction="vertical" className="w-full">
                                {currentCourses.map(course => (
                                    <CourseCard
                                        key={course!.enrollment_id}
                                        course={course}
                                        onViewDetails={() => handleViewDetails(
                                            course
                                        )}
                                    />
                                ))}
                            </Space>
                        ) : (
                            <Empty description="No current courses" />
                        )}
                    </TabPane>

                    <TabPane tab="Available Courses" key="available">
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    type="primary"
                                    onClick={handleBulkEnroll}
                                    disabled={selectedCourses.length === 0 || enrolling}
                                    loading={enrolling}
                                >
                                    Enroll in Selected Courses
                                </Button>
                            </div>
                            <Table
                                rowSelection={{
                                    type: 'checkbox',
                                    onChange: (selectedRowKeys) => {
                                        setSelectedCourses(selectedRowKeys as string[]);
                                    },
                                    getCheckboxProps: (record) => ({
                                        disabled: enrolledCourseIds.has(record.course_id),
                                    }),
                                }}
                                columns={availableCoursesColumns}
                                dataSource={availableCourses || []}
                                rowKey="course_id"
                                loading={availableCoursesLoading}
                                rowClassName={(record) =>
                                    enrolledCourseIds.has(record.course_id) ? 'opacity-50' : ''
                                }
                            />
                        </div>
                    </TabPane>

                    <TabPane tab="Course History" key="history">
                        <CourseTable
                            courses={courseHistory || []}
                            loading={historyLoading}
                        />
                    </TabPane>
                </Tabs>

                <CourseDetailsDrawer
                    visible={!!selectedCourse}
                    onClose={handleCloseDetails}
                    courseDetails={selectedCourse}
                    materials={courseMaterials || []}
                    assignments={courseAssignments || []}
                    loading={
                        materialsLoading ||
                        assignmentsLoading
                    }
                />
            </Space>
        </div>
    );
};