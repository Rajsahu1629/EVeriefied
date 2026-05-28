import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import recruitersRoutes from './routes/recruiters';
import jobsRoutes from './routes/jobs';
import applicationsRoutes from './routes/applications';
import adminRoutes from './routes/admin';
import quizRoutes from './routes/quiz';
import statsRoutes from './routes/stats';
import verificationRoutes from './routes/verification';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}${query}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/recruiters', recruitersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Listen on all interfaces so phones on the same Wi‑Fi can reach the API
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 EVeerified Backend running on port ${PORT}`);
    console.log(`   Local:   http://localhost:${PORT}/api`);
    console.log(`   Network: http://<your-laptop-ip>:${PORT}/api  (use this for Expo Go on phone)`);
});

export default app;
