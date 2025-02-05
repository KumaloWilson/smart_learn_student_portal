import { Question } from "./quiz_question.ts";

export interface QuizSession {
    questions: Question[];
    attempt_id: string;
    start_time: string;
    end_time?: string;
    status: 'active' | 'completed' | 'expired';
}


export interface QuizStartResponse {
    success: boolean;
    data: {
        quizSession: {
            attempt_id: string;
            quiz_id: string;
            student_id: string;
            start_time: Date;
            current_question_index: number;
            remaining_time: number;
            status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
        };
        questions: Array<{
            attempt_id: string;
            question_id: string;
            text: string;
            options: string[];
            correct_answer: string;
            explanation: string;
            difficulty: 'easy' | 'medium' | 'hard';
            topic: string;
            subtopic?: string;
            points: number;
            misconception?: string;
            type: 'multiple_choice' | 'true_false' | 'matching';
            created_at: string;
        }>;
    };
    message: string;
}
