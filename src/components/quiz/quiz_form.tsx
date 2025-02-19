import React, { useEffect, useState } from 'react';
import { Form, Select, Drawer, Input, InputNumber, Space, Button, Tag, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CourseTopic } from "../../models/course_topic";
import { LecturerCourseAssignmentDetails } from "../../models/lecturer_courses";
import { v4 as uuidv4 } from "uuid";
import { Quiz } from "../../models/quiz";

interface QuizFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<Quiz>) => Promise<void>;
    initialValues?: Partial<Quiz>;
    lecturerCourses: LecturerCourseAssignmentDetails[];
    courseTopics: CourseTopic[];
    selectedCourse: string;
    onCourseChange: (courseId: string) => void;
}

export const CustomQuizForm: React.FC<QuizFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    lecturerCourses,
    courseTopics,
    onCourseChange,
    initialValues
}) => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState<string[]>([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                learning_objectives: initialValues.learning_objectives || ['']
            });
            setTags(initialValues.tags || []);
        } else if (visible) {
            form.resetFields();
            setTags([]);
        }
    }, [visible, initialValues, form]);

    const handleClose = (removedTag: string) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
        form.setFieldsValue({ tags: newTags });
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            const newTags = [...tags, inputValue];
            setTags(newTags);
            form.setFieldsValue({ tags: newTags });
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleCourseChange = (courseId: string) => {
        const selected = lecturerCourses.find(course => course.course_id === courseId);
        if (selected) {
            form.setFieldsValue({ topic: selected.course_name });
        }
        onCourseChange(courseId);
    };



    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const values = await form.validateFields();
            const formData = {
                quiz_id: uuidv4(),
                course_id: values.course_id,
                topic: values.topic,
                subtopic: values.subtopic,
                difficulty: values.difficulty,
                total_questions: values.total_questions,
                time_limit: values.time_limit,
                passing_score: values.passing_score,
                learning_objectives: values.learning_objectives || [],
                tags: tags,
                creator_role: 'student' as 'student' | 'lecturer',
                status: 'active' as 'draft' | 'active' | 'archived'
            };
            await onSubmit(formData);
            onCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            title={initialValues ? "Edit Quiz" : "Create Quiz"}
            open={visible}
            onClose={onCancel}
            width={1200}
            extra={
                <Space>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                style={{ maxWidth: '100%' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <Divider>Basic Information</Divider>
                        <Form.Item
                            name="course_id"
                            label="Course"
                            rules={[{ required: true, message: 'Please select a course' }]}
                        >
                            <Select
                                placeholder="Select course"
                                onChange={handleCourseChange}
                                showSearch
                                optionFilterProp="children"
                            >
                                {lecturerCourses.map(course => (
                                    <Select.Option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Hidden field to store course name */}
                        <Form.Item name="topic" hidden>
                            <Input />
                        </Form.Item>


                        <Form.Item
                            name="subtopic"
                            label="Topic"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Select topic">
                                {courseTopics.map(topic => (
                                    <Select.Option key={topic.topic_id} value={topic.topic_name}>
                                        {topic.topic_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="difficulty"
                            label="Difficulty Level"
                            rules={[{ required: true, message: 'Please select difficulty level' }]}
                        >
                            <Select placeholder="Select difficulty">
                                <Select.Option value="easy">Easy</Select.Option>
                                <Select.Option value="medium">Medium</Select.Option>
                                <Select.Option value="hard">Hard</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div>
                        <Divider>Quiz Settings</Divider>
                        <Form.Item
                            name="total_questions"
                            label="Number of Questions"
                            rules={[
                                { required: true, message: 'Please enter number of questions' },
                                { type: 'number', min: 1, max: 50, message: 'Must be between 1 and 50 questions' }
                            ]}
                        >
                            <InputNumber min={1} max={50} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="time_limit"
                            label="Time Limit (minutes)"
                            rules={[
                                { required: true, message: 'Please enter time limit' },
                                { type: 'number', min: 5, max: 180, message: 'Time limit must be between 5 and 180 minutes' }
                            ]}
                        >
                            <InputNumber min={5} max={180} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="passing_score"
                            label="Passing Score (%)"
                            rules={[
                                { required: true, message: 'Please enter passing score' },
                                { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }
                            ]}
                        >
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </div>

                <Divider>Learning Objectives</Divider>
                <Form.List name="learning_objectives">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    required={false}
                                    key={field.key}
                                    label={index === 0 ? 'Learning Objectives' : ''}
                                >
                                    <Form.Item
                                        {...field}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: "Please input learning objective or delete this field.",
                                            },
                                        ]}
                                        noStyle
                                    >
                                        <Input
                                            placeholder="Enter learning objective"
                                            style={{ width: '90%' }}
                                        />
                                    </Form.Item>
                                    {fields.length > 1 && (
                                        <MinusCircleOutlined
                                            className="dynamic-delete-button"
                                            onClick={() => remove(field.name)}
                                            style={{ marginLeft: 8 }}
                                        />
                                    )}
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                    style={{ width: '60%' }}
                                >
                                    Add Learning Objective
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Divider>Tags</Divider>
                <Form.Item label="Tags">
                    <Space wrap>
                        {tags.map((tag) => (
                            <Tag
                                key={tag}
                                closable
                                onClose={() => handleClose(tag)}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {inputVisible ? (
                            <Input
                                type="text"
                                size="small"
                                style={{ width: 78 }}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onBlur={handleInputConfirm}
                                onPressEnter={handleInputConfirm}
                                autoFocus
                            />
                        ) : (
                            <Tag onClick={() => setInputVisible(true)} className="site-tag-plus">
                                <PlusOutlined /> New Tag
                            </Tag>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Drawer>
    );
};