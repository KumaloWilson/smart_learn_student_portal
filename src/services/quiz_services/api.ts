import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import { Quiz } from '../../models/quiz';

export const adminApi = {
    getAllAdmins: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin`);
        return response.data;
    },

    getAdminById: async (id: string) => {
        const response = await axios.get(`${API_BASE_URL}/admin/${id}`);
        return response.data;
    },

    createAdmin: async (admin: Omit<Admin, 'admin'>) => {
        const response = await axios.post(`${API_BASE_URL}/admin`, admin);
        return response.data;
    },

    updateAdmin: async (id: string, admin: Partial<Admin>) => {
        const response = await axios.put(`${API_BASE_URL}/admin/${id}`, admin);
        return response.data;
    },

    deleteAdmin: async (id: string) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/${id}`);
        return response.data;
    },
};



export const quizService = {
    async getQuizzes(): Promise<Quiz[]> {
        const { data } = await api.get('/quizzes');
        return data;
    },

    async getQuiz(id: string): Promise<Quiz> {
        const { data } = await api.get(`/quizzes/${id}`);
        return data;
    },

    async startAttempt(quizId: string): Promise<string> {
        const { data } = await api.post(`/quiz-attempts/start`, { quiz_id: quizId });
        return data.attempt_id;
    },

    async submitAnswer(answer: Partial<QuizAnswer>): Promise<{
        is_correct: boolean;
        points_earned: number;
        explanation: string;
    }> {
        const { data } = await api.post('/quiz-attempts/submit-answer', answer);
        return data;
    },

    async completeAttempt(attemptId: string): Promise<QuizAttempt> {
        const { data } = await api.post(`/quiz-attempts/${attemptId}/complete`);
        return data;
    },

    async getTopicAnalytics(topic: string): Promise<TopicAnalytics> {
        const { data } = await api.get(`/progress/topic/${topic}`);
        return data;
    },

    async getStudyPlan(): Promise<any> {
        const { data } = await api.get('/progress/study-plan');
        return data;
    }
};