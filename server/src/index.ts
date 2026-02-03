import express from 'express';
import cors from 'cors';
import prisma from './prisma';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';
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
console.log('Setting up static file serving from:', path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d', // Кеширование на 1 день
  index: false, // Отключаем автоматическую подачу index.html
  setHeaders: (res, filePath) => {
    // Устанавливаем правильные заголовки для изображений
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', filePath.endsWith('.png') ? 'image/png' : 'image/jpeg');
    }
  }
}));

// Дополнительный путь для проверки загрузки изображений
app.get('/test-image', (req, res) => {
  const imagePath = req.query.path;
  if (!imagePath || typeof imagePath !== 'string') {
    return res.send(`
      <html>
        <head><title>Test Image Loading</title></head>
        <body>
          <h1>Image Test Page</h1>
          <p>Please provide an image path as a query parameter, e.g. /test-image?path=/uploads/properties/image.jpg</p>
        </body>
      </html>
    `);
  }
  
  res.send(`
    <html>
      <head><title>Test Image: ${imagePath}</title></head>
      <body>
        <h1>Testing image: ${imagePath}</h1>
        <img src="${imagePath}" style="max-width: 100%" onerror="document.getElementById('error').textContent = 'Error loading image'">
        <div id="error" style="color: red"></div>
        <p>Image URL: ${imagePath}</p>
      </body>
    </html>
  `);
});

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
app.use('/api/ai', aiRoutes as Router); 

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