import { Request, Response, NextFunction } from 'express';
import { ErrorCodes } from '@regalamelo/shared';

// Unified Error Response format defined in latex doc
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('[Error]:', err);

    const statusCode = err.status || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred.';

    res.status(statusCode).json({
        error: {
            code: errorCode,
            message: message,
        },
    });
};
