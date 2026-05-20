"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = require("bcryptjs");
// In-memory sessions store (could be replaced with Redis, DB, etc.)
const sessions = new Map();
class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserByEmail(email) {
        return this.prisma.users.findUnique({
            where: { email }
        });
    }
    async getUserById(id) {
        return this.prisma.users.findUnique({
            where: { id }
        });
    }
    async createUser(userData) {
        const hashedPassword = await (0, bcryptjs_1.hash)(userData.password, 10);
        return this.prisma.users.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                birth_date: userData.birth_date,
                role: userData.role || 'BUYER',
            }
        });
    }
    async validateCredentials(credentials) {
        const user = await this.getUserByEmail(credentials.email);
        if (!user)
            return null;
        const isValid = await (0, bcryptjs_1.compare)(credentials.password, user.password);
        return isValid ? user : null;
    }
    async createSession(userId) {
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days
        // Store session in memory
        sessions.set(token, {
            userId,
            expiresAt
        });
        return {
            token,
            expires_at: expiresAt
        };
    }
    async validateSession(token) {
        const session = sessions.get(token);
        if (!session)
            return null;
        const now = new Date();
        if (session.expiresAt < now) {
            // Session expired
            sessions.delete(token);
            return null;
        }
        // Get user data
        const user = await this.getUserById(session.userId);
        if (!user) {
            sessions.delete(token);
            return null;
        }
        return {
            token,
            expires_at: session.expiresAt,
            user
        };
    }
    async deleteSession(token) {
        sessions.delete(token);
    }
}
exports.AuthRepository = AuthRepository;
