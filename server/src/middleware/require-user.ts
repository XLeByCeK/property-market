import { Request } from 'express';
import { unauthorized } from '../utils/http-errors';

/**
 * Возвращает пользователя из запроса. Если authenticateToken не отработал
 * (или был забыт), бросает HttpError 401, чтобы вместо TypeError получить
 * корректный ответ клиенту.
 */
export const requireUser = (req: Request) => {
  if (!req.user) throw unauthorized();
  return req.user;
};
