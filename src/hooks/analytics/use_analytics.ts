// hooks/analytics/use-learning-analytics.ts
import { useQuery } from 'react-query';
import axios from 'axios';
import { TopicPerformance } from '../../models/student_topic_perfomance';
import { API_BASE_URL } from '../../configs/config';

interface LearningAnalyticsResponse {
    success: boolean;
    data: {
        student_id: string;
        overall_progress: number;
        topic_performances: TopicPerformance[];
        learning_path: string[];
        weak_areas: string[];
        strong_areas: string[];
    };
    message: string;
}

export const useLearningAnalytics = (studentId?: string) => {
    return useQuery<LearningAnalyticsResponse, Error>(
        ['learningAnalytics', studentId],
        async () => {
            if (!studentId) throw new Error('Student ID is required');

            const { data } = await axios.get(`${API_BASE_URL}/quiz/analytics/student/${studentId}`);
            return data;
        },
        {
            enabled: !!studentId,
            staleTime: 5 * 60 * 1000,
            cacheTime: 30 * 60 * 1000
        }
    );
};