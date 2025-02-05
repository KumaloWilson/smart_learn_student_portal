export interface TopicPerformance {
    topic_id: string;
    topic_name: string;
    average_score: string;
    completion_rate: string;
    weak_subtopics: unknown[];
    strong_subtopics: unknown[];
    recommended_actions: string[];
}