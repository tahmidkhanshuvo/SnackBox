import React from 'react';
import { Layout, Typography, Button, Row, Col, Card } from 'antd';
import './CustomerHome.css';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const CustomerHome = () => (
    <Layout className="customer-layout">
        <Header className="customer-header">
            <Title level={2} style={{ color: 'white', margin: 0 }}>SnackBox Customer</Title>
            <Button type="primary" danger>Logout</Button>
        </Header>
        <Content className="customer-content">
            <div className="welcome-banner">
                <Title>Welcome, Customer!</Title>
                <Paragraph>Delicious meals are just a click away.</Paragraph>
                <Button type="primary" size="large">Order Now</Button>
            </div>
            {/* Additional content can go here */}
        </Content>
    </Layout>
);

export default CustomerHome;