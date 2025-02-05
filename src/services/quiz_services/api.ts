import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import { AnyObject } from 'antd/es/_util/type';
import { QuizStartResponse } from '../../models/quiz_session';

export const quizAPI = {
    // Start a new quiz attempt
    startQuiz: async (requestBody: AnyObject): Promise<QuizStartResponse> => {
        const response = await axios.post(`${API_BASE_URL}/quiz/session/start`, requestBody);
        return response.data;
    },

    createQuiz: async (requestBody: AnyObject) => {
        const response = await axios.post(`${API_BASE_URL}/quiz/session/create`, requestBody);
        return response.data;
    },


    // Submit the complete set of responses for the quiz attempt
    submitQuiz: async (attempt_id: string, responses: unknown[]) => {
        const response = await axios.post(`${API_BASE_URL}/quiz/session/submit`, {
            attempt_id,
            responses
        });
        return response.data;
    },

    // Fetch available quizzes
    getQuizzes: async () => {
        const response = await axios.get(`${API_BASE_URL}/quiz/session/available`);
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
