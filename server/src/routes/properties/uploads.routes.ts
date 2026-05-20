import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../../middleware/auth';
import { requireUser } from '../../middleware/require-user';
import { uploadBuffer } from '../../services/storage.service';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest } from '../../utils/http-errors';
import { logger } from '../../utils/logger';

const router = express.Router();

// Файлы держим в памяти, чтобы сразу пушить их в Yandex Object Storage без локального диска.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/upload-images',
  authenticateToken,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    requireUser(req);

    const files = req.files;
    if (!files || (Array.isArray(files) && files.length === 0)) {
      throw badRequest('No files uploaded');
    }

    const fileArray = files as Express.Multer.File[];
    logger.debug(`Uploading ${fileArray.length} file(s) to Yandex Object Storage`);

    const uploaded = await Promise.all(
      fileArray.map((file) =>
        uploadBuffer({
          buffer: file.buffer,
          contentType: file.mimetype,
          originalName: file.originalname,
        })
      )
    );

    // Возвращаем относительные пути (`/property_images/uploads/<uuid>.jpg`),
    // абсолютный URL для рендера соберёт getImageUrl на клиенте.
    res.status(200).json({ imageUrls: uploaded.map((obj) => obj.relativeUrl) });
  })
);

export default router;
