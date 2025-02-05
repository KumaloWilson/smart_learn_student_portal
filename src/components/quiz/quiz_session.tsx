// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Question } from '../../models/quiz_question';
// import { QuestionCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
// import { QuestionResponse } from '../../models/quiz_question_response';
// import { v4 as uuidv4 } from 'uuid';
// import { message, Alert, Space, Row, Col, Modal, Button } from 'antd';
// import { QuestionCard } from './question_card';

// interface QuizSessionProps {
//     attempt_id: string;
//     questions?: Question[];
//     timeLimit: number; // in minutes
//     onQuizComplete: (responses: QuestionResponse[]) => void;
// }

// export const QuizSession: React.FC<QuizSessionProps> = ({
//     attempt_id,
//     questions: initialQuestions = [],
//     timeLimit,
//     onQuizComplete,
// }) => {
//     // State management
//     const [session, setSession] = useState({
//         questions: initialQuestions,
//         currentIndex: 0,
//     });
//     const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
//         initialQuestions[0] || null
//     );
//     const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//     const [quizTimeRemaining, setQuizTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
//     const [responses, setResponses] = useState<QuestionResponse[]>([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showHint, setShowHint] = useState(false);
//     const [timeWarning, setTimeWarning] = useState(false);
//     const [submissionError, setSubmissionError] = useState<string | null>(null);

//     // Refs for time tracking
//     const questionStartTime = useRef<number>(Date.now());
//     const questionTimeSpent = useRef<number>(0);

//     // Initialize quiz
//     useEffect(() => {
//         if (initialQuestions.length > 0) {
//             setSession({
//                 questions: initialQuestions,
//                 currentIndex: 0,
//             });
//             setCurrentQuestion(initialQuestions[0]);
//             questionStartTime.current = Date.now();
//         }
//     }, [initialQuestions]);

//     // Quiz timer
//     useEffect(() => {
//         const timer = setInterval(() => {
//             setQuizTimeRemaining(prev => {
//                 const newTime = prev - 1;

//                 // Update question time spent
//                 questionTimeSpent.current = (Date.now() - questionStartTime.current) / 1000;

//                 // Time warnings
//                 if (newTime <= 60 && !timeWarning) {
//                     setTimeWarning(true);
//                     message.warning('Less than 1 minute remaining in the quiz!');
//                 }

//                 // Auto-submit when time is up
//                 if (newTime <= 0) {
//                     clearInterval(timer);
//                     handleQuizTimeUp();
//                     return 0;
//                 }

//                 return newTime;
//             });
//         }, 1000);

//         return () => clearInterval(timer);
//     }, []);

//     const handleQuizTimeUp = useCallback(async () => {
//         message.error('Quiz time is up! Submitting your answers...');

//         // Submit current question if answer selected
//         if (selectedAnswer && currentQuestion) {
//             const response = createQuestionResponse(selectedAnswer);
//             const updatedResponses = [...responses, response];

//             try {
//                 await onQuizComplete(updatedResponses);
//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
//                 setSubmissionError(errorMessage);
//                 message.error(errorMessage);
//             }
//         } else {
//             // Submit quiz with current responses
//             try {
//                 await onQuizComplete(responses);
//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
//                 setSubmissionError(errorMessage);
//                 message.error(errorMessage);
//             }
//         }
//     }, [selectedAnswer, currentQuestion, responses, onQuizComplete]);

//     const createQuestionResponse = (answer: string): QuestionResponse => {
//         if (!currentQuestion) throw new Error('No current question available');

//         return {
//             response_id: uuidv4(),
//             attempt_id,
//             question_id: currentQuestion.question_id,
//             student_answer: answer,
//             is_correct: answer === currentQuestion.correct_answer,
//             time_taken: Math.floor(questionTimeSpent.current), // Actual time spent on question
//             points_earned: answer === currentQuestion.correct_answer ? currentQuestion.points : 0,
//             feedback: answer === currentQuestion.correct_answer
//                 ? 'Correct!'
//                 : `Incorrect. The correct answer is "${currentQuestion.correct_answer}"`,
//         };
//     };

//     const handleSelectAnswer = (answer: string) => {
//         setSelectedAnswer(answer);
//         setSubmissionError(null);
//     };

//     const handleSubmitAnswer = async () => {
//         if (!currentQuestion || !selectedAnswer) return;

//         setIsSubmitting(true);
//         try {
//             const response = createQuestionResponse(selectedAnswer);
//             const updatedResponses = [...responses, response];
//             setResponses(updatedResponses);

//             if (session.currentIndex < session.questions.length - 1) {
//                 // Move to next question
//                 const nextIndex = session.currentIndex + 1;
//                 setSession(prev => ({
//                     ...prev,
//                     currentIndex: nextIndex,
//                 }));
//                 setCurrentQuestion(session.questions[nextIndex]);
//                 setSelectedAnswer(null);
//                 questionStartTime.current = Date.now(); // Reset question timer
//                 questionTimeSpent.current = 0;
//             } else {
//                 // Quiz complete
//                 await onQuizComplete(updatedResponses);
//             }
//         } catch (error) {
//             setSubmissionError(error instanceof Error ? error.message : 'Failed to submit answer');
//             message.error('Failed to submit answer. Please try again.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (!session || !currentQuestion) {
//         return (
//             <Alert
//                 message="No Questions Available"
//                 description="Please try refreshing the page or contact support."
//                 type="error"
//                 showIcon
//             />
//         );
//     }

//     return (
//         <div className="quiz-session">
//             <Space direction="vertical" size="large" className="w-full mb-4">
//                 {submissionError && (
//                     <Alert
//                         message="Submission Error"
//                         description={submissionError}
//                         type="error"
//                         showIcon
//                         closable
//                         onClose={() => setSubmissionError(null)}
//                     />
//                 )}

//                 <Row justify="center">
//                     <Col xs={24} sm={20} md={16}>
//                         <QuestionCard
//                             question={currentQuestion}
//                             currentIndex={session.currentIndex}
//                             totalQuestions={session.questions.length}
//                             quizTimeRemaining={quizTimeRemaining}
//                             questionTimeSpent={questionTimeSpent.current}
//                             selectedAnswer={selectedAnswer}
//                             onSelectAnswer={handleSelectAnswer}
//                             onSubmit={handleSubmitAnswer}
//                             onShowHint={() => setShowHint(true)}
//                             isSubmitting={isSubmitting}
//                         />
//                     </Col>
//                 </Row>
//             </Space>

//             <Modal
//                 title={<Space><QuestionCircleOutlined />Hint</Space>}
//                 open={showHint}
//                 onOk={() => setShowHint(false)}
//                 onCancel={() => setShowHint(false)}
//                 maskClosable={false}
//                 centered
//             >
//                 <Alert
//                     message="Hint Available"
//                     description={"currentQuestion.hint"}
//                     type="info"
//                     showIcon
//                 />
//             </Modal>

//             {timeWarning && quizTimeRemaining > 0 && (
//                 <Alert
//                     message="Time Warning"
//                     description={`Only ${Math.floor(quizTimeRemaining / 60)}:${(quizTimeRemaining % 60).toString().padStart(2, '0')} remaining!`}
//                     type="warning"
//                     showIcon
//                     icon={<ClockCircleOutlined />}
//                     className="fixed bottom-4 right-4 w-64 shadow-lg"
//                     action={
//                         <Button size="small" type="text" onClick={() => setTimeWarning(false)}>
//                             Dismiss
//                         </Button>
//                     }
//                 />
//             )}
//         </div>
//     );
// };

// export default QuizSession;


// src/components/quiz/QuizSession.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, message, Row, Col, Progress, Space, Alert, Button, Tooltip } from 'antd';
import { QuestionCard } from './question_card';
import { Question } from '../../models/quiz_question';
import { QuestionCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { QuestionResponse } from '../../models/quiz_question_response';
import { v4 as uuidv4 } from 'uuid';

interface QuizSessionProps {
    attempt_id: string;
    questions?: Question[];
    quizTimeLimit: number; // in minutes
    onQuizComplete: (responses: QuestionResponse[]) => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
    attempt_id,
    questions: initialQuestions = [],
    quizTimeLimit,
    onQuizComplete,
}) => {
    // State management
    const [session, setSession] = useState({
        questions: initialQuestions,
        current_question_index: 0,
    });
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
        initialQuestions[0] || null
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [quizRemainingTime, setQuizRemainingTime] = useState(quizTimeLimit * 60); // Convert to seconds
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [timeWarning, setTimeWarning] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Refs for tracking time
    const questionTimeRef = useRef<number>(0);
    const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize quiz session
    useEffect(() => {
        if (initialQuestions.length > 0) {
            setSession({
                questions: initialQuestions,
                current_question_index: 0,
            });
            setCurrentQuestion(initialQuestions[0]);
            setQuestionStartTime(Date.now());
        }

        return () => {
            if (quizTimerRef.current) {
                clearInterval(quizTimerRef.current);
            }
        };
    }, [initialQuestions]);

    // Quiz timer
    useEffect(() => {
        quizTimerRef.current = setInterval(() => {
            setQuizRemainingTime(prev => {
                if (prev <= 1) {
                    handleQuizTimeUp();
                    return 0;
                }

                // Warning when 5 minutes remaining
                if (prev === 300 && !timeWarning) {
                    setTimeWarning(true);
                    message.warning('5 minutes remaining in the quiz!');
                }

                // Warning when 1 minute remaining
                if (prev === 60) {
                    message.warning('1 minute remaining in the quiz!');
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (quizTimerRef.current) {
                clearInterval(quizTimerRef.current);
            }
        };
    }, []);

    const handleQuizTimeUp = useCallback(async () => {
        if (quizTimerRef.current) {
            clearInterval(quizTimerRef.current);
        }

        message.error('Quiz time is up! Submitting your answers...');
        await handleAutoSubmit();
    }, [responses]);

    const handleAutoSubmit = async () => {
        // If there's a current question with a selected answer, submit it
        if (currentQuestion && selectedAnswer) {
            const finalResponse = createQuestionResponse(selectedAnswer);
            await handleResponseSubmission(finalResponse, true);
        }

        // Submit all responses
        try {
            await onQuizComplete(responses);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            message.error('Failed to submit quiz. Please contact support.');
        }
    };

    const calculateTimeTaken = (): number => {
        const currentTime = Date.now();
        const timeTaken = Math.floor((currentTime - questionStartTime) / 1000);
        return Math.max(0, timeTaken); // Ensure non-negative
    };

    const createQuestionResponse = (answer: string | null): QuestionResponse => {
        if (!currentQuestion) throw new Error('No current question available');

        const timeTaken = calculateTimeTaken();

        return {
            response_id: uuidv4(),
            attempt_id,
            question_id: currentQuestion.question_id,
            student_answer: answer || '',
            is_correct: answer === currentQuestion.correct_answer,
            time_taken: timeTaken,
            points_earned: answer === currentQuestion.correct_answer ? currentQuestion.points : 0,
            feedback: answer === currentQuestion.correct_answer
                ? 'Correct!'
                : `Incorrect. The correct answer is "${currentQuestion.correct_answer}"`,
            created_at: new Date(),
        };
    };

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setSubmissionError(null);
    };

    const handleResponseSubmission = async (response: QuestionResponse, isAutoSubmit = false) => {
        const existingResponseIndex = responses.findIndex(r => r.question_id === response.question_id);
        let updatedResponses: QuestionResponse[];

        if (existingResponseIndex !== -1) {
            updatedResponses = [...responses];
            updatedResponses[existingResponseIndex] = response;
        } else {
            updatedResponses = [...responses, response];
        }

        setResponses(updatedResponses);

        if (!isAutoSubmit && session.current_question_index < session.questions.length - 1) {
            const nextIndex = session.current_question_index + 1;
            setSession(prev => ({
                ...prev,
                current_question_index: nextIndex,
            }));
            setCurrentQuestion(session.questions[nextIndex]);
            setSelectedAnswer(null);
            setQuestionStartTime(Date.now());
            questionTimeRef.current = 0;
        } else if (!isAutoSubmit) {
            try {
                await onQuizComplete(updatedResponses);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
                setSubmissionError(errorMessage);
                message.error(errorMessage);
            }
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion || !selectedAnswer) return;

        setIsSubmitting(true);
        try {
            const response = createQuestionResponse(selectedAnswer);
            await handleResponseSubmission(response);
        } catch (error) {
            setSubmissionError(error instanceof Error ? error.message : 'Failed to submit answer');
            message.error('Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!session || !currentQuestion) {
        return (
            <Alert
                message="No Questions Available"
                description="Please try refreshing the page or contact support."
                type="error"
                showIcon
            />
        );
    }

    const progressPercent = (session.current_question_index / session.questions.length) * 100;
    const quizTimePercent = (quizRemainingTime / (quizTimeLimit * 60)) * 100;

    return (
        <div className="quiz-session">
            <Space direction="vertical" size="large" className="w-full mb-4">
                {submissionError && (
                    <Alert
                        message="Submission Error"
                        description={submissionError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setSubmissionError(null)}
                    />
                )}

                <Row justify="space-between" align="middle" className="mb-4">
                    <Col span={12}>
                        <Progress
                            percent={progressPercent}
                            format={() => `${session.current_question_index + 1}/${session.questions.length}`}
                            status="active"
                        />
                    </Col>
                    <Col span={12} className="text-right">
                        <Tooltip title="Quiz time remaining">
                            <Progress
                                type="circle"
                                percent={quizTimePercent}
                                format={() => formatTime(quizRemainingTime)}
                                width={60}
                                status={quizRemainingTime <= 300 ? 'exception' : 'normal'}
                            />
                        </Tooltip>
                    </Col>
                </Row>

                <QuestionCard
                    question={currentQuestion}
                    currentIndex={session.current_question_index}
                    totalQuestions={session.questions.length}
                    selectedAnswer={selectedAnswer}
                    quizTimeRemaining={quizRemainingTime}
                    questionTimeSpent={questionTimeRef.current}
                    onSelectAnswer={handleSelectAnswer}
                    onSubmit={handleSubmitAnswer}
                    onShowHint={() => setShowHint(true)}
                    isSubmitting={isSubmitting}
                />
            </Space>

            <Modal
                title={<Space><QuestionCircleOutlined />Hint</Space>}
                open={showHint}
                onOk={() => setShowHint(false)}
                onCancel={() => setShowHint(false)}
                maskClosable={false}
                centered
            >
                <Alert
                    message="Hint"
                    description={currentQuestion.misconception || "No hint available"}
                    type="info"
                    showIcon
                />
            </Modal>

            {timeWarning && quizRemainingTime <= 300 && quizRemainingTime > 0 && (
                <Alert
                    message="Time Warning"
                    description={`${Math.ceil(quizRemainingTime / 60)} minutes remaining!`}
                    type="warning"
                    showIcon
                    icon={<ClockCircleOutlined />}
                    className="fixed bottom-4 right-4 w-64 shadow-lg"
                    action={
                        <Button size="small" type="text" onClick={() => setTimeWarning(false)}>
                            Dismiss
                        </Button>
                    }
                />
            )}
        </div>
    );
};

export default QuizSession;