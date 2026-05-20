"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const prisma_1 = __importDefault(require("./config/prisma"));
const error_handler_1 = require("./middleware/error-handler");
const logger_1 = require("./utils/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const chat_1 = __importDefault(require("./routes/chat"));
const ai_1 = __importDefault(require("./routes/ai"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.default.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Изображения объектов недвижимости хранятся в Yandex Object Storage,
// статика клиента раздаётся Next.js — серверу express.static больше не нужен.
if (config_1.default.environment === 'development') {
    app.use((req, _res, next) => {
        logger_1.logger.debug(`${req.method} ${req.url}`);
        next();
    });
}
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/ai', ai_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', environment: config_1.default.environment });
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
app.use(error_handler_1.errorHandler);
const server = app.listen(config_1.default.port, () => {
    logger_1.logger.info(`Server is running on http://localhost:${config_1.default.port}`);
    logger_1.logger.info(`Health check available at http://localhost:${config_1.default.port}/health`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.logger.info('HTTP server closed');
        void prisma_1.default.$disconnect().then(() => {
            logger_1.logger.info('Database connection closed');
            process.exit(0);
        });
    });
});
