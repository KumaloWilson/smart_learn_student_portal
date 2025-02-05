import React, { useState } from 'react';
import { Tabs, Button, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Quiz } from '../../models/quiz';
import { useCurrentCourses, useCurrentCoursesTopics } from '../../hooks/course/hook';
import { useQuizzes } from '../../hooks/quiz/use_quizzes';
import { quizAPI } from '../../services/quiz_services/api';
import { QuizCard } from '../../components/quiz/quiz_card';
import { CustomQuizForm } from '../../components/quiz/quiz_form';

const { TabPane } = Tabs;

interface StudentQuizListProps {
    studentId: string;
    onQuizStart?: (attemptId: string) => void;
}

export const StudentQuizList: React.FC<StudentQuizListProps> = ({
    studentId,
    onQuizStart
}) => {
    const [formVisible, setFormVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        data: currentCourses,
        isLoading: coursesLoading
    } = useCurrentCourses(studentId);

    const {
        data: selectedCourseTopics,
        isLoading: topicsLoading
    } = useCurrentCoursesTopics(selectedCourse);

    const {
        quizzes,
        isLoading: quizzesLoading,
        createCustomQuiz
    } = useQuizzes(studentId);

    const handleStartQuiz = async (quiz: Quiz) => {
        if (!onQuizStart) return;

        setLoading(true);
        try {
            const requestBody = {
                student_id: studentId,
                quiz: {
                    quiz_id: quiz.quiz_id,
                    course_id: quiz.course_id,
                    topic: quiz.topic,
                    subtopic: quiz.subtopic,
                    difficulty: quiz.difficulty,
                    created_by: quiz.created_by,
                    total_questions: quiz.total_questions,
                    time_limit: quiz.time_limit,
                    passing_score: quiz.passing_score,
                    status: quiz.status,
                    learning_objectives: Array.isArray(quiz.learning_objectives)
                        ? quiz.learning_objectives
                        : quiz.learning_objectives ? JSON.parse(quiz.learning_objectives) : [],
                    tags: Array.isArray(quiz.tags) ? quiz.tags : quiz.tags ? JSON.parse(quiz.tags) : []
                }
            };

            console.log(requestBody);

            const response = await quizAPI.startQuiz(requestBody);

            if (response.success) {
                message.success(response.message);
                onQuizStart(response.data.quizSession.attempt_id);
            } else {
                message.error(response.message || 'Failed to start quiz');
            }

        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to start quiz. Please try again.');
            console.error('Quiz start error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async (values: Partial<Quiz>) => {
        try {
            await createCustomQuiz(values);
            setFormVisible(false);
            message.success('Custom quiz created successfully!');
        } catch (error) {
            message.error('Failed to create custom quiz');
            console.error('Create quiz error:', error);
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourse(courseId);
    };

    if (coursesLoading || quizzesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const getQuizzesForCourse = (courseId: string) => {
        return quizzes.filter(quiz => quiz.course_id === courseId);
    };

    return (
        <div className="student-quiz-list">
            <div className="mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setFormVisible(true)}
                    loading={loading}
                >
                    Create Custom Quiz
                </Button>
            </div>

            <Tabs defaultActiveKey="all">
                <TabPane tab="All Quizzes" key="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quizzes.map(quiz => (
                            <QuizCard
                                key={quiz.quiz_id}
                                quiz={quiz}
                                onStart={handleStartQuiz}
                            />
                        ))}
                        {quizzes.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No quizzes available
                            </div>
                        )}
                    </div>
                </TabPane>

                {currentCourses?.map(course => (
                    <TabPane tab={course.course_name} key={course.course_id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getQuizzesForCourse(course.course_id).map(quiz => (
                                <QuizCard
                                    key={quiz.quiz_id}
                                    quiz={quiz}
                                    onStart={handleStartQuiz}
                                />
                            ))}
                            {getQuizzesForCourse(course.course_id).length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    No quizzes available for this course
                                </div>
                            )}
                        </div>
                    </TabPane>
                ))}
            </Tabs>

            <CustomQuizForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSubmit={handleCreateQuiz}
                initialValues={undefined}
                lecturerCourses={currentCourses || []}
                courseTopics={selectedCourseTopics || []}
                selectedCourse={selectedCourse}
                onCourseChange={handleCourseChange}
            />
        </div>
    );
};

export default StudentQuizList;