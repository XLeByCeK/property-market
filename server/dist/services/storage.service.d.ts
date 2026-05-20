export interface UploadedObject {
    /** S3 key внутри бакета, например `property_images/uploads/abcd.jpg` */
    key: string;
    /** Относительный путь, который сохраняется в БД (`/property_images/uploads/abcd.jpg`) */
    relativeUrl: string;
    /** Полный публичный URL объекта */
    publicUrl: string;
}
/**
 * Возвращает уникальный ключ объекта в бакете, например:
 *   property_images/uploads/8f0a3b...-original-name.jpg
 */
export declare const buildObjectKey: (originalName: string, prefix?: string) => string;
/**
 * Загружает буфер в Yandex Object Storage и возвращает информацию об объекте.
 */
export declare const uploadBuffer: (params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
    prefix?: string;
}) => Promise<UploadedObject>;
/**
 * Удаляет объект из бакета. Принимает либо чистый key, либо относительный URL вида `/property_images/...`.
 */
export declare const deleteObject: (keyOrUrl: string) => Promise<void>;
