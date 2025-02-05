// hooks/analytics/use-learning-analytics.ts
import { useQuery } from 'react-query';
import axios from 'axios';

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

            const { data } = await axios.get(`/api/student/${studentId}/learning-analytics`);
            return data;
        },
        {
            enabled: !!studentId,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000 // 30 minutes
        }
    );
};