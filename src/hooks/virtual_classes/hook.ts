// hooks/quiz/quiz_session.ts
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { LecturerCourseAssignmentDetails } from "../../models/lecturer_courses.ts";
import { CourseTopic } from "../../models/course_topic.ts";
import { CourseManagementService } from "../../services/course_service/api.ts";

export const useVirtualClassesManagement = (lecturerId: string) => {
    const [loading, setLoading] = useState(true);
    const [lecturerCourses, setLecturerCourses] = useState<LecturerCourseAssignmentDetails[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [courseTopics, setCourseTopics] = useState<CourseTopic[]>([]);


    const loadLecturerCourses = async () => {
        try {
            const response = await CourseManagementService.getLecturerCourses(lecturerId);
            const courses = Array.isArray(response) ? response : [];
            setLecturerCourses(courses);
        } catch (error) {
            message.error('Failed to load lecturer courses');
            console.error(error);
            setLecturerCourses([]);
        }
    };

    const loadCourseTopics = async (courseId: string) => {
        try {
            const response = await CourseManagementService.getCourseTopics(courseId);
            const topics = Array.isArray(response) ? response : [];
            setCourseTopics(topics);
        } catch (error) {
            message.error('Failed to load course topics');
            console.error(error);
            setCourseTopics([]);
        }
    };

    useEffect(() => {
        if (lecturerId) {
            loadLecturerCourses();
        }
    }, [lecturerId]);

    useEffect(() => {
        if (selectedCourse) {
            loadCourseTopics(selectedCourse);
        }
    }, [selectedCourse]);

    return {
        loading,
        lecturerCourses,
        courseTopics,
        selectedCourse,
        setSelectedCourse,
    };
};