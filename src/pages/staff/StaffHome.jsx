import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Card, Row, Col, Statistic } from 'antd';
import { ClockCircleOutlined, SolutionOutlined } from '@ant-design/icons';
import './StaffHome.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const StaffHome = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        console.log("User logged out. Navigating to login page.");
        navigate('/login');
    };

    return (
        <Layout className="staff-layout">
            <Header className="staff-header">
                <div className="header-content">
                    <Title level={3} style={{ color: 'white', margin: 0 }}>Staff Dashboard</Title>
                    <Button onClick={handleLogout}>Logout</Button>
                </div>
            </Header>
            <Content className="staff-content">
                <div className="content-wrapper">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="staff-card" title="New Orders">
                                <Statistic value={12} valueStyle={{ color: '#333' }} />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="staff-card" title="Pending Complaints">
                                <Statistic value={3} valueStyle={{ color: '#cf1322' }} />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="staff-card" title="Upcoming Shift">
                                <Statistic
                                    title="Shift Time"
                                    value="Today at 4:00 PM"
                                    valueStyle={{ color: '#333', fontSize: '1.2rem' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={12} lg={8}>
                            <Card className="staff-card" title="Manage Orders">
                                <Button 
                                    type="primary" 
                                    icon={<SolutionOutlined />} 
                                    block 
                                    onClick={() => navigate('/orders')}
                                >
                                    Go to Order Management
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default StaffHome;
