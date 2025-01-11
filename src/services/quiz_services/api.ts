import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import { AnyObject } from 'antd/es/_util/type';

export const apiService = {
    // Start a new quiz attempt
    startQuiz: async (requestBody: AnyObject) => {
        const response = await axios.post(`${API_BASE_URL}/quiz/start`, requestBody);
        return response.data;
    },

    // Submit a response for a specific question in the quiz attempt
    submitResponse: async (responseData: {
        attempt_id: string;
        question_id: string;
        student_answer: string;
        time_taken: number;
    }) => {
        const response = await axios.post(`${API_BASE_URL}/quiz/responses`, responseData);
        return response.data;
    },

    // Submit the complete set of responses for the quiz attempt
    submitQuiz: async (attempt_id: string, responses: unknown[]) => {
        const response = await axios.post(`${API_BASE_URL}/quiz/submit`, {
            attempt_id,
            responses
        });
        return response.data;
    },

    // Fetch available quizzes
    getQuizzes: async (filterType: string | undefined) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/available`);
        return response.data;
    },

    // Fetch the responses submitted for a specific quiz attempt
    getAttemptResponses: async (attempt_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/responses/${attempt_id}`);
        return response.data;
    },


    getQuizSession: async (attempt_id: string) => {
        const response = await axios.get(`${API_BASE_URL}/quiz/responses/${attempt_id}`);
        return response.data;
    }
};
