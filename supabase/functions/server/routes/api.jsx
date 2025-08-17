// api.jsx - Main API routes (Laravel-inspired route structure)
import { Hono } from "npm:hono";
import authRoutes from './auth.js';
import customerRoutes from './customer.js';
import staffRoutes from './staff.js';
import managerRoutes from './manager.js';

const apiRoutes = new Hono();

// API version and info
apiRoutes.get('/', (c) => {
  return c.json({
    success: true,
    message: 'SnackBox API v1.0',
    version: '1.0.0',
    description: 'Smart Canteen Management System API',
    endpoints: {
      auth: '/api/auth',
      customer: '/api/customer',
      staff: '/api/staff',
      manager: '/api/manager'
    },
    timestamp: new Date().toISOString()
  });
});

// Route groups (Laravel-style)
apiRoutes.route('/auth', authRoutes);
apiRoutes.route('/customer', customerRoutes);
apiRoutes.route('/staff', staffRoutes);
apiRoutes.route('/manager', managerRoutes);

// Global API health check
apiRoutes.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    services: {
      database: 'connected',
      api: 'running'
    },
    uptime: process ? process.uptime() : 'N/A',
    timestamp: new Date().toISOString()
  });
});

export default apiRoutes;
