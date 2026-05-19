import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ErrorCodes } from '@regalamelo/shared';

export const validateBody = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                next({
                    status: 400,
                    code: ErrorCodes.VALIDATION_ERROR,
                    message: error.errors[0].message,
                });
            } else {
                next(error);
            }
        }
    };
};
