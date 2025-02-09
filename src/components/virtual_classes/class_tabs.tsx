import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface VirtualClassHeaderProps {
    onNewClass: () => void;
}

export const VirtualClassHeader: React.FC<VirtualClassHeaderProps> = ({ onNewClass }) => {
    return (
        <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Virtual Classes</h1>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onNewClass}
            >
                Schedule New Class
            </Button>
        </div>
    );
};
