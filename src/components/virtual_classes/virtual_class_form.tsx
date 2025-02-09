// types.ts
import type { Moment } from 'moment';
import React from 'react';
import { Form, Input, DatePicker, Select, Button } from 'antd';
import { Course } from '../../models/course';
import { CourseTopic } from '../../models/course_topic';

const { RangePicker } = DatePicker;


export interface ClassFormValues {
    course_id: string;
    topic_id?: string;
    title: string;
    description?: string;
    timeRange: [Moment, Moment];
    isRecurring?: boolean;
    recurrencePattern?: string;
}


interface VirtualClassFormProps {
    form: any;
    isSubmitting: boolean;
    lecturerCourses: Course[];
    courseTopics: CourseTopic[];
    selectedCourse: string | null;
    onCourseChange: (courseId: string) => void;
    onFinish: (values: ClassFormValues) => Promise<void>;
}

export const VirtualClassForm: React.FC<VirtualClassFormProps> = ({
    form,
    isSubmitting,
    lecturerCourses,
    courseTopics,
    selectedCourse,
    onCourseChange,
    onFinish,
}) => {
    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            disabled={isSubmitting}
        >
            <Form.Item
                name="course_id"
                label="Course"
                rules={[{ required: true, message: 'Please select a course' }]}
            >
                <Select
                    onChange={onCourseChange}
                    placeholder="Select a course"
                >
                    {lecturerCourses.map(course => (
                        <Select.Option key={course.course_id} value={course.course_id}>
                            {course.course_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="topic_id"
                label="Topic"
                rules={[{ required: true, message: 'Please select a topic' }]}
            >
                <Select
                    placeholder="Select a topic"
                    disabled={!selectedCourse}
                >
                    {courseTopics.map(topic => (
                        <Select.Option key={topic.topic_id} value={topic.topic_id}>
                            {topic.topic_name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <Input.TextArea />
            </Form.Item>

            <Form.Item
                name="timeRange"
                label="Class Time"
                rules={[{ required: true, message: 'Please select class time' }]}
            >
                <RangePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                >
                    Schedule Class
                </Button>
            </Form.Item>
        </Form>
    );
};
