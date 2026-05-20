import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
/**
 * Express middleware: проверяет JWT из заголовка Authorization и кладёт
 * найденного пользователя в req.user. При невалидном или отсутствующем
 * токене возвращает 401/403.
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
