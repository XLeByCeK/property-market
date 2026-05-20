"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../../middleware/auth");
const require_user_1 = require("../../middleware/require-user");
const storage_service_1 = require("../../services/storage.service");
const async_handler_1 = require("../../utils/async-handler");
const http_errors_1 = require("../../utils/http-errors");
const logger_1 = require("../../utils/logger");
const router = express_1.default.Router();
// Файлы держим в памяти, чтобы сразу пушить их в Yandex Object Storage без локального диска.
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            cb(null, true);
        else
            cb(null, false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/upload-images', auth_1.authenticateToken, upload.array('images', 10), (0, async_handler_1.asyncHandler)(async (req, res) => {
    (0, require_user_1.requireUser)(req);
    const files = req.files;
    if (!files || (Array.isArray(files) && files.length === 0)) {
        throw (0, http_errors_1.badRequest)('No files uploaded');
    }
    const fileArray = files;
    logger_1.logger.debug(`Uploading ${fileArray.length} file(s) to Yandex Object Storage`);
    const uploaded = await Promise.all(fileArray.map((file) => (0, storage_service_1.uploadBuffer)({
        buffer: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname,
    })));
    // Возвращаем относительные пути (`/property_images/uploads/<uuid>.jpg`),
    // абсолютный URL для рендера соберёт getImageUrl на клиенте.
    res.status(200).json({ imageUrls: uploaded.map((obj) => obj.relativeUrl) });
}));
exports.default = router;
