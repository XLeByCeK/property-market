"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = require("bcryptjs");
// In-memory sessions store (could be replaced with Redis, DB, etc.)
const sessions = new Map();
class AuthRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.findUnique({
                where: { email }
            });
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.users.findUnique({
                where: { id }
            });
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield (0, bcryptjs_1.hash)(userData.password, 10);
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
        });
    }
    validateCredentials(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserByEmail(credentials.email);
            if (!user)
                return null;
            const isValid = yield (0, bcryptjs_1.compare)(credentials.password, user.password);
            return isValid ? user : null;
        });
    }
    createSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    validateSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const user = yield this.getUserById(session.userId);
            if (!user) {
                sessions.delete(token);
                return null;
            }
            return {
                token,
                expires_at: session.expiresAt,
                user
            };
        });
    }
    deleteSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
            sessions.delete(token);
        });
    }
}
exports.AuthRepository = AuthRepository;
