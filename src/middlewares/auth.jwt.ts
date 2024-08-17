import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function jwtAuth(req: Request, res: Response, next: NextFunction) {
    try {
        // If authorization header is not set, return 401
        if (!req.headers.authorization) throw new Error('Authorization header is not set');

        // Check if token is expired
        const usrToken = req.headers.authorization.split(' ')[1];
        const token = jwt.verify(usrToken, process.env.JWT_SECRET as string)

        console.log(token);
        next()
    } catch (error) {
        console.error(`[Error] ${error}`);
        next('Unauthorized')
    }
}