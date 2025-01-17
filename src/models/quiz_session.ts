import {Question} from "./quiz_question.ts";

export interface QuizSession {
    questions: Question[];
    attempt_id: string;
    start_time: string;
    end_time?: string;
    status: 'active' | 'completed' | 'expired';
}
