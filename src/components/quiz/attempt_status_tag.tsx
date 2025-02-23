import { Tag } from 'antd';
import { CheckCircleOutlined, SyncOutlined, StopOutlined } from '@ant-design/icons';

export const AttemptStatusTag: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
        completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
        in_progress: { color: 'processing', icon: <SyncOutlined spin />, text: 'In Progress' },
        abandoned: { color: 'error', icon: <StopOutlined />, text: 'Abandoned' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
        <Tag color={config.color} icon={config.icon}>
            {config.text}
        </Tag>
    );
};