import React from "react";
import {Card, Space, Statistic} from "antd";

interface GpaCardProps {
    gpa: number;
    totalCredits: number;
    loading: boolean;
}

export const GpaCard: React.FC<GpaCardProps> = ({ gpa, totalCredits, loading }) => {
    return (
        <Card loading={loading}>
            <Space direction="horizontal" size="large">
                <Statistic
                    title="Semester GPA"
                    value={gpa}
                    precision={2}
                    valueStyle={{ color: gpa >= 3.0 ? '#3f8600' : '#cf1322' }}
                />
                <Statistic
                    title="Total Credits"
                    value={totalCredits}
                />
            </Space>
        </Card>
    );
};