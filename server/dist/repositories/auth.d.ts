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
        birth_date: Date | null;
        created_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        updated_at: Date;
        role: string;
    } | null>;
    getUserById(id: number): Promise<{
        id: number;
        email: string;
        password: string;
        birth_date: Date | null;
        created_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        updated_at: Date;
        role: string;
    } | null>;
    createUser(userData: UserData): Promise<{
        id: number;
        email: string;
        password: string;
        birth_date: Date | null;
        created_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        updated_at: Date;
        role: string;
    }>;
    validateCredentials(credentials: {
        email: string;
        password: string;
    }): Promise<{
        id: number;
        email: string;
        password: string;
        birth_date: Date | null;
        created_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        updated_at: Date;
        role: string;
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
            birth_date: Date | null;
            created_at: Date;
            first_name: string;
            last_name: string;
            phone: string | null;
            updated_at: Date;
            role: string;
        };
    } | null>;
    deleteSession(token: string): Promise<void>;
}
