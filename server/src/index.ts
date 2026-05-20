import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import config from './config';
import prisma from './config/prisma';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Изображения объектов недвижимости хранятся в Yandex Object Storage,
// статика клиента раздаётся Next.js — серверу express.static больше не нужен.

if (config.environment === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });
}

app.use('/api/auth', authRoutes as Router);
app.use('/api/properties', propertyRoutes as Router);
app.use('/api/chat', chatRoutes as Router);
app.use('/api/ai', aiRoutes as Router);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: config.environment });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Property Market API',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/properties', '/api/chat', '/api/ai'],
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`Server is running on http://localhost:${config.port}`);
  logger.info(`Health check available at http://localhost:${config.port}/health`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    void prisma.$disconnect().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});
