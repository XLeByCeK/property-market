import { Request, Response, NextFunction } from 'express';
interface UserWithRole {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserWithRole;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
