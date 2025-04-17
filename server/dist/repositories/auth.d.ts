import { PrismaClient } from '@prisma/client';
export interface UserData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    birth_date?: Date;
    role?: string;
}
export declare class AuthRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    getUserByEmail(email: string): Promise<{
        id: number;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        birth_date: Date | null;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    getUserById(id: number): Promise<{
        id: number;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        birth_date: Date | null;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    createUser(userData: UserData): Promise<{
        id: number;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        birth_date: Date | null;
        role: string;
        created_at: Date;
        updated_at: Date;
    }>;
    validateCredentials(credentials: {
        email: string;
        password: string;
    }): Promise<{
        id: number;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        birth_date: Date | null;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    createSession(userId: number): Promise<{
        token: string;
        expires_at: Date;
    }>;
    validateSession(token: string): Promise<{
        token: string;
        expires_at: Date;
        user: {
            id: number;
            email: string;
            password: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            birth_date: Date | null;
            role: string;
            created_at: Date;
            updated_at: Date;
        };
    } | null>;
    deleteSession(token: string): Promise<void>;
}
