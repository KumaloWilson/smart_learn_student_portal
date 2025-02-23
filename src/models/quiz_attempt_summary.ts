export interface QuizAttemptSummary {
    attempt_id: string;
    quiz_id: string;
    course_id: string;
    course_name: string;
    topic: string;
    subtopic?: string;
    difficulty: string;
    start_time: string;
    end_time?: string;
    score?: number;
    status: 'in_progress' | 'completed' | 'abandoned';
}