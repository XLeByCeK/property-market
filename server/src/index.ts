import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import chatRoutes from './routes/chat';
import { Router } from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
app.use('/api/auth', authRoutes as Router);
app.use('/api/properties', propertyRoutes as Router);
app.use('/api/chat', chatRoutes as Router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
}); 