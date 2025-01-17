import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Button, Breadcrumb } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { ItemType } from 'antd/es/menu/interface';
import {useAuth} from "../../hooks/auth/auth.ts";

const { Header } = Layout;
const { Text } = Typography;

interface ProfileHeaderProps {
    breadcrumbItems: string[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ breadcrumbItems }) => {
    const { student, logout } = useAuth();

    const profileMenu: ItemType[] = [
        {
            key: 'profile',
            label: 'View Profile',
            icon: <UserOutlined />,
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: logout,
        },
    ];

    return (
        <Header className="bg-white px-4 flex justify-between items-center">
            <Breadcrumb className="my-4">
                {breadcrumbItems.map((item) => (
                    <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                ))}
            </Breadcrumb>

            <Space size="large">
                <Space>
                    <Text type="secondary">Welcome,</Text>
                    <Text strong>{`${student?.first_name} ${student?.last_name}`}</Text>
                </Space>

                <Dropdown menu={{ items: profileMenu }} placement="bottomRight">
                    <Button type="text" className="flex items-center">
                        <Avatar
                            src={student?.photo_url}
                            icon={!student?.photo_url && <UserOutlined />}
                            className="mr-2"
                        />
                    </Button>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default ProfileHeader;