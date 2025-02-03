import React, { useState } from 'react';
import { Tabs, Button, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Quiz } from '../../models/quiz';
import { QuizCard } from '../../components/quiz/quiz_card';
import { useCurrentCourses } from '../../hooks/course/hook';
import { CustomQuizForm } from '../../components/quiz/quiz_form';
import { useQuizzes } from '../../hooks/quiz/use_quizzes';

const { TabPane } = Tabs;

interface StudentQuizListProps {
    studentId: string;
    onQuizStart?: (quizId: string) => void;
}

export const StudentQuizList: React.FC<StudentQuizListProps> = ({
    studentId,
    onQuizStart
}) => {
    // States
    const [formVisible, setFormVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    // Fetch current courses
    const {
        data: currentCourses,
        isLoading: coursesLoading
    } = useCurrentCourses(studentId);

    // Fetch quizzes
    const {
        quizzes,
        isLoading: quizzesLoading,
        createCustomQuiz
    } = useQuizzes(studentId);

    const handleStartQuiz = (quizId: string) => {
        if (onQuizStart) {
            onQuizStart(quizId);
        }
    };

    const handleCreateQuiz = async (values: Partial<Quiz>) => {
        try {
            await createCustomQuiz(values);
            setFormVisible(false);
        } catch (error) {
            console.error('Failed to create quiz:', error);
        }
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
                                onStart={() => handleStartQuiz(quiz.quiz_id)}
                                showStartButton={true}
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
                                    onStart={() => handleStartQuiz(quiz.quiz_id)}
                                    showStartButton={true}
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
                courseTopics={[]} // You'll need to fetch course topics or pass them as props
                selectedCourse={selectedCourse}
                onCourseChange={setSelectedCourse}
            />
        </div>
    );
};

export default StudentQuizList;