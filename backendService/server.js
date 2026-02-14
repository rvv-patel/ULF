// Backend Service Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const applicationRoutes = require('./routes/application.routes');
const companyRoutes = require('./routes/company.routes');
const branchRoutes = require('./routes/branch.routes');
const applicationDocumentRoutes = require('./routes/applicationDocument.routes');
const companyDocumentRoutes = require('./routes/companyDocument.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');
const onedriveRoutes = require('./routes/onedrive');
const dashboardRoutes = require('./routes/dashboard.routes');
const appSettingsRoutes = require('./routes/appSettingsRoutes');
const auditLogRoutes = require('./routes/auditLog.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware - Configure helmet to allow CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Disable for development
}));

// CORS config - Must be before rate limiting
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate Limiting - After CORS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parser
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/application-documents', applicationDocumentRoutes);
app.use('/api/company-documents', companyDocumentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/onedrive', onedriveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/app-settings', appSettingsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Backend Service is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Routes registered: /api/auth, /api/applications, /api/companies, /api/branches, /api/application-documents, /api/company-documents, /api/users, /api/roles, /api/permissions, /api/dashboard');
    console.log('OneDrive integration updated: Popup isolation active');
});
