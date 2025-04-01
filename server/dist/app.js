"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Базовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PERN TypeScript API' });
});
// Обработка ошибок
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
const start = async () => {
    try {
        await prisma.$connect();
        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
start();
