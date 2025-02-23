import { useQuery } from 'react-query';
import axios from 'axios';
import { CourseAttemptStats } from '../../models/course_attempt_stats';
import { QuizAttemptSummary } from '../../models/quiz_attempt_summary';
import { API_BASE_URL } from '../../configs/config';

export const useQuizAttempts = (studentId: string) => {
    return useQuery<QuizAttemptSummary[]>('quizAttempts', async () => {
        const response = await axios.get(`${API_BASE_URL}/quiz/student/responses/${studentId}/attempts`);
        return response.data.data;
    });
};

export const useCourseQuizAttempts = (studentId: string, courseId: string) => {
    return useQuery<QuizAttemptSummary[]>(['courseAttempts', courseId], async () => {
        const response = await axios.get(`${API_BASE_URL}/quiz/student/responses/${studentId}/course/${courseId}/attempts`);
        return response.data.data;
    });
};

export const useQuizAttemptStats = (studentId: string) => {
    return useQuery<CourseAttemptStats[]>('attemptStats', async () => {
        const response = await axios.get(`${API_BASE_URL}/quiz/student/responses/${studentId}/attempts/stats`);
        return response.data.data;
    });
};