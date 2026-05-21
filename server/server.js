require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/users.routes');
const projectRoutes = require('./src/routes/projects.routes');
const taskRoutes = require('./src/routes/tasks.routes');
const teamRoutes = require('./src/routes/teams.routes');
const inviteRoutes = require('./src/routes/invites.routes');
const messageRoutes = require('./src/routes/messages.routes');

const app = express();

// Connect to MongoDB
connectDB();

// --- Middleware ---
// Allow requests from localhost (dev) AND from any device on the LAN via the machine's IP
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
  'https://syncsphere-l3qa.onrender.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SyncSphere API!', status: 'ok', timestamp: new Date().toISOString() });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});