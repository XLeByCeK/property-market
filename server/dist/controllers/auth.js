"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../utils/auth");
const logger_1 = require("../utils/logger");
const toPublicUser = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
});
const parseBirthDate = (raw) => {
    if (!raw)
        return undefined;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime()))
        return { error: 'Invalid birth date format' };
    return parsed;
};
class AuthController {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async register(req, res) {
        try {
            // Поддерживаем оба именования (camelCase и snake_case) — клиент может прислать любой формат.
            const { email, password, firstName, lastName, phone, birthDate, first_name, last_name } = req.body;
            const role = req.body.role || 'BUYER';
            const actualFirstName = first_name || firstName;
            const actualLastName = last_name || lastName;
            const missing = [];
            if (!email)
                missing.push('email');
            if (!password)
                missing.push('password');
            if (!actualFirstName)
                missing.push('firstName/first_name');
            if (!actualLastName)
                missing.push('lastName/last_name');
            if (missing.length > 0) {
                return res.status(400).json({
                    error: `Missing required fields: ${missing.join(', ')}`,
                });
            }
            const parsedBirthDate = parseBirthDate(req.body.birth_date || birthDate);
            if (parsedBirthDate && typeof parsedBirthDate === 'object' && 'error' in parsedBirthDate) {
                return res.status(400).json({ error: parsedBirthDate.error });
            }
            const existingUser = await this.authRepository.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            const user = await this.authRepository.createUser({
                email,
                password,
                first_name: actualFirstName,
                last_name: actualLastName,
                phone,
                birth_date: parsedBirthDate,
                role,
            });
            const session = await this.authRepository.createSession(user.id);
            const token = (0, auth_1.generateJWT)(user.id);
            res.status(201).json({
                user: toPublicUser(user),
                token,
                session: { token: session.token, expires_at: session.expires_at },
            });
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error during registration' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authRepository.validateCredentials({ email, password });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            const session = await this.authRepository.createSession(user.id);
            const token = (0, auth_1.generateJWT)(user.id);
            res.json({
                user: toPublicUser(user),
                token,
                session: { token: session.token, expires_at: session.expires_at },
            });
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error during login' });
        }
    }
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token)
                await this.authRepository.deleteSession(token);
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            res.status(500).json({ error: 'Internal server error during logout' });
        }
    }
    async validateSession(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                return res.status(401).json({ error: 'No token provided' });
            const session = await this.authRepository.validateSession(token);
            if (!session)
                return res.status(401).json({ error: 'Invalid or expired session' });
            res.json({ valid: true, user: toPublicUser(session.user) });
        }
        catch (error) {
            logger_1.logger.error('Session validation error:', error);
            res.status(500).json({ error: 'Internal server error during session validation' });
        }
    }
}
exports.AuthController = AuthController;
