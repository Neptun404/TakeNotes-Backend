import { NextFunction, Request, Response } from "express";
import { HttpError } from 'http-errors';

export default function (err: HttpError, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode).json({
        status: 'failed',
        message: err.message,
        error: err.name
    })
}