import { ErrorRequestHandler } from 'express';
/**
 * Централизованный обработчик ошибок. Если ошибка — HttpError, отдаёт её статус
 * и сообщение, иначе возвращает 500 и логирует стек.
 */
export declare const errorHandler: ErrorRequestHandler;
