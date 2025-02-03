import { useQuery, useMutation, UseQueryResult } from 'react-query';
import { message } from 'antd';
import { courseAPI } from "../../services/course_service/api.ts";
import { StudentCourseEnrollment } from '../../models/course_enrollment.ts';
import { Course } from "../../models/course.ts";
import { CourseTopic } from '../../models/course_topic.ts';


export const useAvailableCourses = (programId: string, level: string) => {
    return useQuery(
        ['availableCourses', programId, level],
        () => courseAPI.getAvailableCourses(programId, level),
        {
            onError: () => {
                message.error('Failed to fetch current courses');
            }
        }
    );
};

export const useCurrentCourses = (studentId: string): UseQueryResult<(StudentCourseEnrollment & Course)[]> => {
    return useQuery(
        ['currentCourses', studentId],
        () => courseAPI.getCurrentCourses(studentId),
        {
            onError: () => {
                message.error('Failed to fetch current courses');
            }
        }
    );
};

export const useCurrentCoursesTopics = (courseId: string): UseQueryResult<(CourseTopic)[]> => {
    return useQuery(
        ['currentCoursesTopics', courseId],
        () => courseAPI.getCourseTopics(courseId),
        {
            onError: () => {
                message.error('Failed to fetch current courses');
            }
        }
    );
};

export const useCourseHistory = (studentId: string): UseQueryResult<(StudentCourseEnrollment & Course)[]> => {
    return useQuery(
        ['courseHistory', studentId],
        () => courseAPI.getCourseHistory(studentId),
        {
            onError: () => {
                message.error('Failed to fetch course history');
            }
        }
    );
};

export const useSemesterGPA = (
    studentId: string,
    academicYear: string,
    semester: string
): UseQueryResult<{ gpa: number; totalCredits: number }> => {
    return useQuery(
        ['semesterGPA', studentId, academicYear, semester],
        () => courseAPI.getSemesterGPA(studentId, academicYear, semester),
        {
            onError: () => {
                message.error('Failed to fetch semester GPA');
            }
        }
    );
};

export const useEnrollCourse = () => {
    return useMutation(
        (enrollmentData: StudentCourseEnrollment) =>
            courseAPI.enrollInCourse(enrollmentData),
        {
            onSuccess: () => {
                message.success('Successfully enrolled in course');
            },
            onError: () => {
                message.error('Failed to enroll in course');
            }
        }
    );
};

export const useUpdateEnrollment = () => {
    return useMutation(
        ({ enrollmentId, updates }: {
            enrollmentId: string;
            updates: Partial<StudentCourseEnrollment>
        }) => courseAPI.updateEnrollment(enrollmentId, updates),
        {
            onSuccess: () => {
                message.success('Successfully updated enrollment');
            },
            onError: () => {
                message.error('Failed to update enrollment');
            }
        }
    );
};



export const useCourseMaterials = (courseId: string) => {
    return useQuery(
        ['courseMaterials', courseId],
        () => courseAPI.getCourseMaterials(courseId),
        {
            enabled: !!courseId,
            onError: () => {
                message.error('Failed to fetch course materials');
            }
        }
    );
};

export const useCourseAssignments = (courseId: string) => {
    return useQuery(
        ['courseAssignments', courseId],
        () => courseAPI.getCourseAssignments(courseId),
        {
            enabled: !!courseId,
            onError: () => {
                message.error('Failed to fetch course assignments');
            }
        }
    );
};