export interface CourseAttemptStats {
    course_id: string;
    course_name: string;
    total_quizzes_attempted: number;
    total_attempts: number;
    average_score: number;
    completed_attempts: number;
    abandoned_attempts: number;
}