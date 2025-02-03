import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import { StudentCourseEnrollment } from "../../models/course_enrollment.ts";

export const courseAPI = {

    getCourseTopics: async (courseId: string) => {
        const response = await axios.get(`${API_BASE_URL}/lecturer/course/topics/course/${courseId}`);
        return response.data.data;
    },

    getAvailableCourses: async (programId: string, level: string) => {
        const response = await axios.get(
            `${API_BASE_URL}/courses/program/${programId}/level/${level}`
        );
        return response.data.data;
    },

    // Get all current courses for student
    getCurrentCourses: async (studentId: string) => {
        const response = await axios.get(
            `${API_BASE_URL}/student/course/enrollments/${studentId}/courses/current`
        );
        return response.data.data;
    },


    // Get course history
    getCourseHistory: async (studentId: string) => {
        const response = await axios.get(
            `${API_BASE_URL}/student/course/enrollments/${studentId}/courses/history`
        );
        return response.data.data;
    },

    // Get semester GPA
    getSemesterGPA: async (studentId: string, academicYear: string, semester: string) => {
        const response = await axios.get(
            `${API_BASE_URL}/student/course/enrollments/${studentId}/gpa/${academicYear}/${semester}`
        );
        return response.data.data;
    },

    // Enroll in a course
    enrollInCourse: async (enrollmentData: StudentCourseEnrollment) => {
        const response = await axios.post(
            `${API_BASE_URL}/student/course/enrollments/enroll`,
            enrollmentData
        );
        return response.data.data;
    },

    bulkEnrollInCourses: async (enrollments: StudentCourseEnrollment[]) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/student/course/enrollments/bulk-enroll`,
                enrollments
            );
            return response.data.data;
        } catch (error: any) {
            // Rethrow the error with the backend message if available
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    },

    // Update enrollment
    updateEnrollment: async (enrollmentId: string, updates: Partial<StudentCourseEnrollment>) => {
        const response = await axios.put(
            `${API_BASE_URL}/student/course/enrollments/${enrollmentId}`,
            updates
        );
        return response.data.data;
    }
};