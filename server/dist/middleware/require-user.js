"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = void 0;
const http_errors_1 = require("../utils/http-errors");
/**
 * Возвращает пользователя из запроса. Если authenticateToken не отработал
 * (или был забыт), бросает HttpError 401, чтобы вместо TypeError получить
 * корректный ответ клиенту.
 */
const requireUser = (req) => {
    if (!req.user)
        throw (0, http_errors_1.unauthorized)();
    return req.user;
};
exports.requireUser = requireUser;
