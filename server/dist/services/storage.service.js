"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObject = exports.uploadBuffer = exports.buildObjectKey = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const storage_1 = require("../config/storage");
const sanitizeBaseName = (name) => name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
/**
 * Возвращает уникальный ключ объекта в бакете, например:
 *   property_images/uploads/8f0a3b...-original-name.jpg
 */
const buildObjectKey = (originalName, prefix = storage_1.storageConfig.uploadPrefix) => {
    const ext = path_1.default.extname(originalName).toLowerCase();
    const base = sanitizeBaseName(path_1.default.basename(originalName, ext));
    const id = (0, uuid_1.v4)();
    const fileName = base ? `${id}-${base}${ext}` : `${id}${ext}`;
    return `${prefix}/${fileName}`;
};
exports.buildObjectKey = buildObjectKey;
/**
 * Загружает буфер в Yandex Object Storage и возвращает информацию об объекте.
 */
const uploadBuffer = async (params) => {
    if (!storage_1.storageConfig.hasCredentials) {
        throw new Error('Yandex Object Storage credentials are not configured. Set YANDEX_STORAGE_ACCESS_KEY_ID and YANDEX_STORAGE_SECRET_ACCESS_KEY.');
    }
    const key = (0, exports.buildObjectKey)(params.originalName, params.prefix);
    await storage_1.s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: storage_1.storageConfig.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
        // ACL не указываем — публичный доступ настраивается на уровне бакета в YC.
    }));
    return {
        key,
        relativeUrl: `/${key}`,
        publicUrl: `${storage_1.storageConfig.publicBaseUrl.replace(/\/$/, '')}/${key}`,
    };
};
exports.uploadBuffer = uploadBuffer;
/**
 * Удаляет объект из бакета. Принимает либо чистый key, либо относительный URL вида `/property_images/...`.
 */
const deleteObject = async (keyOrUrl) => {
    if (!storage_1.storageConfig.hasCredentials) {
        console.warn('Skipping deleteObject: storage credentials are not configured.');
        return;
    }
    const key = keyOrUrl.replace(/^\/+/, '');
    await storage_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
        Bucket: storage_1.storageConfig.bucket,
        Key: key,
    }));
};
exports.deleteObject = deleteObject;
