import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Typography, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import './Auth.css'; // Uses the same shared CSS file

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log("Attempting to log in with:", values);

        // 1. Get all registered users from storage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log("Found users in storage:", users);

        // 2. Find a user that matches the email AND password
        const user = users.find(u => u.email === values.email && u.password === values.password);

        if (user) {
            // 3. If user is found, log success and redirect
            console.log("SUCCESS: User found!", user);
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            
            // Navigate to the correct dashboard
            switch (user.userType) {
                case 'customer': navigate('/customer'); break;
                case 'staff': navigate('/staff'); break;
                case 'manager': navigate('/manager'); break;
                default: navigate('/'); break;
            }
        } else {
            // 4. If no user is found, alert the user
            console.error("FAILURE: User not found or password incorrect.");
            alert('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <Row className="full-height-row">
                <Col xs={0} md={12} lg={14} className="auth-decorative-panel">
                    <div className="auth-content">
                        <Title level={1}>Welcome Back!</Title>
                        <p>Log in to continue managing your canteen experience.</p>
                    </div>
                </Col>
                <Col xs={24} md={12} lg={10} className="auth-form-panel">
                    <Card className="auth-card">
                        <Title level={2} className="auth-title">Login</Title>
                        <Form
                            name="login"
                            onFinish={onFinish}
                            size="large"
                            autoComplete="off"
                        >
                            <Form.Item
                                name="email"
                                rules={[{ required: true, type: 'email', message: 'Please input your Email!' }]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email Address" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your Password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p>Don't have an account? <Link to="/register">Register now</Link></p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Login;