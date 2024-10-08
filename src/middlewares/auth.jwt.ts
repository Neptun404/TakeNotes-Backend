import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import createError from 'http-errors';

export default function jwtAuth(req: Request, res: Response, next: NextFunction) {
    try {
        // If authorization header is not set, return 401
        if (!req.headers.authorization) throw new Error('Authorization header is not set');

        // Check if token is expired
        const usrToken = req.headers.authorization.split(' ')[1];
        const token = jwt.verify(usrToken, process.env.JWT_SECRET as string) as { id: number, iat: number, exp: number }

        res.locals = {
            userId: token.id
        }
        console.log(token);
        next()
    } catch (error) {
        console.error(`[Error] ${error}`);
        next(createError(401, {
            message: 'Unauthorized',
            name: 'AuthenticationFailed',
        }))
    }
}