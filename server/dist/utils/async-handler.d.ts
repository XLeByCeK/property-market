import { NextFunction, Request, RequestHandler, Response } from 'express';
type AsyncRequestHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>;
/**
 * Оборачивает async-обработчик Express и направляет любые исключения в next(),
 * чтобы они попадали в централизованный error middleware и не оставляли
 * необработанных промисов.
 */
export declare const asyncHandler: <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>) => RequestHandler<P, ResBody, ReqBody, ReqQuery>;
export {};
