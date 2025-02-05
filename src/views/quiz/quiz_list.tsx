import React, { useState } from 'react';
import { Tabs, Button, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Quiz } from '../../models/quiz';
import { QuizCard } from '../../components/quiz/quiz_card';
import { useCurrentCourses, useCurrentCoursesTopics } from '../../hooks/course/hook';
import { CustomQuizForm } from '../../components/quiz/quiz_form';
import { useQuizzes } from '../../hooks/quiz/use_quizzes';
import { quizAPI } from '../../services/quiz_services/api';

const { TabPane } = Tabs;

interface StudentQuizListProps {
    studentId: string;
    onQuizStart?: (attempt_id: string) => void;
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

    // Fetch selected course topics
    const {
        data: selectedCourseTopics,
        isLoading: topicsLoading
    } = useCurrentCoursesTopics(selectedCourse);

    // Fetch quizzes
    const {
        quizzes,
        isLoading: quizzesLoading,
        createCustomQuiz
    } = useQuizzes(studentId);

    const handleStartQuiz = async () => {
        if (!onQuizStart) return;

        try {
            const response = await quizAPI.startQuiz({});
            onQuizStart(response.data.quizSession.attempt_id);
        } catch (error) {
            message.error('Failed to start quiz. Please try again.');
            console.error(error);
        }
    };


    const handleCreateQuiz = async (values: Partial<Quiz>) => {
        await createCustomQuiz(values);
        setFormVisible(false);
    };

    // Handle course selection change
    const handleCourseChange = (courseId: string) => {
        console.log('Selected course:', courseId);
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
                                student_id={studentId}
                                onStart={() => handleStartQuiz(studentId)}
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
                                    student_id={studentId}
                                    onStart={() => handleStartQuiz(studentId)}
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