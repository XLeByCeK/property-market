"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = __importDefault(require("./prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const chat_1 = __importDefault(require("./routes/chat"));
const config_1 = __importDefault(require("./config"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = config_1.default.port;
// CORS configuration
const corsOptions = {
    origin: config_1.default.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the public directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Log requests in development
if (config_1.default.environment === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: config_1.default.environment === 'development' ? err.message : undefined
    });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/chat', chat_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: config_1.default.environment });
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
        prisma_1.default.$disconnect().then(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});
