import React, { useState } from 'react';
import { Tabs, Button, Spin, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { QuizCard } from '../../components/quiz/quiz_card';
import { useQuizzes } from '../../hooks/quiz/quiz_session';

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
    const [isCustomQuizModalVisible, setCustomQuizModalVisible] = useState(false);
    const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

    // Fetch current courses
    const {
        data: currentCourses,
        isLoading: coursesLoading
    } = useCurrentCourses(studentId);

    // Fetch quizzes (you'll need to implement this hook)
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

    const handleCreateCustomQuiz = async (values: any) => {
        try {
            setIsCreatingQuiz(true);
            await createCustomQuiz(values);
            setCustomQuizModalVisible(false);
            message.success('Custom quiz created successfully!');
        } catch (error) {
            message.error('Failed to create custom quiz');
            console.error(error);
        } finally {
            setIsCreatingQuiz(false);
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
                    onClick={() => setCustomQuizModalVisible(true)}
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

            <Modal
                title="Create Custom Quiz"
                open={isCustomQuizModalVisible}
                onCancel={() => setCustomQuizModalVisible(false)}
                footer={null}
                width={800}
            >
                <CustomQuizForm
                    onSubmit={handleCreateCustomQuiz}
                    onCancel={() => setCustomQuizModalVisible(false)}
                    isLoading={isCreatingQuiz}
                    currentCourses={currentCourses || []}
                />
            </Modal>
        </div>
    );
};

export default StudentQuizList;