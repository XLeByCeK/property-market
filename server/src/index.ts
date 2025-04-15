import express from 'express';
import cors from 'cors';
import prisma from './prisma';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import chatRoutes from './routes/chat';
import { Router } from 'express';
import config from './config';
import path from 'path';

const app = express();
const port = config.port;

// CORS configuration
const corsOptions = {
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Log requests in development
if (config.environment === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.environment === 'development' ? err.message : undefined
  });
});

// Routes
app.use('/api/auth', authRoutes as Router);
app.use('/api/properties', propertyRoutes as Router);
app.use('/api/chat', chatRoutes as Router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: config.environment });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Property Market API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/properties',
      '/api/chat'
    ]
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
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