"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.storageConfig = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const endpoint = process.env.YANDEX_STORAGE_ENDPOINT || 'https://storage.yandexcloud.net';
const region = process.env.YANDEX_STORAGE_REGION || 'ru-central1';
const accessKeyId = process.env.YANDEX_STORAGE_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.YANDEX_STORAGE_SECRET_ACCESS_KEY || '';
exports.storageConfig = {
    endpoint,
    region,
    bucket: process.env.YANDEX_STORAGE_BUCKET || 'propertymarket',
    publicBaseUrl: process.env.YANDEX_STORAGE_PUBLIC_BASE_URL ||
        `${endpoint.replace(/\/$/, '')}/${process.env.YANDEX_STORAGE_BUCKET || 'propertymarket'}`,
    uploadPrefix: (process.env.YANDEX_STORAGE_UPLOAD_PREFIX || 'property_images/uploads').replace(/^\/+|\/+$/g, ''),
    hasCredentials: Boolean(accessKeyId && secretAccessKey),
};
if (!exports.storageConfig.hasCredentials) {
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: YANDEX_STORAGE_ACCESS_KEY_ID/SECRET not set. Image uploads to Yandex Object Storage will fail.');
}
exports.s3Client = new client_s3_1.S3Client({
    endpoint,
    region,
    // Path-style addressing — стабильно работает с Yandex Object Storage и бакетами с точками в имени
    forcePathStyle: true,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
