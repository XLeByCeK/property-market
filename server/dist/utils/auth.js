"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWT = generateJWT;
exports.verifyJWT = verifyJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../config/index")); // Импортируем из конфига
function generateJWT(userId) {
    return jsonwebtoken_1.default.sign({ id: userId }, index_1.default.jwtSecret, { expiresIn: index_1.default.jwtExpiresIn });
}
function verifyJWT(token) {
    try {
        return jsonwebtoken_1.default.verify(token, index_1.default.jwtSecret);
    }
    catch (error) {
        return null;
    }
}
