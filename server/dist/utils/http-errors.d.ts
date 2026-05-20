/**
 * Базовый класс ошибок с HTTP-статусом. Бросается из контроллеров/сервисов и
 * единообразно обрабатывается в error middleware.
 */
export declare class HttpError extends Error {
    readonly status: number;
    readonly details?: unknown | undefined;
    constructor(status: number, message: string, details?: unknown | undefined);
}
export declare const badRequest: (message: string, details?: unknown) => HttpError;
export declare const unauthorized: (message?: string) => HttpError;
export declare const forbidden: (message?: string) => HttpError;
export declare const notFound: (message?: string) => HttpError;
