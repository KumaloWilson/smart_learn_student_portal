import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';

export const learningAnalyticsAPI = {
    // Fetch available quizzes
    getStudentAnalytics: async (student_id: string, course_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/analytics/student/${student_id}`);
        return response.data;
    },

    // Fetch the responses submitted for a specific quiz attempt
    getAttemptResponses: async (attempt_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/responses/attempts/${attempt_id}/responses`);
        return response.data;
    },

    getQuizSession: async (attempt_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/session/current/${attempt_id}`);
        return response.data;
    },

    getQuizByCourseID: async (course_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/session/available/course/${course_id}`);
        return response.data;
    },

    getQuizByInstructorID: async (instructor_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/session/available/instructor/${instructor_id}`);
        return response.data;
    },

    deleteQuizByID: async (instructor_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/session/available/${instructor_id}`);
        return response.data;
    }
};
