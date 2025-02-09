import { Tabs } from 'antd';
import { ClassScheduler } from '../../components/virtual_classes/class_scheduler';
import { useState } from 'react';
import { useCurrentCourses } from '../../hooks/course/hook';

const { TabPane } = Tabs;

export const VirtualClasses: React.FC<{ studentId: string }> = ({ studentId }) => {

    const {
        data: currentCourses,
        isLoading: coursesLoading
    } = useCurrentCourses(studentId);


    const [activeTab, setActiveTab] = useState<string>('all');

    return (
        <div className="p-6">

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="All Classes" key="all">
                    <ClassScheduler courseId={null} />
                </TabPane>
                {currentCourses?.map(course => (
                    <TabPane tab={course.course_name} key={course.course_id}>
                        <ClassScheduler courseId={course.course_id} />
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};