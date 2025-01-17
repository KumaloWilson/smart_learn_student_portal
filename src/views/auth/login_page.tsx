import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../hooks/auth/auth.ts";

const { Title } = Typography;

const LoginPage: React.FC = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState<string>('');

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            setError('');
            await login(values.username, values.password);
            navigate('/dashboard');
        } catch (err) {
            setError(`Invalid credentials. Please try again. ${err}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <img
                        src="/src/assets/logo.jpeg"
                        alt="Logo"
                        className="w-24 h-24 mx-auto mb-4"
                    />
                    <Title level={2}>Student Portal</Title>
                    <Title level={4} className="text-gray-500 font-normal">
                        Welcome back!
                    </Title>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Student ID!' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Student ID"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Log in
                        </Button>
                    </Form.Item>

                    <Space direction="vertical" className="w-full text-center">
                        <Typography.Link>Forgot password?</Typography.Link>
                        <Typography.Text type="secondary">
                            Need help? Contact support
                        </Typography.Text>
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;