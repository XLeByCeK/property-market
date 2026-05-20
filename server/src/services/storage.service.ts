import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, storageConfig } from '../config/storage';

export interface UploadedObject {
  /** S3 key внутри бакета, например `property_images/uploads/abcd.jpg` */
  key: string;
  /** Относительный путь, который сохраняется в БД (`/property_images/uploads/abcd.jpg`) */
  relativeUrl: string;
  /** Полный публичный URL объекта */
  publicUrl: string;
}

const sanitizeBaseName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/**
 * Возвращает уникальный ключ объекта в бакете, например:
 *   property_images/uploads/8f0a3b...-original-name.jpg
 */
export const buildObjectKey = (originalName: string, prefix = storageConfig.uploadPrefix): string => {
  const ext = path.extname(originalName).toLowerCase();
  const base = sanitizeBaseName(path.basename(originalName, ext));
  const id = uuidv4();
  const fileName = base ? `${id}-${base}${ext}` : `${id}${ext}`;
  return `${prefix}/${fileName}`;
};

/**
 * Загружает буфер в Yandex Object Storage и возвращает информацию об объекте.
 */
export const uploadBuffer = async (params: {
  buffer: Buffer;
  contentType: string;
  originalName: string;
  prefix?: string;
}): Promise<UploadedObject> => {
  if (!storageConfig.hasCredentials) {
    throw new Error(
      'Yandex Object Storage credentials are not configured. Set YANDEX_STORAGE_ACCESS_KEY_ID and YANDEX_STORAGE_SECRET_ACCESS_KEY.'
    );
  }

  const key = buildObjectKey(params.originalName, params.prefix);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: storageConfig.bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
      // ACL не указываем — публичный доступ настраивается на уровне бакета в YC.
    })
  );

  return {
    key,
    relativeUrl: `/${key}`,
    publicUrl: `${storageConfig.publicBaseUrl.replace(/\/$/, '')}/${key}`,
  };
};

/**
 * Удаляет объект из бакета. Принимает либо чистый key, либо относительный URL вида `/property_images/...`.
 */
export const deleteObject = async (keyOrUrl: string): Promise<void> => {
  if (!storageConfig.hasCredentials) {
    console.warn('Skipping deleteObject: storage credentials are not configured.');
    return;
  }

  const key = keyOrUrl.replace(/^\/+/, '');

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: storageConfig.bucket,
      Key: key,
    })
  );
};
