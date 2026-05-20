"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_errors_1 = require("../utils/http-errors");
const logger_1 = require("../utils/logger");
const config_1 = __importDefault(require("../config"));
/**
 * Централизованный обработчик ошибок. Если ошибка — HttpError, отдаёт её статус
 * и сообщение, иначе возвращает 500 и логирует стек.
 */
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof http_errors_1.HttpError) {
        res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
        return;
    }
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Something went wrong!',
        message: config_1.default.environment === 'development' ? err?.message : undefined,
    });
};
exports.errorHandler = errorHandler;
