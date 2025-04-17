import { Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth';
export declare class AuthController {
    private authRepository;
    constructor(authRepository: AuthRepository);
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    logout(req: Request, res: Response): Promise<void>;
    validateSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
