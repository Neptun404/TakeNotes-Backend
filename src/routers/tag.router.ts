import { NextFunction, Request, Response, Router } from "express";
import jwtAuth from '../middlewares/auth.jwt';
import { HttpError } from 'http-errors';
import { getTags } from "../services/tag.service";

const router = Router()

export default router
    .use(jwtAuth)
    .get('/', getTags)
    .use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
        res.status(err.statusCode).json({
            status: 'failed',
            message: err.message,
            error: err.name
        })
    })
