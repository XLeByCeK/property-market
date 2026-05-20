import { Request } from 'express';
/**
 * Возвращает пользователя из запроса. Если authenticateToken не отработал
 * (или был забыт), бросает HttpError 401, чтобы вместо TypeError получить
 * корректный ответ клиенту.
 */
export declare const requireUser: (req: Request) => import("./auth").AuthenticatedUser;
