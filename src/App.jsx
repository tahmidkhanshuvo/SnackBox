import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd'; // Ant Design's provider
import Login from './auth/Login';
import Register from './auth/Register';
import CustomerHome from './pages/customer/CustomerHome';
import StaffHome from './pages/staff/StaffHome';
import ManagerHome from './pages/manager/ManagerHome';

const App = () => (
    <ConfigProvider
        theme={{
            token: {
                // You can customize the global theme here
                colorPrimary: '#579040',
                borderRadius: 6,
            },
        }}
    >
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/register" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/staff" element={<StaffHome />} />
                <Route path="/manager" element={<ManagerHome />} />
            </Routes>
        </Router>
    </ConfigProvider>
);

export default App;