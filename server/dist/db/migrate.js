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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const database_1 = __importDefault(require("../config/database"));
function runMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.default.connect();
        try {
            yield client.query('BEGIN');
            // Read and execute migration file
            const migrationPath = (0, path_1.join)(__dirname, 'migrations/001_initial_schema.sql');
            const migrationSQL = (0, fs_1.readFileSync)(migrationPath, 'utf8');
            yield client.query(migrationSQL);
            yield client.query('COMMIT');
            console.log('Migrations completed successfully');
        }
        catch (error) {
            yield client.query('ROLLBACK');
            console.error('Migration failed:', error);
            throw error;
        }
        finally {
            client.release();
            yield database_1.default.end();
        }
    });
}
runMigrations().catch(console.error);
