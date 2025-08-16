import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, Row, Col, Typography, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import './Auth.css'; // Uses the same shared CSS file

const { Title } = Typography;

const Register = () => {
    const navigate = useNavigate();

    const onFinish = (values) => {
        // This logic correctly saves the user to localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const newUser = { email: values.email, password: values.password, userType: values.userType };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please login.');
        navigate('/login');
    };

    const userTypeOptions = [
        { value: 'customer', label: 'Customer' },
        { value: 'staff', label: 'Staff' },
        { value: 'manager', label: 'Manager' },
    ];

    return (
        <div className="auth-container">
            <Row className="full-height-row">
                {/* Decorative Panel */}
                <Col xs={0} md={12} lg={14} className="auth-decorative-panel">
                    <div className="auth-content">
                        {/* Updated Title to match the image */}
                        <Title level={1}>Welcome to SnackBox</Title>
                        <p>Your intelligent canteen management solution.</p>
                    </div>
                </Col>

                {/* Form Panel */}
                <Col xs={24} md={12} lg={10} className="auth-form-panel">
                    <Card className="auth-card">
                        <Title level={2} className="auth-title">Create Account</Title>
                        <Form
                            name="register"
                            onFinish={onFinish}
                            initialValues={{ userType: 'customer' }}
                            size="large"
                            autoComplete="off"
                        >
                            <Form.Item
                                name="email"
                                rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email Address" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your Password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                            </Form.Item>

                            <Form.Item
                                name="userType"
                                rules={[{ required: true, message: 'Please select a user type!' }]}
                            >
                                {/* The placeholder will now show correctly */}
                                <Select placeholder="Register As" options={userTypeOptions} />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Register
                                </Button>
                            </Form.Item>
                        </Form>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p>Already have an account? <Link to="/login">Login here</Link></p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Register;